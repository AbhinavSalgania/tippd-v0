import { Suspense } from 'react'
import ManagerComputeClient from './ManagerComputeClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-zinc-600">Loading…</div>}>
      <ManagerComputeClient />
    </Suspense>
  )
}

