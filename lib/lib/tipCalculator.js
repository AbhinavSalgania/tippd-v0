/**
 * Calculates tip distribution for restaurant staff based on sales and tips collected.
 * 
 * @param {number} salesTotal - Total sales amount (must be >= 0)
 * @param {number} tipsCollected - Total tips collected (must be >= 0)
 * @param {number} bartenderCount - Number of bartenders working (must be 0, 1, or 2)
 * @returns {Object} Result object containing:
 *   - bartenderTipout {number} - Tip-out amount for bartenders (rounded to 2 decimals)
 *   - kitchenTipout {number} - Tip-out amount for kitchen (rounded to 2 decimals)
 *   - netTips {number} - Net tips after all tip-outs (rounded to 2 decimals)
 *   - breakdown {string[]} - Array of human-readable strings explaining calculations
 *   - hasError {boolean} - Whether an error occurred
 *   - errorMessage {string|null} - Error message if hasError is true
 */
export function calculateTipDistribution(salesTotal, tipsCollected, bartenderCount) {
  // Helper function to round to 2 decimal places using round-half-up
  const roundToTwoDecimals = (value) => {
    return Math.round(value * 100) / 100;
  };

  // Initialize result object
  const result = {
    bartenderTipout: 0,
    kitchenTipout: 0,
    netTips: 0,
    breakdown: [],
    hasError: false,
    errorMessage: null
  };

  // Input validation
  if (salesTotal < 0) {
    result.hasError = true;
    result.errorMessage = 'Sales total cannot be negative';
    return result;
  }

  if (tipsCollected < 0) {
    result.hasError = true;
    result.errorMessage = 'Tips collected cannot be negative';
    return result;
  }

  if (!Number.isInteger(bartenderCount) || bartenderCount < 0 || bartenderCount > 2) {
    result.hasError = true;
    result.errorMessage = 'Bartender count must be 0, 1, or 2';
    return result;
  }

  // Round inputs to 2 decimals
  salesTotal = roundToTwoDecimals(salesTotal);
  tipsCollected = roundToTwoDecimals(tipsCollected);

  // Add initial breakdown entry
  result.breakdown.push(`Tips collected: $${tipsCollected.toFixed(2)}`);

  // Business Rule 1: If sales < $150, no tip-outs required
  if (salesTotal < 150) {
    result.bartenderTipout = 0;
    result.kitchenTipout = 0;
    result.breakdown.push('Sales below $150: No tip-outs required');
    result.breakdown.push('Bartender tip-out: $0.00');
    result.breakdown.push('Kitchen tip-out: $0.00');
    result.netTips = roundToTwoDecimals(tipsCollected);
    result.breakdown.push(`Net tips: $${result.netTips.toFixed(2)}`);
    return result;
  }

  // Business Rule 2: Calculate bartender tip-out
  let bartenderPercentage = 0;
  if (bartenderCount === 1) {
    bartenderPercentage = 0.01; // 1%
  } else if (bartenderCount === 2) {
    bartenderPercentage = 0.02; // 2%
  }
  // If bartenderCount === 0, percentage stays 0

  result.bartenderTipout = roundToTwoDecimals(salesTotal * bartenderPercentage);
  result.breakdown.push(
    `Bartender tip-out (${(bartenderPercentage * 100).toFixed(0)}% of $${salesTotal.toFixed(2)}): -$${result.bartenderTipout.toFixed(2)}`
  );

  // Business Rule 3: Calculate kitchen tip-out (5% of sales if sales >= $150)
  result.kitchenTipout = roundToTwoDecimals(salesTotal * 0.05);
  result.breakdown.push(
    `Kitchen tip-out (5% of $${salesTotal.toFixed(2)}): -$${result.kitchenTipout.toFixed(2)}`
  );

  // Business Rule 4: Calculate net tips
  let calculatedNetTips = tipsCollected - result.bartenderTipout - result.kitchenTipout;

  // Business Rule 5: Net tips cannot go negative
  if (calculatedNetTips < 0) {
    result.netTips = 0;
    result.hasError = true;
    result.errorMessage = 'Net tips would be negative after tip-outs. Set to $0.00';
    result.breakdown.push(`Net tips (capped at $0.00): $0.00`);
  } else {
    result.netTips = roundToTwoDecimals(calculatedNetTips);
    result.breakdown.push(`Net tips: $${result.netTips.toFixed(2)}`);
  }

  return result;
}
