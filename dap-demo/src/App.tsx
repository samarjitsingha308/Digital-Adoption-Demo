import { useMemo, useState } from 'react'
import { AssistLayer } from './dap/assist/AssistLayer'
import { HelpIcon } from './dap/help/HelpIcon'
import { useDap } from './dap/useDap'
import { WalkthroughOverlay } from './dap/walkthrough/WalkthroughOverlay'
import type { AppPageId } from './dap/types'

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type NavItem = { id: AppPageId; name: string }

function App() {
  const { content, page, setPage, startWalkthrough, assistModeEnabled, setAssistModeEnabled } =
    useDap()
  const [tourId, setTourId] = useState<string>('getting-started')

  const nav: NavItem[] = useMemo(
    () => [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'customers', name: 'Customers' },
      { id: 'campaigns', name: 'Campaigns' },
      { id: 'onboarding', name: 'Onboarding' },
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
                <button
                  data-dap="assist-toggle"
                  type="button"
                  className={classNames(
                    'hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm transition sm:flex',
                    assistModeEnabled
                      ? 'border-sky-400/60 bg-sky-500/10 text-slate-50'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800',
                  )}
                  onClick={() => setAssistModeEnabled(!assistModeEnabled)}
                >
                  <span className="font-semibold">Assist</span>
                  <span
                    className={classNames(
                      'relative inline-flex h-5 w-9 items-center rounded-full border transition',
                      assistModeEnabled ? 'border-sky-400 bg-sky-400' : 'border-slate-600 bg-slate-800',
                    )}
                    aria-hidden="true"
                  >
                    <span
                      className={classNames(
                        'inline-block h-4 w-4 rounded-full bg-slate-950 transition',
                        assistModeEnabled ? 'translate-x-4' : 'translate-x-1',
                      )}
                    />
                  </span>
                </button>
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
            {page === 'onboarding' ? <OnboardingPage /> : null}
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
  const [query, setQuery] = useState('')
  const [segment, setSegment] = useState<'all' | 'enterprise' | 'growth'>('all')
  const [selected, setSelected] = useState<null | {
    name: string
    plan: string
    health: string
    mrr: string
  }>(null)

  const rows = [
    { name: 'Acme Inc', plan: 'Enterprise', health: 'Healthy', mrr: '$24,000' },
    { name: 'Globex', plan: 'Growth', health: 'Watch', mrr: '$8,400' },
    { name: 'Initech', plan: 'Enterprise', health: 'At risk', mrr: '$18,200' },
    { name: 'Umbrella', plan: 'Starter', health: 'Healthy', mrr: '$1,250' },
  ]

  const filtered = rows.filter((r) => {
    const matchQuery = !query.trim() || r.name.toLowerCase().includes(query.trim().toLowerCase())
    const matchSegment =
      segment === 'all'
        ? true
        : segment === 'enterprise'
          ? r.plan === 'Enterprise'
          : r.plan === 'Growth'
    return matchQuery && matchSegment
  })

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Customers"
        subtitle="A table workflow with DAP targets, contextual help, and a detail drawer."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1">
              <input
                data-dap="customers-search"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers…"
              />
            </div>
            <select
              data-dap="customers-filter"
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={segment}
              onChange={(e) => setSegment(e.target.value as 'all' | 'enterprise' | 'growth')}
              aria-label="Segment filter"
            >
              <option value="all">All segments</option>
              <option value="enterprise">Enterprise</option>
              <option value="growth">Growth</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <HelpIcon topicId="customers-import-help" />
            <button
              data-dap="customers-import"
              type="button"
              className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              onClick={() => {
                // demo-only action
                alert('Demo: would open an import flow (CSV upload + preview).')
              }}
            >
              Import CSV
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table data-dap="customers-table" className="w-full text-left text-sm">
            <thead className="bg-slate-950/40 text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="inline-flex items-center gap-2">
                    Health <HelpIcon topicId="customers-health-help" />
                  </span>
                </th>
                <th className="px-4 py-3 font-semibold">MRR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((r) => (
                <tr
                  key={r.name}
                  data-dap={r.name === 'Acme Inc' ? 'customers-row-acme' : undefined}
                  className="cursor-pointer hover:bg-slate-950/40"
                  onClick={() => setSelected(r)}
                >
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

      {selected ? (
        <div
          className="fixed inset-0 z-[1050]"
          onMouseDown={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-slate-950/60" />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-800 bg-slate-950/90 p-5 backdrop-blur-md"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-wide text-slate-400">Customer</div>
                <div className="mt-1 text-lg font-semibold text-slate-50">{selected.name}</div>
                <div className="mt-1 text-sm text-slate-300">
                  Plan: <span className="font-semibold text-slate-100">{selected.plan}</span> ·{' '}
                  Health: <span className="font-semibold text-slate-100">{selected.health}</span>
                </div>
              </div>
              <button
                className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                onClick={() => setSelected(null)}
                aria-label="Close drawer"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-sm font-semibold text-slate-50">Next best actions</div>
                <div className="mt-2 space-y-2 text-sm text-slate-200">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
                    Review onboarding completion
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
                    Contact admin about usage drop
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-50">Billing</div>
                  <HelpIcon topicId="customers-import-help" />
                </div>
                <div className="mt-2 text-sm text-slate-200">
                  MRR: <span className="font-semibold text-slate-100">{selected.mrr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CampaignsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [template, setTemplate] = useState<'activation' | 'adoption' | 'renewal'>('activation')
  const [schedule, setSchedule] = useState('')

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Campaigns"
        subtitle="A creation flow that’s perfect for guided walkthroughs and contextual help."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-sm font-semibold text-slate-50">No campaigns yet</div>
            <div className="mt-1 text-sm text-slate-300">
              Start with a template to reduce setup time and avoid mistakes.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HelpIcon topicId="campaigns-templates-help" />
            <button
              data-dap="campaigns-create"
              className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              onClick={() => setCreateOpen(true)}
            >
              Create campaign
            </button>
          </div>
        </div>
      </div>

      {createOpen ? (
        <div className="fixed inset-0 z-[1050]" onMouseDown={() => setCreateOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/60" />
          <div
            className="absolute right-0 top-0 h-full w-full max-w-lg border-l border-slate-800 bg-slate-950/90 p-5 backdrop-blur-md"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-wide text-slate-400">Campaign</div>
                <div className="mt-1 text-lg font-semibold text-slate-50">New campaign</div>
                <div className="mt-1 text-sm text-slate-300">
                  This panel is instrumented for DAP walkthrough steps.
                </div>
              </div>
              <button
                className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                onClick={() => setCreateOpen(false)}
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div data-dap="campaigns-templates" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-50">Template</div>
                  <HelpIcon topicId="campaigns-templates-help" />
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TemplateCard
                    title="Activation"
                    desc="First wins for new users"
                    selected={template === 'activation'}
                    onClick={() => setTemplate('activation')}
                  />
                  <TemplateCard
                    title="Adoption"
                    desc="Drive feature usage"
                    selected={template === 'adoption'}
                    onClick={() => setTemplate('adoption')}
                  />
                  <TemplateCard
                    title="Renewal"
                    desc="Reduce churn risk"
                    selected={template === 'renewal'}
                    onClick={() => setTemplate('renewal')}
                  />
                </div>
              </div>

              <label className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="mb-1 text-sm font-semibold text-slate-100">Audience</div>
                <select
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  defaultValue="new-admins"
                >
                  <option value="new-admins">New admins</option>
                  <option value="all-users">All users</option>
                  <option value="power-users">Power users</option>
                </select>
              </label>

              <label
                data-dap="campaigns-schedule"
                className="block rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-100">Schedule</span>
                  <HelpIcon topicId="campaigns-schedule-help" />
                </div>
                <input
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="e.g., Tomorrow at 9:00 AM (local time)"
                />
              </label>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  data-dap="campaigns-launch"
                  type="button"
                  className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  onClick={() => {
                    alert(`Demo: would launch a ${template} campaign.`)
                    setCreateOpen(false)
                  }}
                >
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function OnboardingPage() {
  const [form, setForm] = useState({
    companyName: '',
    website: '',
    industry: '',
    teamSize: '',
    billingEmail: '',
    goal: '',
  })

  const applyExample = (fieldId: string, value: string) => {
    setForm((f) => ({ ...f, [fieldId]: value }))
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Onboarding"
        subtitle="A form surface to demo Assist Mode (hesitation + validation + proactive help)."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-50">Create customer</div>
              <div className="mt-1 text-sm text-slate-300">
                Turn on <span className="font-semibold text-slate-100">Assist</span> in the top bar,
                click into a field, then pause.
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200">
                Demo form
              </span>
            </div>
          </div>

          <div data-assist-form="customer-onboarding" className="mt-5 space-y-4">
            <Field
              id="companyName"
              label="Company name"
              value={form.companyName}
              onChange={(v) => setForm((f) => ({ ...f, companyName: v }))}
              placeholder="e.g., Acme Inc."
            />
            <Field
              id="website"
              label="Website"
              value={form.website}
              onChange={(v) => setForm((f) => ({ ...f, website: v }))}
              placeholder="https://example.com"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="industry"
                label="Industry"
                value={form.industry}
                onChange={(v) => setForm((f) => ({ ...f, industry: v }))}
                options={['SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'Education']}
              />
              <Field
                id="teamSize"
                label="Team size"
                value={form.teamSize}
                onChange={(v) => setForm((f) => ({ ...f, teamSize: v }))}
                placeholder="e.g., 250"
              />
            </div>
            <Field
              id="billingEmail"
              label="Billing email"
              value={form.billingEmail}
              onChange={(v) => setForm((f) => ({ ...f, billingEmail: v }))}
              placeholder="billing@company.com"
            />
            <TextAreaField
              id="goal"
              label="Primary goal"
              value={form.goal}
              onChange={(v) => setForm((f) => ({ ...f, goal: v }))}
              placeholder="What does the customer want to achieve?"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                Create customer
              </button>
            </div>
          </div>

          <AssistLayer formId="customer-onboarding" onApplyExample={applyExample} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm font-semibold text-slate-50">How to demo Assist Mode</div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-200">
            <li>Enable <span className="font-semibold text-slate-100">Assist</span> in the top bar.</li>
            <li>Click into a field and pause (~6s) to trigger contextual guidance.</li>
            <li>Type an invalid email and tab out to see an error-focused assist message.</li>
            <li>Stay idle on the form to trigger a gentle “Need help?” nudge.</li>
          </ol>
        </div>
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

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-100">{label}</span>
        <span className="text-xs text-slate-500">Optional</span>
      </div>
      <input
        data-assist-field={id}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-100">{label}</span>
        <span className="text-xs text-slate-500">Optional</span>
      </div>
      <select
        data-assist-field={id}
        className="w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-100">{label}</span>
        <span className="text-xs text-slate-500">Optional</span>
      </div>
      <textarea
        data-assist-field={id}
        className="min-h-[96px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function TemplateCard({
  title,
  desc,
  selected,
  onClick,
}: {
  title: string
  desc: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={classNames(
        'rounded-2xl border p-3 text-left transition',
        selected
          ? 'border-sky-400/60 bg-sky-500/10'
          : 'border-slate-800 bg-slate-950/30 hover:bg-slate-950/50',
      )}
      onClick={onClick}
    >
      <div className="text-sm font-semibold text-slate-50">{title}</div>
      <div className="mt-1 text-xs text-slate-300">{desc}</div>
    </button>
  )
}
