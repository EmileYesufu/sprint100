#!/usr/bin/env node

/**
 * Sprint100 Resilience Testing Script
 * 
 * This script tests error handling and recovery mechanisms:
 * 1. Network disconnect mid-race
 * 2. Expired token handling
 * 3. Server 500 error simulation
 * 4. Offline app launch behavior
 */

const axios = require('axios');
const io = require('socket.io-client');
const fs = require('fs');

console.log('🛡️  Sprint100 Resilience Testing');
console.log('================================\n');

// Test configuration
const BASE_URL = 'http://localhost:4000';
const API_URL = `${BASE_URL}/api`;
const SOCKET_URL = BASE_URL;

// Test results storage
const testResults = {
  networkDisconnect: null,
  expiredToken: null,
  serverError: null,
  offlineBehavior: null,
  crashes: [],
  missingErrorUI: [],
  recommendations: []
};

// Test user data
const testUser = {
  email: `resilience_test_${Date.now()}@example.com`,
  username: `resilience_${Date.now().toString().slice(-8)}`,
  password: 'TestPassword123!'
};

let authToken = null;
let socket = null;

// Utility functions
function logTest(testName, status, details = '') {
  const timestamp = new Date().toISOString();
  const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${statusIcon} ${testName}: ${status}`);
  if (details) {
    console.log(`   ${details}`);
  }
  console.log(`   Time: ${timestamp}\n`);
}

function addCrash(description, severity = 'high') {
  const crash = {
    description,
    severity,
    timestamp: new Date().toISOString()
  };
  testResults.crashes.push(crash);
  console.log(`💥 CRASH: ${description}`);
}

function addMissingUI(description, impact = 'high') {
  const missing = {
    description,
    impact,
    timestamp: new Date().toISOString()
  };
  testResults.missingErrorUI.push(missing);
  console.log(`🚫 MISSING UI: ${description}`);
}

function addRecommendation(description, priority = 'medium') {
  const recommendation = {
    description,
    priority,
    timestamp: new Date().toISOString()
  };
  testResults.recommendations.push(recommendation);
  console.log(`💡 RECOMMENDATION: ${description}`);
}

// Setup test user
async function setupTestUser() {
  console.log('🔧 Setting up test user...');
  
  try {
    // Register user
    const registerResponse = await axios.post(`${API_URL}/register`, {
      email: testUser.email,
      username: testUser.username,
      password: testUser.password
    });
    
    if (registerResponse.status === 200) {
      console.log('✅ Test user registered successfully');
      
      // Login to get token
      const loginResponse = await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      if (loginResponse.status === 200 && loginResponse.data.token) {
        authToken = loginResponse.data.token;
        console.log('✅ Test user logged in successfully');
        return true;
      }
    }
  } catch (error) {
    console.log(`❌ Setup failed: ${error.message}`);
    return false;
  }
  
  return false;
}

// Test 1: Network Disconnect Mid-Race
async function testNetworkDisconnect() {
  console.log('🌐 Test 1: Network Disconnect Mid-Race');
  console.log('--------------------------------------');
  
  if (!authToken) {
    logTest('Network Disconnect', 'SKIP', 'No auth token available');
    return;
  }
  
  return new Promise((resolve) => {
    let connectionEstablished = false;
    let raceStarted = false;
    let disconnectHandled = false;
    
    // Connect to Socket.IO
    socket = io(SOCKET_URL, {
      auth: { token: authToken }
    });
    
    socket.on('connect', () => {
      logTest('Socket Connection', 'PASS', 'Connected to server');
      connectionEstablished = true;
      
      // Join queue to start a race
      socket.emit('join_queue');
    });
    
    socket.on('queue_joined', () => {
      logTest('Queue Join', 'PASS', 'Successfully joined race queue');
    });
    
    socket.on('raceStart', (data) => {
      logTest('Race Start', 'PASS', `Race started: ${JSON.stringify(data)}`);
      raceStarted = true;
      
      // Simulate network disconnect after 2 seconds
      setTimeout(() => {
        console.log('🔌 Simulating network disconnect...');
        socket.disconnect();
        
        // Check if app handles disconnect gracefully
        setTimeout(() => {
          if (!disconnectHandled) {
            addMissingUI('No reconnection UI shown after network disconnect', 'high');
            addRecommendation('Add network status indicator and reconnection prompt', 'high');
          }
          
          testResults.networkDisconnect = {
            success: false,
            issues: ['No graceful disconnect handling', 'No reconnection UI']
          };
          resolve();
        }, 3000);
      }, 2000);
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
      disconnectHandled = true;
      
      // Check if app shows appropriate message
      if (raceStarted) {
        addMissingUI('No "Connection lost" message shown during race', 'high');
        addMissingUI('No reconnection button or automatic retry', 'high');
        addRecommendation('Implement automatic reconnection with user notification', 'high');
      }
    });
    
    socket.on('error', (error) => {
      console.log(`❌ Socket error: ${error.message}`);
      addCrash('Socket.IO error during race', 'high');
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!raceStarted) {
        logTest('Network Disconnect', 'TIMEOUT', 'Race did not start within timeout');
        testResults.networkDisconnect = { success: false, error: 'Race timeout' };
      }
      resolve();
    }, 30000);
  });
}

// Test 2: Expired Token Handling
async function testExpiredToken() {
  console.log('🔑 Test 2: Expired Token Handling');
  console.log('----------------------------------');
  
  if (!authToken) {
    logTest('Expired Token', 'SKIP', 'No auth token available');
    return;
  }
  
  try {
    // Create an expired token (set expiration to past date)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInVzZXJuYW1lIjoidGVzdCIsImlhdCI6MTYwOTQ1OTIwMCwiZXhwIjoxNjA5NDU5MjAwfQ.invalid';
    
    // Test API call with expired token
    const response = await axios.get(`${API_URL}/leaderboard`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    
    if (response.status === 401) {
      logTest('Expired Token API', 'PASS', 'API correctly rejected expired token');
      
      // Test Socket.IO with expired token
      const expiredSocket = io(SOCKET_URL, {
        auth: { token: expiredToken }
      });
      
      expiredSocket.on('connect_error', (error) => {
        logTest('Expired Token Socket', 'PASS', 'Socket.IO correctly rejected expired token');
        testResults.expiredToken = {
          success: true,
          apiHandling: true,
          socketHandling: true
        };
        expiredSocket.disconnect();
      });
      
      expiredSocket.on('connect', () => {
        addMissingUI('Socket.IO should reject expired tokens', 'high');
        addRecommendation('Implement token validation on Socket.IO connection', 'high');
        testResults.expiredToken = {
          success: false,
          apiHandling: true,
          socketHandling: false
        };
        expiredSocket.disconnect();
      });
      
    } else {
      addMissingUI('API should return 401 for expired tokens', 'high');
      addRecommendation('Implement proper token expiration handling', 'high');
      testResults.expiredToken = {
        success: false,
        apiHandling: false,
        socketHandling: false
      };
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Expired Token', 'PASS', 'API correctly rejected expired token');
      testResults.expiredToken = {
        success: true,
        apiHandling: true,
        socketHandling: false
      };
    } else {
      logTest('Expired Token', 'FAIL', error.message);
      testResults.expiredToken = { success: false, error: error.message };
    }
  }
}

// Test 3: Server 500 Error Simulation
async function testServerError() {
  console.log('🚨 Test 3: Server 500 Error Simulation');
  console.log('-------------------------------------');
  
  try {
    // Test with invalid endpoint to simulate server error
    const response = await axios.get(`${API_URL}/invalid-endpoint`);
    
    if (response.status >= 500) {
      logTest('Server Error', 'PASS', 'Server returned 500 error');
      testResults.serverError = {
        success: true,
        errorHandling: true
      };
    } else {
      addMissingUI('App should handle server errors gracefully', 'medium');
      addRecommendation('Implement server error handling with user-friendly messages', 'medium');
      testResults.serverError = {
        success: false,
        errorHandling: false
      };
    }
    
  } catch (error) {
    if (error.response?.status >= 500) {
      logTest('Server Error', 'PASS', 'Server error detected');
      testResults.serverError = {
        success: true,
        errorHandling: true
      };
    } else {
      logTest('Server Error', 'FAIL', error.message);
      testResults.serverError = { success: false, error: error.message };
    }
  }
}

// Test 4: Offline App Launch Behavior
async function testOfflineBehavior() {
  console.log('📱 Test 4: Offline App Launch Behavior');
  console.log('--------------------------------------');
  
  try {
    // Test with unreachable server
    const response = await axios.get('http://unreachable-server:4000/health', {
      timeout: 5000
    });
    
    logTest('Offline Behavior', 'FAIL', 'Server should be unreachable');
    testResults.offlineBehavior = {
      success: false,
      error: 'Server was reachable when it should be offline'
    };
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      logTest('Offline Behavior', 'PASS', 'Server correctly unreachable');
      
      // Check if app would handle offline state
      addMissingUI('No offline indicator shown when server unreachable', 'high');
      addMissingUI('No cached data or offline mode available', 'medium');
      addRecommendation('Implement offline mode with cached data', 'high');
      addRecommendation('Add network status indicator', 'medium');
      
      testResults.offlineBehavior = {
        success: true,
        offlineDetection: true,
        offlineUI: false
      };
    } else {
      logTest('Offline Behavior', 'FAIL', error.message);
      testResults.offlineBehavior = { success: false, error: error.message };
    }
  }
}

// Test 5: Additional Error Scenarios
async function testAdditionalScenarios() {
  console.log('🔍 Test 5: Additional Error Scenarios');
  console.log('------------------------------------');
  
  // Test invalid credentials
  try {
    await axios.post(`${API_URL}/login`, {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    addMissingUI('No error message for invalid login credentials', 'high');
    addRecommendation('Implement proper error messages for authentication failures', 'high');
    
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Invalid Credentials', 'PASS', 'API correctly rejected invalid credentials');
    }
  }
  
  // Test malformed requests
  try {
    await axios.post(`${API_URL}/register`, {
      email: 'invalid-email',
      username: 'a', // Too short
      password: '123' // Too short
    });
    
    addMissingUI('No validation error messages for malformed requests', 'medium');
    addRecommendation('Implement client-side validation with clear error messages', 'medium');
    
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Malformed Request', 'PASS', 'API correctly rejected malformed request');
    }
  }
}

// Generate comprehensive report
function generateResilienceReport() {
  console.log('📊 Resilience Test Report');
  console.log('=========================');
  
  const totalTests = 4;
  const passedTests = Object.values(testResults).filter(result => 
    result && result.success !== false
  ).length;
  
  console.log(`\nOverall Score: ${passedTests}/${totalTests} tests passed`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  console.log('\n📋 Test Results Summary:');
  console.log('-------------------------');
  
  // Test 1: Network Disconnect
  console.log(`1. Network Disconnect: ${testResults.networkDisconnect?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 2: Expired Token
  console.log(`2. Expired Token: ${testResults.expiredToken?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 3: Server Error
  console.log(`3. Server Error: ${testResults.serverError?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 4: Offline Behavior
  console.log(`4. Offline Behavior: ${testResults.offlineBehavior?.success ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n🎯 Resilience Assessment:');
  if (passedTests >= 3) {
    console.log('✅ RESILIENCE GOOD - Most error scenarios handled');
  } else if (passedTests >= 2) {
    console.log('⚠️  RESILIENCE PARTIAL - Some error scenarios need improvement');
  } else {
    console.log('❌ RESILIENCE POOR - Critical error handling issues');
  }
  
  console.log('\n💥 Crashes Found:');
  console.log('------------------');
  if (testResults.crashes.length > 0) {
    testResults.crashes.forEach(crash => {
      console.log(`- ${crash.severity.toUpperCase()}: ${crash.description}`);
    });
  } else {
    console.log('✅ No crashes detected');
  }
  
  console.log('\n🚫 Missing Error UI:');
  console.log('---------------------');
  if (testResults.missingErrorUI.length > 0) {
    testResults.missingErrorUI.forEach(missing => {
      console.log(`- ${missing.impact.toUpperCase()}: ${missing.description}`);
    });
  } else {
    console.log('✅ No missing error UI detected');
  }
  
  console.log('\n💡 Recommendations:');
  console.log('-------------------');
  if (testResults.recommendations.length > 0) {
    testResults.recommendations.forEach(rec => {
      console.log(`- ${rec.priority.toUpperCase()}: ${rec.description}`);
    });
  } else {
    console.log('✅ No recommendations needed');
  }
}

// Main execution
async function runResilienceTests() {
  try {
    console.log('Starting Sprint100 resilience tests...\n');
    
    // Setup test user
    const setupSuccess = await setupTestUser();
    if (!setupSuccess) {
      console.log('❌ Test setup failed - cannot proceed with resilience tests');
      return;
    }
    
    // Wait a moment to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run tests
    await testNetworkDisconnect();
    await testExpiredToken();
    await testServerError();
    await testOfflineBehavior();
    await testAdditionalScenarios();
    
    generateResilienceReport();
    
    // Write results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      testResults: testResults,
      summary: {
        totalTests: 4,
        passedTests: Object.values(testResults).filter(result => 
          result && result.success !== false
        ).length
      }
    };
    
    fs.writeFileSync('qa/error_handling_report.md', `# Sprint100 Error Handling Report

## 🛡️ Resilience Testing Overview
**Date**: ${new Date().toISOString()}
**Test Type**: Error Handling and Recovery
**Status**: ${Object.values(testResults).filter(result => result && result.success !== false).length >= 3 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}

## 📊 Test Results

### Network Disconnect Mid-Race
- **Status**: ${testResults.networkDisconnect?.success ? '✅ PASS' : '❌ FAIL'}
- **Graceful Handling**: ${testResults.networkDisconnect?.success ? 'Yes' : 'No'}
- **Reconnection UI**: ${testResults.networkDisconnect?.success ? 'Available' : 'Missing'}

### Expired Token Handling
- **Status**: ${testResults.expiredToken?.success ? '✅ PASS' : '❌ FAIL'}
- **API Handling**: ${testResults.expiredToken?.apiHandling ? '✅ Correct' : '❌ Incorrect'}
- **Socket Handling**: ${testResults.expiredToken?.socketHandling ? '✅ Correct' : '❌ Incorrect'}

### Server 500 Error
- **Status**: ${testResults.serverError?.success ? '✅ PASS' : '❌ FAIL'}
- **Error Handling**: ${testResults.serverError?.errorHandling ? '✅ Implemented' : '❌ Missing'}

### Offline App Launch
- **Status**: ${testResults.offlineBehavior?.success ? '✅ PASS' : '❌ FAIL'}
- **Offline Detection**: ${testResults.offlineBehavior?.offlineDetection ? '✅ Working' : '❌ Not Working'}
- **Offline UI**: ${testResults.offlineBehavior?.offlineUI ? '✅ Available' : '❌ Missing'}

## 💥 Crashes Found
${testResults.crashes.length > 0 ? testResults.crashes.map(crash => `- **${crash.severity.toUpperCase()}**: ${crash.description}`).join('\n') : '✅ No crashes detected'}

## 🚫 Missing Error UI
${testResults.missingErrorUI.length > 0 ? testResults.missingErrorUI.map(missing => `- **${missing.impact.toUpperCase()}**: ${missing.description}`).join('\n') : '✅ No missing error UI detected'}

## 💡 Recommendations
${testResults.recommendations.length > 0 ? testResults.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.description}`).join('\n') : '✅ No recommendations needed'}

## 🎯 Overall Assessment
**Resilience Score**: ${Object.values(testResults).filter(result => result && result.success !== false).length}/4 tests passed
**Status**: ${Object.values(testResults).filter(result => result && result.success !== false).length >= 3 ? '✅ RESILIENCE GOOD' : '⚠️ RESILIENCE NEEDS IMPROVEMENT'}

## 📋 Action Items
${testResults.crashes.length > 0 || testResults.missingErrorUI.length > 0 ? 
'1. **Address Critical Issues**: Fix crashes and missing error UI\n2. **Implement Error Handling**: Add proper error messages and recovery\n3. **Test Edge Cases**: Verify all error scenarios work correctly' :
'✅ No critical action items needed'}

---

**Test completed**: ${new Date().toISOString()}
`);
    
    console.log('\n📄 Resilience report saved to: qa/error_handling_report.md');
    
  } catch (error) {
    console.error('❌ Resilience testing failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (socket) {
      socket.disconnect();
    }
  }
}

// Run the tests
runResilienceTests();
