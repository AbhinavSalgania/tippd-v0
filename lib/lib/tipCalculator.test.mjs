import { calculateTipDistribution } from './tipCalculator.js';
import assert from 'assert';

// Helper function to compare floating point numbers with tolerance
function assertEqual(actual, expected, message) {
  const tolerance = 0.01;
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: Expected ${expected}, got ${actual}`);
  }
}

// Test Case 1: Normal shift (1 bartender, sales >= $150)
console.log('Test 1: Normal shift');
const test1 = calculateTipDistribution(1000, 200, 1);
assertEqual(test1.bartenderTipout, 10.00, 'Bartender tip-out');
assertEqual(test1.kitchenTipout, 50.00, 'Kitchen tip-out');
assertEqual(test1.netTips, 140.00, 'Net tips');
assert.strictEqual(test1.hasError, false, 'Should not have error');
assert.strictEqual(test1.errorMessage, null, 'Should not have error message');
assert.strictEqual(test1.breakdown.length, 4, 'Should have 4 breakdown items');
console.log('✓ Test 1 passed');
console.log(test1);
console.log('');

// Test Case 2: Two bartenders
console.log('Test 2: Two bartenders');
const test2 = calculateTipDistribution(1500, 250, 2);
assertEqual(test2.bartenderTipout, 30.00, 'Bartender tip-out (2% of 1500)');
assertEqual(test2.kitchenTipout, 75.00, 'Kitchen tip-out (5% of 1500)');
assertEqual(test2.netTips, 145.00, 'Net tips');
assert.strictEqual(test2.hasError, false, 'Should not have error');
assert.strictEqual(test2.errorMessage, null, 'Should not have error message');
console.log('✓ Test 2 passed');
console.log(test2);
console.log('');

// Test Case 3: Below minimum sales (< $150)
console.log('Test 3: Below minimum sales');
const test3 = calculateTipDistribution(100, 50, 1);
assertEqual(test3.bartenderTipout, 0.00, 'Bartender tip-out should be 0');
assertEqual(test3.kitchenTipout, 0.00, 'Kitchen tip-out should be 0');
assertEqual(test3.netTips, 50.00, 'Net tips should equal tips collected');
assert.strictEqual(test3.hasError, false, 'Should not have error');
assert.strictEqual(test3.errorMessage, null, 'Should not have error message');
assert(test3.breakdown.some(item => item.includes('Sales below $150')), 'Should mention sales below $150');
console.log('✓ Test 3 passed');
console.log(test3);
console.log('');

// Test Case 4: Error case (negative net tips)
console.log('Test 4: Error case - negative net tips');
const test4 = calculateTipDistribution(2000, 50, 2);
assertEqual(test4.bartenderTipout, 40.00, 'Bartender tip-out (2% of 2000)');
assertEqual(test4.kitchenTipout, 100.00, 'Kitchen tip-out (5% of 2000)');
assertEqual(test4.netTips, 0.00, 'Net tips should be capped at 0');
assert.strictEqual(test4.hasError, true, 'Should have error flag');
assert(test4.errorMessage !== null, 'Should have error message');
assert(test4.errorMessage.includes('negative'), 'Error message should mention negative');
console.log('✓ Test 4 passed');
console.log(test4);
console.log('');

console.log('All tests passed! ✓');
