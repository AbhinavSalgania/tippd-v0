'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/app/components/AppHeader'
import { readSession, SESSION_KEY } from '@/app/lib/requireRole'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatMoney(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0.00'
  const abs = Math.abs(n)
  const formatted = abs.toFixed(2)
  return n < 0 ? `-$${formatted}` : `$${formatted}`
}

function formatMoneyPlain(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown date'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function comparePeriod(a, b) {
  // Most recent first (date desc), then period_type asc
  const ad = a?.service_periods?.period_date || ''
  const bd = b?.service_periods?.period_date || ''
  if (ad !== bd) return bd.localeCompare(ad)
  const at = a?.service_periods?.period_type || ''
  const bt = b?.service_periods?.period_type || ''
  if (at !== bt) return at.localeCompare(bt)
  return 0
}

/**
 * Parse dollar amount from a description string.
 * Handles: "$55.00", "-$55.00", "+$55.00"
 * Returns null if no amount found.
 */
function parseAmountFromDescription(description) {
  if (typeof description !== 'string') return null
  
  // Match patterns like: -$55.00, +$55.00, $55.00
  const match = description.match(/([+-]?)\$(\d+(?:\.\d{1,2})?)/)
  if (!match) return null
  
  const sign = match[1]
  const value = parseFloat(match[2])
  
  if (!Number.isFinite(value)) return null
  
  // Apply sign
  if (sign === '-') return -value
  return value
}

/**
 * Clean a line item description by removing inline dollar amounts.
 * "Tips collected: $20.00" → "Tips collected"
 * "Kitchen tip-out: -$40.00" → "Kitchen tip-out"
 */
function cleanDescription(description) {
  if (typeof description !== 'string') return ''
  // Remove patterns like ": $20.00", ": -$20.00", ": +$20.00" at end
  // Also handle "below $150 threshold" type patterns - keep those
  return description
    .replace(/:\s*[+-]?\$[\d,.]+\s*$/, '')
    .replace(/\s*[+-]?\$[\d,.]+\s*$/, '')
    .trim()
}

/**
 * Filter line items based on employee role and remove metadata lines.
 * - Bartenders should NOT see "Bartender tip-out" lines (they don't pay this)
 * - Servers see all their deductions
 * - Remove "Service period:" and "Employee:" lines (UUIDs are not user-friendly)
 * - Remove "Role:" line (already shown in badge)
 * - Remove "Sales:" line (not typically shown to employees)
 */
function filterLineItemsForRole(items, role) {
  if (!Array.isArray(items)) return []
  
  return items
    .filter((item) => {
      const desc = (item.description || '').toLowerCase()
      
      // Filter out metadata lines that contain UUIDs or redundant info
      if (desc.startsWith('service period:')) return false
      if (desc.startsWith('employee:')) return false
      if (desc.startsWith('role:')) return false
      if (desc.startsWith('sales:')) return false
      
      // Bartenders don't see bartender tip-out (they receive, not pay)
      const normalizedRole = (role || '').toLowerCase()
      if (normalizedRole === 'bartender' && desc.includes('bartender tip-out')) {
        return false
      }
      
      return true
    })
    .map((item) => {
      // Parse amount from description if not already set
      const parsedAmount = item.amount != null ? item.amount : parseAmountFromDescription(item.description)
      return {
        ...item,
        amount: parsedAmount,
        cleanedDescription: cleanDescription(item.description)
      }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // FOH state
  const [fohPayouts, setFohPayouts] = useState([])
  const [expandedPayoutIds, setExpandedPayoutIds] = useState(() => new Set())

  // BOH state
  const [weeklyPayouts, setWeeklyPayouts] = useState([])
  const [recentHours, setRecentHours] = useState([])

  const role = session?.role || ''
  const isFoh = role === 'server' || role === 'bartender'
  const isBoh = role === 'kitchen' || role === 'kitchen_manager'
  const isManager = role === 'manager'

  const toggleDetails = useCallback((payoutId) => {
    setExpandedPayoutIds((prev) => {
      const next = new Set(prev)
      if (next.has(payoutId)) next.delete(payoutId)
      else next.add(payoutId)
      return next
    })
  }, [])

  // ───────────────────────────────────────────────────────────────────────────
  // Data Loading (SAFE 3-step approach - no relationship joins)
  // ───────────────────────────────────────────────────────────────────────────

  const loadDashboard = useCallback(
    async (s) => {
      setIsLoading(true)
      setError(null)
      setFohPayouts([])
      setWeeklyPayouts([])
      setRecentHours([])

      try {
        if (!s?.employeeId || !s?.role) {
          throw new Error('Missing session. Please log in again.')
        }

        if (s.role === 'server' || s.role === 'bartender') {
          // ─────────────────────────────────────────────────────────────────
          // FOH: 3-step safe loading (payouts → periods → line items → merge)
          // ─────────────────────────────────────────────────────────────────

          // Step 1: Fetch payouts for this employee
          const pRes = await supabase
            .from('service_period_payouts')
            .select(
              'id, service_period_id, employee_id, role, kitchen_contribution, bartender_contribution, bartender_share_received, net_tips, amount_owed_to_house'
            )
            .eq('employee_id', s.employeeId)
            .order('service_period_id', { ascending: false })

          if (pRes.error) throw pRes.error
          let payouts = Array.isArray(pRes.data) ? pRes.data : []

          if (payouts.length === 0) {
            setFohPayouts([])
            return
          }

          // Step 2: Fetch related service_periods
          const servicePeriodIds = Array.from(
            new Set(payouts.map((p) => p.service_period_id).filter(Boolean))
          )
          const payoutIds = Array.from(
            new Set(payouts.map((p) => p.id).filter(Boolean))
          )

          /** @type {Record<string, any>} */
          const periodById = {}
          if (servicePeriodIds.length > 0) {
            const spRes = await supabase
              .from('service_periods')
              .select('id, period_date, period_type')
              .in('id', servicePeriodIds)

            if (spRes.error) throw spRes.error
            for (const sp of spRes.data || []) {
              periodById[sp.id] = sp
            }
          }

          // Step 3: Fetch related payout_line_items
          /** @type {Record<string, Array<any>>} */
          const lineItemsByPayoutId = {}
          if (payoutIds.length > 0) {
            const liRes = await supabase
              .from('payout_line_items')
              .select('id, service_period_payout_id, sort_order, description, amount')
              .in('service_period_payout_id', payoutIds)
              .order('sort_order', { ascending: true })

            if (liRes.error) throw liRes.error
            for (const li of liRes.data || []) {
              const pid = li.service_period_payout_id
              lineItemsByPayoutId[pid] = lineItemsByPayoutId[pid] || []
              lineItemsByPayoutId[pid].push(li)
            }
          }

          // Merge all data in JavaScript
          payouts = payouts.map((p) => ({
            ...p,
            service_periods: periodById[p.service_period_id] || null,
            payout_line_items: (lineItemsByPayoutId[p.id] || [])
              .slice()
              .sort((a, b) => {
                const ao = Number(a.sort_order)
                const bo = Number(b.sort_order)
                if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo
                return String(a.id || '').localeCompare(String(b.id || ''))
              })
          }))

          // Sort by date (most recent first)
          payouts.sort(comparePeriod)

          setFohPayouts(payouts)
          return
        }

        if (s.role === 'kitchen' || s.role === 'kitchen_manager') {
          // ─────────────────────────────────────────────────────────────────
          // BOH: weekly payouts + recent hours (3-step safe loading)
          // ─────────────────────────────────────────────────────────────────

          // Step 1: Fetch weekly payouts
          const wpRes = await supabase
            .from('weekly_kitchen_payouts')
            .select('week_id, employee_id, weekly_kitchen_payout')
            .eq('employee_id', s.employeeId)
            .order('week_id', { ascending: false })

          if (wpRes.error) throw wpRes.error
          const wp = Array.isArray(wpRes.data) ? wpRes.data : []
          setWeeklyPayouts(wp)

          // Step 2: Fetch kitchen work logs
          const logRes = await supabase
            .from('kitchen_work_logs')
            .select('service_period_id, employee_id, hours_worked, role_weight, created_at')
            .eq('employee_id', s.employeeId)
            .order('created_at', { ascending: false })
            .limit(10)

          if (logRes.error) throw logRes.error
          let logs = Array.isArray(logRes.data) ? logRes.data : []

          // Step 3: Fetch related service_periods
          const servicePeriodIds = Array.from(
            new Set(logs.map((l) => l.service_period_id).filter(Boolean))
          )
          /** @type {Record<string, any>} */
          const periodById = {}
          if (servicePeriodIds.length > 0) {
            const spRes = await supabase
              .from('service_periods')
              .select('id, period_date, period_type')
              .in('id', servicePeriodIds)

            if (spRes.error) throw spRes.error
            for (const sp of spRes.data || []) {
              periodById[sp.id] = sp
            }
          }

          // Merge data
          logs = logs.map((l) => ({
            ...l,
            service_periods: periodById[l.service_period_id] || null
          }))

          // Sort by created_at desc
          logs.sort((a, b) => {
            const ac = String(a.created_at || '')
            const bc = String(b.created_at || '')
            if (ac !== bc) return bc.localeCompare(ac)
            return String(a.service_period_id || '').localeCompare(String(b.service_period_id || ''))
          })

          setRecentHours(logs)
          return
        }

        if (s.role === 'manager') {
          // Managers don't have personal tip data - they use manager tools
          return
        }

        throw new Error(`Unsupported role: ${String(s.role)}`)
      } catch (e) {
        setError(e?.message || String(e))
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // ───────────────────────────────────────────────────────────────────────────
  // Session Handling
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const s = readSession()
    if (!s) {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY)
      router.push('/')
      return
    }
    setSession(s)
    loadDashboard(s)
  }, [router, loadDashboard])

  // ───────────────────────────────────────────────────────────────────────────
  // Computed Values
  // ───────────────────────────────────────────────────────────────────────────

  const fohSummary = useMemo(() => {
    const payouts = Array.isArray(fohPayouts) ? fohPayouts : []
    const totalNetTips = payouts.reduce((sum, p) => sum + Number(p.net_tips || 0), 0)
    const totalOwed = payouts.reduce((sum, p) => sum + Number(p.amount_owed_to_house || 0), 0)
    return { totalNetTips, totalOwed, count: payouts.length }
  }, [fohPayouts])

  const mostRecentWeek = useMemo(() => {
    if (!Array.isArray(weeklyPayouts) || weeklyPayouts.length === 0) return null
    return weeklyPayouts[0]
  }, [weeklyPayouts])

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader 
        title="Dashboard" 
        subtitle={session?.displayName ? `Welcome back, ${session.displayName}` : 'Employee view'} 
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Error state */}
        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Loading state */}
        {isLoading ? (
          <div className="text-sm text-zinc-600">Loading your tips...</div>
        ) : !session ? (
          <div className="text-sm text-zinc-600">Redirecting...</div>
        ) : isFoh ? (
          /* ─────────────────────────────────────────────────────────────────
             FOH Dashboard (Server / Bartender)
             ───────────────────────────────────────────────────────────────── */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-xs text-zinc-500">Total net tips</div>
                <div
                  className={`mt-2 text-2xl font-semibold ${
                    Number(fohSummary.totalNetTips) < 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {formatMoney(fohSummary.totalNetTips)}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-xs text-zinc-500">Total owed to house</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-900">
                  {formatMoney(fohSummary.totalOwed)}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-xs text-zinc-500">Service periods</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-900">{fohSummary.count}</div>
              </div>
            </div>

            {/* Recent Shifts List */}
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold">Recent shifts</div>
                <div className="text-xs text-zinc-500">Most recent first</div>
              </div>

              {fohPayouts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-zinc-600">No shifts recorded yet</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Your tip breakdowns will appear here after your shifts are processed.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {fohPayouts.map((p) => {
                    const period = p?.service_periods || {}
                    const date = period.period_date
                    const type = period.period_type || ''
                    const net = Number(p.net_tips || 0)
                    const owed = Number(p.amount_owed_to_house || 0)
                    const expanded = expandedPayoutIds.has(p.id)
                    const rawItems = Array.isArray(p.payout_line_items) ? p.payout_line_items : []
                    const items = filterLineItemsForRole(rawItems, role)

                    return (
                      <div key={p.id} className="px-4 py-4">
                        {/* Shift Row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-zinc-900">
                                {formatDate(date)}
                              </span>
                              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                                {capitalizeFirst(type)}
                              </span>
                              {owed > 0 ? (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                  Owes house
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            <div
                              className={`text-lg font-semibold ${
                                net < 0 ? 'text-red-600' : 'text-emerald-600'
                              }`}
                            >
                              {formatMoney(net)}
                            </div>
                            <button
                              onClick={() => toggleDetails(p.id)}
                              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                              {expanded ? 'Hide breakdown' : 'View breakdown'}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Breakdown */}
                        <div
                          className={`grid transition-all duration-200 ease-in-out ${
                            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Tip breakdown
                              </div>

                              {items.length === 0 ? (
                                <div className="mt-3 text-sm text-zinc-600">
                                  No breakdown details available.
                                </div>
                              ) : (
                                <ul className="mt-3 space-y-2">
                                  {items.map((li, idx) => {
                                    const amount = Number(li.amount)
                                    const isNegative = amount < 0
                                    const desc = (li.description || '').toLowerCase()
                                    const isNetTips = desc.includes('net tips') || desc.includes('net after')
                                    const isOwed = desc.includes('owed')
                                    const isBelowThreshold = desc.includes('below') && desc.includes('threshold')
                                    const displayLabel = li.cleanedDescription || li.description || ''

                                    return (
                                      <li
                                        key={li.id || `${p.id}-${idx}`}
                                        className={`flex items-start justify-between gap-4 text-sm ${
                                          isNetTips || isOwed ? 'border-t border-zinc-200 pt-2 mt-2' : ''
                                        }`}
                                      >
                                        <span className="text-zinc-700">{displayLabel}</span>
                                        {li.amount != null && !isBelowThreshold ? (
                                          <span
                                            className={`font-medium tabular-nums whitespace-nowrap ${
                                              isNegative
                                                ? 'text-red-600'
                                                : isOwed
                                                ? 'text-amber-700'
                                                : isNetTips
                                                ? 'text-emerald-600'
                                                : 'text-zinc-900'
                                            }`}
                                          >
                                            {formatMoney(li.amount)}
                                          </span>
                                        ) : null}
                                      </li>
                                    )
                                  })}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isBoh ? (
          /* ─────────────────────────────────────────────────────────────────
             BOH Dashboard (Kitchen / Kitchen Manager)
             ───────────────────────────────────────────────────────────────── */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-xs text-zinc-500">This week (most recent)</div>
                {mostRecentWeek ? (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-zinc-700">{mostRecentWeek.week_id}</div>
                    <div className="mt-1 text-2xl font-semibold text-emerald-600">
                      {formatMoney(mostRecentWeek.weekly_kitchen_payout)}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-zinc-600">No weekly payouts yet.</div>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-xs text-zinc-500">Weeks recorded</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-900">{weeklyPayouts.length}</div>
              </div>
            </div>

            {/* Past Weekly Payouts */}
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold">Past weekly payouts</div>
                <div className="text-xs text-zinc-500">Most recent first</div>
              </div>

              {weeklyPayouts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-zinc-600">No weekly payouts yet</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Your kitchen tip shares will appear here after weeks are finalized.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {weeklyPayouts.map((w) => (
                    <div key={`${w.week_id}-${w.employee_id}`} className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm font-medium text-zinc-900">{w.week_id}</div>
                      <div className="text-sm font-semibold text-emerald-600">
                        {formatMoney(w.weekly_kitchen_payout)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Hours */}
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold">Recent hours</div>
                <div className="text-xs text-zinc-500">Last 10 logged shifts</div>
              </div>

              {recentHours.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-zinc-600">No hours logged yet</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Your work hours will appear here after being entered by a manager.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {recentHours.map((l, idx) => {
                    const sp = l?.service_periods || {}
                    const label = sp.period_date
                      ? `${formatDate(sp.period_date)} · ${capitalizeFirst(sp.period_type || '')}`
                      : 'Unknown shift'
                    return (
                      <div key={`${l.created_at}-${l.service_period_id}-${idx}`} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{label}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-zinc-900">
                              {formatMoneyPlain(l.hours_worked)} hrs
                            </div>
                            <div className="text-xs text-zinc-500">
                              Weight: {formatMoneyPlain(l.role_weight)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isManager ? (
          /* ─────────────────────────────────────────────────────────────────
             Manager Dashboard
             ───────────────────────────────────────────────────────────────── */
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Manager Tools</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Use the navigation above to manage service periods, compute payouts, and view summaries.
              </p>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                  href="/manager/entries"
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  <div className="text-sm font-semibold text-zinc-900">Entries</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Enter sales and tips for servers and bartenders
                  </div>
                </a>
                
                <a
                  href="/manager/compute"
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  <div className="text-sm font-semibold text-zinc-900">Compute</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Calculate tip distributions for a service period
                  </div>
                </a>
                
                <a
                  href="/manager/kitchen-hours"
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  <div className="text-sm font-semibold text-zinc-900">Kitchen Hours</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Log kitchen staff hours for tip pool allocation
                  </div>
                </a>
                
                <a
                  href="/manager/kitchen-weekly"
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  <div className="text-sm font-semibold text-zinc-900">Kitchen Weekly</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Calculate weekly kitchen tip payouts
                  </div>
                </a>
                
                <a
                  href="/manager/summary"
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 hover:bg-zinc-100 transition-colors"
                >
                  <div className="text-sm font-semibold text-zinc-900">Summary</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    View payout summaries and reports
                  </div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* ─────────────────────────────────────────────────────────────────
             Unsupported Role
             ───────────────────────────────────────────────────────────────── */
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
            <div className="text-sm text-zinc-700">
              Unsupported role: <span className="font-mono">{String(role)}</span>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Please contact your manager if you believe this is an error.
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
