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

type CaseRecord = {
  id: string
  projectId: string
  summary: string
  status: string
  openedAt: string | null
  resolvedAt: string | null
  project: {
    id: string
    name: string
    account?: { id: string; name: string }
  } | null
  createdAt?: string | null
  updatedAt?: string | null
}

type FormState = {
  id?: string
  projectId: string
  summary: string
  status: string
  openedAt: string
  resolvedAt: string
}

type Props = {
  projectOptions: ProjectOption[]
  caseStatuses: StatusOption[]
}

export function PortfolioHighlightsClient({ projectOptions, caseStatuses }: Props) {
  const [records, setRecords] = useState<CaseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialProjectId = projectOptions[0]?.id ?? ''
  const initialStatus = caseStatuses[0]?.value ?? 'OPEN'
  const [form, setForm] = useState<FormState>({ projectId: initialProjectId, summary: '', status: initialStatus, openedAt: '', resolvedAt: '' })
  const [isPending, startTransition] = useTransition()

  const loadCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/project-cases', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load highlights')
      const data: CaseRecord[] = await response.json()
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load highlights')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCases()
  }, [loadCases])

  const resetForm = () =>
    setForm({
      id: undefined,
      projectId: projectOptions[0]?.id ?? '',
      summary: '',
      status: caseStatuses[0]?.value ?? 'OPEN',
      openedAt: '',
      resolvedAt: '',
    })

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      startTransition(async () => {
        try {
          const payload = {
            projectId: form.projectId,
            summary: form.summary,
            status: form.status,
            openedAt: form.openedAt || null,
            resolvedAt: form.resolvedAt || null,
          }

          const url = form.id ? `/api/project-cases/${form.id}` : '/api/project-cases'
          const method = form.id ? 'PATCH' : 'POST'

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to save highlight')
          }

          resetForm()
          await loadCases()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save highlight')
        }
      })
    },
    [form, loadCases]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Remove this highlight?')) return
      startTransition(async () => {
        try {
          const response = await fetch(`/api/project-cases/${id}`, { method: 'DELETE' })
          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to delete highlight')
          }
          if (form.id === id) {
            resetForm()
          }
          await loadCases()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to delete highlight')
        }
      })
    },
    [form.id, loadCases]
  )

  const beginEdit = (record: CaseRecord) => {
    setForm({
      id: record.id,
      projectId: record.projectId,
      summary: record.summary,
      status: record.status,
      openedAt: record.openedAt ? record.openedAt.slice(0, 10) : '',
      resolvedAt: record.resolvedAt ? record.resolvedAt.slice(0, 10) : '',
    })
  }

  const groupedByAccount = useMemo(() => {
    const groups = new Map<string, CaseRecord[]>()
    for (const record of records) {
      const label = record.project?.account?.name ?? 'Unassigned'
      if (!groups.has(label)) groups.set(label, [])
      groups.get(label)!.push(record)
    }
    return Array.from(groups.entries())
  }, [records])

  const statusColors: Record<string, string> = {
    OPEN: 'bg-rose-50 text-rose-700 ring-rose-100',
    PENDING: 'bg-amber-50 text-amber-700 ring-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    CLOSED: 'bg-slate-100 text-slate-600 ring-slate-200',
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Spotlight register</h2>
            <p className="text-sm text-slate-500">
              Track escalations, executive follow-ups, and high-visibility project notes.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
            {records.length} highlights
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading highlights...</div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-rose-600">
              <p>{error}</p>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                onClick={() => loadCases()}
              >
                Try again
              </button>
            </div>
          ) : groupedByAccount.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <p>No highlights captured yet.</p>
              <p>Create a new highlight to mark progress or flag follow-up actions.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {groupedByAccount.map(([account, items]) => (
                <section key={account} className="space-y-3 px-6 py-5">
                  <header className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{account}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {items.length} items
                    </span>
                  </header>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm ring-1 ring-transparent transition hover:ring-sky-200"
                      >
                        <header className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-slate-400">{item.project?.name ?? 'Unassigned Project'}</p>
                            <h4 className="mt-1 text-base font-semibold text-slate-900">{item.summary}</h4>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusColors[item.status] ?? 'bg-slate-100 text-slate-600 ring-slate-200'}`}
                          >
                            {caseStatuses.find((status) => status.value === item.status)?.label ?? item.status.toLowerCase()}
                          </span>
                        </header>
                        <dl className="mt-4 grid gap-x-4 gap-y-2 text-sm text-slate-600 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-slate-400">Opened</dt>
                            <dd>{item.openedAt ? new Date(item.openedAt).toLocaleDateString() : '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-slate-400">Resolved</dt>
                            <dd>{item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString() : '—'}</dd>
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
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? 'Update highlight' : 'Add portfolio highlight'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Link each highlight to a project so the executive overview stays actionable and current.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="highlight-project" className="text-sm font-medium text-slate-700">
                Project
              </label>
              <select
                id="highlight-project"
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
              <label htmlFor="highlight-summary" className="text-sm font-medium text-slate-700">
                Summary
              </label>
              <input
                id="highlight-summary"
                required
                value={form.summary}
                onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. Storage performance review"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="highlight-status" className="text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                id="highlight-status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              >
                {caseStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label.charAt(0).toUpperCase() + status.label.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="highlight-opened" className="text-sm font-medium text-slate-700">
                  Opened at
                </label>
                <input
                  id="highlight-opened"
                  type="date"
                  value={form.openedAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, openedAt: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="highlight-resolved" className="text-sm font-medium text-slate-700">
                  Resolved at
                </label>
                <input
                  id="highlight-resolved"
                  type="date"
                  value={form.resolvedAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, resolvedAt: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isPending}
              >
                {isPending ? 'Saving...' : form.id ? 'Update highlight' : 'Add highlight'}
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

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-900 via-slate-900 to-[#02060f] p-6 text-sm text-slate-200 shadow">
          <h3 className="text-base font-semibold text-white">Guidance</h3>
          <ul className="mt-3 space-y-2 text-slate-300">
            <li>• Use highlights to drive exec readiness and unblock outcomes.</li>
            <li>• Keep timelines accurate so dependencies stay visible.</li>
            <li>• Close highlights once customer communications are complete.</li>
          </ul>
        </div>
      </aside>
    </section>
  )
}
