import pg from 'pg';

// Override with DATABASE_URL, e.g. postgres://user:password@localhost:5432/olma_bills
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/olma_bills',
});
