#!/usr/bin/env node

/**
 * Run a single migration file
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'polylearn',
  user: process.env.DB_USER || 'polylearn_user',
  password: process.env.DB_PASSWORD || '',
};

async function runSingleMigration(filename) {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const filePath = path.join(__dirname, 'migrations', filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filename}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`📝 Running ${filename}...`);
    
    await client.query(sql);
    console.log(`✅ ${filename} completed successfully!\n`);

  } catch (error) {
    console.error(`❌ Migration failed:`);
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node run-single-migration.js <filename>');
  console.error('Example: node run-single-migration.js 007_update_users_table.sql');
  process.exit(1);
}

runSingleMigration(filename);
