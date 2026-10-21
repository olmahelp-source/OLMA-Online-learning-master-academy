import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import { TABLES } from '../shared/tables.js';

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());

// Only tables listed in shared/tables.js are reachable, so the table name
// can be used in SQL safely.
function findTable(req, res, next) {
  const table = TABLES[req.params.table];
  if (!table) return res.status(404).json({ error: 'Unknown table' });
  req.table = table;
  next();
}

// Checks each field against shared/tables.js and returns clean values.
function validate(table, body) {
  const errors = [];
  const values = {};

  for (const col of table.columns) {
    if (col.type === 'list') {
      const items = (Array.isArray(body[col.key]) ? body[col.key] : String(body[col.key] ?? '').split(/[\n,]/))
        .map((item) => item.trim())
        .filter(Boolean);
      if (col.required && items.length === 0) errors.push(`${col.label} is required`);
      values[col.key] = items;
      continue;
    }

    const value = body[col.key] == null ? '' : String(body[col.key]).trim();
    values[col.key] = value || null;

    if (!value) {
      if (col.required) errors.push(`${col.label} is required`);
      continue;
    }
    if (col.type === 'number' && (!Number.isFinite(Number(value)) || Number(value) < (col.min ?? -Infinity))) {
      errors.push(`${col.label} must be a number${col.min != null ? ` of at least ${col.min}` : ''}`);
    }
    if (col.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push(`${col.label} must be a valid email`);
    }
    if (col.pattern && !new RegExp(col.pattern).test(value)) {
      errors.push(`${col.label}: ${col.hint || 'invalid format'}`);
    }
    if (col.options && !col.options.includes(value)) {
      errors.push(`${col.label} must be one of: ${col.options.join(', ')}`);
    }
  }

  return { errors, values };
}

app.get('/api/:table', findTable, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM ${req.params.table} ORDER BY ${req.table.pk}`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/:table', findTable, async (req, res, next) => {
  const { errors, values } = validate(req.table, req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const keys = req.table.columns.map((col) => col.key);
  const params = keys.map((key) => values[key]);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  try {
    const { rows } = await pool.query(
      `INSERT INTO ${req.params.table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      params,
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/:table/:id', findTable, async (req, res, next) => {
  const { errors, values } = validate(req.table, req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const keys = req.table.columns.map((col) => col.key);
  const assignments = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

  try {
    const { rows } = await pool.query(
      `UPDATE ${req.params.table} SET ${assignments} WHERE ${req.table.pk} = $${keys.length + 1} RETURNING *`,
      [...keys.map((key) => values[key]), req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/:table/:id', findTable, async (req, res, next) => {
  try {
    const result = await pool.query(
      `DELETE FROM ${req.params.table} WHERE ${req.table.pk} = $1`,
      [req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Record not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Turns database errors into messages the form can show.
app.use((err, req, res, _next) => {
  console.error(err);
  if (err.code === '23505') return res.status(409).json({ error: 'A record with this id already exists' });
  if (err.code === '23503') {
    const message = req.method === 'DELETE'
      ? 'This record is used by other records and cannot be deleted'
      : 'A linked record does not exist';
    return res.status(req.method === 'DELETE' ? 409 : 400).json({ error: message });
  }
  if (err.code === '23514' || err.code === '22P02' || err.code === '22007') {
    return res.status(400).json({ error: 'One of the values is not allowed' });
  }
  res.status(500).json({ error: 'Server error' });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// After "npm run build", the API also serves the React app on one port.
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile('index.html', { root: dist }));
}

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
