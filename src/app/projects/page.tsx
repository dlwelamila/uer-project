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
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111b2e] via-[#0a1323] to-[#050912] text-slate-100 shadow-xl ring-1 ring-slate-800/50">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-6 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
              Projects Portfolio
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Keep customer projects aligned, visible, and on track.
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              View every initiative across accounts, understand momentum at a glance, and focus your team on the next
              critical milestone.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-200 shadow-lg shadow-sky-900/10 sm:flex-row sm:items-center sm:gap-6">
            <div>
              <span className="block text-xs uppercase tracking-[0.3em] text-sky-300/90">Next review</span>
              <span className="text-lg font-semibold text-white">Executive sync · 28 Oct</span>
            </div>
            <div className="h-12 w-px bg-white/10 sm:h-10 sm:w-px" />
            <div>
              <span className="block text-xs uppercase tracking-[0.3em] text-slate-300/80">Owners</span>
              <span className="text-lg font-semibold text-white">5 Account Managers</span>
            </div>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Portfolio highlights</h2>
        <p className="mt-1 text-sm text-slate-500">
          Quick metrics that frame overall load, velocity, and operational posture across the portfolio.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.accent} p-6 shadow-lg transition-transform hover:-translate-y-1`}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 transition group-hover:opacity-10" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{card.title}</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                  <p className="mt-2 text-sm text-white/70">{card.description}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/10 text-sm font-semibold tracking-wide text-white/80">
                  {card.monogram}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="table-wrap">
            <table className="min-w-full divide-y divide-slate-200">
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
                {projectPipeline.map((item) => (
                  <tr key={`${item.manager}-${item.project}`} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.manager}</td>
                    <td className="px-6 py-4">{item.account}</td>
                    <td className="px-6 py-4">{item.project}</td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <div className="h-2 rounded-full bg-slate-200/70">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{item.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipStyles[item.status]}`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{item.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="table-wrap">
              <table className="min-w-full text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Account</th>
                    <th className="px-6 py-3 text-left">Completed</th>
                    <th className="px-6 py-3 text-left">Ongoing</th>
                    <th className="px-6 py-3 text-left">Upcoming</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portfolioHealth.map((row) => (
                    <tr key={row.account} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.account}</td>
                      <td className="px-6 py-4">{row.completed}</td>
                      <td className="px-6 py-4">{row.ongoing}</td>
                      <td className="px-6 py-4">{row.upcoming}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="table-wrap">
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
                  {taskView.map((row) => (
                    <tr key={row.account} className="hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.account}</td>
                      <td className="px-6 py-4">{row.scope}</td>
                      <td className="px-6 py-4">{row.ongoing}</td>
                      <td className="px-6 py-4">{row.completed}</td>
                      <td className="px-6 py-4">{row.timeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Account manager coverage</h3>
            <p className="mt-1 text-sm text-slate-500">
              Assurance that every account has a clear owner and share of voice in the portfolio.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Export roster
          </button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="table-wrap">
            <table className="min-w-full text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Account manager</th>
                  <th className="px-6 py-3 text-left">Managed accounts</th>
                  <th className="px-6 py-3 text-left">Accounts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamRoster.map((row) => (
                  <tr key={row.manager} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.manager}</td>
                    <td className="px-6 py-4">{row.accounts}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        {row.portfolio.map((account) => (
                          <span
                            key={account}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600"
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

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#04070f] px-8 py-10 text-slate-100 shadow-xl">
        <div className="absolute inset-x-10 -top-20 h-48 rounded-full bg-sky-500/30 blur-3xl" />
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
          <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-center shadow-lg shadow-sky-900/20">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-200">Next sync</p>
            <p className="mt-3 text-3xl font-semibold text-white">31 Oct 2025</p>
            <p className="mt-1 text-sm text-slate-300">Regional delivery cadence</p>
          </div>
        </div>
      </section>
    </div>
  )
}
