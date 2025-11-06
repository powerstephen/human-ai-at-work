"use client";

import { useMemo, useState } from "react";
import BrandHero from "../components/BrandHero";

type Currency = "€" | "$" | "£";
const sym = (c: Currency) => (c === "€" ? "€" : c === "$" ? "$" : "£");

export default function Page() {
  // Step 1
  const [team, setTeam] = useState(
    "Company-wide" as
      | "Company-wide"
      | "Marketing"
      | "Sales"
      | "Customer Support"
      | "Operations"
      | "Engineering"
      | "HR"
  );
  const [employees, setEmployees] = useState<number>(50);
  const [currency, setCurrency] = useState<Currency>("€");

  // Step 2
  const [maturity, setMaturity] = useState<number>(3);
  const hoursPerPersonPerWeek = useMemo(() => {
    // 5–8 hrs/wk depending on maturity (as agreed)
    const min = 5, max = 8;
    const pct = (maturity - 1) / 9;
    return +(min + (max - min) * pct).toFixed(1);
  }, [maturity]);

  // Step 3
  type Priority = "throughput" | "quality" | "onboarding" | "retention" | "upskilling";
  const LABEL: Record<Priority, string> = {
    throughput: "Throughput",
    quality: "Quality",
    onboarding: "Onboarding",
    retention: "Retention",
    upskilling: "Upskilling",
  };
  const HELP: Record<Priority, string> = {
    throughput: "Ship faster; reduce cycle time & context switching.",
    quality: "Fewer reworks; better first-pass yield & QA guardrails.",
    onboarding: "Ramp new hires quicker with playbooks & examples.",
    retention: "Lower regretted attrition via engagement & growth.",
    upskilling: "Expand AI competency; make ‘good’ the default.",
  };
  const [selected, setSelected] = useState<Priority[]>(["throughput", "quality", "onboarding"]);

  // Step 4
  const [hourlyCost, setHourlyCost] = useState<number>(35);
  const [durationMonths, setDurationMonths] = useState<number>(6);

  // Derived
  const hoursTeamPerWeek = useMemo(
    () => hoursPerPersonPerWeek * Math.max(0, employees),
    [hoursPerPersonPerWeek, employees]
  );

  const distribution = useMemo(() => {
    const chosen = selected.length ? selected : (["throughput"] as Priority[]);
    const split = hoursTeamPerWeek / chosen.length;
    const map: Record<Priority, number> = {
      throughput: 0, quality: 0, onboarding: 0, retention: 0, upskilling: 0,
    };
    chosen.forEach((p) => (map[p] = split));
    return map;
  }, [selected, hoursTeamPerWeek]);

  const kpis = useMemo(() => {
    const weeks = Math.max(1, Math.round((durationMonths * 52) / 12));
    const hoursYear = hoursTeamPerWeek * weeks;
    const monthly = (hoursTeamPerWeek * hourlyCost) / 4.33;
    const annual = monthly * 12;
    const trainingCost = employees * 8 * hourlyCost; // simple training model
    const payback = monthly > 0 ? Math.max(0.2, trainingCost / monthly) : 0;
    const annualRoi = trainingCost > 0 ? annual / trainingCost : 0;
    return { hoursYear, monthly, annual, trainingCost, payback, annualRoi };
  }, [hoursTeamPerWeek, hourlyCost, employees, durationMonths]);

  const fmt = (n: number, d = 0) => n.toLocaleString(undefined, { maximumFractionDigits: d });
  const fmtMoney = (n: number, d = 0) =>
    `${sym(currency)}${n.toLocaleString(undefined, { maximumFractionDigits: d })}`;

  return (
    <main>
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 space-y-8">
        {/* HERO replaces the old blue header area */}
        <BrandHero />

        {/* Step badges */}
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          <span className="step-badge">1 · Team</span>
          <span className="step-badge">2 · AI Maturity</span>
          <span className="step-badge">3 · Priorities</span>
          <span className="step-badge">4 · Training & Duration</span>
          <span className="step-badge">5 · Results</span>
        </div>

        {/* Step 1 */}
        <section className="section-card">
          <h2 className="section-title mb-4">Step 1 · Team</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">Department</label>
              <select
                className="select"
                value={team}
                onChange={(e) => setTeam(e.target.value as typeof team)}
              >
                {["Company-wide","Marketing","Sales","Customer Support","Operations","Engineering","HR"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Employees in scope</label>
              <input
                className="input"
                type="number"
                min={1}
                value={employees}
                onChange={(e) => setEmployees(+e.target.value || 0)}
                placeholder="e.g., 50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Currency</label>
              <div className="flex gap-2">
                {(["€", "$", "£"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 h-10 rounded-lg border px-3 font-medium ${
                      currency === c ? "bg-white text-brand-navy border-white" : "bg-white/10 border-white/10 text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="section-card">
          <h2 className="section-title mb-4">Step 2 · AI Maturity</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">Where are you today? (1–10)</label>
              <input
                className="w-full"
                type="range"
                min={1}
                max={10}
                value={maturity}
                onChange={(e) => setMaturity(+e.target.value)}
              />
              <div className="mt-2 flex justify-between text-xs text-white/60">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <span key={n} className={`w-6 text-center ${n === maturity ? "text-white font-semibold" : ""}`}>{n}</span>
                ))}
              </div>
              <p className="mt-3 text-sm text-white/80">
                <span className="font-medium">Selected:</span> {maturity} —{" "}
                {maturity <= 3
                  ? "Early: ad-hoc experiments; big wins from prompt basics + workflow mapping."
                  : maturity <= 6
                  ? "Emerging: pockets of usage; starting to codify playbooks & guardrails."
                  : maturity <= 8
                  ? "Scaling: embedded in key workflows with QA + data hygiene."
                  : "Advanced: standardized, measurable impact; continuous improvement culture."}
              </p>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <h3 className="text-sm text-white/70 mb-2">Estimated hours saved</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="kpi-tile">
                  <div className="kpi-label">Per employee / week</div>
                  <div className="kpi-value">{hoursPerPersonPerWeek}</div>
                </div>
                <div className="kpi-tile">
                  <div className="kpi-label">Team / week</div>
                  <div className="kpi-value">{(hoursPerPersonPerWeek * employees).toLocaleString()}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-white/60">Refine via priorities and training below.</p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Step 3 · Priorities</h2>
            <p className="text-xs text-white/60">Choose up to 3 areas to focus enablement.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-3">
            {(Object.keys(LABEL) as Priority[]).map((p) => {
              const active = selected.includes(p);
              const room = active || selected.length < 3;
              return (
                <button
                  key={p}
                  onClick={() => setSelected((prev) => (active ? prev.filter((x) => x !== p) : room ? [...prev, p] : prev))}
                  className={`btn-choice ${active ? "btn-choice--active" : ""}`}
                >
                  <div className="font-medium">{LABEL[p]}</div>
                  <div className="text-xs opacity-80 mt-1">{HELP[p]}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 4 */}
        <section className="section-card">
          <h2 className="section-title mb-4">Step 4 · Training & Duration</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">Fully-loaded hourly cost ({sym(currency)})</label>
              <input
                className="input"
                type="number"
                min={0}
                value={hourlyCost}
                onChange={(e) => setHourlyCost(+e.target.value || 0)}
                placeholder="e.g., 35"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Duration (months)</label>
              <input
                className="input"
                type="number"
                min={1}
                value={durationMonths}
                onChange={(e) => setDurationMonths(+e.target.value || 1)}
                placeholder="e.g., 6"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Department (for next steps)</label>
              <input className="input" value={team} readOnly />
            </div>
          </div>
        </section>

        {/* Step 5 */}
        <section className="section-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Step 5 · Results</h2>
            <p className="text-xs text-white/60">Modeled impact from your inputs</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="kpi-tile">
              <div className="kpi-label">Monthly savings</div>
              <div className="kpi-value">{fmtMoney(kpis.monthly)}</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-label">Payback</div>
              <div className="kpi-value">{kpis.payback.toFixed(1)} mo</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-label">Annual ROI</div>
              <div className="kpi-value">×{kpis.annualRoi.toFixed(1)}</div>
            </div>
            <div className="kpi-tile">
              <div className="kpi-label">Hours saved / year</div>
              <div className="kpi-value">{fmt(kpis.hoursYear)}</div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left font-medium">Priority</th>
                  <th className="text-left font-medium">Why it matters</th>
                  <th className="text-right font-medium">Hours / wk</th>
                  <th className="text-right font-medium">Est. Value / wk</th>
                </tr>
              </thead>
              <tbody>
                {(["throughput","quality","onboarding","retention","upskilling"] as Priority[])
                  .filter((p) => selected.includes(p))
                  .map((p) => {
                    const hrs = distribution[p];
                    const val = hrs * (hourlyCost || 0);
                    return (
                      <tr key={p}>
                        <td>{LABEL[p]}</td>
                        <td className="text-white/80">{HELP[p]}</td>
                        <td className="text-right">{fmt(hrs)}</td>
                        <td className="text-right">{fmtMoney(val)}</td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>—</td>
                  <td className="text-right">{fmt(hoursTeamPerWeek)}</td>
                  <td className="text-right">{fmtMoney(hoursTeamPerWeek * (hourlyCost || 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 text-sm text-white/85">
            <div className="font-semibold mb-2">Suggested next steps</div>
            <ul className="list-disc pl-5 space-y-1 text-white/80">
              <li>Map top 3 workflows for {team}; publish prompt templates.</li>
              <li>Run a manager-first enablement session; measure in-task usage.</li>
              <li>Set quarterly ROI reviews; correlate usage with retention.</li>
              <li>Expand champions cohort; target 60% competency coverage.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
