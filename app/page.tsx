"use client";

import React, { useMemo, useState } from "react";

/* ----------------------------- Types & helpers ---------------------------- */

type CurrencyCode = "EUR" | "USD" | "GBP" | "AUD";
type Dept =
  | "Company-wide"
  | "Marketing"
  | "Sales"
  | "Customer Support"
  | "Operations"
  | "Engineering"
  | "HR";

type Priority = "throughput" | "quality" | "onboarding" | "retention" | "upskilling";

const CURRENCIES: { code: CurrencyCode; symbol: string }[] = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
  { code: "AUD", symbol: "A$" },
];

const currencySymbol = (c: CurrencyCode) =>
  CURRENCIES.find(x => x.code === c)?.symbol ?? "€";

const fmtMoney = (n: number, c: CurrencyCode) =>
  `${currencySymbol(c)}${Math.round(n).toLocaleString()}`;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/* ------------------------------- Maturity meta ---------------------------- */

const MATURITY_LABELS: Record<number, string> = {
  1: "Early: ad-hoc experiments; big wins from prompt basics + mapping workflows",
  2: "Exploring: scattered usage; first internal demos",
  3: "Pockets of use: a few power users; no shared patterns",
  4: "Emerging: templates appear; limited QA/guardrails",
  5: "Forming: shared prompts; some role-specific workflows",
  6: "Operational: playbooks + light automation in key tasks",
  7: "Scaling: cross-team patterns; usage tracked",
  8: "Integrated: tools embedded in core processes",
  9: "Optimized: advanced automation with QA & metrics",
  10: "Systematic: AI in most workflows; governance + reviews",
};

/** Map maturity (1–10) → indicative weekly hours saved / employee */
const maturityToHours = (lvl: number) => {
  // You asked for: low end ≈ 5 hrs/week; high end ≈ 1 hr/week (more optimization, less raw save)
  const l = clamp(lvl, 1, 10);
  const max = 5; // at level 1
  const min = 1; // at level 10
  // inverse curve
  const span = max - min; // 4
  return max - ((l - 1) / 9) * span;
};

/* ------------------------------ UI primitives ---------------------------- */

const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 ${className}`}>{children}</div>
);

const Row: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = "", children }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>{children}</div>
);

const Label: React.FC<React.PropsWithChildren> = ({ children }) => (
  <label className="block text-slate-700 font-medium mb-2">{children}</label>
);

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement>
> = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-[#3366fe] ${props.className ?? ""}`}
  />
);

const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement>
> = (props) => (
  <select
    {...props}
    className={`w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-[#3366fe] ${props.className ?? ""}`}
  />
);

const StepButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", ...rest }) => (
  <button
    {...rest}
    className={`px-5 py-3 rounded-xl bg-[#3366fe] text-white shadow hover:opacity-95 disabled:opacity-50 ${className}`}
  />
);

const GhostButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", ...rest }) => (
  <button
    {...rest}
    className={`px-5 py-3 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 ${className}`}
  />
);

/* ------------------------------- Main page -------------------------------- */

export default function Page() {
  /* ----------- state ----------- */
  const [step, setStep] = useState(1);

  // Step 1 – basics
  const [department, setDepartment] = useState<Dept>("Company-wide");
  const [headcount, setHeadcount] = useState<number>(150);
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [programMonths, setProgramMonths] = useState<number>(3);

  // Step 2 – maturity (1–10)
  const [maturity, setMaturity] = useState<number>(3);

  // Step 3 – priorities (pick up to 3)
  const [priorities, setPriorities] = useState<Priority[]>(["throughput", "retention", "upskilling"]);

  // Step 4–6 configuration
  const [throughputPct, setThroughputPct] = useState<number>(15); // % faster cycle time
  const [retentionPct, setRetentionPct] = useState<number>(8); // % attrition reduction for in-scope
  const [upskillCoveragePct, setUpskillCoveragePct] = useState<number>(50); // % of team reaching competence

  /* ----------- derived ----------- */

  const hoursPerEmployee = useMemo(() => maturityToHours(maturity), [maturity]);
  const teamHoursPerWeek = useMemo(() => hoursPerEmployee * headcount, [hoursPerEmployee, headcount]);
  const hourlyCost = useMemo(() => avgSalary / (52 * 37.5), [avgSalary]); // salary → hourly (@37.5h week)

  // Very simple value mapping by priority, scaled off maturity hours
  const valueByPriority = useMemo(() => {
    const base = hoursPerEmployee * headcount * hourlyCost; // weekly value
    const picks = new Set(priorities);

    const vThroughput = picks.has("throughput") ? base * (throughputPct / 100) : 0;
    const vQuality = picks.has("quality") ? base * 0.18 : 0;
    const vOnboard = picks.has("onboarding") ? base * 0.22 : 0;
    const vRetention =
      picks.has("retention") ? (retentionPct / 100) * (headcount * 0.18) * (avgSalary * 0.5) / 52 : 0; // weekly
    const vUpskill = picks.has("upskilling") ? base * (upskillCoveragePct / 100) * 0.12 : 0;

    const map: Record<Priority, number> = {
      throughput: vThroughput,
      quality: vQuality,
      onboarding: vOnboard,
      retention: vRetention,
      upskilling: vUpskill,
    };
    return map;
  }, [priorities, hoursPerEmployee, headcount, hourlyCost, throughputPct, retentionPct, upskillCoveragePct, avgSalary]);

  const weeklyValueTotal = useMemo(
    () => (Object.values(valueByPriority).reduce((a, b) => a + b, 0)),
    [valueByPriority]
  );
  const monthlyValue = weeklyValueTotal * 4.33;
  const programCost = trainingPerEmployee * headcount;
  const paybackMonths = programCost > 0 ? programCost / monthlyValue : Infinity;
  const annualROI = programCost > 0 ? (monthlyValue * 12) / programCost : 0;

  /* ----------- helpers ----------- */

  const allSteps = [
    "Basics",
    "AI Maturity",
    "Priorities",
    "Throughput",
    "Retention",
    "Upskilling",
    "Results",
  ];

  const togglePriority = (p: Priority) =>
    setPriorities(prev => (prev.includes(p) ? prev.filter(x => x !== p) : prev.length >= 3 ? prev : [...prev, p]));

  /* ------------------------------- Render ---------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* (Optional) Hero image – keep this simple and non-blocking */}
      <div className="max-w-6xl mx-auto p-4 pt-6">
        <img
          src="/hero.png"
          alt="AI at Work"
          className="w-full h-48 md:h-56 object-cover rounded-2xl border border-slate-200"
          onError={(e) => {
            // if missing, hide gracefully
            const el = e.currentTarget;
            el.style.display = "none";
          }}
        />
      </div>

      {/* Progress */}
      <div className="max-w-6xl mx-auto px-4">
        <Card className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-3">
            {allSteps.map((title, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div key={title} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full
                    ${active ? "bg-[#3366fe] text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"}`}
                  >
                    {n}
                  </span>
                  <span className={`text-sm md:text-base ${active ? "text-slate-900 font-semibold" : "text-slate-600"}`}>
                    {title /* already without 'Configure:' */}
                  </span>
                  {n !== allSteps.length && <span className="mx-2 text-slate-300">•</span>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Step body */}
      <div className="max-w-6xl mx-auto p-4 pb-16">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Team</h2>

            <Row>
              <div>
                <Label>Department</Label>
                <Select
                  value={department}
                  onChange={e => setDepartment(e.target.value as Dept)}
                >
                  {["Company-wide", "Marketing", "Sales", "Customer Support", "Operations", "Engineering", "HR"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
                <p className="text-sm text-slate-500 mt-2">Choose a function or “Company-wide”.</p>
              </div>

              <div>
                <Label>Employees in scope</Label>
                <Input
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={e => setHeadcount(Number(e.target.value || 0))}
                />
              </div>

              <div>
                <Label>Currency</Label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code)}
                      aria-pressed={currency === c.code}
                      className={`px-4 py-2 rounded-full border transition
                        ${currency === c.code ? "bg-[#3366fe] text-white border-[#3366fe]" : "bg-white text-slate-700 border-slate-200"}`}
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>
            </Row>

            <hr className="my-6 border-slate-200" />

            <h3 className="text-slate-900 font-semibold mb-4">Program cost assumptions</h3>
            <Row>
              <div>
                <Label>Average annual salary ({currencySymbol(currency)})</Label>
                <Input
                  type="number"
                  min={0}
                  value={avgSalary}
                  onChange={e => setAvgSalary(Number(e.target.value || 0))}
                />
              </div>
              <div>
                <Label>Training per employee ({currencySymbol(currency)})</Label>
                <Input
                  type="number"
                  min={0}
                  value={trainingPerEmployee}
                  onChange={e => setTrainingPerEmployee(Number(e.target.value || 0))}
                />
              </div>
              <div>
                <Label>Program duration (months)</Label>
                <Input
                  type="number"
                  min={1}
                  value={programMonths}
                  onChange={e => setProgramMonths(Number(e.target.value || 1))}
                />
              </div>
            </Row>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => { /* noop on first step */ }} className="invisible">Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(2)}>Continue →</StepButton>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 2: AI MATURITY */}
        {step === 2 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">AI Maturity</h2>

            <div className="md:flex md:items-start md:gap-8">
              <div className="flex-1">
                <Label>Where are you today?</Label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={maturity}
                  onChange={e => setMaturity(Number(e.target.value))}
                  className="w-full accent-[#3366fe]"
                />
                {/* tick labels 1..10 */}
                <div className="mt-2 grid grid-cols-10 text-xs text-slate-500">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <div key={n} className={`text-center ${n === maturity ? "text-slate-900 font-semibold" : ""}`}>{n}</div>
                  ))}
                </div>

                <p className="mt-4 text-slate-700">{MATURITY_LABELS[maturity as 1]}</p>
              </div>

              <Card className="p-4 mt-6 md:mt-0 w-full md:w-80">
                <h4 className="text-slate-900 font-semibold mb-2">Estimated weekly save</h4>
                <div className="text-sm text-slate-600">Per employee</div>
                <div className="text-2xl font-semibold text-slate-900 mb-3">
                  {hoursPerEmployee.toFixed(1)} hrs
                </div>
                <div className="text-sm text-slate-600">Whole team</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {Math.round(teamHoursPerWeek).toLocaleString()} hrs
                </div>
              </Card>
            </div>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => setStep(1)}>← Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(3)}>Continue →</StepButton>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 3: PRIORITIES */}
        {step === 3 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Priorities (pick up to 3)</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(
                [
                  { key: "throughput", label: "Throughput" },
                  { key: "quality", label: "Quality" },
                  { key: "onboarding", label: "Onboarding" },
                  { key: "retention", label: "Retention" },
                  { key: "upskilling", label: "Upskilling" },
                ] as { key: Priority; label: string }[]
              ).map(p => {
                const on = priorities.includes(p.key);
                const disabled = !on && priorities.length >= 3;
                return (
                  <button
                    key={p.key}
                    onClick={() => togglePriority(p.key)}
                    disabled={disabled}
                    className={`rounded-xl border px-4 py-3 text-left transition
                      ${on ? "bg-[#eaf0ff] border-[#3366fe] text-slate-900" : "bg-white border-slate-200 text-slate-700"}
                      ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
                  >
                    <span className="font-medium">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-slate-500 mt-3">Tip: Your next steps will adapt to what you pick here.</p>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => setStep(2)}>← Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(4)}>Continue →</StepButton>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 4: THROUGHPUT */}
        {step === 4 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Throughput</h2>
            <Row>
              <div className="md:col-span-2">
                <Label>Expected cycle-time improvement (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={throughputPct}
                  onChange={e => setThroughputPct(Number(e.target.value || 0))}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Example: content production, case resolution, lead follow-up.
                </p>
              </div>
            </Row>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => setStep(3)}>← Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(5)}>Continue →</StepButton>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 5: RETENTION */}
        {step === 5 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Retention</h2>
            <Row>
              <div>
                <Label>Attrition reduction for in-scope team (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={retentionPct}
                  onChange={e => setRetentionPct(Number(e.target.value || 0))}
                />
              </div>
            </Row>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => setStep(4)}>← Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(6)}>Continue →</StepButton>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 6: UPSKILLING */}
        {step === 6 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Upskilling</h2>
            <Row>
              <div className="md:col-span-2">
                <Label>Competency coverage target (% of team reaching “confident”)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={upskillCoveragePct}
                  onChange={e => setUpskillCoveragePct(Number(e.target.value || 0))}
                />
                <p className="text-sm text-slate-500 mt-2">Benchmark: aim for 50–70% in first 90 days.</p>
              </div>
            </Row>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => setStep(5)}>← Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(7)}>See results →</StepButton>
              </div>
            </div>
          </Card>
        )}

        {/* STEP 7: RESULTS */}
        {step === 7 && (
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Results</h2>

            {/* Headline KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 border-[#e3e9ff]">
                <div className="text-slate-500 text-sm">Monthly savings</div>
                <div className="text-2xl font-semibold text-slate-900">{fmtMoney(monthlyValue, currency)}</div>
              </Card>
              <Card className="p-4 border-[#e3e9ff]">
                <div className="text-slate-500 text-sm">Payback (months)</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {Number.isFinite(paybackMonths) ? paybackMonths.toFixed(1) : "–"}
                </div>
              </Card>
              <Card className="p-4 border-[#e3e9ff]">
                <div className="text-slate-500 text-sm">Annual ROI (×)</div>
                <div className="text-2xl font-semibold text-slate-900">{annualROI.toFixed(2)}×</div>
              </Card>
              <Card className="p-4 border-[#e3e9ff]">
                <div className="text-slate-500 text-sm">Hours saved / year</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {(teamHoursPerWeek * 52).toLocaleString()}
                </div>
              </Card>
            </div>

            {/* Breakdown table */}
            <div className="overflow-hidden rounded-2xl border border-[#e3e9ff]">
              <div className="grid grid-cols-12 bg-[#f6f9ff] px-4 py-3 text-sm font-medium text-slate-700">
                <div className="col-span-4">Priority</div>
                <div className="col-span-4">Notes</div>
                <div className="col-span-2 text-right">Hours Saved (wk)</div>
                <div className="col-span-2 text-right">Value / wk</div>
              </div>

              {(
                [
                  { key: "throughput", label: "Throughput", note: "Ship faster; reduce cycle time" },
                  { key: "quality", label: "Quality", note: "Fewer reworks; better first-pass yield" },
                  { key: "onboarding", label: "Onboarding", note: "Ramp new hires quicker" },
                  { key: "retention", label: "Retention", note: "Reduce regretted attrition" },
                  { key: "upskilling", label: "Upskilling", note: "Expand AI competency coverage" },
                ] as { key: Priority; label: string; note: string }[]
              ).filter(r => priorities.includes(r.key)).map((row, idx) => {
                const hours = (hoursPerEmployee * headcount) * (row.key === "throughput" ? throughputPct / 100
                  : row.key === "quality" ? 0.18
                  : row.key === "onboarding" ? 0.22
                  : row.key === "retention" ? 0 /* hours proxy not used for retention value */
                  : upskillCoveragePct / 100 * 0.12);

                const value = valueByPriority[row.key];
                return (
                  <div key={row.key} className="grid grid-cols-12 items-center px-4 py-3 border-t border-[#eaf0ff]">
                    <div className="col-span-4 text-slate-900 font-medium">{row.label}</div>
                    <div className="col-span-4 text-slate-600">{row.note}</div>
                    <div className="col-span-2 text-right text-slate-900">{Math.round(hours).toLocaleString()}</div>
                    <div className="col-span-2 text-right text-slate-900">{fmtMoney(value, currency)}</div>
                  </div>
                );
              })}

              <div className="grid grid-cols-12 px-4 py-3 border-t border-[#eaf0ff] bg-white">
                <div className="col-span-8 text-right font-semibold text-slate-900">Total (weekly)</div>
                <div className="col-span-2 text-right font-semibold text-slate-900">—</div>
                <div className="col-span-2 text-right font-semibold text-slate-900">
                  {fmtMoney(weeklyValueTotal, currency)}
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Suggested next steps</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Map top 3 workflows → ship prompt templates + QA/guardrails within 2 weeks.</li>
                <li>Launch “AI Champions” cohort; set quarterly ROI reviews; track usage vs. retention.</li>
                <li>Target 60% competency coverage in 90 days; measure weekly AI-in-task usage.</li>
              </ul>
            </div>

            <div className="flex justify-between mt-8">
              <GhostButton onClick={() => setStep(6)}>← Back</GhostButton>
              <div className="flex items-center gap-3">
                <GhostButton onClick={() => window.location.reload()}>Start over</GhostButton>
                <StepButton onClick={() => setStep(1)}>Restart →</StepButton>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
