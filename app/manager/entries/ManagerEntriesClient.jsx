'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { calculateServicePeriodPayouts } from '@/lib/tipCalculator'
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

function formatEmployeeLabel(employee) {
  const code = employee?.employee_code || '(unknown)'
  const name = employee?.display_name || '—'
  return `${code} · ${name}`
}

function roleSortKey(role) {
  // Bartenders first, then servers.
  return role === 'bartender' ? '0' : role === 'server' ? '1' : `9-${String(role || '')}`
}

/**
 * Parse dollar amount from a line item description string.
 * Handles formats like: "$55.00", "-$55.00", "+$55.00"
 */
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

export default function ManagerEntriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  const [periodDate, setPeriodDate] = useState('')
  const [periodType, setPeriodType] = useState('lunch')
  const [activePeriod, setActivePeriod] = useState(null) // { id, period_date, period_type }

  const [shiftAssignments, setShiftAssignments] = useState([])
  const [activeEmployeeIds, setActiveEmployeeIds] = useState([])

  // inputsByEmployeeId:
  // { [employeeId]: { sales_total: string, tips_collected: string } }
  const [inputsByEmployeeId, setInputsByEmployeeId] = useState({})

  const [storedEntries, setStoredEntries] = useState([])

  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isAddingUnassigned, setIsAddingUnassigned] = useState(false)

  const [loadError, setLoadError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(null)
  const [publishError, setPublishError] = useState(null)
  const [publishSuccess, setPublishSuccess] = useState(null)

  const [showUnassigned, setShowUnassigned] = useState(false)
  const [unassignedServerSearch, setUnassignedServerSearch] = useState('')
  const [unassignedBartenderSearch, setUnassignedBartenderSearch] = useState('')
  const [allowedRoleEmployees, setAllowedRoleEmployees] = useState([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsAllowed(requireManager(router))
  }, [mounted, router])

  // Prefill date/type from query params (optional UX).
  useEffect(() => {
    if (!mounted) return
    const qDate = searchParams.get('date')
    const qType = searchParams.get('type')
    if (qDate && !periodDate) setPeriodDate(qDate)
    if ((qType === 'lunch' || qType === 'dinner') && qType !== periodType) setPeriodType(qType)
  }, [mounted, searchParams, periodDate, periodType])

  const isBusy =
    isLoadingAssignments ||
    isLoadingPeriod ||
    isLoadingEntries ||
    isSaving ||
    isPublishing ||
    isAddingUnassigned

  const setEmployeeInput = useCallback((employeeId, patch) => {
    setInputsByEmployeeId((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] || { sales_total: '', tips_collected: '' }), ...patch }
    }))
  }, [])

  const clearRow = useCallback((employeeId) => {
    setInputsByEmployeeId((prev) => ({
      ...prev,
      [employeeId]: { sales_total: '', tips_collected: '' }
    }))
  }, [])

  const loadAssignmentsAndEntries = useCallback(async (servicePeriodId) => {
    setIsLoadingAssignments(true)
    setIsLoadingEntries(true)
    setLoadError(null)
    setSaveError(null)
    setSaveSuccess(null)
    try {
      const assignmentRes = await supabase
        .from('shift_assignments')
        .select('id, employee_id, worked_role, station, employees ( id, employee_code, display_name, role )')
        .eq('service_period_id', servicePeriodId)
        .order('worked_role', { ascending: true })
        .order('employee_id', { ascending: true })

      if (assignmentRes.error) throw assignmentRes.error
      let assignments = Array.isArray(assignmentRes.data) ? assignmentRes.data : []

      assignments = assignments.slice().sort((a, b) => {
        const ra = roleSortKey(a.worked_role)
        const rb = roleSortKey(b.worked_role)
        if (ra !== rb) return ra.localeCompare(rb)
        const ca = String(a?.employees?.employee_code || '')
        const cb = String(b?.employees?.employee_code || '')
        if (ca !== cb) return ca.localeCompare(cb)
        return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
      })

      /** @type {Array<any>} */
      let entries = []

      const relRes = await supabase
        .from('service_period_entries')
        .select(
          'id, service_period_id, employee_id, role, sales_total, tips_collected, bartender_slot, created_at, employees ( employee_code, display_name, role )'
        )
        .eq('service_period_id', servicePeriodId)
        .order('employee_id', { ascending: true })

      if (!relRes.error) {
        entries = Array.isArray(relRes.data) ? relRes.data : []
      } else {
        const eRes = await supabase
          .from('service_period_entries')
          .select('id, service_period_id, employee_id, role, sales_total, tips_collected, bartender_slot, created_at')
          .eq('service_period_id', servicePeriodId)
          .order('employee_id', { ascending: true })

        if (eRes.error) throw eRes.error
        entries = Array.isArray(eRes.data) ? eRes.data : []

        const employeeIds = Array.from(new Set(entries.map((x) => x.employee_id).filter(Boolean))).sort()
        /** @type {Record<string, any>} */
        const employeeById = {}
        if (employeeIds.length > 0) {
          const empRes = await supabase
            .from('employees')
            .select('id, employee_code, display_name, role')
            .in('id', employeeIds)

          if (empRes.error) throw empRes.error
          for (const emp of empRes.data || []) employeeById[emp.id] = emp
        }

        entries = entries.map((x) => ({ ...x, employees: employeeById[x.employee_id] || null }))
      }

      entries = entries.slice().sort((a, b) => {
        const ra = roleSortKey(a.role)
        const rb = roleSortKey(b.role)
        if (ra !== rb) return ra.localeCompare(rb)
        const ea = a?.employees?.employee_code || ''
        const eb = b?.employees?.employee_code || ''
        if (ea !== eb) return String(ea).localeCompare(String(eb))
        return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
      })

      /** @type {Record<string, any>} */
      const entryByEmployeeId = {}
      for (const e of entries) {
        if (e?.employee_id) entryByEmployeeId[e.employee_id] = e
      }

      setStoredEntries(entries)
      setShiftAssignments(assignments)
      setActiveEmployeeIds(assignments.map((a) => a.employee_id))

      setInputsByEmployeeId((prev) => {
        /** @type {Record<string, { sales_total:string, tips_collected:string }>} */
        const next = {}

        for (const assignment of assignments || []) {
          const employeeId = assignment.employee_id
          const existing = entryByEmployeeId[employeeId]
          next[employeeId] = {
            sales_total: existing?.sales_total != null ? String(existing.sales_total) : '',
            tips_collected: existing?.tips_collected != null ? String(existing.tips_collected) : ''
          }
        }

        for (const [k, v] of Object.entries(prev || {})) {
          if (!next[k]) next[k] = v
        }

        return next
      })
    } catch (e) {
      setLoadError(e?.message || String(e))
      setStoredEntries([])
      setShiftAssignments([])
      setActiveEmployeeIds([])
    } finally {
      setIsLoadingAssignments(false)
      setIsLoadingEntries(false)
    }
  }, [])

  useEffect(() => {
    if (!mounted || !isAllowed) return
    if (!activePeriod?.id) return
    loadAssignmentsAndEntries(activePeriod.id)
  }, [mounted, isAllowed, activePeriod?.id, loadAssignmentsAndEntries])

  useEffect(() => {
    if (!mounted || !isAllowed) return
    if (!showUnassigned) return
    const loadAllowed = async () => {
      try {
        const { data, error } = await supabase
          .from('employee_allowed_roles')
          .select('employee_id, role, employees ( id, employee_code, display_name, role )')
          .in('role', ['server', 'bartender'])
        if (error) throw error
        setAllowedRoleEmployees(Array.isArray(data) ? data : [])
      } catch (e) {
        setLoadError(e?.message || String(e))
        setAllowedRoleEmployees([])
      }
    }
    loadAllowed()
  }, [mounted, isAllowed, showUnassigned])

  const loadOrCreatePeriod = useCallback(async () => {
    setLoadError(null)
    setSaveError(null)
    setSaveSuccess(null)
    setPublishError(null)
    setPublishSuccess(null)
    setActivePeriod(null)
    setStoredEntries([])

    const d = periodDate
    const t = periodType
    if (!d) {
      setLoadError('Select a date first.')
      return
    }
    if (t !== 'lunch' && t !== 'dinner') {
      setLoadError('Select a period type (lunch or dinner).')
      return
    }

    setIsLoadingPeriod(true)
    try {
      // Try to find existing
      const findRes = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .eq('period_date', d)
        .eq('period_type', t)
        .maybeSingle()

      if (findRes.error) throw findRes.error

      if (findRes.data?.id) {
        setActivePeriod(findRes.data)
        return
      }

      // Create if missing
      const createRes = await supabase
        .from('service_periods')
        .insert({ period_date: d, period_type: t })
        .select('id, period_date, period_type')
        .single()

      if (createRes.error) throw createRes.error
      setActivePeriod(createRes.data)
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoadingPeriod(false)
    }
  }, [periodDate, periodType])

  const saveEntries = useCallback(async () => {
    setSaveError(null)
    setSaveSuccess(null)
    setPublishError(null)
    setPublishSuccess(null)

    const servicePeriodId = activePeriod?.id
    if (!servicePeriodId) {
      setSaveError('Load or create a service period first.')
      return
    }

    setIsSaving(true)
    try {
      const bartenderCount = (shiftAssignments || []).filter(
        (assignment) => assignment.worked_role === 'bartender'
      ).length
      const bartenderSlotValue = bartenderCount >= 2 ? 2 : 1
      const upserts = []

      for (const assignment of shiftAssignments || []) {
        if (!activeEmployeeIds.includes(assignment.employee_id)) continue
        const emp = assignment.employees || {}
        const row = inputsByEmployeeId?.[assignment.employee_id] || {
          sales_total: '',
          tips_collected: ''
        }
        const salesRaw = String(row.sales_total ?? '').trim()
        const tipsRaw = String(row.tips_collected ?? '').trim()

        const hasAny = salesRaw !== '' || tipsRaw !== ''
        if (!hasAny) continue

        if (salesRaw === '' || tipsRaw === '') {
          throw new Error(`Enter both sales_total and tips_collected for ${emp.employee_code}.`)
        }

        const sales = asNumber(salesRaw, `sales_total for employee_id=${assignment.employee_id}`)
        const tips = asNumber(tipsRaw, `tips_collected for employee_id=${assignment.employee_id}`)

        if (sales < 0) throw new Error(`sales_total must be >= 0 for ${emp.employee_code}.`)
        if (tips < 0) throw new Error(`tips_collected must be >= 0 for ${emp.employee_code}.`)

        upserts.push({
          service_period_id: servicePeriodId,
          employee_id: assignment.employee_id,
          role: assignment.worked_role,
          sales_total: sales,
          tips_collected: tips,
          bartender_slot: bartenderSlotValue
        })
      }

      if (upserts.length === 0) {
        setSaveError('Enter at least one row before saving.')
        return
      }

      const upsertRes = await supabase
        .from('service_period_entries')
        .upsert(upserts, { onConflict: 'service_period_id,employee_id' })

      if (upsertRes.error) {
        const msg = upsertRes.error.message || String(upsertRes.error)
        if (msg.toLowerCase().includes('no unique or exclusion constraint')) {
          throw new Error(
            "Upsert failed because the DB is missing a UNIQUE constraint on (service_period_id, employee_id). Add that constraint (or matching unique index) and retry."
          )
        }
        throw upsertRes.error
      }

      setSaveSuccess('Saved entries.')
      await loadAssignmentsAndEntries(servicePeriodId)
    } catch (e) {
      setSaveError(e?.message || String(e))
    } finally {
      setIsSaving(false)
    }
  }, [activePeriod?.id, shiftAssignments, activeEmployeeIds, inputsByEmployeeId, loadAssignmentsAndEntries])

  /**
   * Compute & Publish: saves entries first (if needed), then computes payouts and persists them.
   * Employees can see results on /dashboard immediately after.
   */
  const computeAndPublish = useCallback(async () => {
    setPublishError(null)
    setPublishSuccess(null)
    setSaveError(null)
    setSaveSuccess(null)

    const servicePeriodId = activePeriod?.id
    if (!servicePeriodId) {
      setPublishError('Load or create a service period first.')
      return
    }

    setIsPublishing(true)
    try {
      const bartenderCount = (shiftAssignments || []).filter(
        (assignment) => assignment.worked_role === 'bartender'
      ).length
      const bartenderSlotValue = bartenderCount >= 2 ? 2 : 1
      if (bartenderCount !== 1 && bartenderCount !== 2) {
        setPublishError(`Expected 1 or 2 bartenders assigned, but found ${bartenderCount}.`)
        return
      }
      // 1) Build upserts from current inputs (same logic as saveEntries)
      const upserts = []

      for (const assignment of shiftAssignments || []) {
        if (!activeEmployeeIds.includes(assignment.employee_id)) continue
        const emp = assignment.employees || {}
        const row = inputsByEmployeeId?.[assignment.employee_id] || {
          sales_total: '',
          tips_collected: ''
        }
        const salesRaw = String(row.sales_total ?? '').trim()
        const tipsRaw = String(row.tips_collected ?? '').trim()

        const hasAny = salesRaw !== '' || tipsRaw !== ''
        if (!hasAny) continue

        if (salesRaw === '' || tipsRaw === '') {
          throw new Error(`Enter both sales_total and tips_collected for ${emp.employee_code}.`)
        }

        const sales = asNumber(salesRaw, `sales_total for employee_id=${assignment.employee_id}`)
        const tips = asNumber(tipsRaw, `tips_collected for employee_id=${assignment.employee_id}`)

        if (sales < 0) throw new Error(`sales_total must be >= 0 for ${emp.employee_code}.`)
        if (tips < 0) throw new Error(`tips_collected must be >= 0 for ${emp.employee_code}.`)

        upserts.push({
          service_period_id: servicePeriodId,
          employee_id: assignment.employee_id,
          role: assignment.worked_role,
          sales_total: sales,
          tips_collected: tips,
          bartender_slot: bartenderSlotValue
        })
      }

      if (upserts.length === 0) {
        setPublishError('Enter at least one row before computing.')
        return
      }

      // 2) Save entries first
      const upsertRes = await supabase
        .from('service_period_entries')
        .upsert(upserts, { onConflict: 'service_period_id,employee_id' })

      if (upsertRes.error) {
        const msg = upsertRes.error.message || String(upsertRes.error)
        if (msg.toLowerCase().includes('no unique or exclusion constraint')) {
          throw new Error(
            "Upsert failed because the DB is missing a UNIQUE constraint on (service_period_id, employee_id). Add that constraint (or matching unique index) and retry."
          )
        }
        throw upsertRes.error
      }

      // 3) Fetch entries back with employee info for compute
      /** @type {Array<any>} */
      let entries = []
      /** @type {Record<string, { employee_code?: string, display_name?: string }>} */
      let employeeById = {}

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

      if (entries.length === 0) {
        setPublishError('No entries found after save. Please try again.')
        return
      }

      // 4) Build engine input workers[]
      const workers = entries.map((r) => {
        const employeeId = r.employee_id
        return {
          employeeId,
          role: r.role,
          sales: asNumber(r.sales_total, `sales_total for employee_id=${employeeId}`),
          tipsCollected: asNumber(r.tips_collected, `tips_collected for employee_id=${employeeId}`)
        }
      })

      // 5) Compute payouts
      const engine = calculateServicePeriodPayouts({
        servicePeriodId,
        workers
      })

      if (engine?.hasError) {
        setPublishError(engine.errorMessage || 'Tip engine returned an error.')
        return
      }

      // 6) Persist derived totals
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

      // 7) Persist payouts (upsert, get back IDs)
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

      const payoutRes = await supabase
        .from('service_period_payouts')
        .upsert(payoutUpserts, { onConflict: 'service_period_id,employee_id' })
        .select('id, employee_id')

      if (payoutRes.error) throw payoutRes.error
      const payoutRows = Array.isArray(payoutRes.data) ? payoutRes.data : []

      /** @type {Record<string, string>} */
      const payoutIdByEmployeeId = {}
      for (const row of payoutRows) {
        if (row?.employee_id && row?.id) payoutIdByEmployeeId[row.employee_id] = row.id
      }

      // 8) Replace payout_line_items for each payout (delete then insert)
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

      // 9) Success - reload stored entries preview
      await loadAssignmentsAndEntries(servicePeriodId)
      setPublishSuccess('Computed & published. Employees can now see payouts on /dashboard.')
    } catch (e) {
      setPublishError(e?.message || String(e))
    } finally {
      setIsPublishing(false)
    }
  }, [
    activePeriod?.id,
    shiftAssignments,
    activeEmployeeIds,
    inputsByEmployeeId,
    loadAssignmentsAndEntries
  ])

  const activeEmployeeIdSet = useMemo(() => new Set(activeEmployeeIds), [activeEmployeeIds])
  const activeAssignments = useMemo(() => {
    return (shiftAssignments || []).filter((a) => activeEmployeeIdSet.has(a.employee_id))
  }, [shiftAssignments, activeEmployeeIdSet])

  const serverAssignments = useMemo(
    () => activeAssignments.filter((a) => a.worked_role === 'server'),
    [activeAssignments]
  )

  const bartenderAssignments = useMemo(
    () => activeAssignments.filter((a) => a.worked_role === 'bartender'),
    [activeAssignments]
  )

  const assignedEmployeeIdSet = useMemo(
    () => new Set((shiftAssignments || []).map((a) => a.employee_id)),
    [shiftAssignments]
  )

  const availableUnassignedServers = useMemo(() => {
    const q = unassignedServerSearch.trim().toLowerCase()
    return (allowedRoleEmployees || [])
      .filter((r) => r.role === 'server')
      .map((r) => r.employees)
      .filter(Boolean)
      .filter((emp) => !assignedEmployeeIdSet.has(emp.id))
      .filter((emp) => {
        if (!q) return true
        const label = `${emp.employee_code || ''} ${emp.display_name || ''}`.toLowerCase()
        return label.includes(q)
      })
  }, [allowedRoleEmployees, assignedEmployeeIdSet, unassignedServerSearch])

  const availableUnassignedBartenders = useMemo(() => {
    const q = unassignedBartenderSearch.trim().toLowerCase()
    return (allowedRoleEmployees || [])
      .filter((r) => r.role === 'bartender')
      .map((r) => r.employees)
      .filter(Boolean)
      .filter((emp) => !assignedEmployeeIdSet.has(emp.id))
      .filter((emp) => {
        if (!q) return true
        const label = `${emp.employee_code || ''} ${emp.display_name || ''}`.toLowerCase()
        return label.includes(q)
      })
  }, [allowedRoleEmployees, assignedEmployeeIdSet, unassignedBartenderSearch])

  const addUnassignedEmployee = useCallback(
    async (employee, workedRole) => {
      if (!activePeriod?.id) return
      setIsAddingUnassigned(true)
      try {
        const insertRes = await supabase
          .from('shift_assignments')
          .insert({
            service_period_id: activePeriod.id,
            employee_id: employee.id,
            worked_role: workedRole,
            station: null
          })
          .select('id, employee_id, worked_role, station, employees ( id, employee_code, display_name, role )')
          .single()

        if (insertRes.error) throw insertRes.error
        const nextAssignment = insertRes.data
        setShiftAssignments((prev) => {
          const next = [...(prev || []), nextAssignment]
          next.sort((a, b) => {
            const ra = roleSortKey(a.worked_role)
            const rb = roleSortKey(b.worked_role)
            if (ra !== rb) return ra.localeCompare(rb)
            const ca = String(a?.employees?.employee_code || '')
            const cb = String(b?.employees?.employee_code || '')
            if (ca !== cb) return ca.localeCompare(cb)
            return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
          })
          return next
        })
        setActiveEmployeeIds((prev) => (prev.includes(nextAssignment.employee_id) ? prev : [...prev, nextAssignment.employee_id]))
        setInputsByEmployeeId((prev) => ({
          ...prev,
          [nextAssignment.employee_id]: prev[nextAssignment.employee_id] || {
            sales_total: '',
            tips_collected: ''
          }
        }))
      } catch (e) {
        setLoadError(e?.message || String(e))
      } finally {
        setIsAddingUnassigned(false)
      }
    },
    [activePeriod?.id]
  )

  const previewRows = useMemo(() => {
    const entries = Array.isArray(storedEntries) ? storedEntries : []
    return entries.map((e) => {
      const emp = e?.employees || {}
      return {
        id: e.id || `${e.service_period_id}-${e.employee_id}`,
        employee_code: emp.employee_code || '(unknown)',
        display_name: emp.display_name || '',
        role: e.role || emp.role || '',
        sales_total: e.sales_total,
        tips_collected: e.tips_collected
      }
    })
  }, [storedEntries])

  if (!mounted || !isAllowed) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppHeader title="Manager" subtitle="Enter entries and compute payouts" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600">Checking access…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Manager" subtitle="Enter entries and compute payouts" />

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Select or create service period</div>
              <div className="mt-1 text-xs text-zinc-500">
                Choose date + lunch/dinner, then load existing or create a new period.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs text-zinc-600">
                <div className="mb-1">Date</div>
                <input
                  type="date"
                  value={periodDate}
                  onChange={(e) => setPeriodDate(e.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                />
              </label>

              <label className="text-xs text-zinc-600">
                <div className="mb-1">Period type</div>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                >
                  <option value="lunch">lunch</option>
                  <option value="dinner">dinner</option>
                </select>
              </label>

              <button
                onClick={loadOrCreatePeriod}
                disabled={isBusy || !periodDate}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingPeriod ? 'Loading…' : 'Load / Create'}
              </button>
            </div>
          </div>

          {activePeriod ? (
            <div className="mt-3 flex flex-col gap-2 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Selected service_period_id: <span className="font-mono">{activePeriod.id}</span>
              </div>
              <button
                onClick={() => router.push(`/manager/assignments/${activePeriod.id}`)}
                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                View assignments
              </button>
            </div>
          ) : (
            <div className="mt-3 text-xs text-zinc-500">No service period selected.</div>
          )}

          {loadError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">FOH entries</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => activePeriod?.id && loadAssignmentsAndEntries(activePeriod.id)}
                disabled={isBusy || !activePeriod?.id}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingAssignments || isLoadingEntries ? 'Loading…' : 'Reload assignments'}
              </button>
              <button
                onClick={saveEntries}
                disabled={isBusy || !activePeriod?.id}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving…' : 'Save entries'}
              </button>
              <button
                onClick={computeAndPublish}
                disabled={isBusy || !activePeriod?.id}
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPublishing ? 'Publishing…' : 'Compute & Publish'}
              </button>
            </div>
          </div>

          {saveError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </div>
          ) : null}
          {saveSuccess ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {saveSuccess}
            </div>
          ) : null}

          {publishError ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {publishError}
            </div>
          ) : null}
          {publishSuccess ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <div className="font-medium">{publishSuccess}</div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50"
                >
                  View /dashboard
                </button>
                <button
                  onClick={() => router.push('/manager/summary')}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50"
                >
                  View Summary
                </button>
              </div>
            </div>
          ) : null}

          {!activePeriod?.id ? (
            <div className="mt-4 text-sm text-zinc-600">Load or create a service period to start entering rows.</div>
          ) : isLoadingEntries || isLoadingAssignments ? (
            <div className="mt-4 text-sm text-zinc-600">Loading existing entries…</div>
          ) : shiftAssignments.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-600">No FOH assignments found for this service period.</div>
          ) : (
            <div className="mt-4 space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Servers ({serverAssignments.length})</div>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                        <th className="py-2 pr-4">Employee</th>
                        <th className="py-2 pr-4">Role</th>
                        <th className="py-2 pr-4">Station</th>
                        <th className="py-2 pr-4 text-right">Sales total ($)</th>
                        <th className="py-2 pr-4 text-right">Tips collected ($)</th>
                        <th className="py-2 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {serverAssignments.map((assignment) => {
                        const emp = assignment.employees || {}
                        const row = inputsByEmployeeId?.[assignment.employee_id] || {
                          sales_total: '',
                          tips_collected: ''
                        }
                        return (
                          <tr key={assignment.employee_id}>
                            <td className="py-3 pr-4">
                              <div className="font-medium text-zinc-900">{formatEmployeeLabel(emp)}</div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                                server
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-xs text-zinc-500">{assignment.station || '—'}</td>
                            <td className="py-3 pr-4 text-right">
                              <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={row.sales_total}
                                onChange={(e) => setEmployeeInput(assignment.employee_id, { sales_total: e.target.value })}
                                disabled={isBusy}
                                className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={row.tips_collected}
                                onChange={(e) =>
                                  setEmployeeInput(assignment.employee_id, { tips_collected: e.target.value })
                                }
                                disabled={isBusy}
                                className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 pr-2 text-right">
                              <button
                                onClick={() => clearRow(assignment.employee_id)}
                                disabled={isBusy}
                                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Clear
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Bartenders ({bartenderAssignments.length})</div>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                        <th className="py-2 pr-4">Employee</th>
                        <th className="py-2 pr-4">Role</th>
                        <th className="py-2 pr-4">Station</th>
                        <th className="py-2 pr-4 text-right">Sales total ($)</th>
                        <th className="py-2 pr-4 text-right">Tips collected ($)</th>
                        <th className="py-2 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {bartenderAssignments.map((assignment) => {
                        const emp = assignment.employees || {}
                        const row = inputsByEmployeeId?.[assignment.employee_id] || {
                          sales_total: '',
                          tips_collected: ''
                        }
                        return (
                          <tr key={assignment.employee_id}>
                            <td className="py-3 pr-4">
                              <div className="font-medium text-zinc-900">{formatEmployeeLabel(emp)}</div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                                bartender
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-xs text-zinc-500">{assignment.station || '—'}</td>
                            <td className="py-3 pr-4 text-right">
                              <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={row.sales_total}
                                onChange={(e) => setEmployeeInput(assignment.employee_id, { sales_total: e.target.value })}
                                disabled={isBusy}
                                className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={row.tips_collected}
                                onChange={(e) =>
                                  setEmployeeInput(assignment.employee_id, { tips_collected: e.target.value })
                                }
                                disabled={isBusy}
                                className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-sm text-right focus:border-zinc-900 focus:outline-none"
                                placeholder="0.00"
                              />
                            </td>
                            <td className="py-3 pr-2 text-right">
                              <button
                                onClick={() => clearRow(assignment.employee_id)}
                                disabled={isBusy}
                                className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Clear
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-600">
                <button
                  type="button"
                  onClick={() => setShowUnassigned((prev) => !prev)}
                  className="font-medium text-zinc-900 hover:text-zinc-700"
                >
                  {showUnassigned ? 'Hide' : 'Add unassigned staff'}
                </button>
                {showUnassigned ? (
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-zinc-700">Unassigned servers</div>
                      <input
                        type="text"
                        value={unassignedServerSearch}
                        onChange={(e) => setUnassignedServerSearch(e.target.value)}
                        disabled={isBusy}
                        className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1 text-xs focus:border-zinc-900 focus:outline-none"
                        placeholder="Search allowed servers…"
                      />
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-zinc-200 bg-white">
                        {availableUnassignedServers.length === 0 ? (
                          <div className="px-2 py-2 text-xs text-zinc-500">No eligible unassigned servers.</div>
                        ) : (
                          availableUnassignedServers.map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => addUnassignedEmployee(emp, 'server')}
                              className="block w-full px-2 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"
                            >
                              {formatEmployeeLabel(emp)}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-700">Unassigned bartenders</div>
                      <input
                        type="text"
                        value={unassignedBartenderSearch}
                        onChange={(e) => setUnassignedBartenderSearch(e.target.value)}
                        disabled={isBusy}
                        className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-1 text-xs focus:border-zinc-900 focus:outline-none"
                        placeholder="Search allowed bartenders…"
                      />
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-zinc-200 bg-white">
                        {availableUnassignedBartenders.length === 0 ? (
                          <div className="px-2 py-2 text-xs text-zinc-500">No eligible unassigned bartenders.</div>
                        ) : (
                          availableUnassignedBartenders.map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => addUnassignedEmployee(emp, 'bartender')}
                              className="block w-full px-2 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50"
                            >
                              {formatEmployeeLabel(emp)}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {activePeriod?.id ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Stored preview</div>
                <div className="mt-1 text-xs text-zinc-500">What is currently stored for this service period.</div>
              </div>
              <button
                onClick={() => loadAssignmentsAndEntries(activePeriod.id)}
                disabled={isBusy}
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingEntries || isLoadingAssignments ? 'Loading…' : 'Reload preview'}
              </button>
            </div>

            {isLoadingEntries ? (
              <div className="mt-4 text-sm text-zinc-600">Loading…</div>
            ) : previewRows.length === 0 ? (
              <div className="mt-4 text-sm text-zinc-600">No entries stored yet for this service period.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                      <th className="py-2 pr-4">Employee</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4 text-right">Sales total</th>
                      <th className="py-2 pr-4 text-right">Tips collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {previewRows.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2 pr-4">
                          <div className="font-medium text-zinc-900">{r.employee_code}</div>
                          <div className="text-xs text-zinc-500">{r.display_name || '—'}</div>
                        </td>
                        <td className="py-2 pr-4">
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">
                            {r.role}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-right text-zinc-900">{formatMoney(r.sales_total)}</td>
                        <td className="py-2 pr-4 text-right text-zinc-900">{formatMoney(r.tips_collected)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
