# Sprint100 Testing Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Test Environment Setup](#test-environment-setup)
- [Client Testing](#client-testing)
- [Server Testing](#server-testing)
- [Integration Testing](#integration-testing)
- [Performance Testing](#performance-testing)
- [Test Scenarios](#test-scenarios)

## 🎯 Overview

This document outlines comprehensive testing procedures for the Sprint100 racing game platform, covering both client and server components.

## 🛠 Test Environment Setup

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator
- PostgreSQL (for production testing)
- SQLite (for development testing)

### Environment Configuration

#### Development Environment
```bash
# Server
NODE_ENV=development
DATABASE_URL=file:./dev.db
JWT_SECRET=test_jwt_secret
ALLOWED_ORIGINS=http://localhost:8081

# Client
EXPO_PUBLIC_API_URL=http://localhost:4000
APP_ENV=development
```

#### Testing Environment
```bash
# Server
NODE_ENV=testing
DATABASE_URL=file:./test.db
JWT_SECRET=test_jwt_secret
ALLOWED_ORIGINS=http://localhost:8081
RATE_LIMIT_MAX=5000

# Client
EXPO_PUBLIC_API_URL=http://localhost:4000
APP_ENV=test
```

#### Rate Limiting Configuration
The server now supports environment-based rate limiting to prevent automated tests from being blocked:

- **Production/Development**: 100 requests per 15 minutes
- **Testing Environment**: 5000 requests per 15 minutes

When `NODE_ENV=testing`, the rate limiter automatically increases the limit to 5000 requests per window to accommodate automated testing scenarios.

#### Test Environment File
The server includes a `.env.test` file with testing-specific configuration:

```bash
# Load test environment
NODE_ENV=testing
RATE_LIMIT_MAX=5000
RATE_LIMIT_WINDOW_MS=900000
JWT_SECRET="test_jwt_secret_for_automated_testing_only"
ALLOWED_ORIGINS="*"
ENABLE_REQUEST_LOGGING="true"
```

This configuration provides:
- High rate limits (5000 requests per 15 minutes)
- Relaxed CORS (allows all origins)
- Test-specific JWT secret
- Request logging enabled for debugging

## 📱 Client Testing

### Unit Tests
```bash
cd client
npm test
```

### Component Testing
```bash
# Test specific components
npm test -- --testNamePattern="LoginScreen"
npm test -- --testNamePattern="RaceScreen"
```

### E2E Testing
```bash
# Start Expo development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android
```

### Manual Testing Scenarios

#### Authentication Flow
1. **User Registration**
   - [ ] User can register with email/password
   - [ ] Validation errors are displayed
   - [ ] Success redirects to main app

2. **User Login**
   - [ ] User can login with valid credentials
   - [ ] Invalid credentials show error
   - [ ] Success redirects to main app

3. **User Logout**
   - [ ] User can logout successfully
   - [ ] Redirects to login screen

#### Race Flow
1. **Queue System**
   - [ ] User can join queue
   - [ ] Queue status is displayed
   - [ ] User can leave queue

2. **Race Mechanics**
   - [ ] Race starts when enough players join
   - [ ] Race progress is displayed
   - [ ] Early finish logic works (4→3, 8→4)
   - [ ] Final placings are calculated correctly

3. **Real-time Updates**
   - [ ] Socket.IO connection established
   - [ ] Race updates received in real-time
   - [ ] Disconnection handling works

## 🖥 Server Testing

### Unit Tests
```bash
cd server
npm test
```

### Testing with Rate Limiting
```bash
# Run tests with testing environment (high rate limits)
NODE_ENV=testing npm test

# Run specific test suites
NODE_ENV=testing npm test -- --testNamePattern="auth"
NODE_ENV=testing npm test -- --testNamePattern="rate-limit"
```

### API Testing
```bash
# Test authentication endpoints
npm test -- --testNamePattern="auth"

# Test race endpoints
npm test -- --testNamePattern="race"

# Test leaderboard endpoints
npm test -- --testNamePattern="leaderboard"
```

### Database Testing
```bash
# Test database migrations
npx prisma migrate dev

# Test database queries
npm test -- --testNamePattern="database"
```

### Manual Testing Scenarios

#### API Endpoints
1. **Authentication**
   - [ ] POST /api/auth/register - User registration
   - [ ] POST /api/auth/login - User login
   - [ ] POST /api/auth/logout - User logout

2. **Race Management**
   - [ ] GET /api/races - List races
   - [ ] POST /api/races - Create race
   - [ ] GET /api/races/:id - Get race details

3. **User Management**
   - [ ] GET /api/users/:id - Get user profile
   - [ ] GET /api/users/:id/matches - Get user matches
   - [ ] GET /api/leaderboard - Get leaderboard

#### Socket.IO Testing
1. **Connection Management**
   - [ ] Client can connect to server
   - [ ] Connection is authenticated
   - [ ] Disconnection is handled gracefully

2. **Race Events**
   - [ ] joinQueue - User joins race queue
   - [ ] leaveQueue - User leaves race queue
   - [ ] raceStart - Race begins
   - [ ] raceUpdate - Race progress updates
   - [ ] raceEnd - Race finishes

## 🔗 Integration Testing

### Client-Server Integration
```bash
# Start both client and server
npm run dev

# Test full flow
npm run test:integration
```

### Test Scenarios

#### Complete Race Flow
1. **Setup**
   - [ ] Server starts successfully
   - [ ] Client connects to server
   - [ ] Database is accessible

2. **User Journey**
   - [ ] User registers account
   - [ ] User logs in
   - [ ] User joins race queue
   - [ ] Race starts with multiple players
   - [ ] Race progresses in real-time
   - [ ] Race ends with correct placings
   - [ ] ELO ratings are updated

3. **Error Handling**
   - [ ] Network disconnection is handled
   - [ ] Server errors are displayed to user
   - [ ] Invalid data is rejected

## ⚡ Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

### Test Scenarios

#### Concurrent Users
- [ ] 10 concurrent users
- [ ] 50 concurrent users
- [ ] 100 concurrent users

#### Race Performance
- [ ] Race with 2 players
- [ ] Race with 4 players
- [ ] Race with 8 players

#### Database Performance
- [ ] Query response times < 100ms
- [ ] Database connection pooling works
- [ ] No memory leaks

## 📊 Test Scenarios

### Critical Path Testing

#### 1. User Registration and Login
```bash
# Test user registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Test user login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### 2. Race Queue and Matching
```bash
# Test queue join
curl -X POST http://localhost:4000/api/queue/join \
  -H "Authorization: Bearer <token>"

# Test queue status
curl -X GET http://localhost:4000/api/queue/status \
  -H "Authorization: Bearer <token>"
```

#### 3. Race Execution
```bash
# Test race start
curl -X POST http://localhost:4000/api/races/start \
  -H "Authorization: Bearer <token>"

# Test race update
curl -X POST http://localhost:4000/api/races/:id/update \
  -H "Authorization: Bearer <token>" \
  -d '{"progress": 0.5}'
```

### Edge Case Testing

#### 1. Network Disconnection
- [ ] Client disconnects during race
- [ ] Server handles disconnection gracefully
- [ ] Race continues with remaining players

#### 2. Invalid Data
- [ ] Malformed JSON requests
- [ ] Invalid authentication tokens
- [ ] Out-of-range race progress values

#### 3. Concurrent Operations
- [ ] Multiple users join queue simultaneously
- [ ] Race starts while users are joining
- [ ] Database transactions are atomic

## 🐛 Bug Testing

### Known Issues Testing
- [ ] Race threshold logic (4→3, 8→4)
- [ ] ELO calculation accuracy
- [ ] Socket.IO reconnection
- [ ] Database migration issues

### Regression Testing
- [ ] Previously fixed bugs don't reoccur
- [ ] New features don't break existing functionality
- [ ] Performance remains stable

## 📋 Test Checklist

### Pre-Release Testing
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing scenarios completed
- [ ] Performance benchmarks met
- [ ] Security vulnerabilities addressed
- [ ] Documentation updated

### Post-Release Testing
- [ ] Production deployment successful
- [ ] User feedback collected
- [ ] Performance monitoring active
- [ ] Error tracking configured

## 🔧 Troubleshooting

### Common Issues

#### Client Issues
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro bundler
npx react-native start --reset-cache
```

#### Server Issues
```bash
# Reset database
npx prisma migrate reset

# Clear Node.js cache
rm -rf node_modules package-lock.json
npm install
```

#### Database Issues
```bash
# Check database connection
npx prisma db pull

# Run database migrations
npx prisma migrate deploy
```

## 📊 Test Results

### Test Coverage
- **Client**: 80%+ code coverage
- **Server**: 85%+ code coverage
- **Integration**: All critical paths tested

### Performance Benchmarks
- **API Response Time**: < 100ms
- **Database Queries**: < 50ms
- **Socket.IO Latency**: < 10ms
- **Memory Usage**: < 100MB

---

**Status**: ✅ Testing documentation complete for MVP release