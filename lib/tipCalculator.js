/**
 * Money-handling notes (Tippd):
 * - All internal math is performed in integer cents (deterministic).
 * - Convert dollars -> cents only at the boundary (inputs) and cents -> dollars only at outputs.
 * - Negative net tips are allowed and mean the employee owes house cash.
 */
const DEFAULT_RULES = Object.freeze({
  thresholdDollars: 150,
  kitchenTipoutBp: 500, // 5.00%
  bartenderTipoutBpByCount: Object.freeze({
    1: 100, // 1.00%
    2: 200 // 2.00%
  })
});

function roundHalfAwayFromZeroToInt(value) {
  // Standard "round-half-up" generalized for negative numbers (half-away-from-zero).
  if (!Number.isFinite(value)) return NaN;
  return value >= 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
}

function dollarsToCents(dollars) {
  return roundHalfAwayFromZeroToInt(dollars * 100);
}

function centsToDollarsNumber(cents) {
  // Number output; keep 2 decimals as a stable boundary format.
  return Number((cents / 100).toFixed(2));
}

function formatMoneyFromCents(cents) {
  const abs = Math.abs(cents);
  const asDollars = (abs / 100).toFixed(2);
  return cents < 0 ? `-$${asDollars}` : `$${asDollars}`;
}

function normalizeRules(rules = {}) {
  const merged = {
    ...DEFAULT_RULES,
    ...(rules || {}),
    bartenderTipoutBpByCount: {
      ...DEFAULT_RULES.bartenderTipoutBpByCount,
      ...(rules?.bartenderTipoutBpByCount || {})
    }
  };

  return {
    thresholdCents: dollarsToCents(merged.thresholdDollars),
    kitchenTipoutBp: merged.kitchenTipoutBp,
    bartenderTipoutBpByCount: merged.bartenderTipoutBpByCount,
    // Optional: when primitive needs bartenderCount (for server bartender tip-out)
    bartenderCount: rules?.bartenderCount
  };
}

function mulBpRoundHalfUp(cents, bp) {
  // cents * (bp/10000), rounded half-up, cents/bp are assumed non-negative integers.
  const numerator = BigInt(cents) * BigInt(bp);
  const denom = 10000n;
  const q = numerator / denom;
  const r = numerator % denom;
  const rounded = r * 2n >= denom ? q + 1n : q;
  return Number(rounded);
}

function makeErrorResult(base, message) {
  return {
    ...base,
    hasError: true,
    errorMessage: message
  };
}

/**
 * Function contract (Legacy wrapper):
 * - Inputs: (salesTotal:number, tipsCollected:number, bartenderCount:1|2)
 * - Output: legacy shape + `amountOwedToHouse` (no capping; can be >0)
 * - Notes: This is a compatibility wrapper around the cents-based primitive logic.
 */
export function calculateTipDistribution(salesTotal, tipsCollected, bartenderCount) {
  const base = {
    bartenderTipout: 0,
    kitchenTipout: 0,
    netTips: 0,
    amountOwedToHouse: 0,
    breakdown: [],
    hasError: false,
    errorMessage: null
  };

  if (!Number.isFinite(salesTotal) || salesTotal < 0) {
    return makeErrorResult(base, 'Sales total must be a non-negative number');
  }
  if (!Number.isFinite(tipsCollected) || tipsCollected < 0) {
    return makeErrorResult(base, 'Tips collected must be a non-negative number');
  }
  if (!Number.isInteger(bartenderCount) || (bartenderCount !== 1 && bartenderCount !== 2)) {
    return makeErrorResult(base, 'Bartender count must be 1 or 2 (0 is not allowed in this restaurant)');
  }

  const primitive = calculateWorkerObligations({
    role: 'server',
    sales: salesTotal,
    tipsCollected,
    rules: { bartenderCount }
  });

  // Preserve the legacy breakdown concept (ordered, human-readable).
  const bartenderTipoutCents = dollarsToCents(primitive.bartenderContribution);
  const kitchenTipoutCents = dollarsToCents(primitive.kitchenContribution);
  const netCents = dollarsToCents(primitive.netAfterContributions);
  const owedCents = dollarsToCents(primitive.amountOwedToHouse);

  base.bartenderTipout = centsToDollarsNumber(bartenderTipoutCents);
  base.kitchenTipout = centsToDollarsNumber(kitchenTipoutCents);
  base.netTips = centsToDollarsNumber(netCents);
  base.amountOwedToHouse = centsToDollarsNumber(owedCents);
  base.breakdown = primitive.lineItems.slice();
  base.hasError = primitive.hasError;
  base.errorMessage = primitive.errorMessage;

  return base;
}

/**
 * Function contract (Layer A primitive):
 * - Inputs: { role:'server'|'bartender', sales:number, tipsCollected:number, rules?:{ bartenderCount?:1|2, ...overrides } }
 * - Output: what this ONE worker owes/contributes (does not decide pooled shares received)
 */
export function calculateWorkerObligations({ role, sales, tipsCollected, rules } = {}) {
  const normalized = normalizeRules(rules);

  const base = {
    eligible: false,
    kitchenContribution: 0,
    bartenderContribution: 0,
    netAfterContributions: 0,
    amountOwedToHouse: 0,
    lineItems: [],
    hasError: false,
    errorMessage: null
  };

  if (role !== 'server' && role !== 'bartender') {
    return makeErrorResult(base, "Invalid role: must be 'server' or 'bartender'");
  }
  if (!Number.isFinite(sales) || sales < 0) {
    return makeErrorResult(base, 'Sales must be a non-negative number');
  }
  if (!Number.isFinite(tipsCollected) || tipsCollected < 0) {
    return makeErrorResult(base, 'Tips collected must be a non-negative number');
  }

  const salesCents = dollarsToCents(sales);
  const tipsCents = dollarsToCents(tipsCollected);

  if (!Number.isInteger(salesCents) || Number.isNaN(salesCents)) {
    return makeErrorResult(base, 'Sales could not be converted to cents deterministically');
  }
  if (!Number.isInteger(tipsCents) || Number.isNaN(tipsCents)) {
    return makeErrorResult(base, 'Tips collected could not be converted to cents deterministically');
  }

  const lineItems = [];
  lineItems.push(`Role: ${role}`);
  lineItems.push(`Sales: ${formatMoneyFromCents(salesCents)}`);
  lineItems.push(`Tips collected: ${formatMoneyFromCents(tipsCents)}`);

  const eligible = salesCents >= normalized.thresholdCents;
  base.eligible = eligible;

  let kitchenContributionCents = 0;
  let bartenderContributionCents = 0;

  if (!eligible) {
    lineItems.push(
      `Sales below ${formatMoneyFromCents(normalized.thresholdCents)} threshold: no kitchen or bartender tip-out applied`
    );
  } else {
    kitchenContributionCents = mulBpRoundHalfUp(salesCents, normalized.kitchenTipoutBp);
    lineItems.push(
      `Kitchen tip-out (5% of ${formatMoneyFromCents(salesCents)}): -${formatMoneyFromCents(kitchenContributionCents)}`
    );

    if (role === 'server') {
      const bartenderCount = normalized.bartenderCount;
      if (!Number.isInteger(bartenderCount) || (bartenderCount !== 1 && bartenderCount !== 2)) {
        return makeErrorResult(
          { ...base, eligible, lineItems },
          'Server bartender tip-out requires rules.bartenderCount to be 1 or 2'
        );
      }

      const bp = normalized.bartenderTipoutBpByCount[bartenderCount];
      bartenderContributionCents = mulBpRoundHalfUp(salesCents, bp);
      lineItems.push(
        `Bartender tip-out (${bp / 100}% of ${formatMoneyFromCents(salesCents)}): -${formatMoneyFromCents(
          bartenderContributionCents
        )}`
      );
    }
    // Bartenders do not tip out to the bartender pool - no line item needed
  }

  const netAfterContributionsCents = tipsCents - kitchenContributionCents - bartenderContributionCents;
  const amountOwedToHouseCents = Math.max(0, -netAfterContributionsCents);

  lineItems.push(`Net after contributions: ${formatMoneyFromCents(netAfterContributionsCents)}`);
  if (amountOwedToHouseCents > 0) {
    lineItems.push(`Amount owed to house: ${formatMoneyFromCents(amountOwedToHouseCents)}`);
  }

  return {
    eligible,
    kitchenContribution: centsToDollarsNumber(kitchenContributionCents),
    bartenderContribution: centsToDollarsNumber(bartenderContributionCents),
    netAfterContributions: centsToDollarsNumber(netAfterContributionsCents),
    amountOwedToHouse: centsToDollarsNumber(amountOwedToHouseCents),
    lineItems,
    hasError: false,
    errorMessage: null
  };
}

function allocateEqualSplitCents(poolCents, recipientIdsSorted) {
  const n = recipientIdsSorted.length;
  const base = Math.floor(poolCents / n);
  const remainder = poolCents - base * n;

  /** @type {Record<string, number>} */
  const byId = {};
  for (let i = 0; i < n; i++) {
    byId[recipientIdsSorted[i]] = base + (i < remainder ? 1 : 0);
  }
  return byId;
}

/**
 * Function contract (Layer B distributor):
 * - Inputs: { servicePeriodId:string, workers:[{employeeId, role, sales, tipsCollected}], rules?:{...} }
 * - Derives bartenderCount from workers (must be 1 or 2) and computes period pools + per-worker payouts.
 */
export function calculateServicePeriodPayouts({ servicePeriodId, workers, rules } = {}) {
  const base = {
    kitchenPoolTotal: 0,
    bartenderPoolTotal: 0,
    bartenderShare: 0,
    payoutsByWorker: [],
    hasError: false,
    errorMessage: null
  };

  if (typeof servicePeriodId !== 'string' || servicePeriodId.trim() === '') {
    return makeErrorResult(base, 'servicePeriodId must be a non-empty string');
  }
  if (!Array.isArray(workers) || workers.length === 0) {
    return makeErrorResult(base, 'workers must be a non-empty array');
  }

  const bartenders = workers.filter((w) => w?.role === 'bartender');
  const bartenderCount = bartenders.length;
  if (bartenderCount !== 1 && bartenderCount !== 2) {
    return makeErrorResult(
      base,
      `Invalid bartenderCount derived from workers: found ${bartenderCount} bartender(s), but restaurant requires 1 or 2`
    );
  }

  const normalized = normalizeRules({ ...(rules || {}), bartenderCount });

  /** @type {Array<any>} */
  const computed = [];

  for (const w of workers) {
    if (!w || typeof w.employeeId !== 'string' || w.employeeId.trim() === '') {
      return makeErrorResult(base, 'Each worker must have a non-empty employeeId');
    }
    if (w.role !== 'server' && w.role !== 'bartender') {
      return makeErrorResult(base, `Invalid worker role for employeeId=${w.employeeId}`);
    }

    const obligations = calculateWorkerObligations({
      role: w.role,
      sales: w.sales,
      tipsCollected: w.tipsCollected,
      rules: normalized
    });

    if (obligations.hasError) {
      return makeErrorResult(base, `Worker ${w.employeeId} obligations error: ${obligations.errorMessage}`);
    }

    computed.push({
      employeeId: w.employeeId,
      role: w.role,
      salesCents: dollarsToCents(w.sales),
      tipsCents: dollarsToCents(w.tipsCollected),
      kitchenContributionCents: dollarsToCents(obligations.kitchenContribution),
      bartenderContributionCents: dollarsToCents(obligations.bartenderContribution),
      eligible: obligations.eligible,
      obligationsLineItems: obligations.lineItems
    });
  }

  const bartenderPoolCents = computed
    .filter((w) => w.role === 'server')
    .reduce((sum, w) => sum + w.bartenderContributionCents, 0);

  const kitchenPoolCents = computed.reduce((sum, w) => sum + w.kitchenContributionCents, 0);

  const bartenderIdsSorted = computed
    .filter((w) => w.role === 'bartender')
    .map((w) => w.employeeId)
    .sort((a, b) => a.localeCompare(b));

  const bartenderShareById = allocateEqualSplitCents(bartenderPoolCents, bartenderIdsSorted);

  /** @type {Array<any>} */
  const payoutsByWorker = computed
    .slice()
    .sort((a, b) => a.employeeId.localeCompare(b.employeeId))
    .map((w) => {
      const bartenderShareReceivedCents = w.role === 'bartender' ? bartenderShareById[w.employeeId] : 0;
      const netTipsCents = w.tipsCents - w.kitchenContributionCents - w.bartenderContributionCents + bartenderShareReceivedCents;
      const owedCents = Math.max(0, -netTipsCents);

      const lineItems = [];
      lineItems.push(`Service period: ${servicePeriodId}`);
      lineItems.push(`Employee: ${w.employeeId}`);
      lineItems.push(`Role: ${w.role}`);
      lineItems.push(`Tips collected: ${formatMoneyFromCents(w.tipsCents)}`);

      if (!w.eligible) {
        lineItems.push(
          `Sales below ${formatMoneyFromCents(normalized.thresholdCents)} threshold: no tip-out applied`
        );
      } else {
        lineItems.push(`Kitchen tip-out: -${formatMoneyFromCents(w.kitchenContributionCents)}`);
        if (w.role === 'server') {
          lineItems.push(`Bartender tip-out (to pool): -${formatMoneyFromCents(w.bartenderContributionCents)}`);
        }
        // Bartenders do not tip out to the bartender pool - no line item needed
      }

      if (w.role === 'bartender') {
        lineItems.push(`Bartender share received: +${formatMoneyFromCents(bartenderShareReceivedCents)}`);
      }

      lineItems.push(`Net tips: ${formatMoneyFromCents(netTipsCents)}`);
      if (owedCents > 0) {
        lineItems.push(`Amount owed to house: ${formatMoneyFromCents(owedCents)}`);
      }

      return {
        employeeId: w.employeeId,
        role: w.role,
        eligible: w.eligible,
        kitchenContribution: centsToDollarsNumber(w.kitchenContributionCents),
        bartenderContribution: centsToDollarsNumber(w.bartenderContributionCents),
        bartenderShareReceived: centsToDollarsNumber(bartenderShareReceivedCents),
        netTips: centsToDollarsNumber(netTipsCents),
        amountOwedToHouse: centsToDollarsNumber(owedCents),
        lineItems
      };
    });

  const bartenderShareAverageCents = Math.floor(bartenderPoolCents / bartenderCount);

  return {
    kitchenPoolTotal: centsToDollarsNumber(kitchenPoolCents),
    bartenderPoolTotal: centsToDollarsNumber(bartenderPoolCents),
    bartenderShare: centsToDollarsNumber(bartenderShareAverageCents),
    payoutsByWorker,
    hasError: false,
    errorMessage: null
  };
}

function toWeightedUnits(hoursWorked, roleWeight) {
  // Deterministic integer units: (hoursWorked * roleWeight) scaled to 1/10,000.
  return roundHalfAwayFromZeroToInt(hoursWorked * roleWeight * 10000);
}

function allocateProportionalCents(poolCents, entries) {
  // entries: [{ employeeId, units }]
  const totalUnits = entries.reduce((sum, e) => sum + e.units, 0);
  if (totalUnits <= 0) {
    return { hasError: true, errorMessage: 'Total weighted hours in period must be > 0', payoutByEmployeeId: {} };
  }

  /** @type {Array<{employeeId:string, baseCents:number, remainderNumerator:bigint}>} */
  const interim = entries.map((e) => {
    const numerator = BigInt(poolCents) * BigInt(e.units);
    const denom = BigInt(totalUnits);
    const baseCents = Number(numerator / denom);
    const remainderNumerator = numerator % denom;
    return { employeeId: e.employeeId, baseCents, remainderNumerator };
  });

  let allocated = interim.reduce((sum, x) => sum + x.baseCents, 0);
  let remaining = poolCents - allocated;

  // Allocate remaining cents to largest remainders; tie-break by employeeId (deterministic).
  interim.sort((a, b) => {
    if (a.remainderNumerator === b.remainderNumerator) return a.employeeId.localeCompare(b.employeeId);
    return a.remainderNumerator > b.remainderNumerator ? -1 : 1;
  });

  /** @type {Record<string, number>} */
  const payoutByEmployeeId = {};
  for (const item of interim) payoutByEmployeeId[item.employeeId] = item.baseCents;

  for (let i = 0; i < remaining; i++) {
    const recipient = interim[i % interim.length];
    payoutByEmployeeId[recipient.employeeId] += 1;
  }

  return { hasError: false, errorMessage: null, payoutByEmployeeId };
}

/**
 * Function contract (Layer D weekly kitchen allocator):
 * - Inputs: { weekId, periodKitchenPools:[{servicePeriodId,kitchenPoolTotal}], kitchenWorkLogs:[{employeeId,servicePeriodId,hoursWorked,roleWeight}], rules?:{...} }
 * - Output: weekly kitchen payouts per employee with per-period transparency, computed per service period (no mixing).
 */
export function calculateWeeklyKitchenPayouts({ weekId, periodKitchenPools, kitchenWorkLogs, rules } = {}) {
  const base = {
    weekId: typeof weekId === 'string' ? weekId : '',
    payoutsByKitchenEmployee: [],
    hasError: false,
    errorMessage: null
  };

  if (typeof weekId !== 'string' || weekId.trim() === '') {
    return makeErrorResult(base, 'weekId must be a non-empty string');
  }
  if (!Array.isArray(periodKitchenPools)) {
    return makeErrorResult(base, 'periodKitchenPools must be an array');
  }
  if (!Array.isArray(kitchenWorkLogs)) {
    return makeErrorResult(base, 'kitchenWorkLogs must be an array');
  }

  // Keep rules normalization available for threshold defaults, though weekly allocator mainly uses cents math.
  normalizeRules(rules);

  /** @type {Record<string, number>} */
  const poolCentsByPeriod = {};
  for (const p of periodKitchenPools) {
    if (!p || typeof p.servicePeriodId !== 'string' || p.servicePeriodId.trim() === '') {
      return makeErrorResult(base, 'Each periodKitchenPools entry must have a non-empty servicePeriodId');
    }
    if (!Number.isFinite(p.kitchenPoolTotal) || p.kitchenPoolTotal < 0) {
      return makeErrorResult(base, `kitchenPoolTotal must be a non-negative number for servicePeriodId=${p.servicePeriodId}`);
    }
    // If duplicates occur, sum them (explicit and deterministic).
    poolCentsByPeriod[p.servicePeriodId] = (poolCentsByPeriod[p.servicePeriodId] || 0) + dollarsToCents(p.kitchenPoolTotal);
  }

  /** @type {Record<string, Array<{employeeId:string, units:number, hoursWorked:number, roleWeight:number}>>} */
  const logsByPeriod = {};
  for (const log of kitchenWorkLogs) {
    if (!log || typeof log.employeeId !== 'string' || log.employeeId.trim() === '') {
      return makeErrorResult(base, 'Each kitchenWorkLog must have a non-empty employeeId');
    }
    if (typeof log.servicePeriodId !== 'string' || log.servicePeriodId.trim() === '') {
      return makeErrorResult(base, `kitchenWorkLog for employeeId=${log.employeeId} must have a non-empty servicePeriodId`);
    }
    if (!Number.isFinite(log.hoursWorked) || log.hoursWorked < 0) {
      return makeErrorResult(base, `hoursWorked must be a non-negative number for employeeId=${log.employeeId}`);
    }
    if (!Number.isFinite(log.roleWeight) || log.roleWeight <= 0) {
      return makeErrorResult(base, `roleWeight must be a positive number for employeeId=${log.employeeId}`);
    }

    const units = toWeightedUnits(log.hoursWorked, log.roleWeight);
    logsByPeriod[log.servicePeriodId] = logsByPeriod[log.servicePeriodId] || [];
    logsByPeriod[log.servicePeriodId].push({
      employeeId: log.employeeId,
      units,
      hoursWorked: log.hoursWorked,
      roleWeight: log.roleWeight
    });
  }

  /** @type {Record<string, { weeklyTotalCents:number, lineItems:string[] }>} */
  const weeklyByEmployee = {};

  for (const [servicePeriodId, poolCents] of Object.entries(poolCentsByPeriod)) {
    const periodLogs = logsByPeriod[servicePeriodId] || [];
    if (poolCents === 0) continue;
    if (periodLogs.length === 0) {
      return makeErrorResult(
        base,
        `No kitchenWorkLogs found for servicePeriodId=${servicePeriodId}, cannot allocate kitchenPoolTotal`
      );
    }

    // Aggregate units per employee within the service period (in case multiple shifts/logs exist).
    /** @type {Record<string, { units:number, hoursWorkedSum:number, roleWeightSeen:number[] }>} */
    const agg = {};
    for (const l of periodLogs) {
      agg[l.employeeId] = agg[l.employeeId] || { units: 0, hoursWorkedSum: 0, roleWeightSeen: [] };
      agg[l.employeeId].units += l.units;
      agg[l.employeeId].hoursWorkedSum += l.hoursWorked;
      agg[l.employeeId].roleWeightSeen.push(l.roleWeight);
    }

    const entries = Object.entries(agg)
      .map(([employeeId, v]) => ({ employeeId, units: v.units }))
      .sort((a, b) => a.employeeId.localeCompare(b));

    const allocation = allocateProportionalCents(poolCents, entries);
    if (allocation.hasError) {
      return makeErrorResult(base, `Kitchen allocation error for ${servicePeriodId}: ${allocation.errorMessage}`);
    }

    for (const [employeeId, cents] of Object.entries(allocation.payoutByEmployeeId)) {
      weeklyByEmployee[employeeId] = weeklyByEmployee[employeeId] || { weeklyTotalCents: 0, lineItems: [] };
      weeklyByEmployee[employeeId].weeklyTotalCents += cents;
      weeklyByEmployee[employeeId].lineItems.push(
        `Service period ${servicePeriodId}: +${formatMoneyFromCents(cents)} from kitchen pool (${formatMoneyFromCents(poolCents)} total)`
      );
    }
  }

  const payoutsByKitchenEmployee = Object.entries(weeklyByEmployee)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([employeeId, v]) => ({
      employeeId,
      weeklyKitchenPayout: centsToDollarsNumber(v.weeklyTotalCents),
      lineItems: v.lineItems.slice()
    }));

  return {
    weekId,
    payoutsByKitchenEmployee,
    hasError: false,
    errorMessage: null
  };
}
