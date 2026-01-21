#!/usr/bin/env node

/**
 * Backend Testing Script
 * Kiểm tra toàn bộ backend setup
 */

const { Client } = require('pg');
const http = require('http');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabase() {
  log('\n📊 Testing Database Connection...', colors.blue);
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'polylearn',
    user: process.env.DB_USER || 'polylearn_user',
    password: process.env.DB_PASSWORD || '',
  };

  const client = new Client(config);
  
  try {
    await client.connect();
    log('✅ Database connected successfully', colors.green);

    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    log(`\n📋 Found ${tablesResult.rows.length} tables:`, colors.blue);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check migrations table
    const migrations = await client.query(`
      SELECT version, name, run_on 
      FROM pgmigrations 
      ORDER BY run_on DESC 
      LIMIT 5;
    `).catch(() => null);

    if (migrations && migrations.rows.length > 0) {
      log(`\n📝 Recent Migrations:`, colors.blue);
      migrations.rows.forEach(row => {
        console.log(`  - ${row.version}: ${row.name}`);
      });
    }

    await client.end();
    return true;
  } catch (error) {
    log(`❌ Database Error: ${error.message}`, colors.red);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

function httpRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
      });
    }).on('error', reject);
  });
}

async function testServer(baseURL = 'http://localhost:3000') {
  log('\n🚀 Testing Server Endpoints...', colors.blue);
  
  try {
    // Test health endpoint
    const healthResponse = await httpRequest(`${baseURL}/health`);
    if (healthResponse.status === 200) {
      log('✅ Health check passed', colors.green);
      console.log('  Response:', JSON.stringify(healthResponse.data, null, 2));
    }

    // Test API endpoints (basic check without auth)
    const endpoints = [
      '/v1/auth',
      '/v1/user',
      '/v1/pet',
      '/v1/lessons',
    ];

    log(`\n🔍 Checking API Endpoints...`, colors.blue);
    for (const endpoint of endpoints) {
      try {
        const response = await httpRequest(`${baseURL}${endpoint}`);
        log(`  ${endpoint}: ${response.status}`, colors.green);
      } catch (error) {
        log(`  ${endpoint}: Connection failed - ${error.message}`, colors.red);
      }
    }

    return true;
  } catch (error) {
    log(`❌ Server Error: ${error.message}`, colors.red);
    log('   Make sure the server is running (npm run dev)', colors.yellow);
    return false;
  }
}

async function checkEnvironment() {
  log('\n🔧 Checking Environment...', colors.blue);
  
  const requiredVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'FIREBASE_PROJECT_ID',
  ];

  let allSet = true;
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value === 'your_password_here' || value === 'your_random_secret_key_change_this_in_production') {
      log(`  ❌ ${varName}: Not set or using default value`, colors.red);
      allSet = false;
    } else {
      const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') 
        ? '***' 
        : value;
      log(`  ✅ ${varName}: ${displayValue}`, colors.green);
    }
  }

  return allSet;
}

async function main() {
  log('=========================================', colors.blue);
  log('   PolyLearn Backend - System Test', colors.blue);
  log('=========================================', colors.blue);

  // Check environment
  const envOk = await checkEnvironment();
  
  // Test database
  const dbOk = await testDatabase();
  
  // Ask if user wants to test server
  log('\n📋 Database test complete!', colors.blue);
  
  if (!dbOk) {
    log('\n⚠️  Database test failed. Please check your configuration.', colors.yellow);
    log('   1. Make sure PostgreSQL is running', colors.yellow);
    log('   2. Check .env file for correct credentials', colors.yellow);
    log('   3. Run migrations: npm run migrate:up', colors.yellow);
  }

  if (envOk && dbOk) {
    log('\n✅ All checks passed!', colors.green);
    log('\nTo test the API server:', colors.blue);
    log('  1. Start server: npm run dev', colors.yellow);
    log('  2. Then run: node test-backend.js --server', colors.yellow);
  }

  // If --server flag is passed, test server
  if (process.argv.includes('--server')) {
    await testServer();
  }
}

main().catch(error => {
  log(`\n❌ Unexpected Error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
