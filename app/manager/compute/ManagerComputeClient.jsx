'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { calculateServicePeriodPayouts } from '@/lib/tipCalculator'
import AppHeader from '@/app/components/AppHeader'
import ManagerContentTransition from '@/app/manager/ManagerContentTransition'
import { requireManager } from '@/app/lib/requireRole'

function formatPeriodLabel(p) {
  const date = p?.period_date ?? ''
  const type = p?.period_type ?? ''
  return `${date} (${type})`
}

function asNumber(value, fieldName) {
  const n = Number(value)
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number for ${fieldName}: ${String(value)}`)
  }
  return n
}

function normalizeLineItems(lineItems) {
  if (!Array.isArray(lineItems)) return []
  return lineItems.map((li, idx) => {
    if (typeof li === 'string') {
      return { sort_order: idx, description: li, amount: null }
    }
    if (li && typeof li === 'object') {
      const description =
        typeof li.description === 'string'
          ? li.description
          : li.description == null
            ? JSON.stringify(li)
            : String(li.description)
      const amount = li.amount == null ? null : Number(li.amount)
      return { sort_order: idx, description, amount: Number.isFinite(amount) ? amount : null }
    }
    return { sort_order: idx, description: String(li), amount: null }
  })
}

export default function ManagerComputePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectId = searchParams.get('servicePeriodId')
  const [mounted, setMounted] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  const [servicePeriods, setServicePeriods] = useState([])
  const [selectedServicePeriodId, setSelectedServicePeriodId] = useState('')

  const [totalsStatus, setTotalsStatus] = useState('unknown') // 'unknown' | 'checking' | 'set' | 'missing'
  const [totalsError, setTotalsError] = useState(null)

  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false)
  const [isComputing, setIsComputing] = useState(false)

  const [loadError, setLoadError] = useState(null)
  const [computeError, setComputeError] = useState(null)
  const [writeError, setWriteError] = useState(null)

  const [lastRun, setLastRun] = useState(null)
  // lastRun shape:
  // {
  //   servicePeriodId,
  //   kitchenPoolTotal,
  //   bartenderPoolTotal,
  //   payouts: [{ employeeId, employee_code, display_name, role, net_tips, amount_owed_to_house, lineItems }]
  // }

  const selectedPeriod = useMemo(() => {
    return servicePeriods.find((p) => p.id === selectedServicePeriodId) || null
  }, [servicePeriods, selectedServicePeriodId])

  const loadPeriods = useCallback(async () => {
    setIsLoadingPeriods(true)
    setLoadError(null)
    try {
      const { data, error } = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .order('period_date', { ascending: false })
        .order('period_type', { ascending: true })

      if (error) throw error

      const periods = Array.isArray(data) ? data : []
      setServicePeriods(periods)
      setSelectedServicePeriodId((prev) => {
        if (preselectId && periods.some((p) => p.id === preselectId)) return preselectId
        return prev || periods[0]?.id || ''
      })
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoadingPeriods(false)
    }
  }, [preselectId])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsAllowed(requireManager(router))
  }, [mounted, router])

  useEffect(() => {
    if (!mounted || !isAllowed) return
    loadPeriods()
  }, [loadPeriods, mounted, isAllowed])

  // Totals guard: block compute if totals row missing.
  useEffect(() => {
    if (!mounted || !isAllowed) return
    const servicePeriodId = selectedServicePeriodId
    if (!servicePeriodId) {
      setTotalsStatus('unknown')
      setTotalsError(null)
      return
    }

    let isCancelled = false
    ;(async () => {
      setTotalsStatus('checking')
      setTotalsError(null)
      const res = await supabase
        .from('service_period_totals')
        .select('service_period_id')
        .eq('service_period_id', servicePeriodId)
        .maybeSingle()

      if (isCancelled) return
      if (res.error) {
        setTotalsError(res.error.message || String(res.error))
        setTotalsStatus('unknown')
        return
      }
      setTotalsStatus(res.data?.service_period_id ? 'set' : 'missing')
    })()

    return () => {
      isCancelled = true
    }
  }, [mounted, isAllowed, selectedServicePeriodId])

  const computeAndPersist = useCallback(async () => {
    setComputeError(null)
    setWriteError(null)
    setLastRun(null)

    const servicePeriodId = selectedServicePeriodId
    if (!servicePeriodId) {
      setComputeError('Select a service period first.')
      return
    }

    setIsComputing(true)
    try {
      // 1) Fetch entries + employee display info
      /** @type {Array<any>} */
      let entries = []
      /** @type {Record<string, { employee_code?: string, display_name?: string }>} */
      let employeeById = {}

      // Attempt relationship select first (works when FK is present, which your migration defines).
      const relRes = await supabase
        .from('service_period_entries')
        .select(
          'id, service_period_id, employee_id, role, sales_total, tips_collected, bartender_slot, employees ( employee_code, display_name )'
        )
        .eq('service_period_id', servicePeriodId)
        .order('role', { ascending: true })
        .order('employee_id', { ascending: true })

      if (!relRes.error) {
        entries = Array.isArray(relRes.data) ? relRes.data : []
        for (const r of entries) {
          const emp = r?.employees
          if (emp && r?.employee_id) {
            employeeById[r.employee_id] = {
              employee_code: emp.employee_code ?? '',
              display_name: emp.display_name ?? ''
            }
          }
        }
      } else {
        // Fallback: entries -> employees lookup
        const entRes = await supabase
          .from('service_period_entries')
          .select('id, service_period_id, employee_id, role, sales_total, tips_collected, bartender_slot')
          .eq('service_period_id', servicePeriodId)
          .order('role', { ascending: true })
          .order('employee_id', { ascending: true })

        if (entRes.error) throw entRes.error
        entries = Array.isArray(entRes.data) ? entRes.data : []

        const employeeIds = Array.from(new Set(entries.map((e) => e.employee_id).filter(Boolean)))
        if (employeeIds.length > 0) {
          const empRes = await supabase
            .from('employees')
            .select('id, employee_code, display_name')
            .in('id', employeeIds)

          if (empRes.error) throw empRes.error
          for (const emp of empRes.data || []) {
            employeeById[emp.id] = { employee_code: emp.employee_code ?? '', display_name: emp.display_name ?? '' }
          }
        }
      }

      // 2) Build engine input workers[]
      const workers = entries.map((r) => {
        const employeeId = r.employee_id
        return {
          employeeId,
          role: r.role,
          sales: asNumber(r.sales_total, `sales_total for employee_id=${employeeId}`),
          tipsCollected: asNumber(r.tips_collected, `tips_collected for employee_id=${employeeId}`)
        }
      })

      // 3) Compute
      const engine = calculateServicePeriodPayouts({
        servicePeriodId,
        workers
      })

      if (engine?.hasError) {
        setComputeError(engine.errorMessage || 'Tip engine returned an error.')
        return
      }

      // 4) Persist (deterministic + idempotent)
      // 4a) totals upsert
      {
        const { error } = await supabase
          .from('service_period_totals')
          .upsert(
            {
              service_period_id: servicePeriodId,
              bartender_pool_total: engine.bartenderPoolTotal,
              kitchen_pool_total: engine.kitchenPoolTotal
            },
            { onConflict: 'service_period_id' }
          )
        if (error) throw error
      }

      // 4b) payouts upsert (select back IDs)
      const payoutUpserts = (engine.payoutsByWorker || []).map((p) => ({
        service_period_id: servicePeriodId,
        employee_id: p.employeeId,
        role: p.role,
        kitchen_contribution: p.kitchenContribution,
        bartender_contribution: p.bartenderContribution,
        bartender_share_received: p.bartenderShareReceived,
        net_tips: p.netTips,
        amount_owed_to_house: p.amountOwedToHouse
      }))

      const upsertRes = await supabase
        .from('service_period_payouts')
        .upsert(payoutUpserts, { onConflict: 'service_period_id,employee_id' })
        .select('id, employee_id')

      if (upsertRes.error) throw upsertRes.error
      const payoutRows = Array.isArray(upsertRes.data) ? upsertRes.data : []

      /** @type {Record<string, string>} */
      const payoutIdByEmployeeId = {}
      for (const row of payoutRows) {
        if (row?.employee_id && row?.id) payoutIdByEmployeeId[row.employee_id] = row.id
      }

      // 4c) replace payout_line_items for each payout (delete then insert)
      const payoutsByWorker = Array.isArray(engine.payoutsByWorker) ? engine.payoutsByWorker : []
      await Promise.all(
        payoutsByWorker.map(async (p) => {
          const payoutId = payoutIdByEmployeeId[p.employeeId]
          if (!payoutId) {
            throw new Error(`Missing payout row id after upsert for employee_id=${p.employeeId}`)
          }

          const delRes = await supabase.from('payout_line_items').delete().eq('service_period_payout_id', payoutId)
          if (delRes.error) throw delRes.error

          const normalized = normalizeLineItems(p.lineItems).map((li) => ({
            service_period_payout_id: payoutId,
            sort_order: li.sort_order,
            description: li.description,
            amount: li.amount
          }))

          if (normalized.length > 0) {
            const insRes = await supabase.from('payout_line_items').insert(normalized)
            if (insRes.error) throw insRes.error
          }
        })
      )

      // 5) Render-ready results (use engine outputs + employee display info)
      const uiPayouts = payoutsByWorker.map((p) => {
        const emp = employeeById[p.employeeId] || {}
        return {
          employeeId: p.employeeId,
          employee_code: emp.employee_code || '(unknown)',
          display_name: emp.display_name || '',
          role: p.role,
          net_tips: p.netTips,
          amount_owed_to_house: p.amountOwedToHouse,
          lineItems: Array.isArray(p.lineItems) ? p.lineItems : []
        }
      })

      setLastRun({
        servicePeriodId,
        kitchenPoolTotal: engine.kitchenPoolTotal,
        bartenderPoolTotal: engine.bartenderPoolTotal,
        payouts: uiPayouts
      })
    } catch (e) {
      const msg = e?.message || String(e)
      setWriteError(msg)
    } finally {
      setIsComputing(false)
    }
  }, [selectedServicePeriodId])

  if (!mounted || !isAllowed) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppHeader title="Manager" subtitle="Compute payouts" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600">Checking access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Manager" subtitle="Compute payouts" />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <ManagerContentTransition>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 style={{ margin: 0, marginBottom: 12 }}>Manager · Compute payouts</h2>

          {totalsStatus === 'missing' ? (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <div className="font-medium">Totals not set.</div>
              <div className="mt-1">Go to Entries to set bartender/kitchen pools.</div>
              <a
                className="mt-2 inline-block rounded-md bg-white px-3 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-50"
                href={
                  selectedPeriod?.period_date && selectedPeriod?.period_type
                    ? `/manager/entries?date=${encodeURIComponent(selectedPeriod.period_date)}&type=${encodeURIComponent(
                        selectedPeriod.period_type
                      )}`
                    : '/manager/entries'
                }
              >
                Go to Entries
              </a>
            </div>
          ) : totalsError ? (
            <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <div className="font-medium">Totals check failed.</div>
              <div className="mt-1">{totalsError}</div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <label>
              <span style={{ marginRight: 8 }}>Service period</span>
              <select
                value={selectedServicePeriodId}
                onChange={(e) => setSelectedServicePeriodId(e.target.value)}
                disabled={isLoadingPeriods || isComputing}
              >
                <option value="">-- Select a service period --</option>
                {servicePeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {formatPeriodLabel(p)}
                  </option>
                ))}
              </select>
            </label>

            <button onClick={loadPeriods} disabled={isLoadingPeriods || isComputing}>
              {isLoadingPeriods ? 'Loading…' : 'Reload'}
            </button>

            <button
              onClick={computeAndPersist}
              disabled={
                isComputing ||
                !selectedServicePeriodId ||
                totalsStatus === 'missing' ||
                totalsStatus === 'checking'
              }
            >
              {isComputing ? 'Computing…' : 'Compute payouts'}
            </button>
          </div>

          {selectedPeriod ? (
            <div style={{ marginBottom: 12, color: '#444' }}>
              Selected: <strong>{formatPeriodLabel(selectedPeriod)}</strong>
            </div>
          ) : null}

          {loadError ? (
            <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
              <strong>Load error:</strong> {loadError}
            </div>
          ) : null}
          {computeError ? (
            <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
              <strong>Compute error:</strong> {computeError}
              <div style={{ marginTop: 6, color: '#555' }}>
                (No writes were performed because the engine returned an error.)
              </div>
            </div>
          ) : null}
          {writeError ? (
            <div style={{ padding: 12, background: '#fee', border: '1px solid #f99', marginBottom: 12 }}>
              <strong>Write error:</strong> {writeError}
            </div>
          ) : null}

          {lastRun ? (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: 0, marginBottom: 10 }}>Results</h3>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                <div>
                  <div style={{ color: '#666', fontSize: 12 }}>Kitchen pool total</div>
                  <div style={{ fontWeight: 600 }}>{Number(lastRun.kitchenPoolTotal).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: 12 }}>Bartender pool total</div>
                  <div style={{ fontWeight: 600 }}>{Number(lastRun.bartenderPoolTotal).toFixed(2)}</div>
                </div>
              </div>

              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Employee</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Role</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Net tips</th>
                    <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Owed to house</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Line items</th>
                  </tr>
                </thead>
                <tbody>
                  {lastRun.payouts.map((p) => (
                    <tr key={p.employeeId}>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                        <div style={{ fontWeight: 600 }}>{p.employee_code}</div>
                        {p.display_name ? (
                          <div style={{ color: '#666', fontSize: 12 }}>{p.display_name}</div>
                        ) : null}
                        <div style={{ color: '#aaa', fontSize: 11 }}>{p.employeeId}</div>
                      </td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>{p.role}</td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                        {Number(p.net_tips).toFixed(2)}
                      </td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8, textAlign: 'right' }}>
                        {Number(p.amount_owed_to_house).toFixed(2)}
                      </td>
                      <td style={{ borderBottom: '1px solid #f0f0f0', padding: 8 }}>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {(p.lineItems || []).map((li, idx) => (
                            <li key={idx} style={{ marginBottom: 4 }}>
                              {typeof li === 'string' ? li : JSON.stringify(li)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
        </ManagerContentTransition>
      </main>
    </div>
  )
}
