import Image from 'next/image'
import Link from 'next/link'

const highlights = [
  {
    title: 'Guided Capture',
    description:
      'A structured eight-step wizard that ensures every KPI, advisory, and escalation is gathered and validated before you publish.',
    accent: 'bg-gradient-to-r from-sky-500/10 via-transparent to-sky-400/10',
  },
  {
    title: 'Health & Risk Analytics',
    description:
      'Connectivity, contracts, risk, action plans, and escalation matrices generated from the same trusted dataset—ready for customer conversations.',
    accent: 'bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-400/10',
  },
  {
    title: 'Executive Ready Outputs',
    description:
      'Polished dashboards, evidence links, and tailored storytelling that transform raw telemetry into an outcome-focused narrative.',
    accent: 'bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-400/10',
  },
]

const workflow = [
  {
    step: '01',
    title: 'Capture',
    subtitle: 'Launch a guided session and collect telemetry, incidents, and advisories in minutes.',
  },
  {
    step: '02',
    title: 'Enrich',
    subtitle: 'Attach evidence, craft insights, and personalise messaging for your audience.',
  },
  {
    step: '03',
    title: 'Publish',
    subtitle: 'Share a coherent Unified Enterprise Report with executives, partners, and customers instantly.',
  },
]

export default function Page() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-[#050817] text-slate-100 shadow-2xl ring-1 ring-slate-800/60">
      <div className="pointer-events-none absolute -left-24 -top-32 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />

      <section className="relative px-6 pb-16 pt-16 sm:px-12 lg:px-20 lg:pt-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
              Unified Enterprise Report
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Deliver remarkable executive briefings with a single integrated workspace.
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl">
              UER centralises telemetry, advisories, contracts, risks, and actions-so your customer conversations shift from
              data wrangling to strategic outcomes.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/sessions/new"
                className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
              >
                Start a Guided Session
              </Link>
              <Link
                href="/health/code-currency"
                className="rounded-full border border-slate-500/60 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-300/80 hover:text-white"
              >
                Explore Health Dashboards
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-xl">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/70 shadow-2xl shadow-sky-500/20 backdrop-blur">
              <Image
                src="/images/hero-analytics.jpg"
                alt="Person interacting with analytics dashboards on a glass interface."
                fill
                className="object-cover"
                priority
                sizes="(min-width: 1024px) 480px, 100vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sky-500/20 via-transparent to-emerald-500/30 mix-blend-screen" />
            </div>
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-sky-500/40 blur-3xl" />
            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-400/40 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="relative bg-white/5 px-6 py-12 backdrop-blur sm:px-12 lg:px-20">
        <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">Why teams rely on UER</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {highlights.map(({ title, description, accent }) => (
            <div
              key={title}
              className={`group rounded-2xl border border-white/10 ${accent} p-6 shadow-lg transition hover:border-white/30 hover:shadow-xl hover:shadow-sky-500/10`}
            >
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm text-slate-200/90">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-6 py-14 sm:px-12 lg:px-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-5">
            <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">A workflow aligned to customer value</h2>
            <p className="text-slate-300">
              From capture to executive-ready insights, UER mirrors the rhythm of your customer reviews. The platform keeps
              stakeholders aligned and focused on what matters next.
            </p>
          </div>
          <ol className="flex-1 space-y-4">
            {workflow.map(({ step, title, subtitle }) => (
              <li key={step} className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/80 font-semibold text-white shadow-inner">
                  {step}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="text-sm text-slate-200/80">{subtitle}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-b-3xl border-t border-white/10 bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10 px-6 py-14 sm:px-12 lg:px-20">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/20 bg-slate-900/60 px-6 py-10 text-center shadow-xl">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Ready for your next executive readout?
          </h2>
          <p className="mx-auto max-w-2xl text-slate-200">
            Launch a session, capture insights, and ship a customer-ready report faster than ever. UER keeps every
            stakeholder aligned.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sessions/new"
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Create a New Report
            </Link>
            <Link
              href="/risk-register"
              className="rounded-full border border-slate-300/40 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-200/80 hover:text-white"
            >
              Review Risk Register
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
