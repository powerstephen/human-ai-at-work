// components/RoiQuestionnaire.tsx
"use client";

import { useMemo, useState } from "react";

/* -------------------- Helpers -------------------- */
const num = (v: unknown, fb = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : fb;

/* -------------------- Types & constants -------------------- */
type PriorityKey =
  | "Productivity / Throughput"
  | "Upskilling"
  | "Quality"
  | "Staff Retention"
  | "Scalability & Cost"
  | "Customer Experience (CX)";

const PRIORITIES: Array<{ key: PriorityKey; blurb: string }> = [
  { key: "Productivity / Throughput", blurb: "Ship more work in less time — reduce cycle time and queues." },
  { key: "Upskilling", blurb: "Lift team capability with faster onboarding and embedded guidance." },
  { key: "Quality", blurb: "Fewer errors and rework — more consistent, reliable outputs." },
  { key: "Staff Retention", blurb: "Lower burnout and attrition by removing repetitive busywork." },
  { key: "Scalability & Cost", blurb: "Handle higher volume without adding headcount and cost." },
  { key: "Customer Experience (CX)", blurb: "Faster, clearer responses that improve CSAT, NPS, and retention." },
];

type DepartmentScope = "Company-wide" | "Specific department";

const DEPARTMENTS = [
  "Sales","Marketing","Customer Support","HR","Finance","Engineering","Operations","Product","Other",
];

type PriorityInputs = { coveragePct: number; improvementPct: number };

type FormData = {
  // Step 1 — Basics
  scope: DepartmentScope;
  department: string;
  companyName: string;
  employees: number | "";
  adoptionRatePct: number | "";
  averageSalary: number | "";

  // Step 2 — Priorities (up to 3)
  priorities: PriorityKey[];

  // Step 3 — AI Maturity + base per-person hours
  aiMaturity: number | "";      // 1–10
  hoursSavedBase: number | "";  // base hours saved per person per week

  // Steps 4–6 — per selected priority (TWO inputs; no sliders)
  priorityInputs: Record<PriorityKey, PriorityInputs>;
};

const initialData: FormData = {
  scope: "Company-wide",
  department: "",
  companyName: "",
  employees: "",
  adoptionRatePct: "",
  averageSalary: "",
  priorities: [],
  aiMaturity: 5,
  hoursSavedBase: 1,
  priorityInputs: {
    "Productivity / Throughput": { coveragePct: 50, improvementPct: 10 },
    Upskilling: { coveragePct: 30, improvementPct: 10 },
    Quality: { coveragePct: 30, improvementPct: 10 },
    "Staff Retention": { coveragePct: 20, improvementPct: 5 },
    "Scalability & Cost": { coveragePct: 40, improvementPct: 10 },
    "Customer Experience (CX)": { coveragePct: 30, improvementPct: 10 },
  },
};

const STEPS = [
  "Basics",
  "Priorities",
  "AI Maturity",
  "Priority #1",
  "Priority #2",
  "Priority #3",
  "Summary",
  "ROI",
];

/* -------------------- Component -------------------- */
export default function RoiQuestionnaire() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);

  const totalSteps = STEPS.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const next = () => step < totalSteps - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const setField =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      if (
        key === "employees" ||
        key === "adoptionRatePct" ||
        key === "averageSalary" ||
        key === "aiMaturity" ||
        key === "hoursSavedBase"
      ) {
        setData((d) => ({ ...d, [key]: value === "" ? "" : Number(value) }));
      } else {
        setData((d) => ({ ...d, [key]: value as any }));
      }
    };

  const togglePriority = (p: PriorityKey) => {
    setData((d) => {
      const exists = d.priorities.includes(p);
      if (exists) return { ...d, priorities: d.priorities.filter((x) => x !== p) };
      if (d.priorities.length >= 3) {
        const next = [...d.priorities];
        next[next.length - 1] = p;
        return { ...d, priorities: next };
      }
      return { ...d, priorities: [...d.priorities, p] };
    });
  };

  const updatePriorityInput = (
    p: PriorityKey,
    field: keyof PriorityInputs,
    value: number
  ) => {
    setData((d) => ({
      ...d,
      priorityInputs: {
        ...d.priorityInputs,
        [p]: { ...d.priorityInputs[p], [field]: num(value, 0) },
      },
    }));
  };

  // Map steps 4–6 to selected priorities (pad to 3)
  const chosen = [...data.priorities];
  while (chosen.length < 3) chosen.push(undefined as unknown as PriorityKey);
  const [p1, p2, p3] = chosen;

  /* -------------------- Calculations -------------------- */
  const baseHrs = num(data.hoursSavedBase, 0);

  // Priority factor = Σ(coverage% * improvement%) / 10000 over selected priorities
  const priorityFactor = (data.priorities || []).reduce((acc, p) => {
    const inp = data.priorityInputs[p];
    if (!inp) return acc;
    const cov = Math.min(100, Math.max(0, num(inp.coveragePct)));
    const imp = Math.min(100, Math.max(0, num(inp.improvementPct)));
    return acc + (cov * imp) / 10000;
  }, 0);

  // Total per-person weekly hours saved = base + (base * priorityFactor)
  const perPersonWeekly = Math.max(0, baseHrs + baseHrs * priorityFactor);

  // Per-team weekly = per-person * employees * adoption%
  const employees = num(data.employees, 0);
  const adoption = Math.min(1, Math.max(0, num(data.adoptionRatePct, 0) / 100));
  const teamWeekly = Math.max(0, perPersonWeekly * employees * adoption);

  // Hourly rate from salary
  const avgSalary = num(data.averageSalary, 0);
  const hourlyRate = avgSalary > 0 ? avgSalary / 2080 : 0;

  // Annual savings = teamWeekly * 52 * hourlyRate
  const annualSavings = Math.round(teamWeekly * 52 * Math.max(0, hourlyRate));

  /* -------------------- UI -------------------- */
  return (
    <div className="mx-auto">
      {/* Progress — blue theme */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium text-neutral-700">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-neutral-600 sm:grid-cols-8">
          {STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li
                key={label}
                className={[
                  "rounded-md border px-2 py-1",
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : done
                    ? "border-neutral-300 bg-neutral-100 text-neutral-800"
                    : "border-neutral-200 bg-white",
                ].join(" ")}
              >
                {i + 1}. {label}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
        {step === 0 && <StepBasics data={data} setField={setField} />}
        {step === 1 && <StepPriorities data={data} togglePriority={togglePriority} />}
        {step === 2 && (
          <StepAIMaturity
            data={data}
            setField={setField}
            perPersonWeekly={perPersonWeekly}
            teamWeekly={teamWeekly}
          />
        )}
        {step === 3 && (
          <StepPriorityDetail
            title="Priority #1"
            priority={p1}
            inputs={p1 ? data.priorityInputs[p1] : undefined}
            onChange={(f, v) => p1 && updatePriorityInput(p1, f, v)}
          />
        )}
        {step === 4 && (
          <StepPriorityDetail
            title="Priority #2"
            priority={p2}
            inputs={p2 ? data.priorityInputs[p2] : undefined}
            onChange={(f, v) => p2 && updatePriorityInput(p2, f, v)}
          />
        )}
        {step === 5 && (
          <StepPriorityDetail
            title="Priority #3"
            priority={p3}
            inputs={p3 ? data.priorityInputs[p3] : undefined}
            onChange={(f, v) => p3 && updatePriorityInput(p3, f, v)}
          />
        )}
        {step === 6 && (
          <StepSummary
            data={data}
            perPersonWeekly={perPersonWeekly}
            teamWeekly={teamWeekly}
            hourlyRate={hourlyRate}
            annualSavings={annualSavings}
          />
        )}
        {step === 7 && <StepROI annualSavings={annualSavings} />}

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-3">
            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={next}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black"
                onClick={() => console.log("Submit", data)}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 1: Basics ---------- */
function StepBasics({
  data,
  setField,
}: {
  data: FormData;
  setField: (key: keyof FormData) => (e: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Company name</label>
          <input
            type="text"
            value={data.companyName}
            onChange={setField("companyName")}
            placeholder="Acme Inc."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Scope + Department */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Scope</label>
          <select
            value={data.scope}
            onChange={setField("scope")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option>Company-wide</option>
            <option>Specific department</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            {data.scope === "Company-wide" ? "Department (optional)" : "Department"}
          </label>
          <select
            value={data.department}
            onChange={setField("department")}
            disabled={data.scope === "Company-wide"}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-neutral-100 disabled:text-neutral-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="">{data.scope === "Company-wide" ? "—" : "Select department"}</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Headcount, Adoption, Salary */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Employees (in scope)</label>
          <input
            type="number"
            min={1}
            value={data.employees}
            onChange={setField("employees")}
            placeholder="250"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Adoption (% of employees)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={data.adoptionRatePct}
            onChange={setField("adoptionRatePct")}
            placeholder="35"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Average salary (annual, local currency)</label>
          <input
            type="number"
            min={0}
            value={data.averageSalary}
            onChange={setField("averageSalary")}
            placeholder="75000"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 2: Priorities (boxed, pick up to 3) ---------- */
function StepPriorities({
  data,
  togglePriority,
}: {
  data: FormData;
  togglePriority: (p: PriorityKey) => void;
}) {
  const selected = new Set(data.priorities);
  const remaining = Math.max(0, 3 - selected.size);

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-700">Select up to 3 priorities.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRIORITIES.map(({ key, blurb }) => {
          const active = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => togglePriority(key)}
              className={[
                "rounded-xl border p-3 text-left transition",
                active
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{key}</div>
              <div className={active ? "mt-1 text-xs text-blue-700" : "mt-1 text-xs text-neutral-500"}>
                {blurb}
              </div>
              <div className="mt-2 text-[11px]">
                {active ? "Selected" : `${remaining} remaining`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Step 3: AI Maturity (1–10) + KPIs ---------- */
function StepAIMaturity({
  data,
  setField,
  perPersonWeekly,
  teamWeekly,
}: {
  data: FormData;
  setField: (key: keyof FormData) => (e: any) => void;
  perPersonWeekly: number;
  teamWeekly: number;
}) {
  const ticks = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {/* Left: slider + base hours */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-neutral-700">AI maturity (1–10)</label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={data.aiMaturity}
          onChange={setField("aiMaturity")}
          className="w-full accent-blue-600"
        />
        {/* All numbers under the slider */}
        <div className="mt-1 grid grid-cols-10 text-center text-[11px] text-neutral-500">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Base hours saved / person / week
            </label>
            <input
              type="number"
              min={0}
              value={data.hoursSavedBase}
              onChange={setField("hoursSavedBase")}
              placeholder="1.0"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Right: KPI cards */}
      <div className="space-y-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Hours saved</div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">Per person (weekly)</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {perPersonWeekly.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Hours saved</div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">Per team (weekly)</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {teamWeekly.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Steps 4–6: TWO INPUTS per selected priority ---------- */
function StepPriorityDetail({
  title,
  priority,
  inputs,
  onChange,
}: {
  title: string;
  priority: PriorityKey | undefined;
  inputs: PriorityInputs | undefined;
  onChange: (field: keyof PriorityInputs, value: number) => void;
}) {
  if (!priority) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="text-sm text-neutral-600">
          Select priorities on Step 2 to configure this section.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-neutral-600">{priority}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Coverage of work affected (%) — {priority}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={inputs?.coveragePct ?? 0}
            onChange={(e) => onChange("coveragePct", Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-xs text-neutral-500">
            What % of weekly work touches this priority?
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Improvement within covered work (%) — {priority}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={inputs?.improvementPct ?? 0}
            onChange={(e) => onChange("improvementPct", Number(e.target.value))}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Efficiency/quality lift within the covered portion.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 7: Summary (Hours vs Money layout you asked for) ---------- */
function StepSummary({
  data,
  perPersonWeekly,
  teamWeekly,
  hourlyRate,
  annualSavings,
}: {
  data: FormData;
  perPersonWeekly: number;
  teamWeekly: number;
  hourlyRate: number;
  annualSavings: number;
}) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-base font-semibold">Overview</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div><span className="text-neutral-500">Scope:</span> {data.scope}</div>
          <div><span className="text-neutral-500">Department:</span> {data.scope === "Company-wide" ? "—" : (data.department || "—")}</div>
          <div><span className="text-neutral-500">Company:</span> {data.companyName || "—"}</div>
          <div><span className="text-neutral-500">Employees (in scope):</span> {data.employees || "—"}</div>
          <div><span className="text-neutral-500">Adoption %:</span> {data.adoptionRatePct || "—"}</div>
          <div className="text-right"><span className="text-neutral-500">Average salary:</span> {data.averageSalary || "—"}</div>
          <div className="md:col-span-2">
            <span className="text-neutral-500">Priorities:</span>{" "}
            {data.priorities.length ? data.priorities.join(", ") : "—"}
          </div>
        </div>
      </div>

      {/* Split section with HEADINGS and spacing so Hours isn't cramped */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Hours saved (centered card) */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center">
            <h4 className="text-sm font-semibold text-neutral-900">Hours saved</h4>
            <div className="mt-3 flex items-center justify-center gap-8">
              <div className="text-2xl font-bold text-neutral-900">
                {perPersonWeekly.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <div className="mt-1 text-xs font-normal text-neutral-500">Per person / week</div>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {teamWeekly.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <div className="mt-1 text-xs font-normal text-neutral-500">Per team / week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Money saved (right-aligned values) */}
        <div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h4 className="text-sm font-semibold text-neutral-900">Money saved</h4>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
              <div className="text-right">
                <span className="text-neutral-500">Hourly rate basis:</span>{" "}
                <span className="font-semibold">
                  {hourlyRate > 0
                    ? hourlyRate.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : "—"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500">Estimated annual savings:</span>{" "}
                <span className="font-semibold">
                  {annualSavings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 8: ROI ---------- */
function StepROI({ annualSavings }: { annualSavings: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="text-base font-semibold">Estimated Impact</h3>
      <p className="mt-2 text-3xl font-bold">{annualSavings.toLocaleString()}</p>
      <p className="text-sm text-neutral-600">Estimated annual time-savings value (simple model).</p>
    </div>
  );
}
