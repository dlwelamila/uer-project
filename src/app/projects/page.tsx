type Status = 'ongoing' | 'completed' | 'upcoming' | 'scheduled' | 'pending'

const summaryCards = [
  {
    title: 'Total Accounts',
    value: '12',
    description: 'Managed by 5 account managers',
    color: 'sky',
    monogram: 'TA',
    sub: 'Active this FY',
  },
  {
    title: 'Active Projects',
    value: '8',
    description: '2 completed / 4 ongoing / 2 upcoming',
    color: 'emerald',
    monogram: 'AP',
    sub: 'Across accounts',
  },
  {
    title: 'Open Cases',
    value: '5',
    description: '3 resolved / 2 pending follow-ups',
    color: 'cyan',
    monogram: 'OC',
    sub: 'Follow-ups needed',
  },
  {
    title: 'Tasks Completed',
    value: '64%',
    description: '36 of 56 project tasks closed',
    color: 'fuchsia',
    monogram: 'TC',
    sub: 'Percent complete',
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
        monoBg: 'bg-sky-50',
        monoText: 'text-sky-700',
        monoRing: 'ring-sky-100',
      }
    case 'emerald':
      return {
        stripe: 'bg-emerald-400',
        monoBg: 'bg-emerald-50',
        monoText: 'text-emerald-700',
        monoRing: 'ring-emerald-100',
      }
    case 'cyan':
      return {
        stripe: 'bg-cyan-400',
        monoBg: 'bg-cyan-50',
        monoText: 'text-cyan-700',
        monoRing: 'ring-cyan-100',
      }
    case 'fuchsia':
      return {
        stripe: 'bg-fuchsia-400',
        monoBg: 'bg-fuchsia-50',
        monoText: 'text-fuchsia-700',
        monoRing: 'ring-fuchsia-100',
      }
    default:
      return {
        stripe: 'bg-slate-300',
        monoBg: 'bg-slate-50',
        monoText: 'text-slate-700',
        monoRing: 'ring-slate-100',
      }
  }
}

export default function ProjectsPage() {
  return (
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071327] via-[#071225] to-[#03040b] text-slate-100 shadow-lg ring-1 ring-slate-800/50">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" aria-hidden />
        <div className="absolute -right-6 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden />
        <div className="relative container mx-auto flex flex-col gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
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

      <section className="container mx-auto px-6">
        <h2 className="text-lg font-semibold text-slate-900">Portfolio highlights</h2>
        <p className="mt-1 text-sm text-slate-500">
          Quick metrics that frame overall load, velocity, and operational posture across the portfolio.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const c = colorToClasses(card.color)
            return (
              <article
                key={card.title}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-transform hover:-translate-y-1 focus-within:translate-y-0 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-200"
                tabIndex={0}
                aria-labelledby={`${card.title.replace(/\s+/g, '-').toLowerCase()}-title`}
              >
                {/* Accent stripe */}
                <div className={`hidden sm:block h-full w-1 rounded-r-xl ${c.stripe}`} aria-hidden />

                {/* Monogram block */}
                <div className="flex-shrink-0">
                  <div
                    className={`h-14 w-14 flex items-center justify-center rounded-xl ${c.monoBg} ${c.monoText} font-bold text-lg ring-1 ${c.monoRing}`}
                    aria-hidden
                    title={card.title}
                  >
                    {card.monogram}
                  </div>
                  <p className="mt-2 hidden text-xs font-medium text-slate-600 sm:block">{card.sub}</p>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        id={`${card.title.replace(/\s+/g, '-').toLowerCase()}-title`}
                        className="truncate text-sm font-semibold uppercase tracking-wide text-slate-700"
                      >
                        {card.title}
                      </p>
                      <p className="mt-1 truncate text-3xl font-extrabold leading-none text-slate-900">
                        {card.value}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {card.sub}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600 leading-snug">{card.description}</p>

                  <div className="mt-4 flex items-center gap-3">
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

      <section className="container mx-auto px-6 space-y-6">
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
          <div className="overflow-x-auto">
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
                {projectPipeline.map((item) => (
                  <tr
                    key={`${item.manager}-${item.project}`}
                    className="hover:bg-slate-50/60 transition-colors"
                    tabIndex={0}
                    aria-rowindex={projectPipeline.indexOf(item) + 2}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">{item.manager}</td>
                    <td className="px-6 py-4">{item.account}</td>
                    <td className="px-6 py-4">{item.project}</td>
                    <td className="px-6 py-4">
                      <div className="flex min-w-[180px] flex-col gap-2">
                        <div
                          className="relative h-2 rounded-full bg-slate-200/70 overflow-hidden"
                          role="progressbar"
                          aria-valuenow={item.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${item.project} progress`}
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
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusChipStyles[item.status as Status]}`}
                      >
                        {item.status === 'ongoing' ? '•' : item.status === 'completed' ? '✓' : '•'}{' '}
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

      <section className="container mx-auto px-6 grid gap-8 xl:grid-cols-2">
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
            <div className="overflow-x-auto">
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

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
            <div className="overflow-x-auto">
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

      <section className="container mx-auto px-6 space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Account manager coverage</h3>
            <p className="mt-1 text-sm text-slate-500">
              Assurance that every account has a clear owner and share of voice in the portfolio.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
          >
            Export roster
          </button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
          <div className="overflow-x-auto">
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

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-950 to-[#04070f] px-8 py-10 text-slate-100 shadow-lg">
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