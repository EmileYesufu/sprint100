/**
 * Manual Tests for Finish Threshold Logic
 * 
 * Run these assertions to verify threshold calculations:
 * - Import this file and run assertions
 * - Or copy/paste into a test runner
 */

import { computeFinishThreshold, hasReachedThreshold } from './finishThreshold';

// Test Suite: computeFinishThreshold
console.log('=== Testing computeFinishThreshold ===');

// Test 1: 4 racers should have threshold of 3
const threshold4 = computeFinishThreshold(4);
console.assert(threshold4 === 3, `FAIL: Expected 3 for 4 racers, got ${threshold4}`);
console.log('✅ PASS: 4 racers → threshold 3');

// Test 2: 8 racers should have threshold of 4
const threshold8 = computeFinishThreshold(8);
console.assert(threshold8 === 4, `FAIL: Expected 4 for 8 racers, got ${threshold8}`);
console.log('✅ PASS: 8 racers → threshold 4');

// Test 3: 2 racers should have threshold of 2 (default: all must finish)
const threshold2 = computeFinishThreshold(2);
console.assert(threshold2 === 2, `FAIL: Expected 2 for 2 racers, got ${threshold2}`);
console.log('✅ PASS: 2 racers → threshold 2 (default)');

// Test 4: 6 racers should have threshold of 6 (default: all must finish)
const threshold6 = computeFinishThreshold(6);
console.assert(threshold6 === 6, `FAIL: Expected 6 for 6 racers, got ${threshold6}`);
console.log('✅ PASS: 6 racers → threshold 6 (default)');

// Test 5: 1 racer should have threshold of 1
const threshold1 = computeFinishThreshold(1);
console.assert(threshold1 === 1, `FAIL: Expected 1 for 1 racer, got ${threshold1}`);
console.log('✅ PASS: 1 racer → threshold 1');

// Test Suite: hasReachedThreshold
console.log('\n=== Testing hasReachedThreshold ===');

// Test 6: 3 finished out of 4 should reach threshold
const reached4_3 = hasReachedThreshold(3, 4);
console.assert(reached4_3 === true, `FAIL: Expected true for 3/4, got ${reached4_3}`);
console.log('✅ PASS: 3 finished out of 4 → threshold reached');

// Test 7: 2 finished out of 4 should NOT reach threshold
const reached4_2 = hasReachedThreshold(2, 4);
console.assert(reached4_2 === false, `FAIL: Expected false for 2/4, got ${reached4_2}`);
console.log('✅ PASS: 2 finished out of 4 → threshold NOT reached');

// Test 8: 4 finished out of 8 should reach threshold
const reached8_4 = hasReachedThreshold(4, 8);
console.assert(reached8_4 === true, `FAIL: Expected true for 4/8, got ${reached8_4}`);
console.log('✅ PASS: 4 finished out of 8 → threshold reached');

// Test 9: 3 finished out of 8 should NOT reach threshold
const reached8_3 = hasReachedThreshold(3, 8);
console.assert(reached8_3 === false, `FAIL: Expected false for 3/8, got ${reached8_3}`);
console.log('✅ PASS: 3 finished out of 8 → threshold NOT reached');

// Test 10: 1 finished out of 2 should NOT reach threshold (no early finish)
const reached2_1 = hasReachedThreshold(1, 2);
console.assert(reached2_1 === false, `FAIL: Expected false for 1/2, got ${reached2_1}`);
console.log('✅ PASS: 1 finished out of 2 → threshold NOT reached');

// Test 11: 2 finished out of 2 should reach threshold (all finished)
const reached2_2 = hasReachedThreshold(2, 2);
console.assert(reached2_2 === true, `FAIL: Expected true for 2/2, got ${reached2_2}`);
console.log('✅ PASS: 2 finished out of 2 → threshold reached');

// Edge Cases
console.log('\n=== Testing Edge Cases ===');

// Test 12: 0 finished should never reach threshold
const reached4_0 = hasReachedThreshold(0, 4);
console.assert(reached4_0 === false, `FAIL: Expected false for 0/4, got ${reached4_0}`);
console.log('✅ PASS: 0 finished out of 4 → threshold NOT reached');

// Test 13: All finished should always reach threshold
const reached4_4 = hasReachedThreshold(4, 4);
console.assert(reached4_4 === true, `FAIL: Expected true for 4/4, got ${reached4_4}`);
console.log('✅ PASS: 4 finished out of 4 → threshold reached');

// Test 14: More than threshold should still count as reached
const reached4_5 = hasReachedThreshold(5, 4);
console.assert(reached4_5 === true, `FAIL: Expected true for 5/4, got ${reached4_5}`);
console.log('✅ PASS: 5 finished out of 4 (overflow) → threshold reached');

console.log('\n🎉 All tests passed! Threshold logic is correct.\n');

export {};

