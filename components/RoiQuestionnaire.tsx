// components/RoiQuestionnaire.tsx
"use client";

import { useMemo, useState } from "react";

type PriorityLabel =
  | "Productivity"
  | "Upskilling"
  | "Quality"
  | "Staff Retention"
  | "Scalability & Cost"
  | "Customer Experience (CX)";

const PRIORITIES: PriorityLabel[] = [
  "Productivity",
  "Upskilling",
  "Quality",
  "Staff Retention"
  ,"Scalability & Cost",
  "Customer Experience (CX)",
];

type FormData = {
  companyName: string;
  employees: number | "";
  averageSalary: number | "";        // annual, local currency
  hoursSavedPerWeek: number | "";    // per employee
  adoptionRatePct: number | "";      // % of employees
  workweeksPerYear: number | "";     // weeks per year (default 52)
  aiMaturity: number | "";           // 1–5 slider
  priority: PriorityLabel | "";      // chosen via boxed selectors
};

const initialData: FormData = {
  companyName: "",
  employees: "",
  averageSalary: "",
  hoursSavedPerWeek: "",
  adoptionRatePct: "",
  workweeksPerYear: 52,
  aiMaturity: 3, // mid default
  priority: "",
};

const STEPS = ["Company", "Current Workflow", "AI Impact", "Summary"];

export default function RoiQuestionnaire() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initialData);

  const totalSteps = STEPS.length;
  const progress = useMemo(
    () => Math.round(((step + 1) / totalSteps) * 100),
    [step, totalSteps]
  );

  const onNext = () => step < totalSteps - 1 && setStep(step + 1);
  const onBack = () => step > 0 && setStep(step - 1);

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
        key === "averageSalary" ||
        key === "hoursSavedPerWeek" ||
        key === "adoptionRatePct" ||
        key === "workweeksPerYear" ||
        key === "aiMaturity"
      ) {
        setData((d) => ({
          ...d,
          [key]: value === "" ? "" : Number(value),
        }));
      } else {
        setData((d) => ({ ...d, [key]: value as any }));
      }
    };

  // Core savings model (neutral styling; same as before)
  const estimatedAnnualSavings = useMemo(() => {
    const employees = Number(data.employees || 0);
    const avgSalary = Number(data.averageSalary || 0);
    const hoursSaved = Number(data.hoursSavedPerWeek || 0);
    const adoption = Number(data.adoptionRatePct || 0) / 100;
    const weeks = Number(data.workweeksPerYear || 52);

    const hourlyRate = avgSalary > 0 ? avgSalary / 2080 : 0;
    const raw =
      employees *
      adoption *
      Math.max(0, hoursSaved) *
      Math.max(1, weeks) *
      Math.max(0, hourlyRate);

    return Math.round(Math.max(0, raw));
  }, [
    data.employees,
    data.averageSalary,
    data.hoursSavedPerWeek,
    data.adoptionRatePct,
    data.workweeksPerYear,
  ]);

  return (
    <div className="mx-auto">
      {/* Progress — neutral colors */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium text-neutral-700">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-neutral-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs text-neutral-500">
          {STEPS.map((label, i) => (
            <div key={label} className={i === step ? "font-semibold text-neutral-900" : ""}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-neutral-200 p-5 md:p-6">
        {step === 0 && <StepCompany data={data} setField={setField} />}
        {step === 1 && <StepWorkflow data={data} setField={setField} />}
        {step === 2 && <StepAiImpact data={data} setData={setData} />}
        {step === 3 && <StepSummary data={data} estimatedAnnualSavings={estimatedAnnualSavings} />}

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 0}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-3">
            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black"
                onClick={() => {
                  // submit placeholder
                  console.log("Submit", data);
                }}
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

/* ---------- Step 1: Company (includes Average Salary) ---------- */
function StepCompany({
  data,
  setField,
}: {
  data: FormData;
  setField: (key: keyof FormData) => (e: any) => void;
}) {
  return (
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          Employees
        </label>
        <input
          type="number"
          min={1}
          value={data.employees}
          onChange={setField("employees")}
          placeholder="250"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/30"
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/30"
        />
      </div>
    </div>
  );
}

/* ---------- Step 2: Current Workflow (adds AI Maturity slider) ---------- */
function StepWorkflow({
  data,
  setField,
}: {
  data: FormData;
  setField: (key: keyof FormData) => (e: any) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Hours saved per week per employee
          </label>
          <input
            type="number"
            min={0}
            value={data.hoursSavedPerWeek}
            onChange={setField("hoursSavedPerWeek")}
            placeholder="1.5"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/30"
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
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Workweeks per year
          </label>
          <input
            type="number"
            min={1}
            max={52}
            value={data.workweeksPerYear}
            onChange={setField("workweeksPerYear")}
            placeholder="52"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900/30"
          />
        </div>
      </div>

      {/* AI Maturity slider (1–5) */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          AI maturity (1–5)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={data.aiMaturity}
          onChange={setField("aiMaturity")}
          className="w-full accent-neutral-900"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
          <span>1 • Ad-hoc</span>
          <span>2</span>
          <span>3 • Emerging</span>
          <span>4</span>
          <span>5 • Scaled</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 3: AI Impact (priority as boxed selectors) ---------- */
function StepAiImpact({
  data,
  setData,
}: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const selectPriority = (p: PriorityLabel) =>
    setData((d) => ({ ...d, priority: p }));

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">
        Priority focus
      </label>

      {/* Boxed options (not dropdown), responsive 2/3-column grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {PRIORITIES.map((p) => {
          const active = data.priority === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => selectPriority(p)}
              className={[
                "rounded-xl border px-3 py-2 text-sm text-left transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
              ].join(" ")}
            >
              {p}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500">
        Choose the primary outcome your team wants to optimise.
      </p>
    </div>
  );
}

/* ---------- Step 4: Summary ---------- */
function StepSummary({
  data,
  estimatedAnnualSavings,
}: {
  data: FormData;
  estimatedAnnualSavings: number;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="text-base font-semibold text-neutral-900">Overview</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div><span className="text-neutral-500">Company:</span> {data.companyName || "—"}</div>
          <div><span className="text-neutral-500">Employees:</span> {data.employees || "—"}</div>
          <div><span className="text-neutral-500">Average salary:</span> {data.averageSalary || "—"}</div>
          <div><span className="text-neutral-500">Priority:</span> {data.priority || "—"}</div>
          <div><span className="text-neutral-500">AI maturity:</span> {data.aiMaturity || "—"}</div>
          <div><span className="text-neutral-500">Adoption %:</span> {data.adoptionRatePct || "—"}</div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="text-base font-semibold text-neutral-900">Estimated Impact</h3>
        <p className="mt-2 text-2xl font-bold">{estimatedAnnualSavings.toLocaleString()}</p>
        <p className="text-sm text-neutral-600">Estimated annual time-savings value (simple model).</p>
      </div>
    </div>
  );
}
