import { useState } from 'react';

const SAMPLE = `[
  { "...": "one object per record, using the field keys from shared/tables.js" }
]`;

// Pastes a JSON array of records. The server saves all of them or none.
export default function ImportPanel({ table, onImport }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [details, setDetails] = useState([]);
  const [busy, setBusy] = useState(false);

  async function handleImport() {
    setError('');
    setDetails([]);

    let rows;
    try {
      rows = JSON.parse(text);
    } catch (err) {
      setError(`The text is not valid JSON: ${err.message}`);
      return;
    }

    setBusy(true);
    try {
      await onImport(rows);
      setText('');
    } catch (err) {
      setDetails(err.details ?? []);
      setError(err.details?.length ? 'Nothing was imported. Fix these and try again:' : `Nothing was imported. ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="record-form">
      <h3>Import {table.label} records</h3>
      <p className="hint">
        Paste a JSON array of records. Every record is checked first. If any record fails,
        none are saved.
      </p>
      <textarea
        rows={8}
        value={text}
        placeholder={SAMPLE}
        onChange={(event) => setText(event.target.value)}
        aria-label="JSON records to import"
      />
      {error && <p className="error" role="alert">{error}</p>}
      {details.length > 0 && (
        <ul className="error-list">
          {details.map((detail) => <li key={detail}>{detail}</li>)}
        </ul>
      )}
      <div className="actions">
        <button onClick={handleImport} disabled={busy || !text.trim()}>
          {busy ? 'Importing…' : 'Import'}
        </button>
      </div>
    </div>
  );
}
