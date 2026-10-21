# OLMA Bills

A small React + PostgreSQL app for the contractor, location, bill type and bill tables
described in `docs/table-format.md`. No Docker needed.

- **Frontend:** React with Vite
- **API:** Express, one generic set of routes for every table
- **Database:** PostgreSQL

The table definitions live in `shared/tables.js`. The API validates against them, and the
forms and tables are drawn from them. To add a column, change that file and `server/schema.sql`.

## Setup

You need Node.js 18 or newer and PostgreSQL 13 or newer.

```bash
# 1. Create the database (once)
createdb olma_bills

# 2. Install packages (once)
npm install

# 3. Create the tables (once; safe to repeat)
npm run db:init

# 4. Start the app
npm run dev
```

Open http://localhost:5173. The API runs on http://localhost:4000.

If your database is somewhere else, set `DATABASE_URL` before running:

```bash
export DATABASE_URL=postgres://user:password@localhost:5432/olma_bills
```

The default is `postgres://localhost:5432/olma_bills`.

## Production-style run

```bash
npm run build   # builds the React app into dist/
npm start       # serves the API and the app on http://localhost:4000
```

## Data notes

- Dropdowns with fixed values (Type of Bill, Work type) are enforced by the app and the database.
- Dropdowns for State, Status, Company status, Attachment and the location hierarchy are
  free text until their values are given. Add `options` in `shared/tables.js` to turn them into dropdowns.
- A bill's From DG Loc, Contractor and Type of Bill must already exist in their tables.
- A record that other records point to cannot be deleted.
