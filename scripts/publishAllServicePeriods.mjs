// DEV-ONLY SCRIPT: safe to delete; added for demo seeding.
import { createClient } from '@supabase/supabase-js'
import { calculateServicePeriodPayouts } from '../lib/tipCalculator.js'

const args = new Set(process.argv.slice(2))
const isDryRun = args.has('--dry-run')
const hasYes = args.has('--yes')

function exitWith(message) {
  console.error(message)
  process.exit(1)
}

if (process.env.NODE_ENV === 'production') {
  exitWith('Refusing to run: NODE_ENV is production.')
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) {
  exitWith('Missing Supabase URL. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.')
}

function sanitizeUrl(url) {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ''}`
  } catch {
    return String(url)
  }
}

if (!supabaseUrl.startsWith('http://127.0.0.1:') && !supabaseUrl.startsWith('http://localhost:')) {
  exitWith(
    `Refusing to run: Supabase URL must be local (http://127.0.0.1:* or http://localhost:*). Got: ${sanitizeUrl(
      supabaseUrl
    )}`
  )
}

if (!hasYes && !isDryRun) {
  exitWith(
    'This will delete and rewrite derived payout tables for ALL service periods.\n' +
      'Re-run with: npm run publish:all -- --yes\n' +
      'Tip: use --dry-run to preview without writes.'
  )
}

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  exitWith(
    'Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY (preferred), SUPABASE_SECRET_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

function asNumber(value, fieldName) {
  const n = Number(value)
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${fieldName}: ${String(value)}`)
  if (n < 0) throw new Error(`Negative value for ${fieldName}: ${String(value)}`)
  return n
}

function parseAmountFromDescription(description) {
  if (typeof description !== 'string') return null
  const match = description.match(/([+-]?)\$(\d+(?:\.\d{1,2})?)/)
  if (!match) return null
  const sign = match[1]
  const value = parseFloat(match[2])
  if (!Number.isFinite(value)) return null
  if (sign === '-') return -value
  return value
}

function normalizeLineItems(lineItems) {
  if (!Array.isArray(lineItems)) return []
  return lineItems.map((li, idx) => {
    if (typeof li === 'string') {
      const parsedAmount = parseAmountFromDescription(li)
      return { sort_order: idx, description: li, amount: parsedAmount }
    }
    if (li && typeof li === 'object') {
      const description =
        typeof li.description === 'string'
          ? li.description
          : li.description == null
            ? JSON.stringify(li)
            : String(li.description)
      let amount = li.amount == null ? null : Number(li.amount)
      if (!Number.isFinite(amount)) {
        amount = parseAmountFromDescription(description)
      }
      return { sort_order: idx, description, amount }
    }
    const strLi = String(li)
    return { sort_order: idx, description: strLi, amount: parseAmountFromDescription(strLi) }
  })
}

async function main() {
  const periodsRes = await supabase
    .from('service_periods')
    .select('id, period_date, period_type')
    .order('period_date', { ascending: true })
    .order('period_type', { ascending: true })

  if (periodsRes.error) throw periodsRes.error

  const periods = Array.isArray(periodsRes.data) ? periodsRes.data : []
  if (periods.length === 0) {
    console.log('No service periods found. Nothing to publish.')
    return
  }

  let published = 0
  let skipped = 0
  let failed = 0
  const failures = []

  for (let i = 0; i < periods.length; i++) {
    const period = periods[i]
    const label = `${period.period_date} ${period.period_type}`
    console.log(`Publishing ${i + 1}/${periods.length}: ${label}...`)

    try {
      const assignmentsRes = await supabase
        .from('shift_assignments')
        .select('employee_id, worked_role')
        .eq('service_period_id', period.id)

      if (assignmentsRes.error) throw assignmentsRes.error
      const assignments = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []
      const bartenderCount = assignments.filter((a) => a?.worked_role === 'bartender').length

      if (bartenderCount !== 1 && bartenderCount !== 2) {
        console.log(`  Skipping: bartenderCount from assignments was ${bartenderCount} (needs 1 or 2).`)
        skipped++
        continue
      }

      const entriesRes = await supabase
        .from('service_period_entries')
        .select('employee_id, role, sales_total, tips_collected')
        .eq('service_period_id', period.id)

      if (entriesRes.error) throw entriesRes.error

      const entries = (entriesRes.data || []).filter(
        (r) => r && r.sales_total != null && r.tips_collected != null
      )

      if (entries.length === 0) {
        console.log('  Skipping: no entries with sales_total and tips_collected.')
        skipped++
        continue
      }

      const bartenderEntryCount = entries.filter((e) => e?.role === 'bartender').length
      if (bartenderEntryCount !== bartenderCount) {
        console.log(
          `  Skipping: entries have ${bartenderEntryCount} bartender(s), assignments require ${bartenderCount}.`
        )
        skipped++
        continue
      }

      const workers = entries.map((r) => {
        const employeeId = r.employee_id
        return {
          employeeId,
          role: r.role,
          sales: asNumber(r.sales_total, `sales_total for employee_id=${employeeId}`),
          tipsCollected: asNumber(r.tips_collected, `tips_collected for employee_id=${employeeId}`)
        }
      })

      const engine = calculateServicePeriodPayouts({
        servicePeriodId: period.id,
        workers
      })

      if (engine?.hasError) {
        throw new Error(engine.errorMessage || 'Tip engine returned an error.')
      }

      const payoutsByWorker = Array.isArray(engine.payoutsByWorker) ? engine.payoutsByWorker : []
      const normalizedLineItems = payoutsByWorker.flatMap((p) =>
        normalizeLineItems(p.lineItems).map((li) => ({
          employeeId: p.employeeId,
          sort_order: li.sort_order,
          description: li.description,
          amount: li.amount
        }))
      )

      if (isDryRun) {
        console.log('  DRY RUN: would delete payout_line_items, service_period_payouts, service_period_totals.')
        console.log(
          `  DRY RUN: would insert totals(1), payouts(${payoutsByWorker.length}), line_items(${normalizedLineItems.length}).`
        )
        published++
        continue
      }

      const payoutIdsRes = await supabase
        .from('service_period_payouts')
        .select('id')
        .eq('service_period_id', period.id)

      if (payoutIdsRes.error) throw payoutIdsRes.error
      const payoutIds = (payoutIdsRes.data || []).map((row) => row.id).filter(Boolean)

      if (payoutIds.length > 0) {
        const delLineItemsRes = await supabase
          .from('payout_line_items')
          .delete()
          .in('service_period_payout_id', payoutIds)
        if (delLineItemsRes.error) throw delLineItemsRes.error
      }

      const delPayoutsRes = await supabase
        .from('service_period_payouts')
        .delete()
        .eq('service_period_id', period.id)
      if (delPayoutsRes.error) throw delPayoutsRes.error

      const delTotalsRes = await supabase
        .from('service_period_totals')
        .delete()
        .eq('service_period_id', period.id)
      if (delTotalsRes.error) throw delTotalsRes.error

      const totalsRes = await supabase.from('service_period_totals').insert({
        service_period_id: period.id,
        bartender_pool_total: engine.bartenderPoolTotal,
        kitchen_pool_total: engine.kitchenPoolTotal
      })
      if (totalsRes.error) throw totalsRes.error

      const payoutInserts = payoutsByWorker.map((p) => ({
        service_period_id: period.id,
        employee_id: p.employeeId,
        role: p.role,
        kitchen_contribution: p.kitchenContribution,
        bartender_contribution: p.bartenderContribution,
        bartender_share_received: p.bartenderShareReceived,
        net_tips: p.netTips,
        amount_owed_to_house: p.amountOwedToHouse
      }))

      const payoutInsertRes = await supabase
        .from('service_period_payouts')
        .insert(payoutInserts)
        .select('id, employee_id')

      if (payoutInsertRes.error) throw payoutInsertRes.error

      const payoutIdByEmployeeId = {}
      for (const row of payoutInsertRes.data || []) {
        if (row?.employee_id && row?.id) payoutIdByEmployeeId[row.employee_id] = row.id
      }

      const lineItems = payoutsByWorker.flatMap((p) => {
        const payoutId = payoutIdByEmployeeId[p.employeeId]
        if (!payoutId) {
          throw new Error(`Missing payout row id after insert for employee_id=${p.employeeId}`)
        }
        return normalizeLineItems(p.lineItems).map((li) => ({
          service_period_payout_id: payoutId,
          sort_order: li.sort_order,
          description: li.description,
          amount: li.amount
        }))
      })

      if (lineItems.length > 0) {
        const lineItemsRes = await supabase.from('payout_line_items').insert(lineItems)
        if (lineItemsRes.error) throw lineItemsRes.error
      }

      published++
    } catch (err) {
      failed++
      const message = err?.message || String(err)
      failures.push(`${label}: ${message}`)
      console.log(`  Failed: ${message}`)
    }
  }

  const summaryLabel = isDryRun ? 'Summary (dry-run)' : 'Summary'
  console.log(`${summaryLabel}: published ${published}, skipped ${skipped}, failed ${failed}.`)

  if (failures.length > 0) {
    console.log('Failures (up to 10):')
    failures.slice(0, 10).forEach((f) => console.log(`  - ${f}`))
  }
}

main().catch((err) => {
  exitWith(err?.message || String(err))
})
