'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/app/components/AppHeader'
import { readSession, SESSION_KEY } from '@/app/lib/requireRole'

function formatMoney(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function comparePeriod(a, b) {
  // Most recent first (date desc), then period_type asc, then id asc.
  const ad = a?.service_periods?.period_date || ''
  const bd = b?.service_periods?.period_date || ''
  if (ad !== bd) return bd.localeCompare(ad)
  const at = a?.service_periods?.period_type || ''
  const bt = b?.service_periods?.period_type || ''
  if (at !== bt) return at.localeCompare(bt)
  const aid = a?.id || ''
  const bid = b?.id || ''
  return aid.localeCompare(bid)
}

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

  const toggleDetails = useCallback((payoutId) => {
    setExpandedPayoutIds((prev) => {
      const next = new Set(prev)
      if (next.has(payoutId)) next.delete(payoutId)
      else next.add(payoutId)
      return next
    })
  }, [])

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
          // ----------------------------
          // FOH: payouts + periods + line items
          // ----------------------------
          /** @type {Array<any>} */
          let payouts = []

          // Attempt relationship select first.
          const relRes = await supabase
            .from('service_period_payouts')
            .select(
              'id, service_period_id, employee_id, role, kitchen_contribution, bartender_contribution, bartender_share_received, net_tips, amount_owed_to_house, service_periods ( id, period_date, period_type ), payout_line_items ( id, service_period_payout_id, sort_order, description, amount )'
            )
            .eq('employee_id', s.employeeId)
            .order('service_period_id', { ascending: false })

          if (!relRes.error) {
            payouts = Array.isArray(relRes.data) ? relRes.data : []
          } else {
            // Fallback: payouts -> service_periods + payout_line_items
            const pRes = await supabase
              .from('service_period_payouts')
              .select(
                'id, service_period_id, employee_id, role, kitchen_contribution, bartender_contribution, bartender_share_received, net_tips, amount_owed_to_house'
              )
              .eq('employee_id', s.employeeId)
              .order('service_period_id', { ascending: false })

            if (pRes.error) throw pRes.error
            payouts = Array.isArray(pRes.data) ? pRes.data : []

            const servicePeriodIds = Array.from(new Set(payouts.map((p) => p.service_period_id).filter(Boolean))).sort()
            const payoutIds = Array.from(new Set(payouts.map((p) => p.id).filter(Boolean))).sort()

            /** @type {Record<string, any>} */
            const periodById = {}
            if (servicePeriodIds.length > 0) {
              const spRes = await supabase
                .from('service_periods')
                .select('id, period_date, period_type')
                .in('id', servicePeriodIds)

              if (spRes.error) throw spRes.error
              for (const sp of spRes.data || []) periodById[sp.id] = sp
            }

            /** @type {Record<string, Array<any>>} */
            const lineItemsByPayoutId = {}
            if (payoutIds.length > 0) {
              const liRes = await supabase
                .from('payout_line_items')
                .select('id, service_period_payout_id, sort_order, description, amount')
                .in('service_period_payout_id', payoutIds)
                .order('service_period_payout_id', { ascending: true })
                .order('sort_order', { ascending: true })

              if (liRes.error) throw liRes.error
              for (const li of liRes.data || []) {
                const pid = li.service_period_payout_id
                lineItemsByPayoutId[pid] = lineItemsByPayoutId[pid] || []
                lineItemsByPayoutId[pid].push(li)
              }
            }

            payouts = payouts.map((p) => ({
              ...p,
              service_periods: periodById[p.service_period_id] || null,
              payout_line_items: (lineItemsByPayoutId[p.id] || []).slice()
            }))
          }

          // Deterministic sort + line items sort
          payouts = payouts
            .map((p) => ({
              ...p,
              payout_line_items: Array.isArray(p.payout_line_items)
                ? p.payout_line_items.slice().sort((a, b) => {
                    const ao = Number(a.sort_order)
                    const bo = Number(b.sort_order)
                    if (Number.isFinite(ao) && Number.isFinite(bo) && ao !== bo) return ao - bo
                    return String(a.id || '').localeCompare(String(b.id || ''))
                  })
                : []
            }))
            .sort(comparePeriod)

          setFohPayouts(payouts)
          return
        }

        if (s.role === 'kitchen' || s.role === 'kitchen_manager') {
          // ----------------------------
          // BOH: weekly payouts + recent hours
          // ----------------------------
          const wpRes = await supabase
            .from('weekly_kitchen_payouts')
            .select('week_id, employee_id, weekly_kitchen_payout')
            .eq('employee_id', s.employeeId)
            .order('week_id', { ascending: false })

          if (wpRes.error) throw wpRes.error
          const wp = Array.isArray(wpRes.data) ? wpRes.data : []
          setWeeklyPayouts(wp)

          /** @type {Array<any>} */
          let logs = []

          // Attempt relationship select first.
          const relLogsRes = await supabase
            .from('kitchen_work_logs')
            .select(
              'service_period_id, employee_id, hours_worked, role_weight, created_at, service_periods ( id, period_date, period_type )'
            )
            .eq('employee_id', s.employeeId)
            .order('created_at', { ascending: false })
            .limit(10)

          if (!relLogsRes.error) {
            logs = Array.isArray(relLogsRes.data) ? relLogsRes.data : []
          } else {
            // Fallback: logs -> service_periods
            const logRes = await supabase
              .from('kitchen_work_logs')
              .select('service_period_id, employee_id, hours_worked, role_weight, created_at')
              .eq('employee_id', s.employeeId)
              .order('created_at', { ascending: false })
              .limit(10)

            if (logRes.error) throw logRes.error
            logs = Array.isArray(logRes.data) ? logRes.data : []

            const servicePeriodIds = Array.from(new Set(logs.map((l) => l.service_period_id).filter(Boolean))).sort()
            /** @type {Record<string, any>} */
            const periodById = {}
            if (servicePeriodIds.length > 0) {
              const spRes = await supabase
                .from('service_periods')
                .select('id, period_date, period_type')
                .in('id', servicePeriodIds)

              if (spRes.error) throw spRes.error
              for (const sp of spRes.data || []) periodById[sp.id] = sp
            }

            logs = logs.map((l) => ({ ...l, service_periods: periodById[l.service_period_id] || null }))
          }

          // Deterministic ordering (created_at desc, then service_period_id asc)
          logs = logs.slice().sort((a, b) => {
            const ac = String(a.created_at || '')
            const bc = String(b.created_at || '')
            if (ac !== bc) return bc.localeCompare(ac)
            return String(a.service_period_id || '').localeCompare(String(b.service_period_id || ''))
          })

          setRecentHours(logs)
          return
        }

        throw new Error(`Unsupported role: ${String(s.role)}`)
      } catch (e) {
        setError(e?.message || String(e))
      } finally {
        setIsLoading(false)
      }
    },
    [setIsLoading]
  )

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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Dashboard" subtitle="Employee view" />

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="text-sm text-zinc-600">Loading dashboard…</div>
        ) : !session ? (
          <div className="text-sm text-zinc-600">Redirecting…</div>
        ) : isFoh ? (
          <div className="space-y-6">
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

            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold">Service periods</div>
                <div className="text-xs text-zinc-500">Most recent first</div>
              </div>

              {fohPayouts.length === 0 ? (
                <div className="px-4 py-6 text-sm text-zinc-600">No payouts found yet.</div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {fohPayouts.map((p) => {
                    const period = p?.service_periods || {}
                    const date = period.period_date || '(unknown date)'
                    const type = period.period_type || '(unknown type)'
                    const net = Number(p.net_tips || 0)
                    const owed = Number(p.amount_owed_to_house || 0)
                    const expanded = expandedPayoutIds.has(p.id)
                    const items = Array.isArray(p.payout_line_items) ? p.payout_line_items : []

                    return (
                      <div key={p.id} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-zinc-900">
                              {date}{' '}
                              <span className="ml-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                                {type}
                              </span>
                              {owed > 0 ? (
                                <span className="ml-2 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                  Owes house
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">Payout ID: {p.id}</div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`text-sm font-semibold ${net < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {formatMoney(net)}
                            </div>
                            <button
                              onClick={() => toggleDetails(p.id)}
                              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                              {expanded ? 'Hide details' : 'Details'}
                            </button>
                          </div>
                        </div>

                        <div
                          className={`grid transition-all duration-200 ease-in-out ${
                            expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                              <div className="text-xs font-semibold text-zinc-700">Line items</div>
                              {items.length === 0 ? (
                                <div className="mt-2 text-sm text-zinc-600">No line items.</div>
                              ) : (
                                <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                                  {items.map((li) => (
                                    <li
                                      key={
                                        li.id ||
                                        `${p.id}-${String(li.sort_order)}-${String(li.description || '')}-${String(li.amount ?? '')}`
                                      }
                                    >
                                      - {li.description}{' '}
                                      {li.amount != null ? `(${formatMoney(li.amount)})` : ''}
                                    </li>
                                  ))}
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="text-xs text-zinc-500">This week (most recent)</div>
                {mostRecentWeek ? (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-zinc-900">{mostRecentWeek.week_id}</div>
                    <div className="mt-1 text-2xl font-semibold text-zinc-900">
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

            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold">Past weekly payouts</div>
                <div className="text-xs text-zinc-500">Most recent first</div>
              </div>

              {weeklyPayouts.length === 0 ? (
                <div className="px-4 py-6 text-sm text-zinc-600">No weekly payouts found yet.</div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {weeklyPayouts.map((w) => (
                    <div key={`${w.week_id}-${w.employee_id}`} className="flex items-center justify-between px-4 py-3">
                      <div className="text-sm font-medium text-zinc-900">{w.week_id}</div>
                      <div className="text-sm font-semibold text-zinc-900">{formatMoney(w.weekly_kitchen_payout)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="text-sm font-semibold">Recent hours</div>
                <div className="text-xs text-zinc-500">Last 10 logs</div>
              </div>

              {recentHours.length === 0 ? (
                <div className="px-4 py-6 text-sm text-zinc-600">No kitchen work logs found yet.</div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {recentHours.map((l) => {
                    const sp = l?.service_periods || {}
                    const label = sp.period_date ? `${sp.period_date} (${sp.period_type || ''})` : l.service_period_id
                    return (
                      <div key={`${l.created_at}-${l.service_period_id}`} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{label}</div>
                            <div className="mt-1 text-xs text-zinc-500">Service period: {l.service_period_id}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-zinc-900">
                              {formatMoney(l.hours_worked)} hrs
                            </div>
                            <div className="text-xs text-zinc-500">Weight {formatMoney(l.role_weight)}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            Unsupported role: <span className="font-mono">{String(role)}</span>
          </div>
        )}
      </main>
    </div>
  )
}

