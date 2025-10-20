import { Suspense } from 'react'
import { getProjectsDashboardData } from '@/lib/projects'
import { AccountPortfolioHealthClient } from './AccountPortfolioHealthClient'

export const dynamic = 'force-dynamic'

export default async function AccountPortfolioHealthPage() {
  const dashboard = await getProjectsDashboardData()

  return (
    <div className="space-y-10">
      <header className="rounded-3xl bg-gradient-to-r from-[#061428] via-[#091d37] to-[#041020] px-8 py-10 text-white shadow-lg ring-1 ring-white/10">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
          Account Portfolio Health
        </p>
        <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Stay ready for customer signals and renewals.</h1>
        <p className="mt-2 max-w-3xl text-base text-slate-200/90">
          Capture industries, regions, and active initiatives so your coverage map stays actionable in quarterly reviews.
        </p>
      </header>

      <Suspense fallback={<div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-center text-slate-500 shadow">Loading account portfolio...</div>}>
        <AccountPortfolioHealthClient healthRows={dashboard.accountHealth} />
      </Suspense>
    </div>
  )
}
