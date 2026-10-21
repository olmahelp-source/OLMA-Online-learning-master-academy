import { useState } from 'react';
import { TABLES, TABLE_NAMES } from '../shared/tables.js';
import TableView from './TableView.jsx';

export default function App() {
  const [active, setActive] = useState(TABLE_NAMES[0]);

  return (
    <div className="app">
      <header>
        <h1>OLMA Bills</h1>
        <nav>
          {TABLE_NAMES.map((name) => (
            <button
              key={name}
              className={name === active ? 'tab active' : 'tab'}
              onClick={() => setActive(name)}
            >
              {TABLES[name].label}
            </button>
          ))}
        </nav>
      </header>
      <main>
        <TableView name={active} />
      </main>
    </div>
  );
}
