import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'polylearn',
  user: process.env.DB_USER || 'polylearn_user',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL error:', err);
  process.exit(-1);
});

// Query helper function
export const query = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params);
  return result;
};

// Export both named and default
export { pool };
export default pool;
