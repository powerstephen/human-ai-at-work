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
  "Staff Retention",
  "Scalability & Cost",
  "Customer Experience (CX)",
];

type FormData = {
  companyName: string;
  employees: number | "";
  averageSalary: number | "";       // annual, local currency
  hoursSavedPerWeek: number | "";   // per employee
  adoptionRatePct: number | "";     // % of employees
  priority: PriorityLabel | "";     // labeled priorities (6)
};

const initialData: FormData = {
  companyName: "",
  employees: "",
  averageSalary: "",
  hoursSavedPerWeek: "",
  adoptionRatePct: "",
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
        key === "adoptionRatePct"
      ) {
        setData((d) => ({
          ...d,
          [key]: value === "" ? "" : Number(value),
        }));
      } else {
        setData((d) => ({ ...d, [key]: value as any }));
      }
    };

  // Simple savings model using salary + hours saved + adoption
  const estimatedAnnualSavings = useMemo(() => {
    const employees = Number(data.employees || 0);
    const avgSalary = Number(data.averageSalary || 0);
    const hoursSaved = Number(data.hoursSavedPerWeek || 0);
    const adoption = Number(data.adoptionRatePct || 0) / 100;

    // hourly baseline = 2080 working hours/year
    const hourlyRate = avgSalary > 0 ? avgSalary / 2080 : 0;

    // savings = headcount * adoption * hoursSaved/week * 52 weeks * hourlyRate
    const raw =
      employees * adoption * Math.max(0, hoursSaved) * 52 * Math.max(0, hourlyRate);

    return Math.round(Math.max(0, raw));
  }, [
    data.employees,
    data.averageSalary,
    data.hoursSavedPerWeek,
    data.adoptionRatePct,
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm font-medium text-neutral-700">
          <span>
            Step {step + 1} of {totalSteps}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
          <div
            className="h-2 rounded-full bg-red-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs text-neutral-500">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={i === step ? "font-semibold text-neutral-800" : ""}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-neutral-200 p-5 md:p-6">
        {step === 0 && <StepCompany data={data} setField={setField} />}
        {step === 1 && <StepWorkflow data={data} setField={setField} />}
        {step === 2 && <StepAiImpact data={data} setField={setField} />}
        {step === 3 && (
          <StepSummary data={data} estimatedAnnualSavings={estimatedAnnualSavings} />
        )}

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
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>
    </div>
  );
}

/* ---------- Step 2: Current Workflow ---------- */
function StepWorkflow({
  data,
  setField,
}: {
  data: FormData;
  setField: (key: keyof FormData) => (e: any) => void;
}) {
  return (
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
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
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>
    </div>
  );
}

/* ---------- Step 3: AI Impact (6 labeled priorities) ---------- */
function StepAiImpact({
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
          Priority focus
        </label>
        <select
          value={data.priority}
          onChange={setField("priority")}
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="">Select priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-neutral-500">
          Choose the primary outcome your team wants to optimise.
        </p>
      </div>

      {/* Hook for future impact sliders/toggles per priority */}
      {/* e.g., quality error-rate reduction %, retention improvement %, etc. */}
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
          <div>
            <span className="text-neutral-500">Company:</span>{" "}
            {data.companyName || "—"}
          </div>
          <div>
            <span className="text-neutral-500">Employees:</span>{" "}
            {data.employees || "—"}
          </div>
          <div>
            <span className="text-neutral-500">Average salary:</span>{" "}
            {data.averageSalary || "—"}
          </div>
          <div>
            <span className="text-neutral-500">Priority:</span>{" "}
            {data.priority || "—"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="text-base font-semibold text-neutral-900">Estimated Impact</h3>
        <p className="mt-2 text-2xl font-bold">
          {estimatedAnnualSavings.toLocaleString()}
        </p>
        <p className="text-sm text-neutral-600">
          Estimated annual time-savings value (simple model).
        </p>
      </div>
    </div>
  );
}
