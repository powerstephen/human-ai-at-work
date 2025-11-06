"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

/** ---------------------------
 * Types & constants
 * --------------------------*/
type Currency = "EUR" | "USD" | "GBP" | "AUD";
type Dept =
  | "Company-wide"
  | "Marketing"
  | "Sales"
  | "Customer Support"
  | "Operations"
  | "Engineering"
  | "HR";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  AUD: "A$",
};

const PRIORITY_META = [
  {
    key: "throughput",
    label: "Throughput",
    note: "Ship faster; reduce cycle time on core workflows.",
  },
  {
    key: "quality",
    label: "Quality",
    note: "Fewer reworks; higher first-pass yield from better prompts/QA.",
  },
  {
    key: "onboarding",
    label: "Onboarding",
    note: "Ramp new hires quicker with curated prompt packs & SOPs.",
  },
  {
    key: "retention",
    label: "Retention",
    note: "Lower regretted attrition via mastery, agency, and better tools.",
  },
  {
    key: "upskilling",
    label: "Upskilling",
    note: "Expand AI competency coverage across managers & ICs.",
  },
] as const;

const MATURITY_LABELS: Record<number, string> = {
  1: "Ad-hoc experiments; big wins from prompt basics + workflow mapping",
  2: "Isolated usage; early playbooks emerging",
  3: "Team champions; usage sporadic",
  4: "Pilot programs; initial QA/guardrails",
  5: "Multi-team adoption; metrics starting to be tracked",
  6: "Standard playbooks; shared prompt library; measured",
  7: "Automations in key workflows; steady ROI",
  8: "Cross-functional coverage; strong governance",
  9: "Most workflows augmented; robust metrics + QA",
  10: "AI-first operations; continuous improvement loop",
};

/** Map maturity → typical hours saved range per employee/week.
 * We bias low at the bottom (still real ~1h/day) and more efficient at the top (less raw hours; higher leverage).
 */
function hoursSavedFromMaturity(maturity: number): number {
  // 1 → 5h/wk, 5 → 6h/wk, 10 → 7h/wk (ceiling); smooth curve
  const base = 5 + (maturity - 1) * (2 / 9);
  return Math.round(base * 10) / 10; // one decimal
}

/** ---------------------------
 * Small UI primitives
 * --------------------------*/
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" className="input" {...props} />;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className="input" {...props} />;
}

/** ---------------------------
 * Main Page
 * --------------------------*/
export default function Page() {
  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Team (Basics)
  const [dept, setDept] = useState<Dept>("Company-wide");
  const [employees, setEmployees] = useState<number>(50);
  const [currency, setCurrency] = useState<Currency>("EUR");

  // Step 2: Priorities (choose up to 3)
  const [selected, setSelected] = useState<string[]>(["throughput", "quality", "onboarding"]);

  // Step 3: AI Maturity (1–10)
  const [maturity, setMaturity] = useState<number>(4);

  // Step 4: Training & Cost
  const [trainingHoursPerEmployee, setTrainingHoursPerEmployee] = useState<number>(8);
  const [programMonths, setProgramMonths] = useState<number>(3);
  const [hourlyCost, setHourlyCost] = useState<number>(40);

  // Derived
  const symbol = CURRENCY_SYMBOL[currency];

  const hoursPerEmployeePerWeek = useMemo(
    () => hoursSavedFromMaturity(maturity),
    [maturity]
  );
  const teamHoursPerWeek = useMemo(
    () => Math.round(hoursPerEmployeePerWeek * employees),
    [hoursPerEmployeePerWeek, employees]
  );
  const teamHoursPerMonth = useMemo(
    () => Math.round(teamHoursPerWeek * 4.33), // avg weeks per month
    [teamHoursPerWeek]
  );
  const monthlyValue = useMemo(
    () => Math.round(teamHoursPerMonth * hourlyCost),
    [teamHoursPerMonth, hourlyCost]
  );

  // Simple per-priority split for demo: weight the selection equally
  const breakdown = useMemo(() => {
    const picks = PRIORITY_META.filter((p) => selected.includes(p.key));
    const per = picks.length > 0 ? teamHoursPerMonth / picks.length : 0;
    return picks.map((p) => ({
      key: p.key,
      label: p.label,
      note: p.note,
      hours: Math.round(per),
      money: Math.round(per * hourlyCost),
    }));
  }, [selected, teamHoursPerMonth, hourlyCost]);

  const paybackMonths = useMemo(() => {
    // Cost ≈ training hours * hourly cost * employees
    const trainingCost =
      trainingHoursPerEmployee * hourlyCost * employees;
    // Value per month = monthlyValue
    if (monthlyValue <= 0) return Infinity;
    return Math.max(0.5, Math.round((trainingCost / monthlyValue) * 10) / 10); // one decimal, min 0.5
  }, [trainingHoursPerEmployee, hourlyCost, employees, monthlyValue]);

  const annualROI = useMemo(() => {
    // naive multiple: (12 * monthlyValue) / trainingCost
    const trainingCost =
      trainingHoursPerEmployee * hourlyCost * employees;
    if (trainingCost <= 0) return 0;
    const mult = (12 * monthlyValue) / trainingCost;
    return Math.round(mult * 10) / 10;
  }, [trainingHoursPerEmployee, hourlyCost, employees, monthlyValue]);

  /** Helpers */
  const canContinue =
    (step === 1 && employees > 0) ||
    (step === 2 && selected.length > 0 && selected.length <= 3) ||
    (step === 3 && maturity >= 1 && maturity <= 10) ||
    (step === 4 && trainingHoursPerEmployee >= 0 && programMonths >= 1);

  function togglePriority(key: string) {
    setSelected((prev) => {
      const exists = prev.includes(key);
      if (exists) return prev.filter((k) => k !== key);
      // max 3
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  }

  function resetAll() {
    setStep(1);
    setDept("Company-wide");
    setEmployees(50);
    setCurrency("EUR");
    setSelected(["throughput", "quality", "onboarding"]);
    setMaturity(4);
    setTrainingHoursPerEmployee(8);
    setProgramMonths(3);
    setHourlyCost(40);
  }

  /** Render */
  return (
    <div className="min-h-screen">
      <div className="px-4 md:px-8 max-w-6xl mx-auto py-6 md:py-10">
        {/* ---------- HERO (replaces old blue box) ---------- */}
        <div className="hero-wrap mb-6 md:mb-8">
          {/* If /hero.png exists in public, this will load. Fallback to solid if it doesn’t. */}
          <Image
            src="/hero.png"
            alt="AI at Work — Brainster"
            fill
            priority
            className="hero-img"
            onError={(e) => {
              // If image fails, keep a nice solid header
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* ---------- KPI Tiles under hero ---------- */}
        <div className="kpis mb-8">
          <div className="kpi">
            <div className="label">Monthly savings</div>
            <div className="value">
              {symbol}
              {monthlyValue.toLocaleString()}
            </div>
          </div>
          <div className="kpi">
            <div className="label">Payback</div>
            <div className="value">{isFinite(paybackMonths) ? `${paybackMonths} months` : "—"}</div>
          </div>
          <div className="kpi">
            <div className="label">Annual ROI</div>
            <div className="value">{annualROI ? `${annualROI}×` : "—"}</div>
          </div>
          <div className="kpi">
            <div className="label">Hours saved / year</div>
            <div className="value">{Math.round(teamHoursPerMonth * 12).toLocaleString()}</div>
          </div>
        </div>

        {/* ---------- Stepper ---------- */}
        <div className="mb-6">
          <div className="stepper">
            <div className="stepper-track">
              <div
                className="stepper-fill"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
            <div className="stepper-dots">
              {[
                { n: 1, label: "Team" },
                { n: 2, label: "Priorities" },
                { n: 3, label: "Maturity" },
                { n: 4, label: "Training" },
                { n: 5, label: "Results" },
              ].map((s) => {
                const state =
                  step === s.n ? "active" : step > s.n ? "done" : "idle";
                return (
                  <div key={s.n} className="step-dot">
                    <div
                      className={[
                        "step-badge",
                        state === "active" && "step-badge--active",
                        state === "done" && "step-badge--done",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {s.n}
                    </div>
                    <div className="step-label">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------- Steps ---------- */}
        <div className="grid grid-cols-1 gap-6">
          {/* Step 1: Team */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Team</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Department">
                  <select
                    className="select"
                    value={dept}
                    onChange={(e) => setDept(e.target.value as Dept)}
                  >
                    {[
                      "Company-wide",
                      "Marketing",
                      "Sales",
                      "Customer Support",
                      "Operations",
                      "Engineering",
                      "HR",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Employees in scope">
                  <NumberInput
                    min={1}
                    step={1}
                    value={employees}
                    onChange={(e) => setEmployees(Number(e.target.value))}
                  />
                </Field>

                <Field label="Currency">
                  <div className="flex flex-wrap gap-2">
                    {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`btn ${
                          currency === c
                            ? "btn-primary"
                            : "bg-white text-[var(--ink)] border border-gray-200"
                        }`}
                        title={c}
                      >
                        {c === "AUD" ? "A$" : CURRENCY_SYMBOL[c]} {c}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button className="btn btn-ghost" onClick={resetAll}>
                  Start over
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!canContinue}
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Priorities */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-2">Priorities</h2>
              <p className="text-[var(--muted)] mb-4">
                Pick up to <b>three</b> areas to focus your business case.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRIORITY_META.map((p) => {
                  const checked = selected.includes(p.key);
                  const disabled = !checked && selected.length >= 3;
                  return (
                    <label
                      key={p.key}
                      className={`checkbox card p-4 cursor-pointer ${
                        checked
                          ? "ring-2 ring-[var(--brand-blue)]"
                          : "hover:border-[var(--brand-blue)]/40"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => togglePriority(p.key)}
                      />
                      <div>
                        <div className="font-medium">{p.label}</div>
                        <div className="text-sm text-[var(--muted)]">
                          {p.note}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  className="btn bg-white text-[var(--ink)] border border-gray-200"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!canContinue}
                  onClick={() => setStep(3)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Maturity */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-2">AI Maturity</h2>
              <p className="text-[var(--muted)] mb-4">
                Slide to benchmark your current AI adoption. We’ll infer
                realistic time savings per employee.
              </p>

              {/* Slider row */}
              <div className="mb-3">
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={maturity}
                  onChange={(e) => setMaturity(Number(e.target.value))}
                  className="w-full accent-[var(--brand-blue)]"
                />
                <div className="mt-2 flex justify-between text-xs text-[var(--muted)]">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className={`${
                        maturity === i + 1 ? "text-[var(--ink)] font-semibold" : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>

              {/* Maturity explanation + Hours box */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="text-sm text-[var(--muted)] mb-1">
                      Selected maturity description
                    </div>
                    <div className="font-medium text-[var(--ink)]">
                      {MATURITY_LABELS[maturity as 1]}
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#eef2ff] border border-[#cfd8ff]">
                  <div className="text-sm text-[var(--ink)]/80 mb-1">
                    Estimated hours saved
                  </div>
                  <div className="text-2xl font-bold text-[var(--ink)]">
                    {hoursPerEmployeePerWeek}h / employee / week
                  </div>
                  <div className="text-sm text-[var(--ink)]/70 mt-1">
                    Team total: <b>{teamHoursPerWeek}h / week</b>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  className="btn bg-white text-[var(--ink)] border border-gray-200"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!canContinue}
                  onClick={() => setStep(4)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Training */}
          {step === 4 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-2">Training</h2>
              <p className="text-[var(--muted)] mb-4">
                Combine training time, cost, and program duration to estimate
                payback and ROI.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <Field label="Training hours / employee">
                  <NumberInput
                    min={0}
                    step={1}
                    value={trainingHoursPerEmployee}
                    onChange={(e) =>
                      setTrainingHoursPerEmployee(Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Program duration (months)">
                  <NumberInput
                    min={1}
                    step={1}
                    value={programMonths}
                    onChange={(e) => setProgramMonths(Number(e.target.value))}
                  />
                </Field>
                <Field label="Avg hourly cost">
                  <NumberInput
                    min={1}
                    step={1}
                    value={hourlyCost}
                    onChange={(e) => setHourlyCost(Number(e.target.value))}
                  />
                </Field>
                <Field label="Currency">
                  <div className="flex flex-wrap gap-2">
                    {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`btn ${
                          currency === c
                            ? "btn-primary"
                            : "bg-white text-[var(--ink)] border border-gray-200"
                        }`}
                      >
                        {c === "AUD" ? "A$" : CURRENCY_SYMBOL[c]} {c}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  className="btn bg-white text-[var(--ink)] border border-gray-200"
                  onClick={() => setStep(3)}
                >
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!canContinue}
                  onClick={() => setStep(5)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Results */}
          {step === 5 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-1">Results</h2>
              <p className="text-[var(--muted)] mb-4">
                A concise business case you can screenshot or export.
              </p>

              {/* Headline numbers */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs text-[var(--muted)] mb-1">
                    Monthly savings
                  </div>
                  <div className="text-xl font-semibold text-[var(--ink)]">
                    {symbol}
                    {monthlyValue.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs text-[var(--muted)] mb-1">Payback</div>
                  <div className="text-xl font-semibold text-[var(--ink)]">
                    {isFinite(paybackMonths) ? `${paybackMonths} months` : "—"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs text-[var(--muted)] mb-1">
                    Annual ROI
                  </div>
                  <div className="text-xl font-semibold text-[var(--ink)]">
                    {annualROI ? `${annualROI}×` : "—"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-xs text-[var(--muted)] mb-1">
                    Hours saved / year
                  </div>
                  <div className="text-xl font-semibold text-[var(--ink)]">
                    {Math.round(teamHoursPerMonth * 12).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="rounded-xl border border-[rgba(51,102,254,0.18)] overflow-hidden">
                <div className="results-head py-3 bg-[#eef2ff]">
                  <div>Priority</div>
                  <div>Notes</div>
                  <div className="text-right">Hours / month</div>
                  <div className="text-right">Value / month</div>
                </div>
                {breakdown.map((row, i) => (
                  <div key={row.key} className="results-row">
                    <div className="results-area">{row.label}</div>
                    <div className="results-note">{row.note}</div>
                    <div className="results-hours">{row.hours.toLocaleString()}</div>
                    <div className="results-money">
                      {symbol}
                      {row.money.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="results-row font-semibold">
                  <div className="results-area">Total</div>
                  <div />
                  <div className="results-hours">
                    {teamHoursPerMonth.toLocaleString()}
                  </div>
                  <div className="results-money">
                    {symbol}
                    {monthlyValue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-sm font-medium text-[var(--ink)] mb-1">
                    Summary
                  </div>
                  <ul className="list-disc pl-5 text-[var(--ink)]/80 text-[15px] space-y-1">
                    <li>
                      {dept} program covering <b>{employees}</b> employees.
                    </li>
                    <li>
                      AI maturity <b>{maturity}</b> → ~
                      <b>{hoursPerEmployeePerWeek}h</b>/employee/week saved.
                    </li>
                    <li>
                      Payback in <b>{isFinite(paybackMonths) ? paybackMonths : "—"}</b> months; annual ROI{" "}
                      <b>{annualROI ? `${annualROI}×` : "—"}</b>.
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="text-sm font-medium text-[var(--ink)] mb-1">
                    Suggested next steps
                  </div>
                  <ul className="list-disc pl-5 text-[var(--ink)]/80 text-[15px] space-y-1">
                    <li>
                      Map top 3 workflows for {dept}; ship prompt packs + QA in 2 weeks.
                    </li>
                    <li>
                      Launch “AI Champions” cohort; track usage → retention/cycle-time.
                    </li>
                    <li>
                      Set competency coverage to 60%+; review ROI quarterly.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  className="btn bg-white text-[var(--ink)] border border-gray-200"
                  onClick={() => setStep(4)}
                >
                  Back
                </button>
                <button className="btn btn-primary" onClick={resetAll}>
                  Start over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
