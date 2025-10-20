import { Suspense } from 'react'
import { getProjectsDashboardData } from '@/lib/projects'
import { PortfolioHighlightsClient } from './PortfolioHighlightsClient'

export const dynamic = 'force-dynamic'

export default async function PortfolioHighlightsPage() {
  const dashboard = await getProjectsDashboardData()

  const projectOptions = dashboard.pipeline.map((row) => ({ id: row.id, name: row.projectName, account: row.accountName }))

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#0b1528] via-[#0b1d37] to-[#050c18] px-8 py-10 text-white shadow-lg ring-1 ring-white/10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
          Portfolio Highlights
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Amplify wins and unblock the next outcomes.</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-200/90">
          Capture escalations, celebrate progress, and ensure each spotlight has a clear owner and follow-up timeline.
        </p>
      </header>

      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow">Loading highlights...</div>}>
        <PortfolioHighlightsClient
          projectOptions={projectOptions}
          caseStatuses={dashboard.lookups.caseStatuses}
        />
      </Suspense>
    </div>
  )
}
