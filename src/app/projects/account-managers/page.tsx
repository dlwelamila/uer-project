import { Suspense } from 'react'
import { getProjectsDashboardData } from '@/lib/projects'
import { AccountManagersClient } from './AccountManagersClient'

export const dynamic = 'force-dynamic'

export default async function AccountManagersPage() {
  const dashboard = await getProjectsDashboardData()

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#071327] via-[#0b203a] to-[#061526] px-8 py-10 text-white shadow-lg ring-1 ring-white/10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
          Account Managers
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Steer every account with clarity and precision.</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-200/90">
          Build a portfolio roster that keeps customers covered, highlights open capacity, and streamlines hand-offs across your delivery team.
        </p>
      </header>

      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow">Loading roster...</div>}>
        <AccountManagersClient accounts={dashboard.lookups.accounts} />
      </Suspense>
    </div>
  )
}
