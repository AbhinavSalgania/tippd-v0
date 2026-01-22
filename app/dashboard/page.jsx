'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
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

function formatPct(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `${n.toFixed(1)}%` : '—'
}

function safePct(numerator, denominator) {
  const n = Number(numerator)
  const d = Number(denominator)
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null
  return (n / d) * 100
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
 * Get a comparator function based on the selected sort mode
 */
function getSortComparator(sortBy) {
  return (a, b) => {
    const aPeriod = a?.service_periods || {}
    const bPeriod = b?.service_periods || {}

    switch (sortBy) {
      case 'most-recent':
        return comparePeriod(a, b)

      case 'oldest': {
        const ad = aPeriod.period_date || ''
        const bd = bPeriod.period_date || ''
        if (ad !== bd) return ad.localeCompare(bd) // Date ascending
        const at = aPeriod.period_type || ''
        const bt = bPeriod.period_type || ''
        return at.localeCompare(bt)
      }

      case 'highest-net-tips': {
        const aNet = Number(a.net_tips || 0)
        const bNet = Number(b.net_tips || 0)
        return bNet - aNet // Descending
      }

      case 'lowest-net-tips': {
        const aNet = Number(a.net_tips || 0)
        const bNet = Number(b.net_tips || 0)
        return aNet - bNet // Ascending
      }

      case 'highest-tip-pct': {
        const aSales = Number(a.sales_total || 0)
        const bSales = Number(b.sales_total || 0)
        const aTips = Number(a.tips_collected || 0)
        const bTips = Number(b.tips_collected || 0)
        const aPct = aSales > 0 ? (aTips / aSales) : 0
        const bPct = bSales > 0 ? (bTips / bSales) : 0
        return bPct - aPct // Descending
      }

      case 'lowest-tip-pct': {
        const aSales = Number(a.sales_total || 0)
        const bSales = Number(b.sales_total || 0)
        const aTips = Number(a.tips_collected || 0)
        const bTips = Number(b.tips_collected || 0)
        const aPct = aSales > 0 ? (aTips / aSales) : 0
        const bPct = bSales > 0 ? (bTips / bSales) : 0
        return aPct - bPct // Ascending
      }

      case 'highest-sales': {
        const aSales = Number(a.sales_total || 0)
        const bSales = Number(b.sales_total || 0)
        return bSales - aSales // Descending
      }

      case 'lowest-sales': {
        const aSales = Number(a.sales_total || 0)
        const bSales = Number(b.sales_total || 0)
        return aSales - bSales // Ascending
      }

      default:
        return comparePeriod(a, b)
    }
  }
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
// InfoTooltip Component
// ─────────────────────────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:border-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="More information"
      >
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {show && (
        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-10">
          <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 shadow-lg max-w-[200px] whitespace-normal">
            {text}
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-white" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Kitchen Card Component
// ─────────────────────────────────────────────────────────────────────────────

function KitchenCard() {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)
  const pathname = usePathname()

  const kitchenLinks = [
    { href: '/manager/kitchen-hours', label: 'Kitchen Hours', description: 'Log kitchen staff hours for tip pool allocation' },
    { href: '/manager/kitchen-weekly', label: 'Kitchen Weekly', description: 'Calculate weekly kitchen tip payouts' }
  ]

  return (
    <div
      ref={cardRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-zinc-900">Kitchen</div>
          <svg
            className={`h-4 w-4 text-zinc-600 transition-transform ${
              isHovered ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <div className="mt-1 text-xs text-zinc-600">
          Manage kitchen hours and weekly payouts
        </div>
      </div>
      
      {isHovered && (
        <>
          {/* Invisible bridge to maintain hover */}
          <div className="absolute left-0 top-full h-1 w-full" />
          <div className="absolute left-0 top-full pt-1 w-full z-10">
            <div className="rounded-lg border border-zinc-200 bg-white shadow-lg">
              {kitchenLinks.map((l) => {
                const active = pathname === l.href || pathname?.startsWith(`${l.href}/`)
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`block rounded-md px-3 py-2 text-xs transition first:rounded-t-lg last:rounded-b-lg ${
                      active
                        ? 'bg-zinc-900 text-white'
                        : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="font-medium">{l.label}</div>
                    <div className={`mt-0.5 text-[10px] ${
                      active ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {l.description}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
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
  const [sortBy, setSortBy] = useState('most-recent')
  const [timeScope, setTimeScope] = useState('total')

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

          // Step 4: Fetch sales + tips collected for this employee by service period
          /** @type {Record<string, { sales_total: number | null, tips_collected: number | null }>} */
          const entryByPeriodId = {}
          if (servicePeriodIds.length > 0) {
            const salesRes = await supabase
              .from('service_period_entries')
              .select('service_period_id, employee_id, sales_total, tips_collected')
              .eq('employee_id', s.employeeId)
              .in('service_period_id', servicePeriodIds)

            if (salesRes.error) throw salesRes.error
            for (const entry of salesRes.data || []) {
              if (!entry?.service_period_id) continue
              entryByPeriodId[entry.service_period_id] = {
                sales_total: entry.sales_total ?? null,
                tips_collected: entry.tips_collected ?? null
              }
            }
          }

          // Merge all data in JavaScript
          payouts = payouts.map((p) => ({
            ...p,
            service_periods: periodById[p.service_period_id] || null,
            sales_total: entryByPeriodId[p.service_period_id]?.sales_total ?? null,
            tips_collected: entryByPeriodId[p.service_period_id]?.tips_collected ?? null,
            payout_line_items: (lineItemsByPayoutId[p.id] || [])
              .slice()
              .sort((a, b) => {
                const ao = Number(a.sort_order)
                const bo = Number(b.sort_order)
                if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo
                return String(a.id || '').localeCompare(String(b.id || ''))
              })
          }))

          // Note: Sorting is now handled by sortedFohPayouts memo based on sortBy state
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

  /**
   * Filter payouts based on the selected time scope
   */
  const filteredFohPayouts = useMemo(() => {
    const payouts = Array.isArray(fohPayouts) ? fohPayouts : []
    if (timeScope === 'total') return payouts

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    return payouts.filter((p) => {
      const periodDate = p?.service_periods?.period_date
      if (!periodDate) return false

      // Parse date as YYYY-MM-DD in local timezone
      const [year, month, day] = periodDate.split('-').map(Number)
      const date = new Date(year, month - 1, day)

      switch (timeScope) {
        case 'today':
          return date.getTime() === today.getTime()
        case 'yesterday':
          return date.getTime() === yesterday.getTime()
        case 'this-month':
          return date >= thisMonthStart && date < new Date(now.getFullYear(), now.getMonth() + 1, 1)
        case 'last-month':
          return date >= lastMonthStart && date <= lastMonthEnd
        default:
          return true
      }
    })
  }, [fohPayouts, timeScope])

  const fohSummary = useMemo(() => {
    const payouts = filteredFohPayouts
    const totalNetTips = payouts.reduce((sum, p) => sum + Number(p.net_tips || 0), 0)
    const totalOwed = payouts.reduce((sum, p) => sum + Number(p.amount_owed_to_house || 0), 0)
    const totalCollectedTips = payouts.reduce((sum, p) => sum + Number(p.tips_collected || 0), 0)
    const totalKitchenTipOut = payouts.reduce((sum, p) => sum + Number(p.kitchen_contribution || 0), 0)
    const totalBarTipOut = payouts.reduce((sum, p) => sum + Number(p.bartender_contribution || 0), 0)
    const totalSales = payouts.reduce((sum, p) => {
      const sales = Number(p.sales_total)
      return sum + (Number.isFinite(sales) ? sales : 0)
    }, 0)
    return {
      totalNetTips,
      totalCollectedTips,
      totalOwed,
      totalKitchenTipOut,
      totalBarTipOut,
      totalSales,
      count: payouts.length
    }
  }, [filteredFohPayouts])

  const sortedFohPayouts = useMemo(() => {
    const payouts = Array.isArray(fohPayouts) ? [...fohPayouts] : []
    return payouts.sort(getSortComparator(sortBy))
  }, [fohPayouts, sortBy])

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
            <div className="space-y-6">
              {/* Section 1: Take-Home Earnings */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Take-Home Earnings
                  </h2>

                  {/* Time Scope Selector */}
                  <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
                    <button
                      onClick={() => setTimeScope('today')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeScope === 'today'
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setTimeScope('yesterday')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeScope === 'yesterday'
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      onClick={() => setTimeScope('this-month')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeScope === 'this-month'
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      This month
                    </button>
                    <button
                      onClick={() => setTimeScope('last-month')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeScope === 'last-month'
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      Last month
                    </button>
                    <button
                      onClick={() => setTimeScope('total')}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        timeScope === 'total'
                          ? 'bg-zinc-900 text-white shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      Total
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
                  {fohSummary.count === 0 ? (
                    <div className="text-center py-6">
                      <div className="text-sm font-medium text-zinc-600">No shifts found</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {timeScope === 'today' && 'No shifts recorded for today'}
                        {timeScope === 'yesterday' && 'No shifts recorded for yesterday'}
                        {timeScope === 'this-month' && 'No shifts recorded for this month'}
                        {timeScope === 'last-month' && 'No shifts recorded for last month'}
                        {timeScope === 'total' && 'No shifts recorded yet'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-emerald-900">Total Net Tips</div>
                          <div
                            className={`mt-2 text-5xl font-bold tracking-tight ${
                              Number(fohSummary.totalNetTips) < 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}
                          >
                            {formatMoney(fohSummary.totalNetTips)}
                          </div>
                          <div className="mt-2 text-sm text-zinc-600">
                            What you kept after tip-outs
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-zinc-500">Per shift</div>
                          <div className={`mt-1 text-2xl font-semibold ${
                            Number(fohSummary.totalNetTips) < 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {fohSummary.count > 0 ? formatMoney(fohSummary.totalNetTips / fohSummary.count) : '—'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-emerald-100 flex items-baseline gap-2">
                        <span className="text-xs text-zinc-500">Your net tip rate:</span>
                        <span className="text-lg font-semibold text-emerald-700 tabular-nums">
                          {formatPct(safePct(fohSummary.totalNetTips, fohSummary.totalSales))}
                        </span>
                        <span className="text-xs text-zinc-400">of sales (after tip-outs)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-200"></div>

              {/* Section 2: Performance Overview */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 px-1">
                  Performance Overview
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-sm text-zinc-500">Guest Tip Rate</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                      {formatPct(safePct(fohSummary.totalCollectedTips, fohSummary.totalSales))}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      What guests left (before tip-outs)
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="text-sm text-zinc-500">Total Sales</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                      {formatMoney(fohSummary.totalSales)}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      Across {fohSummary.count} {fohSummary.count === 1 ? 'shift' : 'shifts'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-200"></div>

              {/* Section 3: Shift Averages */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3 px-1">
                  Shift Averages
                </h2>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-zinc-500">Shifts worked</div>
                      <div className="mt-1 text-2xl font-semibold text-zinc-900">
                        {fohSummary.count}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">Avg sales / shift</div>
                      <div className="mt-1 text-2xl font-semibold text-zinc-900">
                        {fohSummary.count > 0 ? formatMoney(fohSummary.totalSales / fohSummary.count) : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Shifts List */}
            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Recent shifts</div>
                    <div className="text-xs text-zinc-500">
                      {sortBy === 'most-recent' && 'Most recent first'}
                      {sortBy === 'oldest' && 'Oldest first'}
                      {sortBy === 'highest-net-tips' && 'Highest net tips first'}
                      {sortBy === 'lowest-net-tips' && 'Lowest net tips first'}
                      {sortBy === 'highest-tip-pct' && 'Highest tip % first'}
                      {sortBy === 'lowest-tip-pct' && 'Lowest tip % first'}
                      {sortBy === 'highest-sales' && 'Highest sales first'}
                      {sortBy === 'lowest-sales' && 'Lowest sales first'}
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="sort-select" className="sr-only">
                      Sort shifts by
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 cursor-pointer transition-colors"
                    >
                      <option value="most-recent">Most recent</option>
                      <option value="oldest">Oldest</option>
                      <option value="highest-net-tips">Highest net tips</option>
                      <option value="lowest-net-tips">Lowest net tips</option>
                      <option value="highest-tip-pct">Highest tip %</option>
                      <option value="lowest-tip-pct">Lowest tip %</option>
                      <option value="highest-sales">Highest sales</option>
                      <option value="lowest-sales">Lowest sales</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {sortedFohPayouts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-zinc-600">No shifts recorded yet</div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Your tip breakdowns will appear here after your shifts are processed.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {sortedFohPayouts.map((p) => {
                    const period = p?.service_periods || {}
                    const date = period.period_date
                    const type = period.period_type || ''
                    const net = Number(p.net_tips || 0)
                    const owed = Number(p.amount_owed_to_house || 0)
                    const salesRaw = p.sales_total
                    const salesTotal = Number(salesRaw)
                    const collectedRaw = p.tips_collected
                    const collectedTips = Number(collectedRaw)
                    const collectedPct = formatPct(safePct(collectedTips, salesTotal))
                    const netPct = formatPct(safePct(net, salesTotal))
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
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 tabular-nums">
                                Sales {formatMoney(Number.isFinite(salesTotal) ? salesTotal : 0)}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 tabular-nums">
                                Collected tip %: {collectedPct}
                              </span>
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
                            <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                Tip breakdown
                              </div>

                              {items.length === 0 ? (
                                <div className="mt-3 text-sm text-zinc-600">
                                  No breakdown details available.
                                </div>
                              ) : (
                                <div className="mt-3 space-y-4">
                                  {/* Section 1: Before tip-outs */}
                                  <div className="rounded-md border border-zinc-200 bg-white p-3">
                                    <div className="flex items-center gap-1.5">
                                      <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                                        Before tip-outs
                                      </div>
                                      <InfoTooltip text="Your initial earnings from tips collected during this shift, before any deductions" />
                                    </div>

                                    <div className="mt-2 space-y-1.5">
                                      <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-zinc-700">Sales total</span>
                                        <span className="font-medium tabular-nums text-zinc-900">
                                          {formatMoney(Number.isFinite(salesTotal) ? salesTotal : 0)}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-zinc-700">Tips collected</span>
                                        <span className="font-medium tabular-nums text-emerald-600">
                                          {formatMoney(collectedTips)}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between border-t border-zinc-100 pt-1.5 text-xs sm:text-sm">
                                        <span className="text-zinc-700 font-medium">Tip rate</span>
                                        <span className="font-semibold tabular-nums text-emerald-700">
                                          {collectedPct}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section 2: Tip-outs (deductions) */}
                                  {(() => {
                                    const deductions = items.filter((li) => {
                                      const desc = (li.description || '').toLowerCase()
                                      const isDeduction =
                                        desc.includes('tip-out') ||
                                        desc.includes('kitchen') ||
                                        desc.includes('bartender')
                                      const isNotNetOrOwed =
                                        !desc.includes('net tips') &&
                                        !desc.includes('net after') &&
                                        !desc.includes('owed')
                                      return isDeduction && isNotNetOrOwed && li.amount != null
                                    })

                                    return deductions.length > 0 ? (
                                      <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                        <div className="flex items-center gap-1.5">
                                          <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                                            Tip-outs
                                          </div>
                                          <InfoTooltip text="Tip shares distributed to kitchen and bartender support staff" />
                                        </div>

                                        <div className="mt-2 space-y-1.5">
                                          {deductions.map((li, idx) => {
                                            const amount = Number(li.amount)
                                            const displayLabel = li.cleanedDescription || li.description || ''

                                            return (
                                              <div
                                                key={li.id || `deduction-${idx}`}
                                                className="flex items-center justify-between text-xs sm:text-sm"
                                              >
                                                <span className="text-zinc-700">{displayLabel}</span>
                                                <span className="font-medium tabular-nums text-red-600">
                                                  {formatMoney(amount)}
                                                </span>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    ) : null
                                  })()}

                                  {/* Section 3: After tip-outs */}
                                  <div className="rounded-md border border-zinc-200 bg-white p-3">
                                    <div className="flex items-center gap-1.5">
                                      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-700">
                                        After tip-outs
                                      </div>
                                      <InfoTooltip text="Your final earnings after all tip-out deductions" />
                                    </div>

                                    <div className="mt-2 space-y-1.5">
                                      <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-zinc-700 font-medium">Net tips</span>
                                        <span
                                          className={`font-semibold tabular-nums text-lg ${
                                            net < 0 ? 'text-red-600' : 'text-emerald-600'
                                          }`}
                                        >
                                          {formatMoney(net)}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <span className="text-zinc-700 font-medium">Net tip rate</span>
                                        <span className="font-semibold tabular-nums text-zinc-900">
                                          {netPct}
                                        </span>
                                      </div>

                                      {owed > 0 && (
                                        <div className="flex items-center justify-between border-t border-amber-100 pt-1.5 text-xs sm:text-sm">
                                          <span className="text-amber-800 font-medium">Owed to house</span>
                                          <span className="font-semibold tabular-nums text-amber-700">
                                            {formatMoney(owed)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
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
                    Enter sales and tips, then compute payouts for service periods
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
                
                <KitchenCard />
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
