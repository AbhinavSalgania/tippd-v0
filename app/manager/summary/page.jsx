'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/app/components/AppHeader'
import { requireManager } from '@/app/lib/requireRole'

function asNumber(value, fieldName) {
  const n = Number(value)
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${fieldName}: ${String(value)}`)
  return n
}

function formatMoney(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toFixed(2) : '0.00'
}

function periodSortKey(p) {
  // lunch before dinner; fallback: lexical.
  const t = String(p?.period_type || '')
  const rank = t === 'lunch' ? '0' : t === 'dinner' ? '1' : `9-${t}`
  return `${rank}-${String(p?.id || '')}`
}

export default function ManagerSummaryPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  const [selectedDate, setSelectedDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copySuccess, setCopySuccess] = useState(null)

  const [servicePeriods, setServicePeriods] = useState([])
  const [rows, setRows] = useState([])
  // rows: [{ period_type, period_date, employee_code, display_name, role, net_tips, amount_owed_to_house }]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsAllowed(requireManager(router))
  }, [mounted, router])

  const totalsByPeriodId = useMemo(() => {
    /** @type {Record<string, { net:number, owed:number }>} */
    const by = {}
    for (const r of rows || []) {
      const pid = r.service_period_id
      by[pid] = by[pid] || { net: 0, owed: 0 }
      by[pid].net += Number(r.net_tips || 0)
      by[pid].owed += Number(r.amount_owed_to_house || 0)
    }
    return by
  }, [rows])

  const tsvText = useMemo(() => {
    const header = ['Period', 'Employee Code', 'Name', 'Role', 'Net Tips', 'Owed To House']
    const lines = [header.join('\t')]
    for (const r of rows || []) {
      const periodLabel = `${r.period_date} (${r.period_type})`
      lines.push(
        [
          periodLabel,
          r.employee_code || '',
          r.display_name || '',
          r.role || '',
          formatMoney(r.net_tips),
          formatMoney(r.amount_owed_to_house)
        ].join('\t')
      )
    }
    return lines.join('\n')
  }, [rows])

  const copyAsTsv = useCallback(async () => {
    setCopySuccess(null)
    try {
      if (!tsvText || tsvText.trim() === '') return
      await navigator.clipboard.writeText(tsvText)
      setCopySuccess('Copied TSV to clipboard.')
      setTimeout(() => setCopySuccess(null), 1500)
    } catch (e) {
      setCopySuccess('Copy failed. Your browser may block clipboard access.')
    }
  }, [tsvText])

  const loadSummary = useCallback(async () => {
    setError(null)
    setCopySuccess(null)
    setServicePeriods([])
    setRows([])

    const date = selectedDate
    if (!date) {
      setError('Select a date first.')
      return
    }

    setIsLoading(true)
    try {
      // 1) Service periods for date
      const spRes = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .eq('period_date', date)
        .order('period_type', { ascending: true })
        .order('id', { ascending: true })

      if (spRes.error) throw spRes.error
      const periods = Array.isArray(spRes.data) ? spRes.data : []

      if (periods.length === 0) {
        setError('No service periods found for this date. Create service periods and run /manager/compute first.')
        return
      }

      const periodIds = periods.map((p) => p.id)
      setServicePeriods(periods.slice().sort((a, b) => periodSortKey(a).localeCompare(periodSortKey(b))))

      // 2) Payouts for those service periods
      /** @type {Array<any>} */
      let payouts = []
      /** @type {Record<string, any>} */
      let employeeById = {}

      const relPayoutsRes = await supabase
        .from('service_period_payouts')
        .select('service_period_id, employee_id, role, net_tips, amount_owed_to_house, employees ( employee_code, display_name, role )')
        .in('service_period_id', periodIds)

      if (!relPayoutsRes.error) {
        payouts = Array.isArray(relPayoutsRes.data) ? relPayoutsRes.data : []
        for (const p of payouts) {
          const emp = p?.employees
          if (emp && p?.employee_id) employeeById[p.employee_id] = emp
        }
      } else {
        const pRes = await supabase
          .from('service_period_payouts')
          .select('service_period_id, employee_id, role, net_tips, amount_owed_to_house')
          .in('service_period_id', periodIds)

        if (pRes.error) throw pRes.error
        payouts = Array.isArray(pRes.data) ? pRes.data : []

        const employeeIds = Array.from(new Set(payouts.map((p) => p.employee_id).filter(Boolean))).sort()
        if (employeeIds.length > 0) {
          const eRes = await supabase
            .from('employees')
            .select('id, employee_code, display_name, role')
            .in('id', employeeIds)

          if (eRes.error) throw eRes.error
          for (const emp of eRes.data || []) employeeById[emp.id] = emp
        }
      }

      /** @type {Record<string, any>} */
      const periodById = {}
      for (const p of periods) periodById[p.id] = p

      // 3) Build rows (copy/paste friendly)
      const nextRows = payouts.map((p) => {
        const sp = periodById[p.service_period_id] || {}
        const emp = employeeById[p.employee_id] || {}

        return {
          service_period_id: p.service_period_id,
          period_date: sp.period_date || date,
          period_type: sp.period_type || '',
          employee_id: p.employee_id,
          employee_code: emp.employee_code || '(unknown)',
          display_name: emp.display_name || '',
          role: p.role || emp.role || '',
          net_tips: asNumber(p.net_tips, `net_tips for employee_id=${p.employee_id}`),
          amount_owed_to_house: asNumber(p.amount_owed_to_house, `amount_owed_to_house for employee_id=${p.employee_id}`)
        }
      })

      // Sort: lunch->dinner, then employee_code asc, then employee_id asc
      nextRows.sort((a, b) => {
        const pa = periodSortKey(periodById[a.service_period_id] || { period_type: a.period_type, id: a.service_period_id })
        const pb = periodSortKey(periodById[b.service_period_id] || { period_type: b.period_type, id: b.service_period_id })
        if (pa !== pb) return pa.localeCompare(pb)
        const ea = String(a.employee_code || '')
        const eb = String(b.employee_code || '')
        if (ea !== eb) return ea.localeCompare(eb)
        return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
      })

      setRows(nextRows)
    } catch (e) {
      setError(e?.message || String(e))
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  if (!mounted || !isAllowed) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppHeader title="Manager" subtitle="Summary" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600">Checking access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Manager" subtitle="Summary" />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Daily summary</div>
              <div className="mt-1 text-xs text-zinc-500">
                Select a date to load lunch + dinner payouts (copy/paste friendly).
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Date</div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </label>

              <button
                onClick={loadSummary}
                disabled={isLoading || !selectedDate}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Loading…' : 'Load summary'}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {copySuccess ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {copySuccess}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">Service periods found</div>
            <div className="mt-1 text-xs text-zinc-500">For {selectedDate || '—'}</div>

            {servicePeriods.length === 0 ? (
              <div className="mt-4 text-sm text-zinc-600">No periods loaded yet.</div>
            ) : (
              <ul className="mt-4 space-y-2 text-sm text-zinc-700">
                {servicePeriods.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{p.period_date}</span>{' '}
                      <span className="ml-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                        {p.period_type}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">{p.id}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Copy/paste table</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Columns: Period, Employee Code, Name, Role, Net Tips, Owed To House
                </div>
              </div>
              <button
                onClick={copyAsTsv}
                disabled={rows.length === 0}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Copy as TSV"
              >
                Copy TSV
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="mt-4 text-sm text-zinc-600">No rows loaded yet.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                      <th className="py-2 pr-4">Period</th>
                      <th className="py-2 pr-4">Employee Code</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4 text-right">Net Tips</th>
                      <th className="py-2 pr-2 text-right">Owed To House</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {rows.map((r) => (
                      <tr key={`${r.service_period_id}-${r.employee_id}`}>
                        <td className="py-2 pr-4">
                          {r.period_date}{' '}
                          <span className="ml-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600">
                            {r.period_type}
                          </span>
                        </td>
                        <td className="py-2 pr-4 font-medium">{r.employee_code}</td>
                        <td className="py-2 pr-4 text-zinc-700">{r.display_name || '—'}</td>
                        <td className="py-2 pr-4 text-zinc-700">{r.role}</td>
                        <td className={`py-2 pr-4 text-right font-medium ${r.net_tips < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {formatMoney(r.net_tips)}
                        </td>
                        <td className="py-2 pr-2 text-right text-zinc-900">{formatMoney(r.amount_owed_to_house)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {servicePeriods.length > 0 ? (
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold">Totals by period</div>
            <div className="mt-1 text-xs text-zinc-500">Computed from `service_period_payouts`</div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {servicePeriods.map((p) => {
                const t = totalsByPeriodId[p.id] || { net: 0, owed: 0 }
                return (
                  <div key={p.id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        {p.period_date}{' '}
                        <span className="ml-2 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-600">
                          {p.period_type}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">{p.id}</div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <div className="text-zinc-600">Total net tips</div>
                      <div className={`font-semibold ${t.net < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatMoney(t.net)}</div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <div className="text-zinc-600">Total owed to house</div>
                      <div className="font-semibold text-zinc-900">{formatMoney(t.owed)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

