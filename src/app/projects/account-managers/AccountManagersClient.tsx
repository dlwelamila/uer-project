"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import type { ProjectDashboardData } from '@/lib/projects'

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

type FormState = {
  id?: string
  name: string
  email: string
  phone: string
  accountIds: string[]
}

type Props = {
  accounts: AccountOption[]
}

export function AccountManagersClient({ accounts }: Props) {
  const [managers, setManagers] = useState<ManagerRecord[]>([])
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>(() => [...accounts])
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', accountIds: [] })
  const [isPending, startTransition] = useTransition()
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState('')

  useEffect(() => {
    setAccountOptions((prev) => {
      const merged = new Map<string, AccountOption>()
      for (const option of [...prev, ...accounts]) {
        merged.set(option.id, option)
      }
      return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
    })
  }, [accounts])

  const hasUnassignedAccounts = useMemo(() => managers.some((manager) => manager.accounts.length === 0), [managers])

  const resetForm = useCallback((options?: { close?: boolean }) => {
    setForm({ name: '', email: '', phone: '', accountIds: [], id: undefined })
    setNewAccountName('')
    if (options?.close) {
      setDrawerOpen(false)
    }
  }, [])

  const loadManagers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/project-managers', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to fetch account managers')
      const data: ManagerRecord[] = await response.json()
      setManagers(data)
      setAccountOptions((prev) => {
        const merged = new Map<string, AccountOption>()
        for (const option of prev) {
          merged.set(option.id, option)
        }
        for (const manager of data) {
          for (const account of manager.accounts) {
            if (!merged.has(account.id)) {
              merged.set(account.id, { id: account.id, name: account.name })
            }
          }
        }
        return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load account managers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadManagers()
  }, [loadManagers])

  useEffect(() => {
    if (!drawerOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetForm({ close: true })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [drawerOpen, resetForm])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      startTransition(async () => {
        try {
          const payload = {
            name: form.name.trim(),
            email: form.email.trim() || null,
            phone: form.phone.trim() || null,
            accountIds: form.accountIds,
          }

          const targetUrl = form.id ? `/api/project-managers/${form.id}` : '/api/project-managers'
          const method = form.id ? 'PATCH' : 'POST'

          const response = await fetch(targetUrl, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to save manager')
          }

          resetForm({ close: true })
          await loadManagers()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to save manager')
        }
      })
    },
    [form, loadManagers, resetForm]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm('Remove this account manager? This will detach account assignments.')) return
      startTransition(async () => {
        try {
          const response = await fetch(`/api/project-managers/${id}`, { method: 'DELETE' })
          if (!response.ok) {
            const message = await response.json().catch(() => ({}))
            throw new Error(message?.error ?? 'Unable to delete manager')
          }
          if (form.id === id) {
            resetForm({ close: true })
          }
          await loadManagers()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to delete manager')
        }
      })
    },
    [form.id, loadManagers, resetForm]
  )

  const beginEdit = (manager: ManagerRecord) => {
    setError(null)
    setForm({
      id: manager.id,
      name: manager.name,
      email: manager.email ?? '',
      phone: manager.phone ?? '',
      accountIds: manager.accounts.map((account) => account.id),
    })
    setDrawerOpen(true)
  }

  const handleCreateAccount = useCallback(async () => {
    const value = newAccountName.trim()
    if (!value) return
    setCreatingAccount(true)
    try {
      const response = await fetch('/api/project-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
      })
      if (!response.ok) {
        const message = await response.json().catch(() => ({}))
        throw new Error(message?.error ?? 'Unable to create account')
      }
      const payload = await response.json()
      const option: AccountOption = { id: payload.id, name: payload.name }
      setAccountOptions((prev) => {
        const merged = new Map(prev.map((existing) => [existing.id, existing]))
        merged.set(option.id, option)
        return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name))
      })
      setForm((prev) => ({
        ...prev,
        accountIds: prev.accountIds.includes(option.id) ? prev.accountIds : [...prev.accountIds, option.id],
      }))
      setNewAccountName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account')
    } finally {
      setCreatingAccount(false)
    }
  }, [newAccountName])

  const emptyState = !loading && managers.length === 0

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Roster</h2>
            <p className="text-sm text-slate-500">
              Review active account managers, their contact details, and assignments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
              {managers.length} managers
            </span>
            <button
              type="button"
              onClick={() => {
                setError(null)
                resetForm()
                setDrawerOpen(true)
              }}
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700"
            >
              Add manager
            </button>
          </div>
        </div>

        {error && !drawerOpen ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">Loading account manager roster...</div>
          ) : emptyState ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-slate-500">
              <p>No account managers yet.</p>
              <p>Add your first manager using the button above and assign accounts immediately.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {managers.map((manager) => (
                <article
                  key={manager.id}
                  className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/75 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-900">{manager.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          manager.accounts.length
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100'
                            : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100'
                        }`}
                      >
                        {manager.accounts.length ? `${manager.accounts.length} accounts` : 'Unassigned'}
                      </span>
                    </div>
                    <dl className="grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">Email</dt>
                        <dd>{manager.email ?? 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-400">Phone</dt>
                        <dd>{manager.phone ?? 'Not provided'}</dd>
                      </div>
                    </dl>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                      {manager.accounts.length ? (
                        manager.accounts.map((account, index) => (
                          <span
                            key={account.id}
                            className={`rounded-full px-3 py-1 ring-1 ring-inset ${
                              index % 2 === 0
                                ? 'bg-sky-50 text-sky-700 ring-sky-100'
                                : 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100'
                            }`}
                          >
                            {account.name}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">No accounts assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                      onClick={() => beginEdit(manager)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
                      onClick={() => handleDelete(manager.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#03070f] p-6 text-sm text-slate-200 shadow">
          <h3 className="text-base font-semibold text-white">Coverage tips</h3>
          <ul className="mt-3 space-y-2 text-slate-300">
            <li>• Ensure every strategic account has a named primary and backup manager.</li>
            <li>
              • Balance assignments: {hasUnassignedAccounts ? 'You have unassigned accounts that need attention.' : 'All managers currently have coverage.'}
            </li>
            <li>• Add contact info to ease exec escalations and service transitions.</li>
          </ul>
        </div>
      </section>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={() => resetForm({ close: true })}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-live="assertive"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Account manager</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {form.id ? 'Update account manager' : 'Add account manager'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close editor"
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            onClick={() => resetForm({ close: true })}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-sm text-slate-500">
            Capture ownership, provide contact visibility, and link active accounts for coverage tracking.
          </p>

          {error && drawerOpen ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="manager-name" className="text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="manager-name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. Salima Malimba"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="manager-email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="manager-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="manager-phone" className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                id="manager-phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="+255-700-555-123"
              />
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="manager-accounts" className="text-sm font-medium text-slate-700">
                  Accounts (multi-select)
                </label>
                <select
                  id="manager-accounts"
                  multiple
                  value={form.accountIds}
                  onChange={(event) => {
                    const selected = Array.from(event.target.selectedOptions).map((option) => option.value)
                    setForm((prev) => ({ ...prev, accountIds: selected }))
                  }}
                  className="h-36 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  {accountOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Hold Ctrl/⌘ while selecting to assign multiple accounts.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Need a new account?</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={newAccountName}
                    onChange={(event) => setNewAccountName(event.target.value)}
                    placeholder="Enter account name"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={creatingAccount || !newAccountName.trim()}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {creatingAccount ? 'Adding...' : 'Add account'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isPending ? 'Saving...' : form.id ? 'Update manager' : 'Add manager'}
              </button>
              <button
                type="button"
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
                onClick={() => resetForm({ close: true })}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </aside>
    </>
  )
}
