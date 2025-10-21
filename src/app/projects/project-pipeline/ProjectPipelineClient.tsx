"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import type { ProjectDashboardData } from '@/lib/projects'

type AccountOption = ProjectDashboardData['lookups']['accounts'][number]
type ManagerOption = ProjectDashboardData['lookups']['managers'][number]
type StatusOption = ProjectDashboardData['lookups']['projectStatuses'][number]

type ProjectRecord = {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  dueDate: string | null
  account: { id: string; name: string } | null
  manager: { id: string; name: string } | null
}

type FormState = {
  id?: string
  name: string
  description: string
  status: string
  progress: number
  dueDate: string
  accountId: string
  managerId: string
}

type Props = {
  accounts: AccountOption[]
  managers: ManagerOption[]
  statuses: StatusOption[]
}

export function ProjectPipelineClient({ accounts, managers, statuses }: Props) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const defaultAccountId = accounts[0]?.id ?? ''
  const defaultManagerId = managers[0]?.id ?? ''
  const defaultStatus = statuses[0]?.value ?? 'ONGOING'

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    status: defaultStatus,
    progress: 0,
    dueDate: '',
    accountId: defaultAccountId,
    managerId: defaultManagerId,
  })

  const loadProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/projects', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load project pipeline')
      const data: ProjectRecord[] = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load project pipeline')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const resetForm = () =>
    setForm({
      id: undefined,
      name: '',
      description: '',
      status: defaultStatus,
      progress: 0,
      dueDate: '',
      accountId: defaultAccountId,
      managerId: defaultManagerId,
    })

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      startTransition(async () => {
        try {
          const payload = {
            name: form.name,
            description: form.description || null,
            status: form.status,
            progress: form.progress,
            dueDate: form.dueDate || null,
            accountId: form.accountId,
            managerId: form.managerId,
          }

          const url = form.id ? `/api/projects/${form.id}` : '/api/projects'
          const method = form.id ? 'PATCH' : 'POST'

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to save project')
          }

          resetForm()
          await loadProjects()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save project')
        }
      })
    },
    [form, loadProjects]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Delete this project? Associated tasks and cases will also be removed.')) return
      startTransition(async () => {
        try {
          const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to delete project')
          }
          if (form.id === id) {
            resetForm()
          }
          await loadProjects()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to delete project')
        }
      })
    },
    [form.id, loadProjects]
  )

  const beginEdit = (project: ProjectRecord) => {
    setForm({
      id: project.id,
      name: project.name,
      description: project.description ?? '',
      status: project.status,
      progress: project.progress,
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
      accountId: project.account?.id ?? defaultAccountId,
      managerId: project.manager?.id ?? defaultManagerId,
    })
  }

  const statusBadgeMap: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    ONGOING: 'bg-sky-50 text-sky-700 ring-sky-100',
    UPCOMING: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100',
    BLOCKED: 'bg-rose-50 text-rose-700 ring-rose-100',
    ON_HOLD: 'bg-amber-50 text-amber-700 ring-amber-100',
  }

  const totalProgress = useMemo(() => projects.reduce((acc, project) => acc + project.progress, 0), [projects])
  const avgProgress = projects.length ? Math.round(totalProgress / projects.length) : 0

  const timelineInsights = useMemo(() => {
    if (projects.length === 0) {
      return {
        overdue: 0,
        completed: 0,
        upcomingWithin30: 0,
      }
    }

    const now = new Date()
    const in30 = new Date(now)
    in30.setDate(in30.getDate() + 30)

    let overdue = 0
    let completed = 0
    let upcomingWithin30 = 0

    for (const project of projects) {
      if (project.status === 'COMPLETED') {
        completed += 1
        continue
      }

      if (!project.dueDate) continue

      const due = new Date(project.dueDate)
      if (due < now) overdue += 1
      else if (due <= in30) upcomingWithin30 += 1
    }

    return { overdue, completed, upcomingWithin30 }
  }, [projects])

  const checklistLines = projects.length === 0
    ? [
        'Create a project to begin tracking delivery milestones.',
        'Assign a manager and account so ownership and scope stay clear.',
        'Set a due date to surface upcoming launches.',
      ]
    : [
        `${timelineInsights.completed} project${timelineInsights.completed === 1 ? ' is' : 's are'} marked completed.`,
        timelineInsights.overdue > 0
          ? `${timelineInsights.overdue} active project${timelineInsights.overdue === 1 ? ' is' : 's are'} past due—review timelines.`
          : 'No active projects are past due right now.',
        timelineInsights.upcomingWithin30 > 0
          ? `${timelineInsights.upcomingWithin30} project${timelineInsights.upcomingWithin30 === 1 ? ' has' : 's have'} deadlines within 30 days.`
          : 'No launches scheduled in the next 30 days.',
      ]

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pipeline</h2>
            <p className="text-sm text-slate-500">
              Monitor milestones, delivery confidence, and upcoming launches.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
            {projects.length} projects · Avg progress {avgProgress}%
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading pipeline...</div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-rose-600">
              <p>{error}</p>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                onClick={() => loadProjects()}
              >
                Try again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <p>No projects yet.</p>
              <p>Add your first project to start tracking delivery momentum.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {projects.map((project) => (
                <article key={project.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/75 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadgeMap[project.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}
                      >
                        {statuses.find((status) => status.value === project.status)?.label ?? project.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{project.description ?? 'No summary provided yet.'}</p>
                    <dl className="grid gap-x-6 gap-y-2 text-xs uppercase tracking-wide text-slate-400 md:grid-cols-3">
                      <div>
                        <dt>Account</dt>
                        <dd className="text-sm normal-case text-slate-700">{project.account?.name ?? 'Unassigned'}</dd>
                      </div>
                      <div>
                        <dt>Owner</dt>
                        <dd className="text-sm normal-case text-slate-700">{project.manager?.name ?? 'Unassigned'}</dd>
                      </div>
                      <div>
                        <dt>Timeline</dt>
                        <dd className="text-sm normal-case text-slate-700">
                          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}
                        </dd>
                      </div>
                    </dl>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{project.progress}%</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                      onClick={() => beginEdit(project)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? 'Update project' : 'Create project'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bring new engagements online, adjust milestones, or close projects from the pipeline.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="project-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. Exadata Optimisation"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="project-description" className="text-sm font-medium text-slate-700">
                Summary
              </label>
              <textarea
                id="project-description"
                rows={3}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Key objectives, scope, or notable context..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="project-account" className="text-sm font-medium text-slate-700">
                  Account
                </label>
                <select
                  id="project-account"
                  required
                  value={form.accountId}
                  onChange={(event) => setForm((prev) => ({ ...prev, accountId: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="project-manager" className="text-sm font-medium text-slate-700">
                  Owner
                </label>
                <select
                  id="project-manager"
                  required
                  value={form.managerId}
                  onChange={(event) => setForm((prev) => ({ ...prev, managerId: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="project-status" className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="project-status"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label.charAt(0).toUpperCase() + status.label.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="project-due" className="text-sm font-medium text-slate-700">
                  Due date
                </label>
                <input
                  id="project-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="project-progress" className="text-sm font-medium text-slate-700">
                Progress
              </label>
              <input
                id="project-progress"
                type="range"
                min={0}
                max={100}
                step={1}
                value={form.progress}
                onChange={(event) => setForm((prev) => ({ ...prev, progress: Number(event.target.value) }))}
                className="w-full accent-sky-500"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>0%</span>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-semibold text-slate-600">{form.progress}% complete</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isPending ? 'Saving...' : form.id ? 'Update project' : 'Create project'}
              </button>
              {form.id ? (
                <button
                  type="button"
                  className="text-sm font-medium text-slate-500 hover:text-slate-900"
                  onClick={resetForm}
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-900 via-slate-900 to-[#03070f] p-6 text-sm text-slate-200 shadow">
          <h3 className="text-base font-semibold text-white">Delivery checklist</h3>
          <ul className="mt-3 space-y-2 text-slate-300">
            {checklistLines.map((line, index) => (
              <li key={index}>• {line}</li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  )
}
