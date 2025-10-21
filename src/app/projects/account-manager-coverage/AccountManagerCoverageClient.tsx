"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ProjectManagerCoverageRow, ProjectPipelineRow, ProjectDashboardData } from '@/lib/projects'

type AccountOption = ProjectDashboardData['lookups']['accounts'][number]

type ManagerRecord = {
  id: string
  name: string
  email: string | null
  phone: string | null
  accounts: { id: string; name: string }[]
  createdAt: string | null
  updatedAt: string | null
}

type CoverageRow = {
  managerId: string
  managerName: string
  accountNames: string[]
  accountCount: number
  email: string | null
  phone: string | null
  projectActive: number
  projectOverdue: number
}

type Props = {
  managerCoverage: ProjectManagerCoverageRow[]
  accounts: AccountOption[]
  pipeline: ProjectPipelineRow[]
}

export function AccountManagerCoverageClient({ managerCoverage, accounts, pipeline }: Props) {
  const [roster, setRoster] = useState<ManagerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoster = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/project-managers', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load account manager roster')
      const data: ManagerRecord[] = await response.json()
      setRoster(data.sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load account manager roster')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRoster()
  }, [loadRoster])

  const rosterById = useMemo(() => {
    const map = new Map<string, ManagerRecord>()
    for (const manager of roster) {
      map.set(manager.id, manager)
    }
    return map
  }, [roster])

  const projectsByManager = useMemo(() => {
    const map = new Map<string, { total: number; active: number; overdue: number }>()
    const now = new Date()
    for (const project of pipeline) {
      const key = project.managerName || 'Unassigned'
      if (!map.has(key)) {
        map.set(key, { total: 0, active: 0, overdue: 0 })
      }
      const entry = map.get(key)!
      entry.total += 1
      if (project.status !== 'COMPLETED') {
        entry.active += 1
        if (project.dueDate) {
          const due = new Date(project.dueDate)
          if (due < now) entry.overdue += 1
        }
      }
    }
    return map
  }, [pipeline])

  const coverageRows: CoverageRow[] = useMemo(() => {
    return managerCoverage
      .map((row) => {
        const rosterEntry = rosterById.get(row.managerId) ?? null
        const baseNames = rosterEntry?.accounts?.map((account) => account.name) ?? row.accounts
        const uniqueNames = Array.from(new Set(baseNames)).sort((a, b) => a.localeCompare(b))
        const referenceName = rosterEntry?.name ?? row.managerName
        const projectStats = projectsByManager.get(referenceName) ?? { total: 0, active: 0, overdue: 0 }
        return {
          managerId: row.managerId,
          managerName: referenceName,
          accountNames: uniqueNames,
          accountCount: uniqueNames.length,
          email: rosterEntry?.email ?? null,
          phone: rosterEntry?.phone ?? null,
          projectActive: projectStats.active,
          projectOverdue: projectStats.overdue,
        }
      })
      .sort((a, b) => a.managerName.localeCompare(b.managerName))
  }, [managerCoverage, projectsByManager, rosterById])

  const coverageSummary = useMemo(() => {
    const assignedNames = new Set<string>()
    for (const row of managerCoverage) {
      for (const name of row.accounts) {
        assignedNames.add(name)
      }
    }
    const totalAccounts = accounts.length
    const assignedCount = assignedNames.size
    const coveragePercent = totalAccounts === 0 ? 0 : Math.round((assignedCount / totalAccounts) * 100)
    const avgAccounts = managerCoverage.length
      ? Math.round((managerCoverage.reduce((sum, row) => sum + row.managedAccounts, 0) / managerCoverage.length) * 10) / 10
      : 0
    const maxAccounts = managerCoverage.reduce((max, row) => Math.max(max, row.managedAccounts), 0)
    const unassignedAccounts = accounts.filter((account) => !assignedNames.has(account.name))
    return { totalAccounts, assignedCount, coveragePercent, avgAccounts, maxAccounts, unassignedAccounts }
  }, [accounts, managerCoverage])

  const reminderLines = useMemo(() => {
    if (coverageRows.length === 0) {
      return [
        'Add account managers to begin tracking coverage balance.',
        'Assign accounts so the system can highlight ownership gaps.',
        'Use contact details to keep escalation paths current.',
      ]
    }

    const { unassignedAccounts, maxAccounts, avgAccounts } = coverageSummary
    const maxDelta = avgAccounts > 0 ? maxAccounts - avgAccounts : 0
    const overCapacityManagers = coverageRows.filter((row) => row.accountCount === maxAccounts && maxDelta >= 2)
    const overdueManagers = coverageRows.filter((row) => row.projectOverdue > 0)
    const topUnassigned = unassignedAccounts.slice(0, 3).map((account) => account.name)
    const topUnassignedLabel = topUnassigned.length ? ` (${topUnassigned.join(', ')})` : ''

    return [
      unassignedAccounts.length > 0
        ? `${unassignedAccounts.length} account${unassignedAccounts.length === 1 ? '' : 's'} lack coverage${topUnassignedLabel}.`
        : `100% of accounts have an owner.`,
      overCapacityManagers.length > 0
        ? `${overCapacityManagers.map((row) => row.managerName).join(', ')} handle${overCapacityManagers.length === 1 ? 's' : ''} the largest books at ${maxAccounts} accounts.`
        : `Coverage is balanced around ${avgAccounts} account${avgAccounts === 1 ? '' : 's'} per manager.`,
      overdueManagers.length > 0
        ? `${overdueManagers.length} manager${overdueManagers.length === 1 ? ' has' : 's have'} overdue project commitments.`
        : 'No managers have overdue project timelines today.',
    ]
  }, [coverageRows, coverageSummary])

  const unassignedAccounts = coverageSummary.unassignedAccounts

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Managers</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{coverageRows.length}</p>
            <p className="mt-1 text-sm text-slate-500">Active account managers syncing with the roster.</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{coverageSummary.coveragePercent}%</p>
            <p className="mt-1 text-sm text-slate-500">{coverageSummary.assignedCount} of {coverageSummary.totalAccounts} accounts have an owner.</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average load</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{coverageSummary.avgAccounts}</p>
            <p className="mt-1 text-sm text-slate-500">Accounts per manager across the roster.</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overdue work</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{coverageRows.reduce((sum, row) => sum + row.projectOverdue, 0)}</p>
            <p className="mt-1 text-sm text-slate-500">Projects owned by managers that are currently past due.</p>
          </article>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Coverage roster</h2>
            <p className="text-sm text-slate-500">Assignments by manager with linked project load.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadRoster()}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              Refresh
            </button>
            <a
              href="/projects/account-managers"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
            >
              Manage coverage
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading coverage snapshot...</div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-rose-600">
              <p>{error}</p>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                onClick={() => loadRoster()}
              >
                Try again
              </button>
            </div>
          ) : coverageRows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <p>No account managers recorded.</p>
              <p>Add managers from the roster page to start tracking coverage.</p>
            </div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Manager</th>
                    <th className="px-6 py-3 text-left">Accounts</th>
                    <th className="px-6 py-3 text-left">Active projects</th>
                    <th className="px-6 py-3 text-left">Overdue</th>
                    <th className="px-6 py-3 text-left">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coverageRows.map((row) => (
                    <tr key={row.managerId} className="transition hover:bg-slate-50/75">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-900">{row.managerName}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                            {row.accountCount} account{row.accountCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                          {row.accountNames.map((name) => (
                            <span key={name} className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-inset ring-sky-100">
                              {name}
                            </span>
                          ))}
                          {row.accountNames.length === 0 ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">No accounts</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.accountCount}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.projectActive}</td>
                      <td className="px-6 py-4 text-sm font-medium text-rose-600">{row.projectOverdue}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <div>{row.email ?? 'No email'}</div>
                        <div>{row.phone ?? 'No phone'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid gap-3 p-4 text-sm text-slate-600 md:hidden">
            {coverageRows.map((row) => (
              <article key={row.managerId} className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.managerName}</p>
                    <p className="text-xs text-slate-500">{row.email ?? 'No email'} · {row.phone ?? 'No phone'}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    {row.accountCount} account{row.accountCount === 1 ? '' : 's'}
                  </span>
                </header>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Active projects</dt>
                    <dd className="text-slate-900">{row.projectActive}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Overdue</dt>
                    <dd className="text-rose-600">{row.projectOverdue}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  {row.accountNames.length ? (
                    row.accountNames.map((name) => (
                      <span key={name} className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 ring-1 ring-inset ring-sky-100">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">No accounts</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <h3 className="text-base font-semibold text-slate-900">Unassigned accounts</h3>
          {unassignedAccounts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Every tracked account has at least one manager.</p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unassignedAccounts.map((account) => (
                <li key={account.id} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                  {account.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <h3 className="text-base font-semibold text-slate-900">Balance guidance</h3>
          <p className="mt-2 text-sm text-slate-500">
            Use the roster page to assign owners, then revisit here to validate load against live project work.
          </p>
          <dl className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Highest load</dt>
              <dd className="text-slate-900">{coverageSummary.maxAccounts} account{coverageSummary.maxAccounts === 1 ? '' : 's'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Unassigned</dt>
              <dd className="text-slate-900">{unassignedAccounts.length}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#04070f] p-6 text-sm text-slate-200 shadow">
          <h3 className="text-base font-semibold text-white">Coverage signals</h3>
          <ul className="mt-3 space-y-2 text-slate-300">
            {reminderLines.map((line, index) => (
              <li key={index}>• {line}</li>
            ))}
          </ul>
        </div>
      </aside>
    </section>
  )
}
