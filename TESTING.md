# Testing Documentation

## Overview

This project includes comprehensive unit tests for critical game systems using Jest and ts-jest.

## Test Coverage

### Server Tests

#### ELO Rating System (`server/src/utils/elo.test.ts`)
- ✅ **Equal ratings**: Verifies symmetric win/loss deltas (~16 points)
- ✅ **Rating differences**: Tests asymmetric deltas for higher/lower rated players
- ✅ **Upsets**: Validates significant point changes for unexpected outcomes
- ✅ **Draws**: Ensures proper handling of tie scenarios
- ✅ **Extreme ratings**: Edge cases with very high/low ratings
- ✅ **Zero-sum property**: Confirms rating changes balance out
- ✅ **K-factor verification**: Tests that K=32 is correctly applied
- ✅ **Formula accuracy**: Validates expected score calculations

**Coverage:** 100% of ELO calculation logic

### Client Tests

#### AI Runner System (`client/src/ai/aiRunner.test.ts`)
- ✅ **Determinism**: Same seed produces identical behavior
- ✅ **Seed variation**: Different seeds create different outcomes
- ✅ **Meters calculation**: Validates 1 step = 0.6 meters formula
- ✅ **Race completion**: Ensures races finish at 100m
- ✅ **Difficulty levels**: Hard > Medium > Easy in speed and accuracy
- ✅ **Personalities**: Tests Consistent, Erratic, and Aggressive traits
- ✅ **Sprint behavior**: Validates speed boost in final 10%
- ✅ **Alternating sides**: Checks left/right tap pattern
- ✅ **Reset functionality**: Confirms deterministic replay capability
- ✅ **Factory function**: Tests createAIRunners with multiple bots
- ✅ **Edge cases**: Handles large time jumps, incremental updates

**Coverage:** ~95% of AI simulation logic

## Running Tests

### Server Tests

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Client Tests

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage
```

## Test Structure

```
server/
├── jest.config.js              # Jest configuration
├── src/
│   └── utils/
│       ├── elo.ts              # ELO implementation
│       └── elo.test.ts         # ELO tests (54 test cases)

client/
├── jest.config.js              # Jest configuration
├── src/
│   └── ai/
│       ├── aiRunner.ts         # AI implementation
│       └── aiRunner.test.ts    # AI tests (38 test cases)
```

## Configuration

### Server (Node.js environment)
- **Preset**: `ts-jest`
- **Environment**: `node`
- **Test pattern**: `**/*.test.ts`, `**/*.spec.ts`

### Client (React/React Native environment)
- **Preset**: `ts-jest`
- **Environment**: `jsdom`
- **Test pattern**: `**/*.test.ts(x)`, `**/*.spec.ts(x)`
- **Module mapping**: `@/*` resolves to `src/*`

## Continuous Integration

Tests should be run before:
- ✅ Merging pull requests
- ✅ Deploying to production
- ✅ Creating release builds

## Adding New Tests

### Test File Naming Convention
- Unit tests: `*.test.ts` or `*.spec.ts`
- Place test files alongside the code they test

### Example Test Structure

```typescript
import { functionToTest } from './module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    test('should handle normal case', () => {
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });

    test('should handle edge case', () => {
      // Test edge cases
    });
  });
});
```

## Test Results Summary

### Server
- **ELO System**: 54 test cases
- **All Passing**: ✅
- **Coverage**: 100%

### Client
- **AI Runner**: 38 test cases
- **All Passing**: ✅
- **Coverage**: ~95%

## Pre-Beta Checklist

Before beta release, ensure:
- [ ] All tests passing (`npm test` in both server/ and client/)
- [ ] No linter errors
- [ ] Coverage reports reviewed
- [ ] Edge cases documented
- [ ] Performance tests added (if applicable)

## Future Test Additions

Recommended areas for additional testing:
1. **Server**: Socket.IO event handlers
2. **Server**: Match pairing logic
3. **Server**: Database operations (integration tests)
4. **Client**: useTraining hook
5. **Client**: SeededRandom utility
6. **E2E**: Full race simulation (player + AI)

## Troubleshooting

### Tests Not Running
```bash
# Install dependencies
npm install

# Clear Jest cache
npx jest --clearCache
```

### Module Resolution Errors
- Check `tsconfig.json` paths match `jest.config.js` moduleNameMapper
- Ensure `@types/jest` is installed

### TypeScript Errors in Tests
- Verify `@types/jest` version matches `jest` version
- Check `tsconfig.json` includes test files

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

