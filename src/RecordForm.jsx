import { useEffect, useState } from 'react';
import { api } from './api.js';

// Values shown in the form. Lists are edited one item per line.
function startValues(table, record) {
  const values = {};
  for (const col of table.columns) {
    if (col.type === 'list') values[col.key] = (record?.[col.key] || []).join('\n');
    else values[col.key] = record?.[col.key] ?? '';
  }
  return values;
}

export default function RecordForm({ table, record, onSave, onCancel }) {
  const isEdit = Boolean(record);
  const [values, setValues] = useState(() => startValues(table, record));
  const [refRows, setRefRows] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Dropdowns that point at another table are filled from that table.
  useEffect(() => {
    const refColumns = table.columns.filter((col) => col.ref);
    Promise.all(refColumns.map((col) => api.list(col.ref.table)))
      .then((lists) => setRefRows(Object.fromEntries(refColumns.map((col, i) => [col.key, lists[i]]))))
      .catch((err) => setError(err.message));
  }, [table]);

  function change(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(values);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderInput(col) {
    const common = {
      id: col.key,
      name: col.key,
      value: values[col.key],
      required: col.required,
      readOnly: isEdit && col.key === table.pk,
      onChange: (event) => change(col.key, event.target.value),
    };

    if (col.options) {
      return (
        <select {...common}>
          <option value="">Select…</option>
          {col.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }

    if (col.ref) {
      return (
        <select {...common}>
          <option value="">Select…</option>
          {(refRows[col.key] || []).map((row) => (
            <option key={row[col.ref.key]} value={row[col.ref.key]}>
              {row[col.ref.key]} – {row[col.ref.label]}
            </option>
          ))}
        </select>
      );
    }

    if (col.type === 'textarea' || col.type === 'list') {
      return <textarea rows={3} {...common} />;
    }

    const inputType = { number: 'number', email: 'email', tel: 'tel' }[col.type] || 'text';
    return (
      <input
        type={inputType}
        step={col.type === 'number' ? '0.01' : undefined}
        min={col.min}
        pattern={col.pattern}
        title={col.hint}
        {...common}
      />
    );
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <h3>{isEdit ? `Edit ${table.label}` : `New ${table.label}`}</h3>
      <div className="field-grid">
        {table.columns.map((col) => (
          <div className="field" key={col.key}>
            <label htmlFor={col.key}>
              {col.label}
              {col.required && ' *'}
            </label>
            {renderInput(col)}
            {col.hint && <small>{col.hint}</small>}
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
