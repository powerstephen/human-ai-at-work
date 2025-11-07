"use client";

import { useMemo, useState } from "react";
import BrandHero from "../components/BrandHero";

type Currency = "EUR" | "USD" | "GBP" | "AUD";
type Department =
  | "Company-wide"
  | "Marketing"
  | "Sales"
  | "Customer Support"
  | "Operations"
  | "Engineering"
  | "HR";

const BRAND = "#3366fe";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  AUD: "A$",
};

const STEP_LABELS = [
  "Basics",
  "AI Maturity",
  "Priorities",
  "Throughput",
  "Retention",
  "Upskilling",
  "Results",
] as const;

export default function Page() {
  // Step navigation
  const [step, setStep] = useState(0);

  // Basics
  const [department, setDepartment] = useState<Department>("Company-wide");
  const [headcount, setHeadcount] = useState<number>(150);
  const [currency, setCurrency] = useState<Currency>("EUR");
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [programMonths, setProgramMonths] = useState<number>(3);

  // AI maturity (1–10)
  const [maturity, setMaturity] = useState<number>(4);

  // Priorities (select 3)
  const PRIORITY_OPTIONS = [
    { key: "throughput", label: "Throughput (cycle time)" },
    { key: "quality", label: "Quality (first-pass yield)" },
    { key: "onboarding", label: "Onboarding speed" },
    { key: "retention", label: "Retention" },
    { key: "upskilling", label: "Upskilling coverage" },
  ] as const;
  type PriorityKey = (typeof PRIORITY_OPTIONS)[number]["key"];
  const [selected, setSelected] = useState<PriorityKey[]>(["throughput", "retention", "upskilling"]);

  // Config inputs (simple but realistic)
  const [throughputHours, setThroughputHours] = useState<number>(0); // auto from maturity
  const [retentionRateDelta, setRetentionRateDelta] = useState<number>(5); // points
  const [upskillingCoverage, setUpskillingCoverage] = useState<number>(60); // %

  // Derived: hourly cost & team monthly hours
  const hourlyCost = useMemo(() => (avgSalary / 12) / 160, [avgSalary]); // 160 hours/month
  const teamHoursPerMonth = useMemo(() => headcount * 160, [headcount]);

  // Auto-map maturity → productivity hours saved per employee / week
  const maturityWeeklyHours = useMemo(() => {
    // Linear mapping: 1 → 5h/week, 10 → 1h/week (early wins larger)
    const max = 5;
    const min = 1;
    const span = max - min;                 // 4
    const pct = (maturity - 1) / 9;         // 0..1
    const hours = max - pct * span;         // 5..1
    return Number(hours.toFixed(1));
  }, [maturity]);

  // Keep throughputHours synced with maturity
  const effectiveThroughputHours = useMemo(() => {
    const base = maturityWeeklyHours;
    return Math.max(base, throughputHours || 0); // allow manual increase, never below base
  }, [maturityWeeklyHours, throughputHours]);

  // Priority selection (max 3)
  const togglePriority = (k: PriorityKey) => {
    setSelected((prev) => {
      if (prev.includes(k)) return prev.filter((x) => x !== k);
      if (prev.length >= 3) return [...prev.slice(1), k];
      return [...prev, k];
    });
  };

  // Simple valuation per priority (demo math)
  const monthlySavings = useMemo(() => {
    const sym = CURRENCY_SYMBOL[currency];

    // Throughput: maturity-driven hours saved per employee per week
    const hasThroughput = selected.includes("throughput");
    const thrHoursTeamPerMonth =
      hasThroughput ? effectiveThroughputHours * 4 * headcount : 0;
    const thrValue = thrHoursTeamPerMonth * hourlyCost;

    // Retention: delta points * annual attrition cost per head → monthly
    const hasRetention = selected.includes("retention");
    const attritionCostPerHead = avgSalary * 0.6; // assume 60% of salary
    const baselineAttrition = 18; // %
    const improved = Math.max(0, baselineAttrition - retentionRateDelta);
    const retainedPoints = hasRetention ? retainedDelta(baselineAttrition, improved) : 0;
    const retainedHeadsPerYear = (retainedPoints / 100) * headcount;
    const retAnnual = retainedHeadsPerYear * attritionCostPerHead;
    const retMonthly = retAnnual / 12;

    // Upskilling: coverage * 0.5h/week uplift per covered employee
    const hasUpskill = selected.includes("upskilling");
    const covered = (upskillingCoverage / 100) * headcount;
    const upHours = hasUpskill ? covered * 0.5 * 4 : 0;
    const upValue = upHours * hourlyCost;

    const total = thrValue + retMonthly + upValue;

    return {
      sym,
      thr: thrValue,
      ret: retMonthly,
      up: upValue,
      total,
      hoursBreakdown: {
        throughput: thrHoursTeamPerMonth,
        upskilling: upHours,
      },
    };
  }, [
    currency,
    selected,
    effectiveThroughputHours,
    headcount,
    hourlyCost,
    avgSalary,
    retentionRateDelta,
    upskillingCoverage,
  ]);

  function retainedDelta(base: number, improved: number) {
    return Math.max(0, base - improved);
  }

  // Step rendering helpers
  const StepHeader = () => (
    <div className="container-narrow mt-4">
      <div className="stepper">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`step-pill ${i === step ? "active" : ""}`}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
              {i + 1}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const Nav = () => (
    <div className="container-narrow flex items-center justify-between gap-3 mt-6 mb-2">
      <button
        className="btn btn-ghost"
        onClick={() => setStep((s) => Math.max(0, s - 1))}
        disabled={step === 0}
      >
        ← Back
      </button>
      <button
        className="btn btn-primary"
        onClick={() => setStep((s) => Math.min(STEP_LABELS.length - 1, s + 1))}
      >
        {step === STEP_LABELS.length - 1 ? "Finish" : "Continue →"}
      </button>
    </div>
  );

  return (
    <div className="pb-16">
      {/* HERO */}
      <BrandHero />

      {/* STEPPER */}
      <StepHeader />

      {/* STEP CARDS */}
      <div className="container-narrow mt-4">
        {/* Basics */}
        {step === 0 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-4">Team</h2>
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="label">Department</label>
                <select
                  className="input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
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
                <p className="help">Choose a function or “Company-wide”.</p>
              </div>

              <div>
                <label className="label">Employees in scope</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(parseInt(e.target.value || "0", 10))}
                />
              </div>

              <div>
                <label className="label">Currency</label>
                <div className="flex flex-wrap gap-2">
                  {(["EUR", "USD", "GBP", "AUD"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`btn ${c === currency ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setCurrency(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-6">
              <div>
                <label className="label">
                  Average annual salary ({CURRENCY_SYMBOL[currency]})
                </label>
                <input
                  className="input"
                  type="number"
                  value={avgSalary}
                  onChange={(e) => setAvgSalary(parseInt(e.target.value || "0", 10))}
                />
              </div>
              <div>
                <label className="label">
                  Training per employee ({CURRENCY_SYMBOL[currency]})
                </label>
                <input
                  className="input"
                  type="number"
                  value={trainingPerEmployee}
                  onChange={(e) =>
                    setTrainingPerEmployee(parseInt(e.target.value || "0", 10))
                  }
                />
              </div>
              <div>
                <label className="label">Program duration (months)</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={programMonths}
                  onChange={(e) =>
                    setProgramMonths(parseInt(e.target.value || "0", 10))
                  }
                />
              </div>
            </div>
            <Nav />
          </section>
        )}

        {/* AI Maturity */}
        {step === 1 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-4">AI Maturity</h2>
            <p className="text-slate-600 mb-4">
              Benchmark where you are today. The maturity score maps to an estimated
              weekly hours-saved potential per employee and auto-feeds the Throughput step.
            </p>

            <div className="grid gap-4 md:grid-cols-[1fr_280px] items-start">
              <div>
                <label className="label">Select level (1–10)</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={maturity}
                  onChange={(e) => setMaturity(parseInt(e.target.value, 10))}
                  className="w-full accent-[color:var(--brand)]"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-6 text-center ${
                        maturity === i + 1 ? "text-[color:var(--brand)] font-semibold" : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-sm text-slate-600">Summary</div>
                  <div className="mt-1 font-medium">
                    {maturity <= 3 &&
                      "Early: ad-hoc experiments; big wins from prompt basics + workflow mapping."}
                    {maturity >= 4 && maturity <= 7 &&
                      "Scaling: growing adoption; playbooks, shared prompts, QA/guardrails matter."}
                    {maturity >= 8 &&
                      "Embedded: most workflows augmented; focus on quality, compliance, and speed."}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Estimated hours saved
                </div>
                <div className="mt-2 text-3xl font-semibold">
                  {maturityWeeklyHours}h<span className="text-base font-normal"> / person / week</span>
                </div>
                <div className="mt-2 text-slate-600 text-sm">
                  Team per month:{" "}
                  <span className="font-medium">
                    {Math.round(maturityWeeklyHours * 4 * headcount)}h
                  </span>
                </div>
              </div>
            </div>

            <Nav />
          </section>
        )}

        {/* Priorities */}
        {step === 2 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-4">Pick top 3 priorities</h2>
            <p className="text-slate-600 mb-3">
              Choose the outcomes that matter most. These drive the configuration steps.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {PRIORITY_OPTIONS.map((p) => {
                const active = selected.includes(p.key);
                return (
                  <button
                    type="button"
                    key={p.key}
                    onClick={() => togglePriority(p.key)}
                    className={`btn ${active ? "btn-primary" : "btn-ghost"} justify-start`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <p className="help">You can select up to three.</p>
            <Nav />
          </section>
        )}

        {/* Throughput (auto seeded by maturity, but editable) */}
        {step === 3 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-4">Throughput</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Hours saved per employee per week</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={effectiveThroughputHours}
                  onChange={(e) => setThroughputHours(parseFloat(e.target.value || "0"))}
                />
                <p className="help">
                  Auto-derived from AI maturity ({maturityWeeklyHours}h), but you can
                  increase if you already have strong workflow candidates.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-500">Team / month</div>
                <div className="mt-1 text-2xl font-semibold">
                  {Math.round(effectiveThroughputHours * 4 * headcount)}h
                </div>
                <div className="text-sm text-slate-600 mt-1">
                  Est. value:{" "}
                  <span className="font-medium">
                    {CURRENCY_SYMBOL[currency]}
                    {Math.round(effectiveThroughputHours * 4 * headcount * hourlyCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <Nav />
          </section>
        )}

        {/* Retention */}
        {step === 4 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-4">Retention</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Expected reduction in regretted attrition (pp)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={20}
                  value={retentionRateDelta}
                  onChange={(e) => setRetentionRateDelta(parseFloat(e.target.value || "0"))}
                />
                <p className="help">
                  Points = percentage points. Example: 18% → 13% is 5 points.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-500">Est. monthly value</div>
                <div className="mt-1 text-2xl font-semibold">
                  {CURRENCY_SYMBOL[currency]}
                  {Math.round(monthlySavings.ret).toLocaleString()}
                </div>
              </div>
            </div>
            <Nav />
          </section>
        )}

        {/* Upskilling */}
        {step === 5 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-4">Upskilling</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="label">Coverage target (% of team trained)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  max={100}
                  value={upskillingCoverage}
                  onChange={(e) => setUpskillingCoverage(parseFloat(e.target.value || "0"))}
                />
                <p className="help">
                  Quick-win target is usually 50–70% coverage in the first quarter.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs uppercase tracking-wide text-slate-500">Est. monthly value</div>
                <div className="mt-1 text-2xl font-semibold">
                  {CURRENCY_SYMBOL[currency]}
                  {Math.round(monthlySavings.up).toLocaleString()}
                </div>
              </div>
            </div>
            <Nav />
          </section>
        )}

        {/* Results */}
        {step === 6 && (
          <section className="card card-pad">
            <h2 className="text-xl font-semibold mb-5">Results</h2>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="kpi">
                <div className="label">Monthly savings</div>
                <div className="value">
                  {CURRENCY_SYMBOL[currency]}
                  {Math.round(monthlySavings.total).toLocaleString()}
                </div>
              </div>
              <div className="kpi">
                <div className="label">Payback</div>
                <div className="value">
                  {/* Program cost: training per employee * headcount spread across months */}
                  {calcPaybackMonths({
                    headcount,
                    trainingPerEmployee,
                    programMonths,
                    monthlyReturn: monthlySavings.total,
                  })}{" "}
                  months
                </div>
              </div>
              <div className="kpi">
                <div className="label">Annual ROI</div>
                <div className="value">
                  {calcAnnualRoiMultiple({
                    monthlyReturn: monthlySavings.total,
                    headcount,
                    trainingPerEmployee,
                    programMonths,
                  }).toFixed(1)}{" "}
                  ×
                </div>
              </div>
              <div className="kpi">
                <div className="label">Hours saved / year</div>
                <div className="value">
                  {Math.round(
                    (monthlySavings.hoursBreakdown.throughput +
                      monthlySavings.hoursBreakdown.upskilling) * 12
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left p-3">Priority</th>
                    <th className="text-left p-3">Why it matters</th>
                    <th className="text-right p-3">Hours / mo</th>
                    <th className="text-right p-3">Value / mo</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <Row
                    label="Throughput"
                    why="Ship faster; reduce cycle time"
                    hours={monthlySavings.hoursBreakdown.throughput}
                    value={monthlySavings.thr}
                    sym={monthlySavings.sym}
                  />
                  <Row
                    label="Retention"
                    why="Reduce regretted attrition"
                    hours={0}
                    value={monthlySavings.ret}
                    sym={monthlySavings.sym}
                  />
                  <Row
                    label="Upskilling"
                    why="Expand AI competency coverage"
                    hours={monthlySavings.hoursBreakdown.upskilling}
                    value={monthlySavings.up}
                    sym={monthlySavings.sym}
                  />
                  <tr className="border-t">
                    <td className="p-3 font-semibold">Total</td>
                    <td className="p-3"></td>
                    <td className="p-3 text-right font-semibold">
                      {Math.round(
                        monthlySavings.hoursBreakdown.throughput +
                          monthlySavings.hoursBreakdown.upskilling
                      ).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {monthlySavings.sym}
                      {Math.round(monthlySavings.total).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-slate-600">
              <p className="font-medium">Next steps</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Map top 3 workflows; ship prompt templates & guardrails.</li>
                <li>Launch “AI Champions” cohort; track AI-in-task usage.</li>
                <li>Quarterly ROI review tied to throughput/quality metrics.</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  why,
  hours,
  value,
  sym,
}: {
  label: string;
  why: string;
  hours: number;
  value: number;
  sym: string;
}) {
  return (
    <tr className="border-t">
      <td className="p-3">{label}</td>
      <td className="p-3 text-slate-600">{why}</td>
      <td className="p-3 text-right">{Math.round(hours).toLocaleString()}</td>
      <td className="p-3 text-right">
        {sym}
        {Math.round(value).toLocaleString()}
      </td>
    </tr>
  );
}

function calcPaybackMonths({
  headcount,
  trainingPerEmployee,
  programMonths,
  monthlyReturn,
}: {
  headcount: number;
  trainingPerEmployee: number;
  programMonths: number;
  monthlyReturn: number;
}) {
  const totalCost = headcount * trainingPerEmployee;
  const monthlyCost = totalCost / Math.max(1, programMonths);
  const netPerMonth = monthlyReturn - monthlyCost;
  if (netPerMonth <= 0) return 99;
  return Math.max(1, Math.round(totalCost / netPerMonth));
}

function calcAnnualRoiMultiple({
  monthlyReturn,
  headcount,
  trainingPerEmployee,
  programMonths,
}: {
  monthlyReturn: number;
  headcount: number;
  trainingPerEmployee: number;
  programMonths: number;
}) {
  const totalCost = headcount * trainingPerEmployee;
  const annualReturn = monthlyReturn * 12;
  const programCost = totalCost; // one-off
  if (programCost <= 0) return 0;
  return annualReturn / programCost;
}
