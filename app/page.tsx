"use client";
import { useState } from "react";

/* ============================================================
   Constants
============================================================ */
const BLUE = "#3366FF";

const TEAMS = [
  { value: "company", label: "Company-wide" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "operations", label: "Operations" },
  { value: "finance", label: "Finance" },
  { value: "it", label: "IT / Tech" },
] as const;

type Team = (typeof TEAMS)[number]["value"];
type Currency = "EUR" | "USD" | "GBP";
type Goal =
  | "throughput"
  | "quality"
  | "onboarding"
  | "retention"
  | "cost"
  | "upskilling";

const GOAL_META: Record<
  Goal,
  { label: string; hint: string }
> = {
  throughput: { label: "Throughput", hint: "Faster project or task completion" },
  quality: { label: "Quality / Rework", hint: "Reduce rework cycles" },
  onboarding: { label: "Onboarding", hint: "Faster ramp-up of new hires" },
  retention: { label: "Retention", hint: "Reduce churn of skilled talent" },
  cost: { label: "Cost", hint: "Reduce tool overlap or vendor spend" },
  upskilling: { label: "Upskilling", hint: "Boost team AI proficiency" },
};

/* ============================================================
   Utility
============================================================ */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function fmtMoney(v: number, c: Currency) {
  return v.toLocaleString(undefined, {
    style: "currency",
    currency: c,
    maximumFractionDigits: 0,
  });
}
function symbol(c: Currency) {
  return c === "EUR" ? "€" : c === "USD" ? "$" : "£";
}

/* ============================================================
   Page
============================================================ */
export default function Calculator() {
  const [step, setStep] = useState(0);
  const [team, setTeam] = useState<Team>("company");
  const [employees, setEmployees] = useState(10);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [avgSalary, setAvgSalary] = useState(60000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState(300);
  const [durationMonths, setDurationMonths] = useState(6);
  const [maturity, setMaturity] = useState(3);
  const [useMaturityEstimate, setUseMaturityEstimate] = useState(true);
  const [selected, setSelected] = useState<Goal[]>([]);

  const hourly = avgSalary / 2080;
  const maturityHoursPerPerson = maturity * 0.3;
  const maturityHoursTeam = maturityHoursPerPerson * employees * 52;

  const stepPct = step / 8;
  const steps = [
    { key: "team", title: "Team" },
    { key: "maturity", title: "AI Maturity" },
    { key: "priorities", title: "Priorities" },
    ...selected.map((g) => ({ key: `goal-${g}`, title: GOAL_META[g].label })),
    { key: "results", title: "Results" },
  ];

  const gotoNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const gotoPrev = () => setStep((s) => Math.max(s - 1, 0));

  /* ============================================================
     Styles
  ============================================================ */
  const container = {
    maxWidth: 980,
    margin: "0 auto",
    padding: "0 16px",
    fontFamily: "Inter, sans-serif",
    color: "#0E1320",
  } as const;

  const heroImgWrap = {
    width: "100%",
    marginBottom: 16,
    position: "relative",
    zIndex: 2,
  } as const;

  const heroImg = {
    width: "100%",
    height: "auto",
    maxHeight: 320,
    objectFit: "cover",
    display: "block",
    borderRadius: 18,
    border: "1px solid #E7ECF7",
    boxShadow: "0 18px 40px rgba(15,42,120,.08)",
  } as const;

  const card = {
    background: "#fff",
    border: "1px solid #E7ECF7",
    borderRadius: 16,
    boxShadow: "0 10px 28px rgba(12,20,38,.08)",
    padding: 18,
    margin: "16px auto",
  } as const;

  const h3 = {
    margin: "0 0 .7rem",
    fontSize: "1.06rem",
    fontWeight: 900,
  } as const;

  const label = { fontWeight: 800, display: "block", marginBottom: 6 } as const;
  const input = {
    width: "100%",
    border: "1px solid #E2E8F5",
    borderRadius: 12,
    padding: "10px 12px",
    minHeight: 42,
  } as const;

  const btn = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 800,
    border: "1px solid #E7ECF7",
    cursor: "pointer",
    background: "#fff",
    color: "#0E1320",
  } as const;

  const btnPrimary = {
    ...btn,
    background: BLUE,
    color: "#fff",
    borderColor: "transparent",
    boxShadow: "0 8px 20px rgba(31,77,255,.25)",
  } as const;

  const centerRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  } as const;

  const gridAuto = {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  } as const;

  /* ============================================================
     Render
  ============================================================ */
  return (
    <main style={container}>
      {/* HERO */}
      <section style={heroImgWrap}>
        <img src="/hero.png" alt="Hero" style={heroImg} />
        <h1 style={{ marginTop: 12, fontSize: "1.4rem", fontWeight: 900 }}>
          AI at Work — Human Productivity ROI
        </h1>
        <p style={{ margin: "6px 0 10px", color: "#475569" }}>
          Quantify time saved, payback, and retention impact from training
          managers and teams to work effectively with AI.
        </p>
      </section>

      {/* STEPPER */}
      <section style={{ ...card, padding: 12 }}>
        <div
          style={{
            height: 10,
            background: "#E9EDFB",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: `${stepPct * 100}%`,
              background: BLUE,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {steps.map((s, i) => (
            <div
              key={s.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: i <= step ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  border: i <= step ? "none" : "2px solid #CFD8FF",
                  background: i <= step ? BLUE : "#fff",
                  color: i <= step ? "#fff" : "#0E1320",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 12,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontWeight: 800, fontSize: 12 }}>{s.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* STEP 0: TEAM */}
      {steps[step]?.key === "team" && (
        <section style={card}>
          <h3 style={h3}>Team</h3>
          <div style={gridAuto}>
            <div>
              <label style={label}>Department</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as Team)}
                style={input}
              >
                {TEAMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={label}>Employees in scope</label>
              <input
                type="number"
                min={1}
                value={employees}
                onChange={(e) =>
                  setEmployees(Number(e.target.value || 0))
                }
                style={input}
              />
            </div>

            <div>
              <label style={label}>Currency</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["EUR", "USD", "GBP"] as Currency[]).map((c) => {
                  const active = currency === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      style={{
                        ...btn,
                        background: active ? BLUE : "#fff",
                        color: active ? "#fff" : "#0E1320",
                      }}
                      onClick={() => setCurrency(c)}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={centerRow}>
            <div />
            <button style={btnPrimary} onClick={gotoNext}>
              Continue →
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
