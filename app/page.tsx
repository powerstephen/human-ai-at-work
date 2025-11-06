"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

export default function Page() {
  const [step, setStep] = useState(1);
  const [employees, setEmployees] = useState(12);
  const [currency, setCurrency] = useState<"€" | "$" | "£">("€");
  const [maturity, setMaturity] = useState(4);
  const [hourlyCost, setHourlyCost] = useState(35);
  const [trainingBudget, setTrainingBudget] = useState(12000);

  const symbol = currency;
  const hoursPerEmployee = useMemo(() => 6 + (10 - maturity) * 0.3, [maturity]);
  const teamHours = useMemo(() => hoursPerEmployee * employees, [hoursPerEmployee, employees]);
  const monthlySavings = useMemo(() => teamHours * hourlyCost * 4.33, [teamHours, hourlyCost]);
  const payback = useMemo(() => (trainingBudget / monthlySavings).toFixed(1), [trainingBudget, monthlySavings]);
  const annualROI = useMemo(() => ((monthlySavings * 12) / trainingBudget).toFixed(1), [monthlySavings, trainingBudget]);

  return (
    <div className="min-h-screen bg-[#0b1022] text-white">
      {/* Hero section */}
      <div className="relative w-full h-[400px] md:h-[480px] overflow-hidden">
        <Image
          src="/hero.png"
          alt="Hero"
          fill
          className="object-cover object-center opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            AI at Work — Human Productivity ROI
          </h1>
          <p className="max-w-2xl text-white/80">
            Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
          </p>
        </div>
      </div>

      {/* Step progress */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        <div className="flex justify-between text-sm mb-4">
          {["Team", "Priorities", "Maturity", "Training", "Results"].map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <div
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-medium ${
                  i + 1 === step
                    ? "bg-[#3366fe] border-[#3366fe] text-white"
                    : i + 1 < step
                    ? "bg-white/20 border-white/30 text-white"
                    : "border-white/20 text-white/60"
                }`}
              >
                {i + 1}
              </div>
              <div className="mt-1 text-white/80">{label}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Team */}
        {step === 1 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Team Setup</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Employees</label>
                <input
                  type="number"
                  className="w-full rounded-lg px-3 py-2 text-black"
                  value={employees}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Currency</label>
                <div className="flex gap-2">
                  {["€", "$", "£"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c as any)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        currency === c
                          ? "bg-[#3366fe] text-white border-[#3366fe]"
                          : "bg-white text-black border-gray-300"
                      }`}
                    >
                      {c === "€" ? "EUR" : c === "$" ? "USD" : "GBP"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Hourly Cost</label>
                <input
                  type="number"
                  className="w-full rounded-lg px-3 py-2 text-black"
                  value={hourlyCost}
                  onChange={(e) => setHourlyCost(Number(e.target.value))}
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
          </div>
        )}

        {/* Step 2: Priorities */}
        {step === 2 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Select Priorities</h2>
            <p className="text-white/80 mb-4">Example priorities only (static)</p>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(3)}
              >
                Continue
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white ml-3"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Maturity */}
        {step === 3 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">AI Maturity</h2>
            <input
              type="range"
              min={1}
              max={10}
              value={maturity}
              onChange={(e) => setMaturity(Number(e.target.value))}
              className="w-full accent-[#3366fe]"
            />
            <div className="text-sm mt-3">
              Level: <span className="font-semibold">{maturity}</span> — Hours saved per employee:{" "}
              <span className="font-semibold">{hoursPerEmployee.toFixed(1)}</span>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(4)}
              >
                Continue
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white ml-3"
                onClick={() => setStep(2)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Training */}
        {step === 4 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Training Setup</h2>
            <label className="block text-sm mb-1">Training Budget</label>
            <input
              type="number"
              className="w-full rounded-lg px-3 py-2 text-black"
              value={trainingBudget}
              onChange={(e) => setTrainingBudget(Number(e.target.value))}
            />
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-[#3366fe] text-white"
                onClick={() => setStep(5)}
              >
                Continue
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white ml-3"
                onClick={() => setStep(3)}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Results */}
        {step === 5 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
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
                <div className="text-xl font-semibold mt-1">{payback} months</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Annual ROI</div>
                <div className="text-xl font-semibold mt-1">×{annualROI}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-wide text-white/70">Hours Saved / Yr</div>
                <div className="text-xl font-semibold mt-1">
                  {Math.round(teamHours * 12).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-white/20 text-white mr-3"
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
          </div>
        )}
      </div>
    </div>
  );
}
