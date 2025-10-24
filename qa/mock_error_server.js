#!/usr/bin/env node

/**
 * Mock Error Server for Sprint100 Resilience Testing
 * 
 * This server simulates various error conditions to test
 * client resilience and error handling.
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4001; // Different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚨 Mock Error Server for Resilience Testing');
console.log('==========================================\n');

// Track request count for rate limiting simulation
let requestCount = 0;

// Simulate server 500 error
app.get('/api/health', (req, res) => {
  console.log('📡 Health check requested');
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Database connection failed',
    timestamp: new Date().toISOString()
  });
});

// Simulate authentication errors
app.post('/api/login', (req, res) => {
  console.log('🔑 Login attempt');
  
  // Simulate different error scenarios
  const errorType = req.query.error || 'none';
  
  switch (errorType) {
    case '500':
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Authentication service unavailable'
      });
      break;
    case 'timeout':
      // Simulate timeout by not responding
      setTimeout(() => {
        res.status(408).json({ 
          error: 'Request Timeout',
          message: 'Server took too long to respond'
        });
      }, 10000);
      break;
    case 'network':
      // Simulate network error by closing connection
      res.connection.destroy();
      break;
    default:
      res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
  }
});

// Simulate registration errors
app.post('/api/register', (req, res) => {
  console.log('📝 Registration attempt');
  
  const errorType = req.query.error || 'validation';
  
  switch (errorType) {
    case '500':
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'User service unavailable'
      });
      break;
    case 'duplicate':
      res.status(409).json({ 
        error: 'User already exists',
        message: 'Email or username is already taken'
      });
      break;
    case 'validation':
      res.status(400).json({ 
        error: 'Validation Error',
        message: 'Invalid username format',
        details: {
          username: 'Username must be 3-20 characters long'
        }
      });
      break;
    default:
      res.status(201).json({ 
        message: 'User created successfully',
        user: { id: 1, email: req.body.email, username: req.body.username }
      });
  }
});

// Simulate rate limiting
app.get('/api/leaderboard', (req, res) => {
  console.log('📊 Leaderboard request');
  requestCount++;
  
  if (requestCount > 3) {
    res.status(429).json({ 
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 900
    });
  } else {
    res.json([
      { id: 1, username: 'player1', elo: 1200 },
      { id: 2, username: 'player2', elo: 1150 }
    ]);
  }
});

// Simulate database errors
app.get('/api/users/:id/matches', (req, res) => {
  console.log('👤 User matches request');
  
  const errorType = req.query.error || 'db';
  
  switch (errorType) {
    case 'db':
      res.status(500).json({ 
        error: 'Database Error',
        message: 'Unable to connect to database',
        code: 'DB_CONNECTION_FAILED'
      });
      break;
    case 'timeout':
      res.status(408).json({ 
        error: 'Request Timeout',
        message: 'Database query timed out'
      });
      break;
    default:
      res.json([]);
  }
});

// Simulate Socket.IO connection errors
app.get('/api/socket-test', (req, res) => {
  console.log('🔌 Socket.IO test request');
  
  res.json({
    message: 'Socket.IO connection test',
    status: 'error',
    error: 'Connection refused',
    code: 'ECONNREFUSED'
  });
});

// Simulate malformed responses
app.get('/api/malformed', (req, res) => {
  console.log('🔧 Malformed response test');
  
  // Send malformed JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send('{"incomplete": "json"');
});

// Simulate slow responses
app.get('/api/slow', (req, res) => {
  console.log('🐌 Slow response test');
  
  setTimeout(() => {
    res.json({ 
      message: 'Slow response',
      delay: '5 seconds'
    });
  }, 5000);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❓ Unknown endpoint:', req.path);
  res.status(404).json({ 
    error: 'Not Found',
    message: `Endpoint ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚨 Mock Error Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available Error Scenarios:');
  console.log('================================');
  console.log('GET  /api/health              - Server 500 error');
  console.log('POST /api/login?error=500     - Login 500 error');
  console.log('POST /api/login?error=timeout  - Login timeout');
  console.log('POST /api/login?error=network - Network error');
  console.log('POST /api/register?error=500  - Registration 500 error');
  console.log('POST /api/register?error=duplicate - Duplicate user error');
  console.log('GET  /api/leaderboard         - Rate limiting (after 3 requests)');
  console.log('GET  /api/users/1/matches?error=db - Database error');
  console.log('GET  /api/users/1/matches?error=timeout - Database timeout');
  console.log('GET  /api/socket-test         - Socket.IO connection error');
  console.log('GET  /api/malformed           - Malformed JSON response');
  console.log('GET  /api/slow                - Slow response (5 seconds)');
  console.log('\n💡 Usage:');
  console.log('1. Start this server: node qa/mock_error_server.js');
  console.log('2. Update client API_URL to http://localhost:4001');
  console.log('3. Test different error scenarios');
  console.log('4. Observe client error handling');
  console.log('\n🛑 Press Ctrl+C to stop the server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock error server...');
  process.exit(0);
});
