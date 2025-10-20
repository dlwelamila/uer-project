import { getProjectsDashboardData } from '@/lib/projects'

type Status = 'ongoing' | 'completed' | 'upcoming' | 'scheduled' | 'pending'

type PipelineRowView = {
  id: string
  managerName: string
  accountName: string
  projectName: string
  progress: number
  dueDateLabel: string | null
  statusKey: Status
  statusLabel: string
}

const projectStatusBadgeMap: Record<string, Status> = {
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  UPCOMING: 'upcoming',
  BLOCKED: 'pending',
  ON_HOLD: 'scheduled',
}

function toStatusKey(status: string | null | undefined): Status {
  if (!status) return 'ongoing'
  return projectStatusBadgeMap[status] ?? 'ongoing'
}

function toStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Ongoing'
  if (status === 'ON_HOLD') return 'On hold'
  if (status.includes('_')) {
    const [first, second] = status.split('_')
    return `${first.charAt(0)}${first.slice(1).toLowerCase()} ${second.charAt(0)}${second.slice(1).toLowerCase()}`
  }
  return status.charAt(0) + status.slice(1).toLowerCase()
}

const portfolioBadgeStyles = {
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  ongoing: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
  upcoming: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-100',
}

const taskBadgeStyles = {
  scope: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
  ongoing: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  timeline: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100',
}

const coverageBadgeStyles = {
  count: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100',
  export: 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
}

const accountChipPalette = [
  'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
  'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-100',
  'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-100',
  'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
]

function accountChipClass(index: number) {
  return accountChipPalette[index % accountChipPalette.length]
}

const statusChipStyles: Record<Status, string> = {
  ongoing: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
  upcoming: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-inset ring-fuchsia-100',
  scheduled: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100',
  pending: 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-100',
}

function colorToClasses(color: string) {
  switch (color) {
    case 'sky':
      return {
        stripe: 'bg-sky-400',
        pillBg: 'bg-sky-50',
        pillText: 'text-sky-700',
        pillRing: 'ring-sky-100',
        metricText: 'text-sky-700',
      }
    case 'emerald':
      return {
        stripe: 'bg-emerald-400',
        pillBg: 'bg-emerald-50',
        pillText: 'text-emerald-700',
        pillRing: 'ring-emerald-100',
        metricText: 'text-emerald-700',
      }
    case 'cyan':
      return {
        stripe: 'bg-cyan-400',
        pillBg: 'bg-cyan-50',
        pillText: 'text-cyan-700',
        pillRing: 'ring-cyan-100',
        metricText: 'text-cyan-700',
      }
    case 'fuchsia':
      return {
        stripe: 'bg-fuchsia-400',
        pillBg: 'bg-fuchsia-50',
        pillText: 'text-fuchsia-700',
        pillRing: 'ring-fuchsia-100',
        metricText: 'text-fuchsia-700',
      }
    default:
      return {
        stripe: 'bg-slate-300',
        pillBg: 'bg-slate-50',
        pillText: 'text-slate-700',
        pillRing: 'ring-slate-100',
        metricText: 'text-slate-900',
      }
  }
}

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const dashboard = await getProjectsDashboardData()

  const summaryCards = dashboard.summaryCards
  const pipelineRows: PipelineRowView[] = dashboard.pipeline.map((row) => ({
    id: row.id,
    managerName: row.managerName,
    accountName: row.accountName,
    projectName: row.projectName,
    progress: row.progress,
    dueDateLabel: row.dueDateLabel ?? null,
    statusKey: toStatusKey(row.status),
    statusLabel: toStatusLabel(row.status),
  }))

  const accountHealthRows = dashboard.accountHealth
  const taskPipelineRows = dashboard.taskPipeline
  const managerCoverage = dashboard.managerCoverage

  return (
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071327] via-[#071225] to-[#03040b] text-slate-100 shadow-lg ring-1 ring-slate-800/50">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" aria-hidden />
        <div className="absolute -right-6 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden />
        <div className="relative container mx-auto flex flex-col gap-8 px-4 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
              Projects Portfolio
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl leading-tight">
              Keep customer projects aligned, visible, and on track.
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              View initiatives across accounts, understand momentum at a glance, and focus your team on the next critical
              milestone.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-white/6 bg-white/2 px-6 py-5 text-sm text-slate-200 shadow-md sm:flex-row sm:items-center">
            <div>
              <span className="block text-xs uppercase tracking-[0.3em] text-sky-300/90">Next review</span>
              <span className="text-lg font-semibold text-white">Executive sync · 28 Oct</span>
            </div>
            <div className="hidden h-12 w-px bg-white/10 sm:block" />
            <div>
              <span className="block text-xs uppercase tracking-[0.3em] text-slate-300/80">Owners</span>
              <span className="text-lg font-semibold text-white">5 Account Managers</span>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">Portfolio highlights</h2>
        <p className="mt-1 text-sm text-slate-500">
          Quick metrics that frame overall load, velocity, and operational posture across the portfolio.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const c = colorToClasses(card.color)
            const labelId = `${card.key}-title`
            return (
              <article
                key={card.key}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 focus-within:translate-y-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-200 sm:flex-row sm:items-center sm:gap-6"
                tabIndex={0}
                aria-labelledby={labelId}
              >
                {/* Accent stripe */}
                <div className={`hidden sm:block h-full w-1 rounded-r-xl ${c.stripe}`} aria-hidden />

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        id={labelId}
                        className="truncate text-sm font-semibold uppercase tracking-wide text-slate-700"
                      >
                        {card.title}
                      </p>
                      <p className={`mt-1 truncate text-3xl font-extrabold leading-none ${c.metricText}`}>
                        {card.value}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${c.pillBg} ${c.pillText} ${c.pillRing}`}
                      >
                        {card.sub}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-snug text-slate-600">{card.description}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                    >
                      View projects
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 bg-transparent px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                    >
                      Quick details
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

  <section className="container mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Project pipeline</h2>
            <p className="text-sm text-slate-500">In-flight work with accountable owners, milestones, and target dates.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
              Updated 2h ago
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" role="table" aria-label="Project pipeline">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Account Manager</th>
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Milestone</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {pipelineRows.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                    tabIndex={0}
                    aria-rowindex={index + 2}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{item.managerName}</td>
                    <td className="px-6 py-4">{item.accountName}</td>
                    <td className="px-6 py-4">{item.projectName}</td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <div
                          className="relative h-2 rounded-full bg-slate-200/70 overflow-hidden"
                          role="progressbar"
                          aria-valuenow={item.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${item.projectName} progress`}
                        >
                          <div
                            className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 transition-all duration-700 ease-out"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusChipStyles[item.statusKey]}`}
                      >
                        {item.statusKey === 'completed' ? '✓' : '•'} {item.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.dueDateLabel ?? 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 p-4 md:hidden">
            {pipelineRows.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account manager</p>
                    <p className="text-sm font-semibold text-slate-900">{item.managerName}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusChipStyles[item.statusKey]}`}>
                    {item.statusKey === 'completed' ? '✓' : '•'} {item.statusLabel}
                  </span>
                </header>
                <dl className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Account</dt>
                    <dd className="text-slate-900">{item.accountName}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Project</dt>
                    <dd className="text-right text-slate-900">{item.projectName}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Progress</dt>
                    <dd className="mt-1">
                      {/* Mobile cards keep the same progress bar visuals */}
                      <div className="flex min-w-[160px] flex-col gap-2">
                        <div
                          className="relative h-2 overflow-hidden rounded-full bg-slate-200/70"
                          role="progressbar"
                          aria-valuenow={item.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${item.projectName} progress`}
                        >
                          <div
                            className="absolute inset-y-0 left-0 h-full rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{item.progress}%</span>
                      </div>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="font-medium text-slate-500">Timeline</dt>
                    <dd className="text-slate-900">{item.dueDateLabel ?? 'TBD'}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 sm:px-6 xl:grid-cols-2">
        <div className="space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Account portfolio health</h3>
              <p className="mt-1 text-sm text-slate-500">
                Completed, ongoing, and upcoming projects across each strategic customer.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">FY25</span>
          </header>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm text-slate-600" role="table" aria-label="Account portfolio health">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Account</th>
                    <th className="px-6 py-3 text-left">Completed</th>
                    <th className="px-6 py-3 text-left">Ongoing</th>
                    <th className="px-6 py-3 text-left">Upcoming</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accountHealthRows.map((row) => (
                    <tr key={row.accountId} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-semibold text-slate-900">{row.accountName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${portfolioBadgeStyles.completed}`}>
                          {row.completed}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${portfolioBadgeStyles.ongoing}`}>
                          {row.ongoing}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${portfolioBadgeStyles.upcoming}`}>
                          {row.upcoming}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              <div className="grid gap-3 p-4 text-sm text-slate-600 md:hidden">
                {accountHealthRows.map((row) => (
                  <article key={row.accountId} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                    <header className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{row.accountName}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">FY25</span>
                    </header>
                    <dl className="mt-3 space-y-2">
                      <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-500">Completed</dt>
                      <dd className="text-slate-900">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${portfolioBadgeStyles.completed}`}>
                          {row.completed}
                        </span>
                      </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-500">Ongoing</dt>
                      <dd className="text-slate-900">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${portfolioBadgeStyles.ongoing}`}>
                          {row.ongoing}
                        </span>
                      </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-500">Upcoming</dt>
                      <dd className="text-slate-900">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${portfolioBadgeStyles.upcoming}`}>
                          {row.upcoming}
                        </span>
                      </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
          </div>
        </div>

        <div className="space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Task pipeline</h3>
              <p className="mt-1 text-sm text-slate-500">
                Scope, progress, and target dates for project tasks still in execution.
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
              Workflow
            </span>
          </header>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Account</th>
                    <th className="px-6 py-3 text-left">Task scope</th>
                    <th className="px-6 py-3 text-left">Ongoing</th>
                    <th className="px-6 py-3 text-left">Completed</th>
                    <th className="px-6 py-3 text-left">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taskPipelineRows.map((row) => {
                    const timeline = row.nextTimeline ?? 'TBD'
                    return (
                      <tr key={row.accountId} className="transition hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-semibold text-slate-900">{row.accountName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${taskBadgeStyles.scope}`}>
                            {row.scope}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${taskBadgeStyles.ongoing}`}>
                            {row.ongoing}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${taskBadgeStyles.completed}`}>
                            {row.completed}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${taskBadgeStyles.timeline}`}>
                            {timeline}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-4 text-sm text-slate-600 md:hidden">
              {taskPipelineRows.map((row) => {
                const timeline = row.nextTimeline ?? 'TBD'
                return (
                  <article key={row.accountId} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <header className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{row.accountName}</p>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${taskBadgeStyles.timeline}`}>{timeline}</span>
                  </header>
                  <dl className="mt-3 space-y-2">
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-500">Task scope</dt>
                      <dd className="text-slate-900">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${taskBadgeStyles.scope}`}>
                          {row.scope}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-500">Ongoing</dt>
                      <dd className="text-slate-900">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${taskBadgeStyles.ongoing}`}>
                          {row.ongoing}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="font-medium text-slate-500">Completed</dt>
                      <dd className="text-slate-900">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${taskBadgeStyles.completed}`}>
                          {row.completed}
                        </span>
                      </dd>
                    </div>
                  </dl>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto space-y-5 px-4 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Account manager coverage</h3>
            <p className="mt-1 text-sm text-slate-500">
              Assurance that every account has a clear owner and share of voice in the portfolio.
            </p>
          </div>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 ${coverageBadgeStyles.export}`}
          >
            Export roster
          </button>
        </header>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow">
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Account manager</th>
                  <th className="px-6 py-3 text-left">Managed accounts</th>
                  <th className="px-6 py-3 text-left">Accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managerCoverage.map((row) => (
                  <tr key={row.managerId} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-semibold text-slate-900">{row.managerName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${coverageBadgeStyles.count}`}>
                        {row.managedAccounts}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {row.accounts.map((account, index) => (
                          <span key={account} className={`rounded-full px-3 py-1 ${accountChipClass(index)}`}>
                            {account}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 text-sm text-slate-600 md:hidden">
            {managerCoverage.map((row) => (
              <article key={row.managerId} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{row.managerName}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${coverageBadgeStyles.count}`}>
                    {row.managedAccounts} accounts
                  </span>
                </header>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  {row.accounts.map((account, index) => (
                    <span key={account} className={`rounded-full px-3 py-1 ${accountChipClass(index)}`}>
                      {account}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#04070f] px-6 py-10 text-slate-100 shadow-lg sm:px-8">
        <div className="absolute inset-x-10 -top-20 h-48 rounded-full bg-sky-500/30 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.38em] text-slate-200">
              Next actions
            </p>
            <h3 className="text-2xl font-semibold text-white sm:text-3xl">
              Prepare the FY25 roadmap briefing with proactive customer follow-ups.
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>- Confirm sign-off for VXLAN expansion runbook.</li>
              <li>- Align TRA Exadata team on resource coverage before August sprint.</li>
              <li>- Raise upcoming dependency risks for NEMC network upgrade.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 px-6 py-5 text-center shadow-md">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Next sync</p>
            <p className="mt-3 text-3xl font-semibold text-white">31 Oct 2025</p>
            <p className="mt-1 text-sm text-slate-300">Regional delivery cadence</p>
          </div>
        </div>
      </section>
    </div>
  )
}