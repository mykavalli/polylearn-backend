#!/usr/bin/env node

/**
 * Check database tables and structure
 */

const { Client } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'polylearn',
  user: process.env.DB_USER || 'polylearn_user',
  password: process.env.DB_PASSWORD || '',
};

async function checkDatabase() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📊 Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('  (No tables found)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    console.log('');

    // Check users table structure if exists
    const usersTable = tablesResult.rows.find(r => r.table_name === 'users');
    if (usersTable) {
      console.log('👤 Users table columns:');
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position;
      `);
      columnsResult.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabase();
