import {
  calculateTipDistribution,
  calculateWorkerObligations,
  calculateServicePeriodPayouts,
  calculateWeeklyKitchenPayouts
} from './tipCalculator.js';
import assert from 'assert';

function roundHalfAwayFromZeroToInt(value) {
  return value >= 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
}

function toCents(dollars) {
  return roundHalfAwayFromZeroToInt(dollars * 100);
}

function assertMoneyEqual(actualDollars, expectedDollars, label) {
  assert.strictEqual(toCents(actualDollars), toCents(expectedDollars), `${label} (cents exact)`);
}

// 1) sales < 150 => no contributions, net equals tipsCollected, amountOwedToHouse=0
console.log('Test 1: Threshold per-worker (sales < $150) => no contributions');
{
  const r = calculateWorkerObligations({ role: 'server', sales: 100, tipsCollected: 50 });
  assert.strictEqual(r.hasError, false);
  assert.strictEqual(r.eligible, false);
  assertMoneyEqual(r.kitchenContribution, 0, 'kitchenContribution');
  assertMoneyEqual(r.bartenderContribution, 0, 'bartenderContribution');
  assertMoneyEqual(r.netAfterContributions, 50, 'netAfterContributions');
  assertMoneyEqual(r.amountOwedToHouse, 0, 'amountOwedToHouse');
  assert(r.lineItems.some((s) => s.includes('Sales below')), 'lineItems should mention threshold');
}
console.log('✓ Test 1 passed\n');

// A) Legacy wrapper remains working; bartenderCount must be 1 or 2 and negative net is not capped
console.log('Test 2: Legacy wrapper still works; bartenderCount=0 invalid; negative net not capped');
{
  const invalid = calculateTipDistribution(1000, 200, 0);
  assert.strictEqual(invalid.hasError, true);
  assert(invalid.errorMessage.includes('1 or 2'));

  const neg = calculateTipDistribution(1000, 10, 2); // eligible, contributions exceed tips
  assert.strictEqual(neg.hasError, false);
  assertMoneyEqual(neg.bartenderTipout, 20, 'legacy bartenderTipout');
  assertMoneyEqual(neg.kitchenTipout, 50, 'legacy kitchenTipout');
  assertMoneyEqual(neg.netTips, -60, 'legacy netTips');
  assertMoneyEqual(neg.amountOwedToHouse, 60, 'legacy amountOwedToHouse');
}
console.log('✓ Test 2 passed\n');

// 2) bartenderCount derived from workers; 1 vs 2 changes bartender pool totals and bartender shares
console.log('Test 3: Derived bartenderCount (1 vs 2) changes pool totals and shares');
{
  const workers1 = [
    { employeeId: 'b1', role: 'bartender', sales: 500, tipsCollected: 60 },
    { employeeId: 's1', role: 'server', sales: 1000, tipsCollected: 200 }
  ];
  const period1 = calculateServicePeriodPayouts({ servicePeriodId: 'lunch-1', workers: workers1 });
  assert.strictEqual(period1.hasError, false);
  assertMoneyEqual(period1.bartenderPoolTotal, 10, 'bartenderPoolTotal (1 bartender => 1%)');
  assertMoneyEqual(period1.bartenderShare, 10, 'bartenderShare (avg)');

  const workers2 = [
    { employeeId: 'b1', role: 'bartender', sales: 500, tipsCollected: 60 },
    { employeeId: 'b2', role: 'bartender', sales: 400, tipsCollected: 40 },
    { employeeId: 's1', role: 'server', sales: 1000, tipsCollected: 200 }
  ];
  const period2 = calculateServicePeriodPayouts({ servicePeriodId: 'lunch-2', workers: workers2 });
  assert.strictEqual(period2.hasError, false);
  assertMoneyEqual(period2.bartenderPoolTotal, 20, 'bartenderPoolTotal (2 bartenders => 2%)');
  assertMoneyEqual(period2.bartenderShare, 10, 'bartenderShare (avg floor)');

  const b1 = period2.payoutsByWorker.find((w) => w.employeeId === 'b1');
  const b2 = period2.payoutsByWorker.find((w) => w.employeeId === 'b2');
  assertMoneyEqual(b1.bartenderShareReceived, 10, 'b1 share');
  assertMoneyEqual(b2.bartenderShareReceived, 10, 'b2 share');
}
console.log('✓ Test 3 passed\n');

// 3) bartender receives share AND pays kitchen contribution on their own sales
console.log('Test 4: Bartender receives share and pays kitchen contribution');
{
  const workers = [
    { employeeId: 'b1', role: 'bartender', sales: 500, tipsCollected: 50 },
    { employeeId: 's1', role: 'server', sales: 1000, tipsCollected: 200 }
  ];
  const period = calculateServicePeriodPayouts({ servicePeriodId: 'dinner-1', workers });
  assert.strictEqual(period.hasError, false);

  const bartender = period.payoutsByWorker.find((w) => w.employeeId === 'b1');
  assertMoneyEqual(bartender.kitchenContribution, 25, 'bartender kitchen contribution (5% of 500)');
  assertMoneyEqual(bartender.bartenderContribution, 0, 'bartender bartenderContribution');
  assert(toCents(bartender.bartenderShareReceived) > 0, 'bartender should receive some share');
}
console.log('✓ Test 4 passed\n');

// 4) negative net => amountOwedToHouse matches exactly (no capping)
console.log('Test 5: Negative net => amountOwedToHouse exact, no capping');
{
  const workers = [
    { employeeId: 'b1', role: 'bartender', sales: 500, tipsCollected: 0 },
    { employeeId: 's1', role: 'server', sales: 1000, tipsCollected: 10 }
  ];
  const period = calculateServicePeriodPayouts({ servicePeriodId: 'dinner-2', workers });
  assert.strictEqual(period.hasError, false);

  const server = period.payoutsByWorker.find((w) => w.employeeId === 's1');
  assert(toCents(server.netTips) < 0, 'server netTips should be negative');
  assert.strictEqual(toCents(server.amountOwedToHouse), -toCents(server.netTips), 'owed == -net');
}
console.log('✓ Test 5 passed\n');

// 5) lunch vs dinner pools remain separate (no mixing)
// 6) weekly kitchen payout distributes correctly by weighted hours + manager weight; totals reconcile
console.log('Test 6: Lunch vs dinner separation + weekly kitchen payout weighted hours');
{
  const lunchWorkers = [
    { employeeId: 'b1', role: 'bartender', sales: 500, tipsCollected: 60 },
    { employeeId: 's1', role: 'server', sales: 1000, tipsCollected: 200 }
  ];
  const dinnerWorkers = [
    { employeeId: 'b2', role: 'bartender', sales: 400, tipsCollected: 40 },
    { employeeId: 's2', role: 'server', sales: 800, tipsCollected: 160 }
  ];

  const lunch = calculateServicePeriodPayouts({ servicePeriodId: 'lunch-2026-01-01', workers: lunchWorkers });
  const dinner = calculateServicePeriodPayouts({ servicePeriodId: 'dinner-2026-01-01', workers: dinnerWorkers });
  assert.strictEqual(lunch.hasError, false);
  assert.strictEqual(dinner.hasError, false);

  // Ensure computed independently (values differ, and we never combine them in distributor).
  assert.notStrictEqual(toCents(lunch.kitchenPoolTotal), toCents(dinner.kitchenPoolTotal));

  // Weekly allocator: allocate each period separately.
  // Use fixed pools to validate weighted allocation deterministically.
  const weekly = calculateWeeklyKitchenPayouts({
    weekId: 'week-1',
    periodKitchenPools: [
      { servicePeriodId: 'lunch-2026-01-01', kitchenPoolTotal: 100.0 },
      { servicePeriodId: 'dinner-2026-01-01', kitchenPoolTotal: 60.0 }
    ],
    kitchenWorkLogs: [
      // Lunch: cook vs manager with different weights
      { employeeId: 'k1', servicePeriodId: 'lunch-2026-01-01', hoursWorked: 5, roleWeight: 1.0 },
      { employeeId: 'k2', servicePeriodId: 'lunch-2026-01-01', hoursWorked: 5, roleWeight: 2.0 },
      // Dinner: only k1 worked
      { employeeId: 'k1', servicePeriodId: 'dinner-2026-01-01', hoursWorked: 3, roleWeight: 1.0 }
    ]
  });
  assert.strictEqual(weekly.hasError, false);

  const k1 = weekly.payoutsByKitchenEmployee.find((p) => p.employeeId === 'k1');
  const k2 = weekly.payoutsByKitchenEmployee.find((p) => p.employeeId === 'k2');

  // Lunch pool $100: k1 gets $33.33, k2 gets $66.67 (remainder cent goes to larger remainder = k2)
  // Dinner pool $60: k1 gets $60.00
  assertMoneyEqual(k1.weeklyKitchenPayout, 93.33, 'k1 weeklyKitchenPayout');
  assertMoneyEqual(k2.weeklyKitchenPayout, 66.67, 'k2 weeklyKitchenPayout');

  // Totals reconcile exactly to pool cents.
  const totalWeeklyCents = weekly.payoutsByKitchenEmployee.reduce((sum, p) => sum + toCents(p.weeklyKitchenPayout), 0);
  assert.strictEqual(totalWeeklyCents, toCents(160.0), 'weekly totals reconcile to pool cents');
}
console.log('✓ Test 6 passed\n');

console.log('All tests passed! ✓');
