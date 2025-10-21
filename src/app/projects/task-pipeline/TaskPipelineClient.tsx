"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'

type StatusOption = {
  value: string
  label: string
}

type ProjectOption = {
  id: string
  name: string
  account: string
}

type TaskRecord = {
  id: string
  projectId: string
  title: string
  status: string
  dueDate: string | null
  completedAt: string | null
  project: {
    id: string
    name: string
    account: { id: string; name: string } | null
  } | null
  createdAt?: string | null
  updatedAt?: string | null
}

type FormState = {
  id?: string
  projectId: string
  title: string
  status: string
  dueDate: string
  completedAt: string
}

type Props = {
  projectOptions: ProjectOption[]
  statusOptions: StatusOption[]
}

export function TaskPipelineClient({ projectOptions, statusOptions }: Props) {
  const defaultProjectId = projectOptions[0]?.id ?? ''
  const defaultStatus = statusOptions[0]?.value ?? 'TODO'

  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterAccount, setFilterAccount] = useState<string>('all')
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<FormState>({ projectId: defaultProjectId, title: '', status: defaultStatus, dueDate: '', completedAt: '' })

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = filterAccount === 'all' ? '/api/project-tasks' : `/api/project-tasks?accountId=${filterAccount}`
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load task pipeline')
      const data: TaskRecord[] = await response.json()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load task pipeline')
    } finally {
      setLoading(false)
    }
  }, [filterAccount])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const resetForm = () =>
    setForm({
      id: undefined,
      projectId: projectOptions[0]?.id ?? '',
      title: '',
      status: statusOptions[0]?.value ?? 'TODO',
      dueDate: '',
      completedAt: '',
    })

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      startTransition(async () => {
        try {
          const payload = {
            projectId: form.projectId,
            title: form.title,
            status: form.status,
            dueDate: form.dueDate || null,
            completedAt: form.completedAt || null,
          }

          const url = form.id ? `/api/project-tasks/${form.id}` : '/api/project-tasks'
          const method = form.id ? 'PATCH' : 'POST'

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to save task')
          }

          resetForm()
          await loadTasks()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save task')
        }
      })
    },
    [form, loadTasks]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Delete this task?')) return
      startTransition(async () => {
        try {
          const response = await fetch(`/api/project-tasks/${id}`, { method: 'DELETE' })
          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to delete task')
          }
          if (form.id === id) {
            resetForm()
          }
          await loadTasks()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to delete task')
        }
      })
    },
    [form.id, loadTasks]
  )

  const beginEdit = (task: TaskRecord) => {
    setForm({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      completedAt: task.completedAt ? task.completedAt.slice(0, 10) : '',
    })
  }

  const groupedByAccount = useMemo(() => {
    const groups = new Map<string, TaskRecord[]>()
    for (const task of tasks) {
      const key = task.project?.account?.name ?? 'Unassigned'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(task)
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [tasks])

  const accountFilters = useMemo(() => {
    const unique = new Map<string, string>()
    for (const option of projectOptions) {
      unique.set(option.account, option.account)
    }
    for (const task of tasks) {
      if (task.project?.account?.name) unique.set(task.project.account.name, task.project.account.name)
    }
    return Array.from(unique.values()).sort()
  }, [projectOptions, tasks])

  const statusBadgeMap: Record<string, string> = {
    TODO: 'bg-slate-100 text-slate-700 ring-slate-200',
    IN_PROGRESS: 'bg-sky-50 text-sky-700 ring-sky-100',
    DONE: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    BLOCKED: 'bg-rose-50 text-rose-700 ring-rose-100',
  }

  const taskInsights = useMemo(() => {
    if (tasks.length === 0) {
      return {
        overdue: 0,
        blocked: 0,
        finishedThisWeek: 0,
      }
    }

    const now = new Date()
    const startOfWeek = (() => {
      const date = new Date(now)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      date.setDate(diff)
      date.setHours(0, 0, 0, 0)
      return date
    })()

    let overdue = 0
    let blocked = 0
    let finishedThisWeek = 0

    for (const task of tasks) {
      if (task.status === 'BLOCKED') blocked += 1
      if (task.status !== 'DONE' && task.dueDate) {
        const due = new Date(task.dueDate)
        if (due < now) overdue += 1
      }
      if (task.completedAt) {
        const completed = new Date(task.completedAt)
        if (completed >= startOfWeek) finishedThisWeek += 1
      }
    }

    return { overdue, blocked, finishedThisWeek }
  }, [tasks])

  const executionNotes = tasks.length === 0
    ? [
        'Log your first task to populate the execution board.',
        'Link tasks to a project so status rolls up correctly.',
        'Set due dates to highlight upcoming commitments.',
      ]
    : [
        taskInsights.overdue > 0
          ? `${taskInsights.overdue} active task${taskInsights.overdue === 1 ? ' is' : 's are'} past due.`
          : 'No active tasks are past due.',
        taskInsights.blocked > 0
          ? `${taskInsights.blocked} task${taskInsights.blocked === 1 ? ' is' : 's are'} flagged as blocked.`
          : 'No tasks are currently marked blocked.',
        taskInsights.finishedThisWeek > 0
          ? `${taskInsights.finishedThisWeek} task${taskInsights.finishedThisWeek === 1 ? ' was' : 's were'} completed this week.`
          : 'No tasks have been completed this week yet.',
      ]

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Execution board</h2>
            <p className="text-sm text-slate-500">
              Filter by account to zoom in on deliverables and dependencies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="task-account-filter" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account
            </label>
            <select
              id="task-account-filter"
              value={filterAccount}
              onChange={(event) => setFilterAccount(event.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="all">All</option>
              {accountFilters.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading tasks...</div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-rose-600">
              <p>{error}</p>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                onClick={() => loadTasks()}
              >
                Try again
              </button>
            </div>
          ) : groupedByAccount.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <p>No tasks captured yet.</p>
              <p>Add a new task to begin tracking execution milestones.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {groupedByAccount.map(([accountName, items]) => (
                <section key={accountName} className="space-y-3 px-6 py-5">
                  <header className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{accountName}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {items.length} tasks
                    </span>
                  </header>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {items.map((item) => (
                      <article key={item.id} className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm ring-1 ring-transparent transition hover:ring-sky-200">
                        <header className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400">{item.project?.name ?? 'Unassigned project'}</p>
                            <h4 className="mt-1 text-base font-semibold text-slate-900">{item.title}</h4>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusBadgeMap[item.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}
                          >
                            {statusOptions.find((option) => option.value === item.status)?.label ?? item.status.toLowerCase()}
                          </span>
                        </header>
                        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-slate-400">Due</dt>
                            <dd>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-slate-400">Completed</dt>
                            <dd>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '—'}</dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            onClick={() => beginEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-rose-700"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? 'Update task' : 'Add task'}</h2>
          <p className="mt-1 text-sm text-slate-500">Keep deliverables clear and linked to the right project.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="task-project" className="text-sm font-medium text-slate-700">
                Project
              </label>
              <select
                id="task-project"
                required
                value={form.projectId}
                onChange={(event) => setForm((prev) => ({ ...prev, projectId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} — {project.account}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="task-title" className="text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="task-title"
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. Patch automation rollout"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="task-status" className="text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label.charAt(0).toUpperCase() + status.label.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="task-due" className="text-sm font-medium text-slate-700">
                  Due date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-completed" className="text-sm font-medium text-slate-700">
                  Completed at
                </label>
                <input
                  id="task-completed"
                  type="date"
                  value={form.completedAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, completedAt: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isPending ? 'Saving...' : form.id ? 'Update task' : 'Add task'}
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

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-slate-900 to-[#02060f] p-6 text-sm text-slate-200 shadow">
          <h3 className="text-base font-semibold text-white">Execution notes</h3>
          <ul className="mt-3 space-y-2 text-slate-300">
            {executionNotes.map((line, index) => (
              <li key={index}>• {line}</li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  )
}
