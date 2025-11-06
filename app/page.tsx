"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Currency = "€" | "$" | "£";

export default function Page() {
  // Steps
  const [step, setStep] = useState(1);

  // Step 1 — Team basics
  const [employees, setEmployees] = useState(12);
  const [currency, setCurrency] = useState<Currency>("€");
  const [hourlyCost, setHourlyCost] = useState(35);

  // Step 3 — AI maturity
  const [maturity, setMaturity] = useState(4); // 1..10

  // Step 4 — Training
  const [trainingBudget, setTrainingBudget] = useState(12000);

  // Calcs
  const symbol = currency;
  // Simple mapping of maturity -> hours saved / employee / week
  const hoursPerEmployee = useMemo(() => {
    // more mature = slightly fewer quick wins; less mature = bigger gains from basics
    // 1 -> ~5.0h/w, 10 -> ~2.3h/w
    return 5 - (maturity - 1) * 0.3;
  }, [maturity]);

  const teamHoursPerWeek = useMemo(
    () => Math.max(0, hoursPerEmployee) * employees,
    [hoursPerEmployee, employees]
  );

  const weeksPerMonth = 4.33;
  const monthlySavings = useMemo(
    () => teamHoursPerWeek * hourlyCost * weeksPerMonth,
    [teamHoursPerWeek, hourlyCost]
  );

  const paybackMonths = useMemo(
    () => (monthlySavings > 0 ? (trainingBudget / monthlySavings).toFixed(1) : "—"),
    [trainingBudget, monthlySavings]
  );

  const annualROI = useMemo(
    () => (trainingBudget > 0 ? (((monthlySavings * 12) / trainingBudget)).toFixed(1) : "—"),
    [monthlySavings, trainingBudget]
  );

  return (
    <div className="min-h-screen bg-[#0b1022] text-white">
      {/* PURE IMAGE HERO (replaces the old blue header) */}
      <div className="relative w-full h-[380px] md:h-[460px] overflow-hidden">
        <Image
          src="/hero.png"
          alt="AI at Work"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            AI at Work — Human Productivity ROI
          </h1>
          <p className="max-w-2xl text-white/85">
            Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Step tracker */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm">
            {["Team", "Priorities", "Maturity", "Training", "Results"].map((label, i) => {
              const n = i + 1;
              const state =
                n === step ? "active" : n < step ? "done" : "todo";
              return (
                <div key={label} className="flex-1 text-center">
                  <div
                    className={[
                      "inline-flex items-center justify-center w-9 h-9 rounded-full border text-sm font-semibold select-none",
                      state === "active" && "bg-[#3366fe] border-[#3366fe] text-white",
                      state === "done" && "bg-white/20 border-white/30 text-white",
                      state === "todo" && "border-white/25 text-white/65",
                    ].join(" ")}
                  >
                    {n}
                  </div>
                  <div className="mt-1 text-white/80">{label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Team */}
        {step === 1 && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Team</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Employees in scope</label>
                <input
                  type="number"
                  min={1}
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value || 0))}
                  className="w-full rounded-lg px-3 py-2 text-black"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Currency</label>
                <div className="flex gap-2">
                  {(["€", "$", "£"] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={[
                        "px-3 py-1.5 rounded-lg border transition",
                        currency === c
                          ? "bg-[#3366fe] text-white border-[#3366fe]"
                          : "bg-white text-black border-gray-300",
                      ].join(" ")}
                    >
                      {c === "€" ? "EUR" : c === "$" ? "USD" : "GBP"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Avg. fully-loaded hourly cost</label>
                <input
                  type="number"
                  min={1}
                  value={hourlyCost}
                  onChange={(e) => setHourlyCost(Number(e.target.value || 0))}
                  className="w-full rounded-lg px-3 py-2 text-black"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: Priorities (placeholder – static copy) */}
        {step === 2 && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Priorities</h2>
            <p className="text-white/80">
              (Optional static step here; we kept it light to stabilise UI. We can
              re-enable the selectable tags later.)
            </p>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: Maturity */}
        {step === 3 && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">AI Maturity</h2>

            <div className="mb-3">
              <input
                type="range"
                min={1}
                max={10}
                value={maturity}
                onChange={(e) => setMaturity(Number(e.target.value))}
                className="w-full accent-[#3366fe]"
              />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Maturity</div>
                <div className="text-xl font-semibold mt-1">{maturity}/10</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">
                  Hours / employee / week
                </div>
                <div className="text-xl font-semibold mt-1">
                  {hoursPerEmployee.toFixed(1)}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">
                  Team hours / week
                </div>
                <div className="text-xl font-semibold mt-1">
                  {Math.round(teamHoursPerWeek).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(4)}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 4: Training */}
        {step === 4 && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Training</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Training budget</label>
                <input
                  type="number"
                  min={0}
                  value={trainingBudget}
                  onChange={(e) => setTrainingBudget(Number(e.target.value || 0))}
                  className="w-full rounded-lg px-3 py-2 text-black"
                />
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white"
                onClick={() => setStep(3)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(5)}
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {/* STEP 5: Results */}
        {step === 5 && (
          <section className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Results</h2>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">
                  Monthly Savings
                </div>
                <div className="text-xl font-semibold mt-1">
                  {symbol}
                  {Math.round(monthlySavings).toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Payback</div>
                <div className="text-xl font-semibold mt-1">
                  {paybackMonths} months
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Annual ROI</div>
                <div className="text-xl font-semibold mt-1">×{annualROI}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">
                  Hours Saved / Year
                </div>
                <div className="text-xl font-semibold mt-1">
                  {Math.round(teamHoursPerWeek * 52).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white"
                onClick={() => setStep(4)}
              >
                Back
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(1)}
              >
                Start Over
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
