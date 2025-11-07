"use client";

import { useMemo, useState } from "react";

/** Currency handling */
type Currency = "EUR" | "USD" | "GBP" | "AUD";
const SYMBOL: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  AUD: "A$",
};

/** Steps */
const STEPS = ["Team", "Priorities", "AI Maturity", "Training", "Results"] as const;
type Step = typeof STEPS[number];

/** Priorities (select up to 3) */
const PRIORITY_OPTIONS = [
  { key: "throughput", label: "Throughput" },
  { key: "quality", label: "Quality" },
  { key: "onboarding", label: "Onboarding" },
  { key: "retention", label: "Retention" },
  { key: "upskilling", label: "Upskilling" },
] as const;
type PriorityKey = typeof PRIORITY_OPTIONS[number]["key"];

export default function Page() {
  // Global UI state
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Step 1 — Team
  const [department, setDepartment] = useState<string>("Company-wide");
  const [employees, setEmployees] = useState<number>(25);
  const [hourlyCost, setHourlyCost] = useState<number>(35);

  // Step 2 — Priorities
  const [selectedPriorities, setSelectedPriorities] = useState<PriorityKey[]>([
    "throughput",
    "quality",
    "onboarding",
  ]);

  // Step 3 — AI Maturity (1..10 with matching hours saved baseline)
  const [maturity, setMaturity] = useState<number>(3);

  // Step 4 — Training (weeks + cohort size)
  const [weeks, setWeeks] = useState<number>(4);
  const [cohortSize, setCohortSize] = useState<number>(employees > 0 ? Math.min(20, employees) : 10);

  // Derived
  const currencySymbol = SYMBOL[currency];

  // Simple maturity → hours saved per person (per week) mapping
  // Scales from ~5h at very low maturity down to ~1h at very high maturity (efficiency focus)
  const perPersonHours = useMemo(() => {
    const clamped = Math.min(10, Math.max(1, maturity));
    // Map 1..10 → 5..1 linearly
    const hours = Math.round((11 - clamped) * 0.5); // 1→5, 10→0.5→rounded=1
    return Math.max(1, hours);
  }, [maturity]);

  // Priority multipliers—demo weights to spread hours across chosen priorities
  const weights: Record<PriorityKey, number> = {
    throughput: 1.0,
    quality: 0.7,
    onboarding: 0.8,
    retention: 0.5,
    upskilling: 0.6,
  };

  const breakdown = useMemo(() => {
    const totalWeight = selectedPriorities.reduce((s, k) => s + weights[k], 0) || 1;
    const teamHours = perPersonHours * employees;

    return selectedPriorities.map((k) => {
      const share = weights[k] / totalWeight;
      const hrs = teamHours * share;
      const value = hrs * hourlyCost;
      return { key: k, label: k[0].toUpperCase() + k.slice(1), hours: hrs, value };
    });
  }, [selectedPriorities, perPersonHours, employees, hourlyCost]);

  const totals = useMemo(() => {
    const hours = breakdown.reduce((s, r) => s + r.hours, 0);
    const value = breakdown.reduce((s, r) => s + r.value, 0);
    // very simple monthly lens for the live KPIs
    const monthly = value * 4; // ~4 weeks
    // naive payback calc demo: assume training cost proxy = cohortSize * hourlyCost * weeks * 3h/session
    const trainingHours = cohortSize * weeks * 3;
    const trainingCost = trainingHours * hourlyCost;
    const paybackMonths = monthly > 0 ? Math.max(0.5, trainingCost / monthly) : 0;
    const annualRoiMultiple = trainingCost > 0 ? (monthly * 12) / trainingCost : 0;
    return { weeklyHours: hours, weeklyValue: value, monthlyValue: monthly, paybackMonths, annualRoiMultiple };
  }, [breakdown, cohortSize, weeks, hourlyCost]);

  /** Helpers */
  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex((i) => Math.max(i - 1, 0));
  const goTo = (i: number) => setStepIndex(Math.min(Math.max(i, 0), STEPS.length - 1));

  const togglePriority = (k: PriorityKey) => {
    setSelectedPriorities((prev) => {
      const exists = prev.includes(k);
      if (exists) return prev.filter((x) => x !== k);
      if (prev.length >= 3) return [...prev.slice(1), k]; // keep max 3
      return [...prev, k];
    });
  };

  return (
    <div className="min-h-screen">
      {/* HERO image banner */}
      <div className="hero" />

      <main className="container">
        {/* KPIs row */}
        <div className="kpis">
          <div className="kpi">
            <div className="label">Monthly savings</div>
            <div className="value">
              {currencySymbol}
              {Math.round(totals.monthlyValue).toLocaleString()}
            </div>
          </div>
          <div className="kpi">
            <div className="label">Payback</div>
            <div className="value">{totals.paybackMonths.toFixed(1)} months</div>
          </div>
          <div className="kpi">
            <div className="label">Annual ROI</div>
            <div className="value">{totals.annualRoiMultiple.toFixed(1)}×</div>
          </div>
          <div className="kpi">
            <div className="label">Hours saved / week (team)</div>
            <div className="value">{Math.round(totals.weeklyHours).toLocaleString()}</div>
          </div>
        </div>

        {/* Wizard header */}
        <div className="mt-6 card">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">AI at Work — Human Productivity ROI</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-80">Currency</span>
              <select
                className="select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                style={{ width: 120 }}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>

          {/* Stepper */}
          <div className="stepper mt-4">
            {STEPS.map((s, i) => (
              <button
                key={s}
                className={`dot ${i === stepIndex ? "active" : ""}`}
                onClick={() => goTo(i)}
                type="button"
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="stepper-labels">
            {STEPS.map((s, i) => (
              <div key={s} style={{ textAlign: "center" }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Current step card */}
        <div className="mt-4 card">
          {STEPS[stepIndex] === "Team" && (
            <div>
              <h2 className="text-lg font-semibold">Team</h2>
              <p className="opacity-80 mt-2">Set the audience and costs.</p>
              <div className="grid-3 mt-4">
                <div>
                  <label className="text-sm opacity-90">Department</label>
                  <select className="select mt-2" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option>Company-wide</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Customer Support</option>
                    <option>Operations</option>
                    <option>Engineering</option>
                    <option>HR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm opacity-90">Employees in scope</label>
                  <input
                    className="input mt-2"
                    type="number"
                    min={1}
                    value={employees}
                    onChange={(e) => setEmployees(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div>
                  <label className="text-sm opacity-90">Avg. fully-loaded hourly cost</label>
                  <div className="mt-2" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="text-white">{currencySymbol}</span>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      value={hourlyCost}
                      onChange={(e) => setHourlyCost(parseFloat(e.target.value || "0"))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {STEPS[stepIndex] === "Priorities" && (
            <div>
              <h2 className="text-lg font-semibold">Priorities</h2>
              <p className="opacity-80 mt-2">Pick up to three focus areas.</p>
              <div className="check-row mt-4">
                {PRIORITY_OPTIONS.map((p) => (
                  <label key={p.key} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={!!selectedPriorities.includes(p.key)}
                      onChange={() => togglePriority(p.key)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
              <p className="opacity-70 text-sm mt-3">You can select up to 3. Selecting a new one will replace the oldest.</p>
            </div>
          )}

          {STEPS[stepIndex] === "AI Maturity" && (
            <div>
              <h2 className="text-lg font-semibold">AI Maturity</h2>
              <p className="opacity-80 mt-2">
                Slide 1–10 to benchmark current adoption. We estimate time saved per person/week accordingly.
              </p>
              <div className="mt-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={maturity}
                  onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                  style={{ width: "100%" }}
                />
                <div className="flex items-center justify-between mt-2" style={{ fontSize: 12, opacity: 0.9 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
              </div>
              <div className="grid-3 mt-4">
                <div className="card">
                  <div className="opacity-80 text-sm">Maturity level</div>
                  <div className="text-2xl font-bold mt-1">{maturity}/10</div>
                </div>
                <div className="card">
                  <div className="opacity-80 text-sm">Hours saved / person / week</div>
                  <div className="text-2xl font-bold mt-1">{perPersonHours}h</div>
                </div>
                <div className="card">
                  <div className="opacity-80 text-sm">Hours saved / team / week</div>
                  <div className="text-2xl font-bold mt-1">{Math.round(perPersonHours * employees)}h</div>
                </div>
              </div>
            </div>
          )}

          {STEPS[stepIndex] === "Training" && (
            <div>
              <h2 className="text-lg font-semibold">Training</h2>
              <p className="opacity-80 mt-2">Model a simple cohort to kickstart adoption.</p>
              <div className="grid-3 mt-4">
                <div>
                  <label className="text-sm opacity-90">Duration (weeks)</label>
                  <input
                    className="input mt-2"
                    type="number"
                    min={1}
                    value={weeks}
                    onChange={(e) => setWeeks(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div>
                  <label className="text-sm opacity-90">Cohort size</label>
                  <input
                    className="input mt-2"
                    type="number"
                    min={1}
                    value={cohortSize}
                    onChange={(e) => setCohortSize(parseInt(e.target.value || "0", 10))}
                  />
                </div>
                <div className="card">
                  <div className="opacity-80 text-sm">Training cost (est.)</div>
                  <div className="text-2xl font-bold mt-1">
                    {currencySymbol}
                    {Math.round(cohortSize * weeks * 3 * hourlyCost).toLocaleString()}
                  </div>
                  <div className="opacity-75 text-xs mt-1">Assumes ~3h/week guided practice × weeks.</div>
                </div>
              </div>
            </div>
          )}

          {STEPS[stepIndex] === "Results" && (
            <div>
              <h2 className="text-lg font-semibold">Results</h2>
              <p className="opacity-80 mt-2">Weekly breakdown by priority plus roll-ups.</p>

              <table className="results mt-3">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th style={{ width: "45%" }}>Notes</th>
                    <th>Hours / wk</th>
                    <th style={{ textAlign: "right" }}>Value / wk</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row) => (
                    <tr key={row.key}>
                      <td style={{ fontWeight: 600 }}>{row.label}</td>
                      <td className="opacity-80">
                        {
                          {
                            throughput: "Ship faster; reduce cycle time across key workflows.",
                            quality: "Fewer reworks; higher first-pass yield.",
                            onboarding: "Ramp new hires faster with AI-assisted SOPs.",
                            retention: "Lower regretted attrition via better tools & engagement.",
                            upskilling: "Broaden AI competency coverage with playbooks.",
                          }[row.key]
                        }
                      </td>
                      <td>{Math.round(row.hours)}</td>
                      <td style={{ textAlign: "right" }}>
                        {currencySymbol}
                        {Math.round(row.value).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ fontWeight: 700 }}>Total</td>
                    <td />
                    <td style={{ fontWeight: 700 }}>{Math.round(totals.weeklyHours)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {currencySymbol}
                      {Math.round(totals.weeklyValue).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="grid-4 mt-4">
                <div className="card">
                  <div className="opacity-80 text-sm">Monthly savings</div>
                  <div className="text-2xl font-bold mt-1">
                    {currencySymbol}
                    {Math.round(totals.monthlyValue).toLocaleString()}
                  </div>
                </div>
                <div className="card">
                  <div className="opacity-80 text-sm">Payback (months)</div>
                  <div className="text-2xl font-bold mt-1">{totals.paybackMonths.toFixed(1)}</div>
                </div>
                <div className="card">
                  <div className="opacity-80 text-sm">Annual ROI (×)</div>
                  <div className="text-2xl font-bold mt-1">{totals.annualRoiMultiple.toFixed(1)}</div>
                </div>
                <div className="card">
                  <div className="opacity-80 text-sm">Hours saved / wk (team)</div>
                  <div className="text-2xl font-bold mt-1">{Math.round(totals.weeklyHours)}</div>
                </div>
              </div>

              <ul className="mt-4" style={{ lineHeight: 1.5 }}>
                <li>• Map top 3 workflows; ship prompt templates & guardrails within 2 weeks.</li>
                <li>• Launch an “AI Champions” cohort; track AI-in-task usage weekly.</li>
                <li>• Set a competency coverage target (e.g., 60%) and review quarterly ROI.</li>
              </ul>
            </div>
          )}

          {/* Nav */}
          <div className="mt-6 flex items-center justify-between">
            <button className="btn secondary" onClick={back} disabled={stepIndex === 0}>
              Back
            </button>
            <div className="flex items-center gap-2">
              <button className="btn secondary" onClick={() => goTo(0)}>Start Over</button>
              {stepIndex < STEPS.length - 1 ? (
                <button className="btn" onClick={next}>Continue</button>
              ) : (
                <button className="btn">Download PDF</button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
