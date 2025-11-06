// app/page.tsx
'use client';

import { useMemo, useState } from 'react';

/* ----------------------------- Types / helpers ---------------------------- */

type Currency = 'EUR' | 'USD' | 'GBP' | 'AUD';

const CURRENCY_SYMBOL: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  AUD: 'A$',
};

function money(n: number, c: Currency) {
  const locale =
    c === 'EUR' ? 'de-DE' :
    c === 'GBP' ? 'en-GB' :
    c === 'AUD' ? 'en-AU' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(n);
}

/* --------------------------------- UI bits -------------------------------- */

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-lg text-sm font-medium border transition',
        active ? 'bg-[#3366fe] text-white border-[#3366fe] shadow-sm' : 'bg-white text-black border-gray-300 hover:border-[#3366fe]'
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-white/90 mb-1">{label}</span>
      {children}
    </label>
  );
}

/* ------------------------------- Main Page -------------------------------- */

export default function Page() {
  // wizard
  const steps = ['Team', 'Priorities', 'Maturity', 'Training', 'Results'] as const;
  const [stepIdx, setStepIdx] = useState(0);

  // inputs
  const [department, setDepartment] = useState<'Company-wide' | 'Marketing' | 'Sales' | 'Customer Support' | 'Operations' | 'Engineering' | 'HR'>('Company-wide');
  const [employees, setEmployees] = useState(25);
  const [currency, setCurrency] = useState<Currency>('EUR'); // <-- AUD supported

  // priorities (choose up to 3)
  const PRIORITY_ALL = ['Throughput', 'Quality', 'Onboarding', 'Retention', 'Upskilling'] as const;
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['Throughput', 'Quality', 'Upskilling']);

  // maturity 1..10
  const [maturity, setMaturity] = useState(4);

  // training inputs
  const [weeks, setWeeks] = useState(6);
  const [hoursPerWeek, setHoursPerWeek] = useState(1);

  // simple model (demo)
  const hoursSavedPerPersonPerWeek = useMemo(() => {
    // more mature orgs save less from “basics”; less mature save more from foundational training
    // Map maturity 1..10 -> base hours: 5 → 1
    const base = 5 - (maturity - 1) * (4 / 9); // ~5 down to ~1
    const trainingBoost = Math.min(0.5 * hoursPerWeek, 2); // extra from training depth
    return Math.max(0.5, base + trainingBoost); // never below 0.5
  }, [maturity, hoursPerWeek]);

  const teamHoursPerMonth = useMemo(() => {
    const weekly = hoursSavedPerPersonPerWeek * employees;
    return Math.round(weekly * 4.33);
  }, [hoursSavedPerPersonPerWeek, employees]);

  const hourlyCost = 50; // demo constant
  const monthlySavings = useMemo(() => teamHoursPerMonth * hourlyCost, [teamHoursPerMonth]);
  const paybackMonths = useMemo(() => Math.max(1, Math.round(3 - maturity / 4 + (10 - selectedPriorities.length) * 0.1)), [maturity, selectedPriorities.length]);
  const annualRoiMultiple = useMemo(() => Math.max(1, Math.round((monthlySavings * 12) / (employees * 2500))), [monthlySavings, employees]);

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="min-h-screen bg-[#0b1022] text-white">
      {/* Header band (kept simple; if you use a hero image elsewhere, you can place it above this wrapper) */}
      <div className="bg-[#0b1022]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-semibold">AI at Work — Human Productivity ROI</h1>
          <p className="text-white/80 mt-1">
            Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
          </p>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Monthly savings</div>
              <div className="text-xl font-semibold mt-1">{money(monthlySavings, currency)}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Payback</div>
              <div className="text-xl font-semibold mt-1">{paybackMonths} months</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Annual ROI</div>
              <div className="text-xl font-semibold mt-1">×{annualRoiMultiple}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/70">Hours saved / year</div>
              <div className="text-xl font-semibold mt-1">{Math.round(teamHoursPerMonth * 12).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-t border-white/10 bg-[#0e1533]">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <div className="grid grid-cols-5 gap-2">
            {steps.map((label, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center border',
                      done ? 'bg-[#3366fe] border-[#3366fe] text-white' :
                      active ? 'border-[#3366fe] text-white' : 'border-white/30 text-white' // <-- numbers forced white
                    ].join(' ')}
                  >
                    {i + 1}
                  </div>
                  <div className={['text-sm', active ? 'text-white' : 'text-white/80'].join(' ')}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step container */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Step 1: Team */}
        {stepIdx === 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold mb-4">Team</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Department">
                  <select
                    className="w-full bg-white/90 text-black rounded-lg px-3 py-2"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                  >
                    <option>Company-wide</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Customer Support</option>
                    <option>Operations</option>
                    <option>Engineering</option>
                    <option>HR</option>
                  </select>
                </Field>

                <Field label="Employees in scope">
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-white/90 text-black rounded-lg px-3 py-2"
                    value={employees}
                    onChange={(e) => setEmployees(Math.max(1, Number(e.target.value || 0)))}
                  />
                </Field>

                <Field label="Currency">
                  <div className="flex gap-2">
                    {(['EUR','USD','GBP','AUD'] as Currency[]).map((c) => (
                      <Chip key={c} active={currency === c} onClick={() => setCurrency(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-sm font-semibold mb-3">Live summary</h3>
              <ul className="space-y-2 text-sm text-white/90">
                <li><span className="text-white/60">Dept:</span> {department}</li>
                <li><span className="text-white/60">Employees:</span> {employees}</li>
                <li><span className="text-white/60">Currency:</span> {CURRENCY_SYMBOL[currency]} ({currency})</li>
                <li><span className="text-white/60">Est. hours saved / person / week:</span> {hoursSavedPerPersonPerWeek.toFixed(1)}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Priorities (no word "configure" anywhere) */}
        {stepIdx === 1 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-4">Priorities (pick up to 3)</h2>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_ALL.map((p) => {
                const active = selectedPriorities.includes(p);
                return (
                  <Chip
                    key={p}
                    active={active}
                    onClick={() => {
                      if (active) {
                        setSelectedPriorities(selectedPriorities.filter(x => x !== p));
                      } else if (selectedPriorities.length < 3) {
                        setSelectedPriorities([...selectedPriorities, p]);
                      }
                    }}
                  >
                    {p}
                  </Chip>
                );
              })}
            </div>
            <p className="text-white/70 text-sm mt-3">We’ll reflect these names throughout the flow (e.g., “Throughput”, not “Throughput — configure”).</p>
          </div>
        )}

        {/* Step 3: Maturity */}
        {stepIdx === 2 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-4">AI Maturity</h2>
            <div className="mt-2">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={maturity}
                onChange={(e) => setMaturity(Number(e.target.value))}
                className="w-full accent-[#3366fe]"
              />
              <div className="flex justify-between text-xs mt-1 text-white">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <p className="text-white/80 mt-3">
                Current level: <span className="font-semibold">{maturity}</span> — Estimated hours saved / person / week: <span className="font-semibold">{hoursSavedPerPersonPerWeek.toFixed(1)}h</span>
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Training */}
        {stepIdx === 3 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-4">Training</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Duration (weeks)">
                <input
                  type="number"
                  min={1}
                  className="w-full bg-white/90 text-black rounded-lg px-3 py-2"
                  value={weeks}
                  onChange={(e) => setWeeks(Math.max(1, Number(e.target.value || 0)))}
                />
              </Field>
              <Field label="Hours per week (per person)">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  className="w-full bg-white/90 text-black rounded-lg px-3 py-2"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Math.max(0, Number(e.target.value || 0)))}
                />
              </Field>
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {stepIdx === 4 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold mb-4">Results</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Team hours / month</div>
                <div className="text-2xl font-semibold mt-1">{teamHoursPerMonth.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Monthly savings</div>
                <div className="text-2xl font-semibold mt-1">{money(monthlySavings, currency)}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Payback</div>
                <div className="text-2xl font-semibold mt-1">{paybackMonths} months</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Annual ROI</div>
                <div className="text-2xl font-semibold mt-1">×{annualRoiMultiple}</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-white/85">
              <div className="font-semibold mb-1">Notes</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Maturity level influences baseline time-savings; deeper training adds incremental gains.</li>
                <li>Priorities selected: {selectedPriorities.join(', ') || '—'}.</li>
                <li>Assumes blended hourly cost of {money(hourlyCost, currency)}.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={() => setStepIdx(0)}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            Start over
          </button>

          <div className="flex items-center gap-3">
            {stepIdx > 0 && (
              <button
                type="button"
                onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                Back
              </button>
            )}
            {stepIdx < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStepIdx((s) => Math.min(steps.length - 1, s + 1))}
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white font-semibold shadow hover:opacity-90"
              >
                Continue
              </button>
            ) : (
              <a
                href="/report"
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white font-semibold shadow hover:opacity-90"
              >
                Generate report
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
