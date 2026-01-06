import { useMemo, useState } from 'react'
import { HelpIcon } from './dap/help/HelpIcon'
import { useDap } from './dap/useDap'
import { WalkthroughOverlay } from './dap/walkthrough/WalkthroughOverlay'
import type { AppPageId } from './dap/types'

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type NavItem = { id: AppPageId; name: string }

function App() {
  const { content, page, setPage, startWalkthrough } = useDap()
  const [tourId, setTourId] = useState<string>('getting-started')

  const nav: NavItem[] = useMemo(
    () => [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'customers', name: 'Customers' },
      { id: 'campaigns', name: 'Campaigns' },
      { id: 'settings', name: 'Settings' },
    ],
    [],
  )

  return (
    <div className="min-h-full bg-slate-950 text-slate-100">
      <WalkthroughOverlay />

      <div className="flex min-h-full">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 md:block">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-400" />
            <div>
              <div className="text-sm font-semibold leading-none text-slate-50">
                Northstar
              </div>
              <div className="text-xs text-slate-400">Analytics Suite</div>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {nav.map((item) => (
              <button
                key={item.id}
                className={classNames(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition',
                  page === item.id
                    ? 'bg-slate-900 text-slate-50'
                    : 'text-slate-200 hover:bg-slate-900/60',
                )}
                onClick={() => setPage(item.id)}
              >
                <span className="font-medium">{item.name}</span>
                {page === item.id ? (
                  <span className="h-2 w-2 rounded-full bg-sky-300" />
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="text-xs font-semibold tracking-wide text-slate-400">
              Demo mode
            </div>
            <div className="mt-2 text-sm text-slate-200">
              This UI is a demo surface for in-app guidance and contextual help.
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-wide text-slate-400">
                  Digital Adoption Platform demo
                </div>
                <div className="truncate text-lg font-semibold text-slate-50">
                  {nav.find((n) => n.id === page)?.name}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="hidden rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:block"
                  value={tourId}
                  onChange={(e) => setTourId(e.target.value)}
                  aria-label="Choose walkthrough"
                >
                  {Object.values(content.walkthroughs).map((wt) => (
                    <option key={wt.id} value={wt.id}>
                      {wt.name}
                    </option>
                  ))}
                </select>
                <button
                  data-dap="topbar-tour"
                  className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  onClick={() => startWalkthrough(tourId)}
                >
                  Start walkthrough
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
            {page === 'dashboard' ? <DashboardPage /> : null}
            {page === 'customers' ? <CustomersPage /> : null}
            {page === 'campaigns' ? <CampaignsPage /> : null}
            {page === 'settings' ? <SettingsPage /> : null}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-xl font-semibold text-slate-50">{title}</div>
        <div className="mt-1 text-sm text-slate-300">{subtitle}</div>
      </div>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Overview"
        subtitle="A realistic dashboard surface for tours, tooltips, and contextual help."
      />

      <div
        data-dap="kpi-cards"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard label="Monthly Active Users" value="128,430" delta="+8.2%" helpId="kpis-help" />
        <KpiCard label="Trial → Paid" value="14.6%" delta="+1.1%" />
        <KpiCard label="Churn risk" value="2.3%" delta="-0.4%" />
        <KpiCard label="NPS" value="49" delta="+3" />
      </div>

      <div
        data-dap="filters"
        className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-50">Filters</div>
            <HelpIcon topicId="filters-help" />
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200">
              Segment: Enterprise
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200">
              Region: North America
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200">
              Range: 30 days
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              data-dap="view-picker"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              defaultValue="default"
              aria-label="Saved view"
            >
              <option value="default">Default view</option>
              <option value="qbr">QBR snapshot</option>
              <option value="onboarding">Onboarding health</option>
            </select>
            <button
              data-dap="save-view"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              type="button"
            >
              Save view
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 lg:col-span-2">
          <div className="text-sm font-semibold text-slate-50">Engagement trend</div>
          <div className="mt-1 text-sm text-slate-300">
            Placeholder visualization for demo purposes.
          </div>
          <div className="mt-4 h-48 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/10" />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm font-semibold text-slate-50">Suggested actions</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              Reach out to accounts with declining usage.
            </li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              Recommend onboarding checklist to new admins.
            </li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              Review feature adoption by team size.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  delta,
  helpId,
}: {
  label: string
  value: string
  delta: string
  helpId?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold tracking-wide text-slate-400">{label}</div>
        {helpId ? <HelpIcon topicId={helpId} /> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">{value}</div>
      <div className="mt-1 text-xs text-emerald-300">{delta}</div>
    </div>
  )
}

function CustomersPage() {
  const rows = [
    { name: 'Acme Inc', plan: 'Enterprise', health: 'Healthy', mrr: '$24,000' },
    { name: 'Globex', plan: 'Growth', health: 'Watch', mrr: '$8,400' },
    { name: 'Initech', plan: 'Enterprise', health: 'At risk', mrr: '$18,200' },
    { name: 'Umbrella', plan: 'Starter', health: 'Healthy', mrr: '$1,250' },
  ]

  return (
    <div className="space-y-6">
      <SectionTitle title="Customers" subtitle="A table view that can be guided step-by-step." />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Health</th>
                <th className="px-4 py-3 font-semibold">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((r) => (
                <tr key={r.name} className="hover:bg-slate-950/40">
                  <td className="px-4 py-3 font-medium text-slate-50">{r.name}</td>
                  <td className="px-4 py-3 text-slate-200">{r.plan}</td>
                  <td className="px-4 py-3 text-slate-200">{r.health}</td>
                  <td className="px-4 py-3 text-slate-200">{r.mrr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function CampaignsPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Campaigns"
        subtitle="Another surface for contextual guidance, tooltips, and inline docs."
      />
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-200">
        This page is intentionally lightweight — the DAP experience is the focus.
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Settings"
        subtitle="A common place to guide admins through setup and configuration."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm font-semibold text-slate-50">Workspace</div>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              <span>Single sign-on</span>
              <span className="text-xs text-slate-400">Not configured</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              <span>Data retention</span>
              <span className="text-xs text-slate-400">90 days</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm font-semibold text-slate-50">Notifications</div>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              <span>Weekly summary</span>
              <span className="text-xs text-emerald-300">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 p-3">
              <span>Risk alerts</span>
              <span className="text-xs text-emerald-300">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
