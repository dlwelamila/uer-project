"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import type { ProjectAccountHealthRow } from '@/lib/projects'

type AccountRecord = {
  id: string
  name: string
  industry: string | null
  region: string | null
  createdAt: string | null
  updatedAt: string | null
}

type JoinedAccount = AccountRecord & {
  stats: ProjectAccountHealthRow | null
}

type FormState = {
  id?: string
  name: string
  industry: string
  region: string
}

type Props = {
  healthRows: ProjectAccountHealthRow[]
}

export function AccountPortfolioHealthClient({ healthRows }: Props) {
  const [accounts, setAccounts] = useState<JoinedAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<FormState>({ name: '', industry: '', region: '' })

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/project-accounts', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load accounts')
      const data: AccountRecord[] = await response.json()
      const mapped: JoinedAccount[] = data.map((account) => ({
        ...account,
        stats: healthRows.find((row) => row.accountId === account.id) ?? null,
      }))
      // Include accounts that appear in stats but not yet in master data
      const missingStats = healthRows.filter((row) => !mapped.some((account) => account.id === row.accountId))
      const missingJoined: JoinedAccount[] = missingStats.map((row) => ({
        id: row.accountId,
        name: row.accountName,
        industry: null,
        region: null,
        createdAt: null,
        updatedAt: null,
        stats: row,
      }))
      setAccounts([...mapped, ...missingJoined].sort((a, b) => a.name.localeCompare(b.name)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load accounts')
    } finally {
      setLoading(false)
    }
  }, [healthRows])

  useEffect(() => {
    void loadAccounts()
  }, [loadAccounts])

  const resetForm = () => setForm({ id: undefined, name: '', industry: '', region: '' })

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      startTransition(async () => {
        try {
          const payload = {
            name: form.name,
            industry: form.industry || null,
            region: form.region || null,
          }

          const url = form.id ? `/api/project-accounts/${form.id}` : '/api/project-accounts'
          const method = form.id ? 'PATCH' : 'POST'

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to save account')
          }

          resetForm()
          await loadAccounts()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save account')
        }
      })
    },
    [form, loadAccounts]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Delete this account record? Linked projects will be orphaned.')) return
      startTransition(async () => {
        try {
          const response = await fetch(`/api/project-accounts/${id}`, { method: 'DELETE' })
          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to delete account')
          }
          if (form.id === id) {
            resetForm()
          }
          await loadAccounts()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to delete account')
        }
      })
    },
    [form.id, loadAccounts]
  )

  const beginEdit = (account: JoinedAccount) => {
    setForm({
      id: account.id,
      name: account.name,
      industry: account.industry ?? '',
      region: account.region ?? '',
    })
  }

  const totals = useMemo(() => {
    const completed = healthRows.reduce((acc, row) => acc + row.completed, 0)
    const ongoing = healthRows.reduce((acc, row) => acc + row.ongoing, 0)
    const upcoming = healthRows.reduce((acc, row) => acc + row.upcoming, 0)
    return { completed, ongoing, upcoming }
  }, [healthRows])

  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Accounts</h2>
            <p className="text-sm text-slate-500">
              Overview of live work and readiness across the customer base.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
            {accounts.length} accounts · {totals.completed} completed / {totals.ongoing} ongoing / {totals.upcoming} upcoming
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading account portfolio...</div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-rose-600">
              <p>{error}</p>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                onClick={() => loadAccounts()}
              >
                Try again
              </button>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <p>No accounts captured yet.</p>
              <p>Add your first strategic account to begin tracking health.</p>
            </div>
          ) : (
            <div className="hidden md:block">
              <table className="min-w-full text-sm text-slate-600" role="table" aria-label="Account health">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Account</th>
                    <th className="px-6 py-3 text-left">Industry</th>
                    <th className="px-6 py-3 text-left">Region</th>
                    <th className="px-6 py-3 text-left">Completed</th>
                    <th className="px-6 py-3 text-left">Ongoing</th>
                    <th className="px-6 py-3 text-left">Upcoming</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((account) => (
                    <tr key={account.id} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-semibold text-slate-900">{account.name}</td>
                      <td className="px-6 py-4">{account.industry ?? '—'}</td>
                      <td className="px-6 py-4">{account.region ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                          {account.stats?.completed ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-100">
                          {account.stats?.ongoing ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 ring-1 ring-inset ring-fuchsia-100">
                          {account.stats?.upcoming ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                            onClick={() => beginEdit(account)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                            onClick={() => handleDelete(account.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid gap-3 p-4 text-sm text-slate-600 md:hidden">
            {accounts.map((account) => (
              <article key={account.id} className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                <header className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{account.name}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {account.stats?.completed ?? 0} / {account.stats?.ongoing ?? 0} / {account.stats?.upcoming ?? 0}
                  </span>
                </header>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Industry</dt>
                    <dd className="text-slate-900">{account.industry ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Region</dt>
                    <dd className="text-slate-900">{account.region ?? '—'}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    onClick={() => beginEdit(account)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                    onClick={() => handleDelete(account.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-900">{form.id ? 'Update account' : 'Add account'}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Maintain clean account metadata for coverage views and renewals planning.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="account-name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="account-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. CRDB"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="account-industry" className="text-sm font-medium text-slate-700">
                Industry
              </label>
              <input
                id="account-industry"
                value={form.industry}
                onChange={(event) => setForm((prev) => ({ ...prev, industry: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. Banking"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="account-region" className="text-sm font-medium text-slate-700">
                Region
              </label>
              <input
                id="account-region"
                value={form.region}
                onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. TZ"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isPending ? 'Saving...' : form.id ? 'Update account' : 'Add account'}
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

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-900 via-slate-900 to-[#02060f] p-6 text-sm text-slate-200 shadow">
          <h3 className="text-base font-semibold text-white">Health reminders</h3>
          <ul className="mt-3 space-y-2 text-slate-300">
            <li>• Keep industries and regions current to align coverage by competency.</li>
            <li>• Use completed/ongoing counts to balance workloads across the year.</li>
            <li>• Remove inactive accounts to declutter the executive overview.</li>
          </ul>
        </div>
      </aside>
    </section>
  )
}
