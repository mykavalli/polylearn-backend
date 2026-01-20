#!/usr/bin/env node

/**
 * Database migration runner using Node.js
 * Runs all SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env file
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'polylearn',
  user: process.env.DB_USER || 'polylearn_user',
  password: process.env.DB_PASSWORD || '',
};

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations() {
  console.log('🗄️  Running database migrations...');
  console.log(`Database: ${config.database}`);
  console.log(`Host: ${config.host}:${config.port}`);
  console.log('');

  // Connect to database
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all SQL files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    // Run each migration
    for (const file of files) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`📝 Running ${file}...`);
      
      try {
        await client.query(sql);
        console.log(`✅ ${file} completed\n`);
      } catch (error) {
        console.error(`❌ ${file} failed:`);
        console.error(error.message);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
