// Writes docs/form-elements.md from shared/tables.js, so the field map always
// matches the forms the app actually draws. Run with: npm run docs:forms
import { writeFile } from 'node:fs/promises';
import { TABLES } from '../shared/tables.js';

// How the form element receives its value.
function elementOf(col) {
  if (col.ref) return 'Dropdown (lookup)';
  if (col.options) return 'Dropdown (fixed list)';
  if (col.type === 'textarea') return 'Multi-line text';
  if (col.type === 'list') return 'Multi-line list (one per line)';
  return 'Single-line input';
}

// HTML input type used for single-line fields.
function htmlTypeOf(col) {
  if (col.ref || col.options || col.type === 'textarea' || col.type === 'list') return '—';
  return { number: 'number', email: 'email', tel: 'tel' }[col.type] || 'text';
}

// Rules checked on the form and again on the server.
function methodOf(col) {
  const rules = [];
  if (col.ref) rules.push(`must match an existing ${col.ref.table}.${col.ref.key}`);
  if (col.options) rules.push(`one of: ${col.options.join(', ')}`);
  if (col.type === 'number') rules.push(`number${col.min != null ? `, ≥ ${col.min}` : ''}`);
  if (col.type === 'email') rules.push('valid email address');
  if (col.pattern) rules.push(`matches \`${col.pattern}\``);
  if (col.type === 'list') rules.push('split on new lines or commas, empty items removed');
  return rules.length ? rules.join('; ') : 'any text, trimmed';
}

// What runs when the user acts on the field.
function actionsOf(col, pk) {
  const actions = [];
  if (col.key === pk) actions.push('Read-only when editing an existing record');
  actions.push('On change: updates the form value');
  actions.push('On save: sent to the server, checked, then stored');
  if (col.ref) actions.push(`On open: loads ${col.ref.table} for the dropdown`);
  return actions.join('; ');
}

// Attributes set on the element.
function propertiesOf(col) {
  const props = [];
  if (col.type === 'number') props.push('step 0.01');
  if (col.min != null) props.push(`min ${col.min}`);
  if (col.pattern) props.push(`pattern`);
  if (col.hint) props.push(`title "${col.hint}"`);
  return props.length ? props.join(', ') : '—';
}

const lines = [
  '# Form Elements',
  '',
  'Generated from `shared/tables.js` by `npm run docs:forms`. Do not edit by hand.',
  '',
];

for (const [name, table] of Object.entries(TABLES)) {
  lines.push(`## ${table.label} (\`${name}\`)`, '');
  lines.push('| Field | Element | HTML type | Requirement | Method (rules) | Actions | Properties |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const col of table.columns) {
    const requirement = col.required ? 'Required' : 'Optional';
    lines.push(
      `| ${col.label} (\`${col.key}\`) | ${elementOf(col)} | ${htmlTypeOf(col)} | ${requirement} | ${methodOf(col)} | ${actionsOf(col, table.pk)} | ${propertiesOf(col)} |`,
    );
  }
  lines.push('');
}

await writeFile(new URL('../docs/form-elements.md', import.meta.url), lines.join('\n'));
console.log('Wrote docs/form-elements.md');
