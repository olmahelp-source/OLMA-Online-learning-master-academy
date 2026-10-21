import { useEffect, useState } from 'react';
import { TABLES } from '../shared/tables.js';
import { api } from './api.js';
import RecordForm from './RecordForm.jsx';

function cellText(value) {
  if (value == null) return '';
  return Array.isArray(value) ? value.join(', ') : String(value);
}

export default function TableView({ name }) {
  const table = TABLES[name];
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null); // null, 'new', or the row being edited
  const [error, setError] = useState('');

  async function load() {
    try {
      setRows(await api.list(name));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    setEditing(null);
    load();
  }, [name]);

  async function save(values) {
    if (editing === 'new') await api.create(name, values);
    else await api.update(name, editing[table.pk], values);
    setEditing(null);
    await load();
  }

  async function remove(row) {
    if (!window.confirm(`Delete this ${table.label} record?`)) return;
    try {
      await api.remove(name, row[table.pk]);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="toolbar">
        <h2>{table.label}</h2>
        <button onClick={() => setEditing('new')}>Add {table.label}</button>
      </div>

      {error && <p className="error">{error}</p>}

      {editing && (
        <RecordForm
          key={editing === 'new' ? 'new' : editing[table.pk]}
          table={table}
          record={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {table.columns.map((col) => <th key={col.key}>{col.label}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={table.columns.length + 1} className="empty">No records yet.</td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row[table.pk]}>
                {table.columns.map((col) => <td key={col.key}>{cellText(row[col.key])}</td>)}
                <td className="actions">
                  <button className="secondary" onClick={() => setEditing(row)}>Edit</button>
                  <button className="danger" onClick={() => remove(row)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
