#!/usr/bin/env node

/**
 * PolyLearn Backend - Complete System Test
 * Kiểm tra toàn bộ hệ thống backend
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  log('\n' + '='.repeat(60), colors.cyan);
  log(`  ${title}`, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

async function runTest(name, command) {
  try {
    log(`\n▶ Running: ${name}...`, colors.blue);
    const { stdout, stderr } = await execAsync(command);
    if (stderr && !stderr.includes('warning') && !stderr.includes('info')) {
      log(`⚠️  stderr: ${stderr}`, colors.yellow);
    }
    console.log(stdout);
    log(`✅ ${name} completed`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${name} failed`, colors.red);
    console.error(error.stdout || error.message);
    return false;
  }
}

async function main() {
  section('🚀 PolyLearn Backend - Complete System Test');
  
  log('\n📋 Test Suite:', colors.magenta);
  log('  1. Environment Check', colors.cyan);
  log('  2. Database Connection & Operations', colors.cyan);
  log('  3. Backend API Endpoints', colors.cyan);
  log('  4. Integration Test', colors.cyan);

  const results = {
    environment: false,
    database: false,
    api: false,
    integration: false,
  };

  // Test 1: Environment
  section('1️⃣  Environment Check');
  results.environment = await runTest(
    'Environment Configuration',
    'node test-backend.js'
  );

  // Test 2: Database
  section('2️⃣  Database Operations');
  results.database = await runTest(
    'Database CRUD Operations',
    'node test-database.js'
  );

  // Test 3: API Endpoints
  section('3️⃣  API Endpoints');
  log('\n⏳ Starting backend server for API tests...', colors.yellow);
  
  // Start server in background
  const serverProcess = exec('npm run dev', (error) => {
    if (error && !error.killed) {
      log(`Server error: ${error.message}`, colors.red);
    }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  results.api = await runTest(
    'API Endpoint Testing',
    'node test-api.js'
  );

  // Stop server
  serverProcess.kill();
  log('🛑 Backend server stopped', colors.yellow);

  // Final Summary
  section('📊 Test Summary');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;

  log('\nResults:', colors.magenta);
  log(`  Environment Check:     ${results.environment ? '✅ PASS' : '❌ FAIL'}`, 
      results.environment ? colors.green : colors.red);
  log(`  Database Operations:   ${results.database ? '✅ PASS' : '❌ FAIL'}`, 
      results.database ? colors.green : colors.red);
  log(`  API Endpoints:         ${results.api ? '✅ PASS' : '❌ FAIL'}`, 
      results.api ? colors.green : colors.red);

  log(`\n📈 Score: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? colors.green : colors.yellow);

  if (passedTests === totalTests) {
    section('🎉 ALL TESTS PASSED!');
    log('\n✅ Backend is fully functional and ready for deployment!', colors.green);
    log('\n📝 Next Steps:', colors.cyan);
    log('  1. Deploy to VPS: ssh polylearn@207.148.124.24', colors.yellow);
    log('  2. Start with PM2: pm2 start ecosystem.config.js', colors.yellow);
    log('  3. Monitor: pm2 logs polylearn-api', colors.yellow);
    log('  4. Test production API: curl http://207.148.124.24:3000/health', colors.yellow);
  } else {
    section('⚠️  SOME TESTS FAILED');
    log(`\n${failedTests} test(s) failed. Please review the errors above.`, colors.red);
  }

  section('');
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n⏹️  Tests interrupted by user', colors.yellow);
  process.exit(1);
});

main().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
