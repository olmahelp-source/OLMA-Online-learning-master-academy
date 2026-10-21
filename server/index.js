import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pool } from './db.js';
import { TABLES } from '../shared/tables.js';

const app = express();
const PORT = process.env.PORT || 4000;
const MAX_BATCH_ROWS = 500;

app.use(express.json({ limit: '1mb' }));

// An error with an HTTP status and an optional list of field-level problems.
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Only tables listed in shared/tables.js are reachable, so the table name
// can be used in SQL safely.
function findTable(req, res, next) {
  const table = TABLES[req.params.table];
  if (!table) return next(new AppError(404, 'Unknown table'));
  req.table = table;
  next();
}

// Checks each field against shared/tables.js and returns clean values.
// Throws AppError(400) listing every problem found.
function cleanRow(table, body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new AppError(400, 'Each record must be a JSON object');
  }

  const errors = [];
  const values = {};

  for (const col of table.columns) {
    if (col.type === 'list') {
      const items = (Array.isArray(body[col.key]) ? body[col.key] : String(body[col.key] ?? '').split(/[\n,]/))
        .map((item) => String(item).trim())
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

  if (errors.length) throw new AppError(400, errors.join('; '), errors);
  return values;
}

// Runs work() inside one transaction. If it throws, everything it wrote is
// rolled back. If the rollback itself fails, the connection is discarded.
async function withTransaction(work) {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch((rollbackErr) => {
      discard = true;
      console.error('Rollback failed', rollbackErr);
    });
    throw err;
  } finally {
    client.release(discard);
  }
}

function insertSql(table) {
  const keys = table.columns.map((col) => col.key);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  return {
    text: `INSERT INTO ${table.name} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    keys,
  };
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
  try {
    const values = cleanRow(req.table, req.body);
    const row = await withTransaction(async (client) => {
      const insert = insertSql({ ...req.table, name: req.params.table });
      const { rows } = await client.query(insert.text, insert.keys.map((key) => values[key]));
      return rows[0];
    });
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

// Inserts many rows at once. Every row is checked first; if any row is bad,
// or the database rejects any row, nothing is saved.
app.post('/api/:table/batch', findTable, async (req, res, next) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : req.body?.rows;
    if (!Array.isArray(rows)) throw new AppError(400, 'Send a JSON array of records');
    if (rows.length === 0) throw new AppError(400, 'No records to import');
    if (rows.length > MAX_BATCH_ROWS) throw new AppError(400, `Import at most ${MAX_BATCH_ROWS} records at a time`);

    const problems = [];
    const cleaned = rows.map((row, i) => {
      try {
        return cleanRow(req.table, row);
      } catch (err) {
        problems.push(...(err.details ?? [err.message]).map((msg) => `Row ${i + 1}: ${msg}`));
        return null;
      }
    });
    if (problems.length) throw new AppError(400, problems.join('; '), problems);

    const inserted = await withTransaction(async (client) => {
      const insert = insertSql({ ...req.table, name: req.params.table });
      const saved = [];
      for (const [i, values] of cleaned.entries()) {
        try {
          const { rows: result } = await client.query(insert.text, insert.keys.map((key) => values[key]));
          saved.push(result[0]);
        } catch (err) {
          const appError = toAppError(err);
          throw new AppError(appError.status, `Row ${i + 1}: ${appError.message}`);
        }
      }
      return saved;
    });
    res.status(201).json({ inserted: inserted.length, rows: inserted });
  } catch (err) {
    next(err);
  }
});

app.put('/api/:table/:id', findTable, async (req, res, next) => {
  try {
    const values = cleanRow(req.table, req.body);
    const row = await withTransaction(async (client) => {
      // Lock the row so a concurrent delete cannot slip in between check and update.
      const existing = await client.query(
        `SELECT 1 FROM ${req.params.table} WHERE ${req.table.pk} = $1 FOR UPDATE`,
        [req.params.id],
      );
      if (!existing.rowCount) throw new AppError(404, 'Record not found');

      const keys = req.table.columns.map((col) => col.key);
      const assignments = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
      const { rows } = await client.query(
        `UPDATE ${req.params.table} SET ${assignments} WHERE ${req.table.pk} = $${keys.length + 1} RETURNING *`,
        [...keys.map((key) => values[key]), req.params.id],
      );
      return rows[0];
    });
    res.json(row);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/:table/:id', findTable, async (req, res, next) => {
  try {
    await withTransaction(async (client) => {
      const result = await client.query(
        `DELETE FROM ${req.params.table} WHERE ${req.table.pk} = $1`,
        [req.params.id],
      );
      if (!result.rowCount) throw new AppError(404, 'Record not found');
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Converts a database or parser error into an AppError with a message the UI can show.
function toAppError(err) {
  if (err instanceof AppError) return err;
  if (err.type === 'entity.parse.failed') return new AppError(400, 'Request body is not valid JSON');
  if (err.type === 'entity.too.large') return new AppError(413, 'Request is too large');

  switch (err.code) {
    case '23505':
      return new AppError(409, 'A record with this id already exists');
    case '23503':
      return err.detail?.includes('is still referenced')
        ? new AppError(409, 'This record is used by other records and cannot be deleted')
        : new AppError(400, 'A linked record does not exist');
    case '23502':
      return new AppError(400, 'A required value is missing');
    case '22001':
      return new AppError(400, 'A value is too long');
    case '22003':
      return new AppError(400, 'A number is out of range');
    case '23514':
    case '22P02':
    case '22007':
      return new AppError(400, 'One of the values is not allowed');
    default:
      return new AppError(500, 'Server error');
  }
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Last step for every error: log server faults, send a clean JSON response.
app.use((err, req, res, _next) => {
  const appError = toAppError(err);
  if (appError.status >= 500) console.error(`${req.method} ${req.originalUrl}`, err);
  res.status(appError.status).json({
    error: appError.message,
    ...(appError.details && { details: appError.details }),
  });
});

// After "npm run build", the API also serves the React app on one port.
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile('index.html', { root: dist }));
}

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
