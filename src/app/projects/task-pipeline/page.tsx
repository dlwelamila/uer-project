import { Suspense } from 'react'
import { getProjectsDashboardData } from '@/lib/projects'
import { TaskPipelineClient } from './TaskPipelineClient'

export const dynamic = 'force-dynamic'

export default async function TaskPipelinePage() {
  const dashboard = await getProjectsDashboardData()

  const projectOptions = dashboard.pipeline.map((row) => ({ id: row.id, name: row.projectName, account: row.accountName }))

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#071326] via-[#0e2039] to-[#040d1a] px-8 py-10 text-white shadow-lg ring-1 ring-white/10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
          Task Pipeline
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Orchestrate every deliverable with confidence.</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-200/90">
          Plan the scope, align dates, and keep implementation teams on track.
        </p>
      </header>

      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow">Loading task pipeline...</div>}>
        <TaskPipelineClient
          projectOptions={projectOptions}
          statusOptions={dashboard.lookups.taskStatuses}
        />
      </Suspense>
    </div>
  )
}
