import { Suspense } from 'react'
import ManagerDashboardClient from './ManagerDashboardClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading…</div>}>
      <ManagerDashboardClient />
    </Suspense>
  )
}
