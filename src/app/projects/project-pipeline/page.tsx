import { Suspense } from 'react'
import { getProjectsDashboardData } from '@/lib/projects'
import { ProjectPipelineClient } from './ProjectPipelineClient'

export const dynamic = 'force-dynamic'

export default async function ProjectPipelinePage() {
  const dashboard = await getProjectsDashboardData()

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#071326] via-[#10203b] to-[#051020] px-8 py-10 text-white shadow-lg ring-1 ring-white/10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
          Project Pipeline
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Guide every engagement from kickoff to value.</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-200/90">
          Stand up new work, keep owners accountable, and track progress with live insights and sentiment.
        </p>
      </header>

      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow">Loading pipeline...</div>}>
        <ProjectPipelineClient
          accounts={dashboard.lookups.accounts}
          managers={dashboard.lookups.managers}
          statuses={dashboard.lookups.projectStatuses}
        />
      </Suspense>
    </div>
  )
}
