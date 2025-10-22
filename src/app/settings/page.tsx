export default function SettingsPage() {
  return (
    <div className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111b2e] via-[#0a1323] to-[#050912] text-slate-100 shadow-xl ring-1 ring-slate-800/50">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-6 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-slate-200">
              User Settings
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Hello!
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              Welcome to your user settings page. Configure your preferences and account details here.
            </p>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings and preferences.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="px-6 py-8 space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Display Name</label>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="Enter your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Role</label>
              <select className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                <option>Account Manager</option>
                <option>Administrator</option>
                <option>Viewer</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
        <p className="mt-1 text-sm text-slate-500">
          Customize your experience.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive updates about your projects and tasks</p>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-sky-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Dark Mode</p>
                <p className="text-xs text-slate-500">Use dark theme across the application</p>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
        >
          Save Changes
        </button>
      </section>
    </div>
  )
}
