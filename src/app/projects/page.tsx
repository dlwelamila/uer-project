type Status = 'ongoing' | 'completed' | 'upcoming' | 'scheduled' | 'pending'

const summaryCards = [
  {
    title: 'Total Accounts',
    value: '12',
    description: 'Managed by 5 account managers',
    accent: 'from-sky-500/20 via-sky-500/5 to-slate-900/10 border-sky-500/40 text-sky-200',
    monogram: 'TA',
  },
  {
    title: 'Active Projects',
    value: '8',
    description: '2 completed / 4 ongoing / 2 upcoming',
    accent: 'from-emerald-500/20 via-emerald-500/5 to-slate-900/10 border-emerald-500/40 text-emerald-200',
    monogram: 'AP',
  },
  {
    title: 'Open Cases',
    value: '5',
    description: '3 resolved / 2 pending follow-ups',
    accent: 'from-cyan-500/20 via-cyan-500/5 to-slate-900/10 border-cyan-500/40 text-cyan-100',
    monogram: 'OC',
  },
  {
    title: 'Tasks Completed',
    value: '64%',
    description: '36 of 56 project tasks closed',
    accent: 'from-fuchsia-500/20 via-fuchsia-500/5 to-slate-900/10 border-fuchsia-500/40 text-fuchsia-200',
    monogram: 'TC',
  },
]

const projectPipeline = [
  {
    manager: 'Derick Lwelamila',
    account: 'CRDB',
    project: 'HCI Modernisation',
    progress: 89,
    status: 'ongoing',
    due: '22 Sep 2025',
  },
  {
    manager: 'Salima Malimba',
    account: 'TRA',
    project: 'Exadata Optimisation',
    progress: 45,
    status: 'ongoing',
    due: '20 Aug 2025',
  },
  {
    manager: 'Dickson Daud',
    account: 'TPDC',
    project: 'VXLAN Expansion',
    progress: 100,
    status: 'completed',
    due: '11 May 2025',
  },
  {
    manager: 'Johnson M.',
    account: 'NEMC',
    project: 'Network Upgrade',
    progress: 25,
    status: 'ongoing',
    due: 'TBD',
  },
]

const portfolioHealth = [
  { account: 'CRDB', completed: 4, ongoing: 1, upcoming: 1 },
  { account: 'MICIT', completed: 1, ongoing: 0, upcoming: 1 },
  { account: 'TCRA', completed: 1, ongoing: 0, upcoming: 0 },
  { account: 'E-GA', completed: 1, ongoing: 1, upcoming: 0 },
  { account: 'NBC', completed: 2, ongoing: 1, upcoming: 1 },
  { account: 'TBS', completed: 1, ongoing: 1, upcoming: 0 },
]

const taskView = [
  { account: 'NBC', scope: 4, ongoing: 2, completed: 2, timeline: '20 May 2025' },
  { account: 'TBS', scope: 2, ongoing: 1, completed: 0, timeline: '20 May 2025' },
  { account: 'CRDB', scope: 5, ongoing: 3, completed: 2, timeline: '15 Jun 2025' },
  { account: 'TRA', scope: 3, ongoing: 2, completed: 1, timeline: '30 Apr 2025' },
]

const teamRoster = [
  { manager: 'Derick Lwelamila', accounts: 4, portfolio: ['STANBIC', 'CRDB', 'IRMICT', 'NBC'] },
  { manager: 'Salima Malimba', accounts: 2, portfolio: ['TRA', 'TCRA'] },
  { manager: 'Dickson Daud', accounts: 3, portfolio: ['TPDC', 'NMB', 'TBS'] },
  { manager: 'Johnson M.', accounts: 2, portfolio: ['NEMC', 'TANESCO'] },
  { manager: 'Jason Derul', accounts: 1, portfolio: ['TANF'] },
]

const statusChipStyles: Record<Status, string> = {
  ongoing: 'bg-sky-500/15 text-sky-200 ring-1 ring-inset ring-sky-500/40',
  completed: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-inset ring-emerald-500/40',
  upcoming: 'bg-fuchsia-500/15 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-500/40',
  scheduled: 'bg-amber-400/15 text-amber-200 ring-1 ring-inset ring-amber-400/40',
  pending: 'bg-slate-400/15 text-slate-200 ring-1 ring-inset ring-slate-400/40',
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8 pb-12 md:space-y-12">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111b2e] via-[#0a1323] to-[#050912] text-slate-100 shadow-xl ring-1 ring-slate-800/50 md:rounded-3xl">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-6 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 px-5 py-8 sm:px-8 md:gap-8 md:px-10 md:py-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl space-y-3 md:space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-200 sm:px-4 sm:text-xs sm:tracking-[0.32em]">
              Projects Portfolio
            </p>
            <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
              Keep customer projects aligned, visible, and on track.
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
              View every initiative across accounts, understand momentum at a glance, and focus your team on the next
              critical milestone.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200 shadow-lg shadow-sky-900/10 sm:flex-row sm:items-center sm:gap-6 md:rounded-2xl md:px-6 md:py-5 lg:flex-col lg:gap-3">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.26em] text-sky-300/90 sm:text-xs sm:tracking-[0.3em]">Next review</span>
              <span className="text-base font-semibold text-white sm:text-lg">Executive sync · 28 Oct</span>
            </div>
            <div className="hidden h-px w-full bg-white/10 sm:block sm:h-10 sm:w-px lg:h-px lg:w-full" />
            <div>
              <span className="block text-[10px] uppercase tracking-[0.26em] text-slate-300/80 sm:text-xs sm:tracking-[0.3em]">Owners</span>
              <span className="text-base font-semibold text-white sm:text-lg">5 Account Managers</span>
            </div>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">Portfolio highlights</h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Quick metrics that frame overall load, velocity, and operational posture across the portfolio.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-6 md:gap-5 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${card.accent} p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:rounded-2xl md:p-6`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/70 sm:text-sm">{card.title}</p>
                  <p className="mt-3 text-2xl font-semibold text-white sm:text-3xl md:mt-4">{card.value}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/70 sm:text-sm">{card.description}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/10 text-xs font-semibold tracking-wide text-white/80 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-sm">
                  {card.monogram}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 md:space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3 md:gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 md:text-lg">Project pipeline</h2>
            <p className="text-xs text-slate-500 sm:text-sm">In-flight work with accountable owners, milestones, and target dates.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 sm:px-3 sm:text-xs">
              Updated 2h ago
            </span>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg md:rounded-2xl">
          <div className="table-wrap">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                  <th className="px-3 py-2.5 sm:px-4 md:px-6 md:py-3">Account Manager</th>
                  <th className="px-3 py-2.5 sm:px-4 md:px-6 md:py-3">Account</th>
                  <th className="px-3 py-2.5 sm:px-4 md:px-6 md:py-3">Project</th>
                  <th className="px-3 py-2.5 sm:px-4 md:px-6 md:py-3">Milestone</th>
                  <th className="px-3 py-2.5 sm:px-4 md:px-6 md:py-3">Status</th>
                  <th className="px-3 py-2.5 sm:px-4 md:px-6 md:py-3">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600 sm:text-sm">
                {projectPipeline.map((item) => (
                  <tr key={`${item.manager}-${item.project}`} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-medium text-slate-900 sm:px-4 md:px-6 md:py-4">{item.manager}</td>
                    <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{item.account}</td>
                    <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{item.project}</td>
                    <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">
                      <div className="flex min-w-[120px] flex-col gap-1.5 sm:min-w-[140px] md:min-w-[180px] md:gap-2">
                        <div className="h-1.5 rounded-full bg-slate-200/70 md:h-2">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 transition-all duration-500 md:h-2"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 sm:text-xs">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs md:px-3 ${statusChipStyles[item.status as Status]}`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-900 sm:px-4 md:px-6 md:py-4">{item.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:gap-8 xl:grid-cols-2">
        <div className="space-y-4 md:space-y-5">
          <header className="flex items-start justify-between gap-3 md:gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 md:text-lg">Account portfolio health</h3>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Completed, ongoing, and upcoming projects across each strategic customer.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 sm:px-3 sm:text-xs">FY25</span>
          </header>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg md:rounded-2xl">
            <div className="table-wrap">
              <table className="min-w-full text-xs text-slate-600 sm:text-sm">
                <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                  <tr>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Account</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Completed</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Ongoing</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Upcoming</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portfolioHealth.map((row) => (
                    <tr key={row.account} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-3 py-3 font-medium text-slate-900 sm:px-4 md:px-6 md:py-4">{row.account}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.completed}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.ongoing}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.upcoming}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-5">
          <header className="flex items-start justify-between gap-3 md:gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 md:text-lg">Task pipeline</h3>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Scope, progress, and target dates for project tasks still in execution.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500 sm:px-3 sm:text-xs">
              Workflow
            </span>
          </header>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg md:rounded-2xl">
            <div className="table-wrap">
              <table className="min-w-full text-xs text-slate-600 sm:text-sm">
                <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                  <tr>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Account</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Task scope</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Ongoing</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Completed</th>
                    <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taskView.map((row) => (
                    <tr key={row.account} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-3 py-3 font-medium text-slate-900 sm:px-4 md:px-6 md:py-4">{row.account}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.scope}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.ongoing}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.completed}</td>
                      <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 md:space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 md:text-lg">Account manager coverage</h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Assurance that every account has a clear owner and share of voice in the portfolio.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:px-4 sm:py-2 sm:text-sm"
          >
            Export roster
          </button>
        </header>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg md:rounded-2xl">
          <div className="table-wrap">
            <table className="min-w-full text-xs text-slate-600 sm:text-sm">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                <tr>
                  <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Account manager</th>
                  <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Managed accounts</th>
                  <th className="px-3 py-2.5 text-left sm:px-4 md:px-6 md:py-3">Accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamRoster.map((row) => (
                  <tr key={row.manager} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-medium text-slate-900 sm:px-4 md:px-6 md:py-4">{row.manager}</td>
                    <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">{row.accounts}</td>
                    <td className="px-3 py-3 sm:px-4 md:px-6 md:py-4">
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-500 sm:gap-2 sm:text-xs">
                        {row.portfolio.map((account) => (
                          <span
                            key={account}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 sm:px-2.5 sm:py-1 md:px-3"
                          >
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
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#04070f] px-5 py-8 text-slate-100 shadow-xl sm:px-6 md:rounded-3xl md:px-8 md:py-10">
        <div className="absolute inset-x-10 -top-20 h-48 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2.5 md:space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-200 sm:px-4 sm:text-xs sm:tracking-[0.38em]">
              Next actions
            </p>
            <h3 className="text-xl font-semibold leading-tight text-white sm:text-2xl md:text-3xl">
              Prepare the FY25 roadmap briefing with proactive customer follow-ups.
            </h3>
            <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300 sm:text-sm md:space-y-2">
              <li>- Confirm sign-off for VXLAN expansion runbook.</li>
              <li>- Align TRA Exadata team on resource coverage before August sprint.</li>
              <li>- Raise upcoming dependency risks for NEMC network upgrade.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 px-5 py-4 text-center shadow-lg shadow-sky-900/20 md:rounded-2xl md:px-6 md:py-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-200 sm:text-xs sm:tracking-[0.35em]">Next sync</p>
            <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl md:mt-3">31 Oct 2025</p>
            <p className="mt-1 text-xs text-slate-300 sm:text-sm">Regional delivery cadence</p>
          </div>
        </div>
      </section>
    </div>
  )
}
