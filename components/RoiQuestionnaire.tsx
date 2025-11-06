// components/RoiQuestionnaire.tsx
"use client";

import { useMemo, useState } from "react";

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
  "Sales",
  "Marketing",
  "Customer Support",
  "HR",
  "Finance",
  "Engineering",
  "Operations",
  "Product",
  "Other",
];

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

  // Step 3 — AI Maturity + Hours
  aiMaturity: number | ""; // 1–10
  hoursSavedPerWeek: number | ""; // per person weekly

  // Steps 4–6 — priority-specific controls (simple weight/impact 0–100)
  priorityImpacts: Record<PriorityKey, number>;
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
  hoursSavedPerWeek: 1,
  priorityImpacts: {
    "Productivity / Throughput": 50,
    Upskilling: 50,
    Quality: 50,
    "Staff Retention": 50,
    "Scalability & Cost": 50,
    "Customer Experience (CX)": 50,
  },
};

/* -------------------- Step labels (always 8) -------------------- */

const STEP_LABELS = [
  "Basics",
  "Priorities",
  "AI Maturity",
  "Priority #1",
  "Priority #2",
  "Priority #3",
  "Summary",
  "ROI",
];

/* -------------------- Main -------------------- */

export default function RoiQuestionnaire() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);

  const totalSteps = STEP_LABELS.length;
  const progress = useMemo(
    () => Math.round(((step + 1) / totalSteps) * 100),
    [step, totalSteps]
  );

  const next = () => step < totalSteps - 1 && setStep(step + 1);
  const back = () => step > 0 && setStep(step - 1);

  const setField =
    (key: keyof FormData) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      const value = e.target.value;
      if (
        key === "employees" ||
        key === "adoptionRatePct" ||
        key === "averageSalary" ||
        key === "aiMaturity" ||
        key === "hoursSavedPerWeek"
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

  // Derived
  const hoursSavedPerTeamWeekly = useMemo(() => {
    const perPerson = Number(data.hoursSavedPerWeek || 0);
    const employees = Number(data.employees || 0);
    const adoption = Number(data.adoptionRatePct || 0) / 100;
    return Math.max(0, perPerson * employees * adoption);
  }, [data.hoursSavedPerWeek, data.employees, data.adoptionRatePct]);

  const estimatedAnnualSavings = useMemo(() => {
    const employees = Number(data.employees || 0);
    const avgSalary = Number(data.averageSalary || 0);
    const perPersonHours = Number(data.hoursSavedPerWeek || 0);
    const adoption = Number(data.adoptionRatePct || 0) / 100;
    const hourlyRate = avgSalary > 0 ? avgSalary / 2080 : 0; // 2080 hrs/yr
    const raw =
      employees * adoption * Math.max(0, perPersonHours) * 52 * Math.max(0, hourlyRate);
    return Math.round(Math.max(0, raw));
  }, [data.employees, data.averageSalary, data.hoursSavedPerWeek, data.adoptionRatePct]);

  // Map steps 4–6 to selected priorities (pad to 3 placeholders)
  const sel = [...data.priorities];
  while (sel.length < 3) sel.push(undefined as unknown as PriorityKey);
  const [p1, p2, p3] = sel;

  return (
    <div className="mx-auto">
      {/* Progress — light theme with red accent (like that earlier build) */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium text-neutral-700">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-red-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] text-neutral-600 sm:grid-cols-8">
          {STEP_LABELS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li
                key={label}
                className={[
                  "rounded-md border px-2 py-1",
                  active
                    ? "border-red-600 bg-red-50 text-red-700"
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

      {/* Card container (light) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
        {step === 0 && <StepBasics data={data} setField={setField} />}
        {step === 1 && <StepPriorities data={data} togglePriority={togglePriority} />}
        {step === 2 && (
          <StepAIMaturity
            data={data}
            setField={setField}
            hoursSavedPerTeamWeekly={hoursSavedPerTeamWeekly}
          />
        )}
        {step === 3 && (
          <StepPriorityDetail
            title="Priority #1"
            priority={p1}
            impact={data.priorityImpacts[p1 as PriorityKey] ?? 50}
            setImpact={(v) =>
              setData((d) => ({
                ...d,
                priorityImpacts: { ...d.priorityImpacts, [p1 as PriorityKey]: v },
              }))
            }
          />
        )}
        {step === 4 && (
          <StepPriorityDetail
            title="Priority #2"
            priority={p2}
            impact={data.priorityImpacts[p2 as PriorityKey] ?? 50}
            setImpact={(v) =>
              setData((d) => ({
                ...d,
                priorityImpacts: { ...d.priorityImpacts, [p2 as PriorityKey]: v },
              }))
            }
          />
        )}
        {step === 5 && (
          <StepPriorityDetail
            title="Priority #3"
            priority={p3}
            impact={data.priorityImpacts[p3 as PriorityKey] ?? 50}
            setImpact={(v) =>
              setData((d) => ({
                ...d,
                priorityImpacts: { ...d.priorityImpacts, [p3 as PriorityKey]: v },
              }))
            }
          />
        )}
        {step === 6 && (
          <StepSummaryInputs
            data={data}
            hoursSavedPerTeamWeekly={hoursSavedPerTeamWeekly}
          />
        )}
        {step === 7 && <StepROI estimatedAnnualSavings={estimatedAnnualSavings} />}

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
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
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

/* -------------------- Step 1: Basics -------------------- */
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
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Company name
          </label>
          <input
            type="text"
            value={data.companyName}
            onChange={setField("companyName")}
            placeholder="Acme Inc."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-red-200"
          />
        </div>

        {/* Scope + Department */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Scope
          </label>
          <select
            value={data.scope}
            onChange={setField("scope")}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
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
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-neutral-100 disabled:text-neutral-500 focus:ring-2 focus:ring-red-200"
          >
            <option value="">{data.scope === "Company-wide" ? "—" : "Select department"}</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Headcount, Adoption, Salary */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Employees (in scope)
          </label>
          <input
            type="number"
            min={1}
            value={data.employees}
            onChange={setField("employees")}
            placeholder="250"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Adoption (% of employees)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={data.adoptionRatePct}
            onChange={setField("adoptionRatePct")}
            placeholder="35"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Average salary (annual, local currency)
          </label>
          <input
            type="number"
            min={0}
            value={data.averageSalary}
            onChange={setField("averageSalary")}
            placeholder="75000"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------- Step 2: Priorities (multi-select up to 3) -------------------- */
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
                  ? "border-red-600 bg-red-50 text-red-800"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{key}</div>
              <div className={active ? "mt-1 text-xs text-red-700" : "mt-1 text-xs text-neutral-500"}>
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

/* -------------------- Step 3: AI Maturity (1–10) + RHS KPIs -------------------- */
function StepAIMaturity({
  data,
  setField,
  hoursSavedPerTeamWeekly,
}: {
  data: FormData;
  setField: (key: keyof FormData) => (e: any) => void;
  hoursSavedPerTeamWeekly: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {/* Left: slider + per-person input */}
      <div className="md:col-span-2">
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          AI maturity (1–10)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={data.aiMaturity}
          onChange={setField("aiMaturity")}
          className="w-full accent-red-600"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
          <span>1 • Ad-hoc</span>
          <span>3</span>
          <span>5 • Emerging</span>
          <span>8</span>
          <span>10 • Scaled</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Hours saved / person / week
            </label>
            <input
              type="number"
              min={0}
              value={data.hoursSavedPerWeek}
              onChange={setField("hoursSavedPerWeek")}
              placeholder="1.0"
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-red-200"
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
            {Number(data.hoursSavedPerWeek || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Hours saved</div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">Per team (weekly)</div>
          <div className="mt-2 text-2xl font-bold text-neutral-900">
            {hoursSavedPerTeamWeekly.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Steps 4–6: Priority detail (generic impact slider) -------------------- */
function StepPriorityDetail({
  title,
  priority,
  impact,
  setImpact,
}: {
  title: string;
  priority: PriorityKey | undefined;
  impact: number;
  setImpact: (v: number) => void;
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
            Impact weighting (%) for "{priority}"
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={impact}
            onChange={(e) => setImpact(Number(e.target.value))}
            className="w-full accent-red-600"
          />
          <div className="mt-1 text-sm">{impact}%</div>
          <p className="mt-1 text-xs text-neutral-500">
            Use this to emphasise which outcomes matter most in your business case.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-xs text-neutral-500">Tip</div>
          <div className="mt-1 text-sm">
            Tie “{priority}” to concrete metrics (e.g., cycle time, CSAT/NPS, error rate, attrition).
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Step 7: Summary (with centered “Hours Saved”) -------------------- */
function StepSummaryInputs({
  data,
  hoursSavedPerTeamWeekly,
}: {
  data: FormData;
  hoursSavedPerTeamWeekly: number;
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
          <div><span className="text-neutral-500">Average salary:</span> {data.averageSalary || "—"}</div>
          <div className="md:col-span-2">
            <span className="text-neutral-500">Priorities:</span> {data.priorities.length ? data.priorities.join(", ") : "—"}
          </div>
        </div>
      </div>

      {/* Centered Hours Saved block (this is the bit you flagged before) */}
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center">
          <div className="text-xs text-neutral-500">Hours saved (weekly)</div>
          <div className="mt-1 text-sm font-semibold text-neutral-900">Per person / Per team</div>
          <div className="mt-3 flex items-center justify-center gap-8">
            <div className="text-2xl font-bold text-neutral-900">
              {Number(data.hoursSavedPerWeek || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <div className="mt-1 text-xs font-normal text-neutral-500">Per person</div>
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {hoursSavedPerTeamWeekly.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <div className="mt-1 text-xs font-normal text-neutral-500">Per team</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Step 8: ROI -------------------- */
function StepROI({ estimatedAnnualSavings }: { estimatedAnnualSavings: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="text-base font-semibold">Estimated Impact</h3>
      <p className="mt-2 text-3xl font-bold">
        {estimatedAnnualSavings.toLocaleString()}
      </p>
      <p className="text-sm text-neutral-600">
        Estimated annual time-savings value (simple model).
      </p>
    </div>
  );
}
