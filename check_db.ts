import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

async function check() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const users = await pool.query('SELECT name, email, role FROM users');
    console.log('--- Current Users in DB ---');
    console.table(users.rows);
    
    const tenants = await pool.query('SELECT name FROM tenants');
    console.log('--- Current Tenants in DB ---');
    console.table(tenants.rows);
    
  } catch (err) {
    console.error('Error checking DB:', err.message);
  } finally {
    await pool.end();
  }
}

check();
