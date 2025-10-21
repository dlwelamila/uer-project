import { Suspense } from 'react'
import { getProjectsDashboardData } from '@/lib/projects'
import { AccountManagerCoverageClient } from './AccountManagerCoverageClient'

export const dynamic = 'force-dynamic'

export default async function AccountManagerCoveragePage() {
  const dashboard = await getProjectsDashboardData()

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-br from-[#071326] via-[#0b1d36] to-[#030915] px-8 py-10 text-white shadow-lg ring-1 ring-white/10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
          Account Manager Coverage
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Balance portfolio ownership before gaps appear.</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-200/90">
          Review the assignment matrix, monitor project load, and close unassigned accounts.
        </p>
      </header>

      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow">Loading coverage analytics...</div>}>
        <AccountManagerCoverageClient
          managerCoverage={dashboard.managerCoverage}
          accounts={dashboard.lookups.accounts}
          pipeline={dashboard.pipeline}
        />
      </Suspense>
    </div>
  )
}
