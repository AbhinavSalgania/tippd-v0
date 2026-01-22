'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { calculateServicePeriodPayouts } from '@/lib/tipCalculator'
import AppHeader from '@/app/components/AppHeader'
import ManagerContentTransition from '@/app/manager/ManagerContentTransition'
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
  return role === 'bartender' ? '0' : role === 'server' ? '1' : `9-${String(role || '')}`
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

function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCurrentPeriodType() {
  const now = new Date()
  const hour = now.getHours()
  // Before 5pm (17:00) = lunch, after = dinner
  return hour < 17 ? 'lunch' : 'dinner'
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function ManagerDashboardClient() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  const [periodDate, setPeriodDate] = useState('')
  const [periodType, setPeriodType] = useState('lunch')
  const [activePeriod, setActivePeriod] = useState(null)

  const [shiftAssignments, setShiftAssignments] = useState([])
  const [inputsByEmployeeId, setInputsByEmployeeId] = useState({})
  const [nameFilter, setNameFilter] = useState('')

  const [isLoadingPeriod, setIsLoadingPeriod] = useState(false)
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
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
    setPeriodDate(getTodayDateString())
    setPeriodType(getCurrentPeriodType())
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsAllowed(requireManager(router))
  }, [mounted, router])

  const isBusy = isLoadingPeriod || isLoadingAssignments || isSaving || isPublishing || isAddingUnassigned

  const isPastDate = useMemo(() => {
    if (!periodDate) return false
    const today = getTodayDateString()
    return periodDate < today
  }, [periodDate])

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
    setLoadError(null)
    setSaveError(null)
    setSaveSuccess(null)
    setPublishError(null)
    setPublishSuccess(null)

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
        const sa = String(a.station || '')
        const sb = String(b.station || '')
        if (sa !== sb) return sa.localeCompare(sb)
        const ca = String(a?.employees?.employee_code || '')
        const cb = String(b?.employees?.employee_code || '')
        if (ca !== cb) return ca.localeCompare(cb)
        return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
      })

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

      const entryByEmployeeId = {}
      for (const e of entries) {
        if (e?.employee_id) entryByEmployeeId[e.employee_id] = e
      }

      setShiftAssignments(assignments)

      setInputsByEmployeeId((prev) => {
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
      setShiftAssignments([])
    } finally {
      setIsLoadingAssignments(false)
    }
  }, [])

  const loadOrCreatePeriod = useCallback(async (shouldCreate = false) => {
    setLoadError(null)
    setSaveError(null)
    setSaveSuccess(null)
    setPublishError(null)
    setPublishSuccess(null)
    setActivePeriod(null)
    setShiftAssignments([])

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
      const findRes = await supabase
        .from('service_periods')
        .select('id, period_date, period_type')
        .eq('period_date', d)
        .eq('period_type', t)
        .maybeSingle()

      if (findRes.error) throw findRes.error

      if (findRes.data?.id) {
        setActivePeriod(findRes.data)
        await loadAssignmentsAndEntries(findRes.data.id)
        return
      }

      if (shouldCreate) {
        const createRes = await supabase
          .from('service_periods')
          .insert({ period_date: d, period_type: t })
          .select('id, period_date, period_type')
          .single()

        if (createRes.error) throw createRes.error
        setActivePeriod(createRes.data)
        await loadAssignmentsAndEntries(createRes.data.id)
      } else {
        setActivePeriod(null)
      }
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setIsLoadingPeriod(false)
    }
  }, [periodDate, periodType, loadAssignmentsAndEntries])

  useEffect(() => {
    if (!mounted || !isAllowed || !periodDate) return
    loadOrCreatePeriod(false)
  }, [mounted, isAllowed, periodDate, periodType])

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

  const saveEntries = useCallback(async () => {
    setSaveError(null)
    setSaveSuccess(null)
    setPublishError(null)
    setPublishSuccess(null)

    const servicePeriodId = activePeriod?.id
    if (!servicePeriodId) {
      setSaveError('Create a service period first.')
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
          throw new Error(`Enter both sales and tips for ${emp.employee_code}.`)
        }

        const sales = asNumber(salesRaw, `sales_total for employee_id=${assignment.employee_id}`)
        const tips = asNumber(tipsRaw, `tips_collected for employee_id=${assignment.employee_id}`)

        if (sales < 0) throw new Error(`Sales must be >= 0 for ${emp.employee_code}.`)
        if (tips < 0) throw new Error(`Tips must be >= 0 for ${emp.employee_code}.`)

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

      if (upsertRes.error) throw upsertRes.error

      setSaveSuccess('Saved entries.')
      await loadAssignmentsAndEntries(servicePeriodId)
    } catch (e) {
      setSaveError(e?.message || String(e))
    } finally {
      setIsSaving(false)
    }
  }, [activePeriod?.id, shiftAssignments, inputsByEmployeeId, loadAssignmentsAndEntries])

  const computeAndPublish = useCallback(async () => {
    setPublishError(null)
    setPublishSuccess(null)
    setSaveError(null)
    setSaveSuccess(null)

    const servicePeriodId = activePeriod?.id
    if (!servicePeriodId) {
      setPublishError('Create a service period first.')
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

      const upserts = []

      for (const assignment of shiftAssignments || []) {
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
          throw new Error(`Enter both sales and tips for ${emp.employee_code}.`)
        }

        const sales = asNumber(salesRaw, `sales_total for employee_id=${assignment.employee_id}`)
        const tips = asNumber(tipsRaw, `tips_collected for employee_id=${assignment.employee_id}`)

        if (sales < 0) throw new Error(`Sales must be >= 0 for ${emp.employee_code}.`)
        if (tips < 0) throw new Error(`Tips must be >= 0 for ${emp.employee_code}.`)

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

      const upsertRes = await supabase
        .from('service_period_entries')
        .upsert(upserts, { onConflict: 'service_period_id,employee_id' })

      if (upsertRes.error) throw upsertRes.error

      let entries = []
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
        servicePeriodId,
        workers
      })

      if (engine?.hasError) {
        setPublishError(engine.errorMessage || 'Tip engine returned an error.')
        return
      }

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

      const payoutIdByEmployeeId = {}
      for (const row of payoutRows) {
        if (row?.employee_id && row?.id) payoutIdByEmployeeId[row.employee_id] = row.id
      }

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

      await loadAssignmentsAndEntries(servicePeriodId)
      setPublishSuccess('Computed & published. Employees can now see payouts.')
    } catch (e) {
      setPublishError(e?.message || String(e))
    } finally {
      setIsPublishing(false)
    }
  }, [activePeriod?.id, shiftAssignments, inputsByEmployeeId, loadAssignmentsAndEntries])

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
            const sa = String(a.station || '')
            const sb = String(b.station || '')
            if (sa !== sb) return sa.localeCompare(sb)
            const ca = String(a?.employees?.employee_code || '')
            const cb = String(b?.employees?.employee_code || '')
            if (ca !== cb) return ca.localeCompare(cb)
            return String(a.employee_id || '').localeCompare(String(b.employee_id || ''))
          })
          return next
        })
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

  const filteredAssignments = useMemo(() => {
    const q = nameFilter.trim().toLowerCase()
    if (!q) return shiftAssignments
    return shiftAssignments.filter((a) => {
      const emp = a.employees || {}
      const label = `${emp.employee_code || ''} ${emp.display_name || ''}`.toLowerCase()
      return label.includes(q)
    })
  }, [shiftAssignments, nameFilter])

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

  const groupedAssignments = useMemo(() => {
    const groups = {}
    for (const assignment of filteredAssignments) {
      const role = assignment.worked_role || 'unknown'
      const station = assignment.station || 'Unassigned'
      const key = `${role}|${station}`
      if (!groups[key]) {
        groups[key] = { role, station, assignments: [] }
      }
      groups[key].assignments.push(assignment)
    }

    const result = Object.values(groups).sort((a, b) => {
      const ra = roleSortKey(a.role)
      const rb = roleSortKey(b.role)
      if (ra !== rb) return ra.localeCompare(rb)
      return a.station.localeCompare(b.station)
    })

    return result
  }, [filteredAssignments])

  if (!mounted || !isAllowed) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <AppHeader title="Today's Service" subtitle="Daily workflow dashboard" />
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-zinc-600">Checking access…</div>
      </div>
    )
  }

  const dateDisplay = formatDateDisplay(periodDate)
  const periodDisplay = periodType === 'lunch' ? 'Lunch' : 'Dinner'

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <AppHeader title="Today's Service" subtitle="Daily workflow dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <ManagerContentTransition className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">{dateDisplay} — {periodDisplay}</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {activePeriod ? `Service period loaded` : 'No period found for this date'}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs text-zinc-600">
                <div className="mb-1 font-medium">Date</div>
                <input
                  type="date"
                  value={periodDate}
                  onChange={(e) => setPeriodDate(e.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-60"
                />
              </label>

              <label className="text-xs text-zinc-600">
                <div className="mb-1 font-medium">Period</div>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-60"
                >
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </label>

              {!activePeriod && (
                <button
                  onClick={() => loadOrCreatePeriod(true)}
                  disabled={isBusy || !periodDate}
                  className="mt-5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingPeriod ? 'Creating…' : 'Create period'}
                </button>
              )}
            </div>
          </div>

          {loadError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {loadError}
            </div>
          )}
        </div>

        {activePeriod && (
          <>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Scheduled staff for {dateDisplay} ({periodDisplay})
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {shiftAssignments.length} staff assigned · Enter sales and tips below
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    placeholder="Search by name or code…"
                    className="w-full sm:w-48 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                  />
                  <button
                    onClick={() => router.push('/manager/entries')}
                    className="whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Entries page
                  </button>
                </div>
              </div>

              {isPastDate && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <div className="font-medium">View-only mode for past dates</div>
                  <div className="mt-1 text-xs">
                    To edit past entries, use the{' '}
                    <button
                      onClick={() => router.push('/manager/entries')}
                      className="font-medium text-amber-900 underline hover:no-underline"
                    >
                      Entries page
                    </button>
                    .
                  </div>
                </div>
              )}

              {saveError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {saveSuccess}
                </div>
              )}
              {publishError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {publishError}
                </div>
              )}
              {publishSuccess && (
                <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <div className="font-medium">{publishSuccess}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-50"
                    >
                      View employee dashboard
                    </button>
                    <button
                      onClick={() => router.push('/manager/summary')}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50"
                    >
                      View summary
                    </button>
                  </div>
                </div>
              )}

              {isLoadingAssignments ? (
                <div className="mt-4 text-sm text-zinc-600">Loading staff assignments…</div>
              ) : shiftAssignments.length === 0 ? (
                <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                  <div className="font-medium">No staff scheduled for this period</div>
                  <div className="mt-1 text-xs">
                    Go to the{' '}
                    <button
                      onClick={() => router.push('/manager/entries')}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      Entries page
                    </button>{' '}
                    to manage assignments.
                  </div>
                </div>
              ) : (
                <div className="mt-5 space-y-6">
                  {groupedAssignments.map((group) => (
                    <div key={`${group.role}-${group.station}`}>
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 capitalize">
                          {group.role === 'bartender' ? 'Bartenders' : 'Servers'}
                        </span>
                        {group.station !== 'Unassigned' && (
                          <span className="text-xs text-zinc-500">· {group.station}</span>
                        )}
                        <span className="text-xs text-zinc-400">({group.assignments.length})</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm table-fixed">
                          <colgroup>
                            <col className="w-auto" />
                            <col className="w-32" />
                            <col className="w-32" />
                            {!isPastDate && <col className="w-24" />}
                          </colgroup>
                          <thead>
                            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                              <th className="py-2 pr-4 font-medium">Employee</th>
                              <th className="py-2 pr-4 text-right font-medium">Sales ($)</th>
                              <th className="py-2 pr-4 text-right font-medium">Tips ($)</th>
                              {!isPastDate && <th className="py-2 pr-2 text-right font-medium">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {group.assignments.map((assignment) => {
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
                                  {isPastDate ? (
                                    <>
                                      <td className="py-3 pr-4 text-right">
                                        <div className="text-sm text-zinc-700">
                                          {row.sales_total ? formatMoney(row.sales_total) : '—'}
                                        </div>
                                      </td>
                                      <td className="py-3 pr-4 text-right">
                                        <div className="text-sm text-zinc-700">
                                          {row.tips_collected ? formatMoney(row.tips_collected) : '—'}
                                        </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="py-3 pr-4 text-right">
                                        <input
                                          type="number"
                                          step="0.01"
                                          inputMode="decimal"
                                          value={row.sales_total}
                                          onChange={(e) =>
                                            setEmployeeInput(assignment.employee_id, { sales_total: e.target.value })
                                          }
                                          disabled={isBusy}
                                          className="w-28 rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-right focus:border-zinc-900 focus:outline-none disabled:opacity-60"
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
                                          className="w-28 rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-right focus:border-zinc-900 focus:outline-none disabled:opacity-60"
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
                                    </>
                                  )}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {!isPastDate && (
                    <div className="group rounded-lg border border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-3 transition-all hover:border-zinc-400 hover:bg-zinc-50">
                      <button
                        type="button"
                        onClick={() => setShowUnassigned((prev) => !prev)}
                        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 transition-colors group-hover:text-zinc-900"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span>{showUnassigned ? 'Hide unassigned staff' : 'Add unassigned staff'}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 text-zinc-400 transition-transform group-hover:text-zinc-600 ${
                            showUnassigned ? 'rotate-180' : ''
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
                              placeholder="Search all employees…"
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
                              placeholder="Search all employees…"
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
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200">
                    <button
                      onClick={saveEntries}
                      disabled={isBusy || isPastDate}
                      className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? 'Saving…' : 'Save entries'}
                    </button>
                    <button
                      onClick={computeAndPublish}
                      disabled={isBusy || isPastDate}
                      className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPublishing ? 'Publishing…' : 'Compute & Publish'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        </ManagerContentTransition>
      </main>
    </div>
  )
}
