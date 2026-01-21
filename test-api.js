#!/usr/bin/env node

/**
 * API Testing Script
 * Test các endpoints của backend
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function httpRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({ 
            status: res.statusCode, 
            data: parsed,
            headers: res.headers 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: responseData,
            headers: res.headers 
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testHealthEndpoint(baseURL) {
  log('\n🏥 Testing Health Endpoint...', colors.blue);
  try {
    const response = await httpRequest(`${baseURL}/health`);
    if (response.status === 200) {
      log('✅ Health check passed', colors.green);
      console.log('   Status:', response.data.status);
      console.log('   Uptime:', Math.floor(response.data.uptime), 'seconds');
    } else {
      log(`❌ Health check failed with status ${response.status}`, colors.red);
    }
    return response.status === 200;
  } catch (error) {
    log(`❌ Health check error: ${error.message}`, colors.red);
    return false;
  }
}

async function testAuthEndpoints(baseURL) {
  log('\n🔐 Testing Auth Endpoints...', colors.blue);
  
  const tests = [
    {
      name: 'GET /v1/auth',
      method: 'GET',
      url: `${baseURL}/v1/auth`,
      expectedStatus: [404, 405], // No GET route
    },
    {
      name: 'POST /v1/auth/register (without data)',
      method: 'POST',
      url: `${baseURL}/v1/auth/register`,
      expectedStatus: [400, 422], // Validation error
    },
  ];

  for (const test of tests) {
    try {
      const response = await httpRequest(test.url, test.method, test.data);
      const statusOk = test.expectedStatus.includes(response.status);
      if (statusOk) {
        log(`  ✅ ${test.name}: ${response.status}`, colors.green);
      } else {
        log(`  ⚠️  ${test.name}: ${response.status} (expected ${test.expectedStatus.join(' or ')})`, colors.yellow);
      }
    } catch (error) {
      log(`  ❌ ${test.name}: ${error.message}`, colors.red);
    }
  }
}

async function testUserEndpoints(baseURL) {
  log('\n👤 Testing User Endpoints...', colors.blue);
  
  const tests = [
    {
      name: 'GET /v1/user (without auth)',
      method: 'GET',
      url: `${baseURL}/v1/user`,
      expectedStatus: [401, 404], // Unauthorized or not found
    },
    {
      name: 'GET /v1/user/profile (without auth)',
      method: 'GET',
      url: `${baseURL}/v1/user/profile`,
      expectedStatus: [401, 404],
    },
  ];

  for (const test of tests) {
    try {
      const response = await httpRequest(test.url, test.method);
      const statusOk = test.expectedStatus.includes(response.status);
      if (statusOk) {
        log(`  ✅ ${test.name}: ${response.status}`, colors.green);
      } else {
        log(`  ⚠️  ${test.name}: ${response.status}`, colors.yellow);
        if (response.data) {
          console.log('     Response:', JSON.stringify(response.data).substring(0, 100));
        }
      }
    } catch (error) {
      log(`  ❌ ${test.name}: ${error.message}`, colors.red);
    }
  }
}

async function testPetEndpoints(baseURL) {
  log('\n🐾 Testing Pet Endpoints...', colors.blue);
  
  const tests = [
    {
      name: 'GET /v1/pet (without auth)',
      method: 'GET',
      url: `${baseURL}/v1/pet`,
      expectedStatus: [401, 404],
    },
  ];

  for (const test of tests) {
    try {
      const response = await httpRequest(test.url, test.method);
      const statusOk = test.expectedStatus.includes(response.status);
      if (statusOk) {
        log(`  ✅ ${test.name}: ${response.status}`, colors.green);
      } else {
        log(`  ⚠️  ${test.name}: ${response.status}`, colors.yellow);
      }
    } catch (error) {
      log(`  ❌ ${test.name}: ${error.message}`, colors.red);
    }
  }
}

async function testLessonEndpoints(baseURL) {
  log('\n📚 Testing Lesson Endpoints...', colors.blue);
  
  const tests = [
    {
      name: 'GET /v1/lessons',
      method: 'GET',
      url: `${baseURL}/v1/lessons`,
      expectedStatus: [200, 401, 404],
    },
    {
      name: 'GET /v1/lessons/1',
      method: 'GET',
      url: `${baseURL}/v1/lessons/1`,
      expectedStatus: [200, 401, 404],
    },
  ];

  for (const test of tests) {
    try {
      const response = await httpRequest(test.url, test.method);
      const statusOk = test.expectedStatus.includes(response.status);
      if (statusOk) {
        log(`  ✅ ${test.name}: ${response.status}`, colors.green);
        if (response.status === 200 && response.data) {
          console.log('     Data:', JSON.stringify(response.data).substring(0, 150) + '...');
        }
      } else {
        log(`  ⚠️  ${test.name}: ${response.status}`, colors.yellow);
      }
    } catch (error) {
      log(`  ❌ ${test.name}: ${error.message}`, colors.red);
    }
  }
}

async function test404(baseURL) {
  log('\n🚫 Testing 404 Handler...', colors.blue);
  try {
    const response = await httpRequest(`${baseURL}/nonexistent-endpoint`);
    if (response.status === 404) {
      log('  ✅ 404 handler works correctly', colors.green);
      if (response.data) {
        console.log('     Response:', JSON.stringify(response.data));
      }
    } else {
      log(`  ⚠️  Expected 404 but got ${response.status}`, colors.yellow);
    }
  } catch (error) {
    log(`  ❌ 404 test error: ${error.message}`, colors.red);
  }
}

async function main() {
  const baseURL = process.argv[2] || 'http://localhost:3000';
  
  log('=========================================', colors.cyan);
  log('   PolyLearn API - Endpoint Testing', colors.cyan);
  log('=========================================', colors.cyan);
  log(`\n🌐 Testing: ${baseURL}`, colors.blue);

  // Test health first
  const healthOk = await testHealthEndpoint(baseURL);
  
  if (!healthOk) {
    log('\n❌ Server is not responding. Make sure it\'s running:', colors.red);
    log('   npm run dev', colors.yellow);
    process.exit(1);
  }

  // Test all endpoints
  await testAuthEndpoints(baseURL);
  await testUserEndpoints(baseURL);
  await testPetEndpoints(baseURL);
  await testLessonEndpoints(baseURL);
  await test404(baseURL);

  log('\n=========================================', colors.cyan);
  log('✅ API Testing Complete!', colors.green);
  log('=========================================', colors.cyan);
}

main().catch(error => {
  log(`\n❌ Test Error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
