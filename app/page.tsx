'use client';
import Image from 'next/image';
import React, { useState } from 'react';

/* ============================================================
   Constants and Types
============================================================ */
type Currency = 'USD' | 'EUR' | 'GBP' | 'AUD';
type Goal = 'throughput' | 'quality' | 'onboarding' | 'retention' | 'cost' | 'upskilling';
const BLUE = '#3366FF';

const symbol = (c: Currency) =>
  c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : 'A$';

const fmtMoney = (v: number, c: Currency) =>
  `${symbol(c)}${Math.round(v).toLocaleString()}`;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

/* ============================================================
   Main Page
============================================================ */
export default function Page() {
  // Hero styles
  const heroImgWrap = {
    maxWidth: 980,
    margin: '0 auto 16px',
    position: 'relative',
    zIndex: 10,
  } as const;

  const heroImg = {
    width: '100%',
    display: 'block',
    borderRadius: 18,
    border: '1px solid #E7ECF7',
    boxShadow: '0 18px 40px rgba(15,42,120,.08)',
  } as const;

  /* ------------------- State ------------------- */
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [employees, setEmployees] = useState(25);
  const [avgSalary, setAvgSalary] = useState(80000);
  const [aiMaturity, setAiMaturity] = useState(3);
  const [selected, setSelected] = useState<Goal[]>([]);

  // Goal state
  const [tpHoursPerWeek, setTpHoursPerWeek] = useState(1);
  const [tpUtilPct, setTpUtilPct] = useState(60);
  const [qlEventsPerPersonPerMonth, setQlEventsPerPersonPerMonth] = useState(3);
  const [qlReductionPct, setQlReductionPct] = useState(20);
  const [qlHoursPerFix, setQlHoursPerFix] = useState(1.5);
  const [obHiresPerYear, setObHiresPerYear] = useState(10);
  const [obBaselineRamp, setObBaselineRamp] = useState(4);
  const [obImprovedRamp, setObImprovedRamp] = useState(3);
  const [rtBaselineTurnoverPct, setRtBaselineTurnoverPct] = useState(20);
  const [rtReductionPct, setRtReductionPct] = useState(5);
  const [rtReplacementCostPct, setRtReplacementCostPct] = useState(50);
  const [csConsolidationPerMonth, setCsConsolidationPerMonth] = useState(500);
  const [csEliminatedTools, setCsEliminatedTools] = useState(2);
  const [csAvgToolCostPerMonth, setCsAvgToolCostPerMonth] = useState(120);
  const [upCoveragePct, setUpCoveragePct] = useState(50);
  const [upHoursPerWeek, setUpHoursPerWeek] = useState(0.5);
  const [upUtilPct, setUpUtilPct] = useState(70);

  /* ------------------- Derived ------------------- */
  const hourly = avgSalary / 1920;
  const maturityHoursPerPerson = aiMaturity * 0.8;
  const maturityHoursTeam = maturityHoursPerPerson * employees;
  const totalHours = maturityHoursTeam;
  const annualValue = totalHours * hourly;
  const roiMultiple = annualValue / (avgSalary * employees * 0.05);
  const paybackMonths = (avgSalary * employees * 0.05) / (annualValue / 12);

  const steps = [
    { key: 'intro', title: 'Start' },
    { key: 'maturity', title: 'AI Maturity' },
    { key: 'priorities', title: 'Priorities' },
    ...selected.map((g) => ({ key: `goal-${g}`, title: g })),
    { key: 'results', title: 'Results' },
  ];

  const gotoNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const gotoPrev = () => setStep((s) => Math.max(s - 1, 0));

  const toggleGoal = (g: Goal) => {
    setSelected((sel) =>
      sel.includes(g) ? sel.filter((x) => x !== g) : [...sel, g].slice(0, 3)
    );
  };

  /* ============================================================
     Layout Styles
  ============================================================ */
  const card = {
    background: '#fff',
    border: '1px solid #E7ECF7',
    borderRadius: 16,
    boxShadow: '0 10px 28px rgba(12,20,38,.08)',
    padding: 18,
    maxWidth: 980,
    margin: '16px auto',
  } as const;
  const h3 = { margin: '0 0 .7rem', fontSize: '1.06rem', fontWeight: 900, color: '#0F172A' } as const;
  const help = { fontSize: '.86rem', color: '#667085' } as const;
  const btn = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 12,
    fontWeight: 800,
    border: '1px solid #E7ECF7',
    cursor: 'pointer',
    background: '#fff',
  } as const;
  const btnPrimary = {
    ...btn,
    background: `linear-gradient(90deg,#5A7BFF,${BLUE})`,
    color: '#fff',
    borderColor: 'transparent',
    boxShadow: '0 8px 20px rgba(31,77,255,.25)',
  } as const;
  const centerRow = { display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 } as const;

  /* ============================================================
     Render
  ============================================================ */
  return (
    <main style={{ padding: '24px 12px 80px', background: '#fff', color: '#0F172A' }}>
      {/* HERO IMAGE */}
      <div style={heroImgWrap}>
        <Image
          src="/hero.png"
          alt="Hero banner"
          width={980}
          height={400}
          style={heroImg}
          priority
        />
      </div>

      {/* STEP 0 */}
      {steps[step]?.key === 'intro' && (
        <section style={card}>
          <h3 style={h3}>HR Digitisation — Business Case Builder</h3>
          <p style={help}>
            Calculate potential ROI from digitising your HR and AI initiatives.
          </p>
          <div style={centerRow}>
            <button style={btnPrimary} onClick={gotoNext}>
              Get Started →
            </button>
          </div>
        </section>
      )}

      {/* STEP 1: AI MATURITY */}
      {steps[step]?.key === 'maturity' && (
        <section style={card}>
          <h3 style={h3}>AI Maturity</h3>
          <p style={help}>Assess where your team is today on AI adoption (1–10).</p>
          <input
            type="range"
            min={1}
            max={10}
            value={aiMaturity}
            onChange={(e) => setAiMaturity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <p style={{ ...help, marginTop: 8 }}>
            {aiMaturity} — {maturityLabel(aiMaturity)}
          </p>

          <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 900 }}>Per person / week</span>
              <span style={{ fontWeight: 900 }}>{maturityHoursPerPerson.toFixed(1)}h</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 900 }}>Team / year</span>
              <span style={{ fontWeight: 900 }}>{maturityHoursTeam.toLocaleString()}h</span>
            </div>
          </div>

          <div style={centerRow}>
            <button style={btn} onClick={gotoPrev}>
              ← Back
            </button>
            <button style={btnPrimary} onClick={gotoNext}>
              Continue →
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: PRIORITIES */}
      {steps[step]?.key === 'priorities' && (
        <section style={card}>
          <h3 style={h3}>Priorities</h3>
          <p style={help}>Select up to three focus areas for your business case.</p>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            {(['throughput','quality','onboarding','retention','cost','upskilling'] as Goal[]).map((g) => {
              const on = selected.includes(g);
              return (
                <label
                  key={g}
                  style={{
                    border: '1px solid #E7ECF7',
                    borderRadius: 14,
                    padding: 12,
                    background: on ? 'rgba(51,102,254,.06)' : '#fff',
                    display: 'grid',
                    gap: 8,
                    gridTemplateColumns: 'auto 1fr',
                    alignItems: 'start',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleGoal(g)}
                    style={{ transform: 'scale(1.2)', marginTop: 2 }}
                  />
                  <div>
                    <div style={{ fontWeight: 900, textTransform: 'capitalize' }}>{g}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={centerRow}>
            <button style={btn} onClick={gotoPrev}>
              ← Back
            </button>
            <button style={btnPrimary} onClick={gotoNext} disabled={selected.length === 0}>
              Continue →
            </button>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {steps[step]?.key === 'results' && (
        <section style={card}>
          <h3 style={h3}>Results</h3>
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
              marginBottom: 10,
            }}
          >
            <KPI label="Total annual value" value={fmtMoney(annualValue, currency)} />
            <KPI label="Annual ROI" value={`${roiMultiple.toFixed(1)}×`} />
            <KPI
              label="Payback"
              value={Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : '—'}
            />
            <KPI label="Total hours saved (est.)" value={totalHours.toLocaleString()} />
          </div>
          <div style={centerRow}>
            <button style={btn} onClick={gotoPrev}>
              ← Back
            </button>
            <button style={btnPrimary} onClick={() => setStep(0)}>
              Start over
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

/* ============================================================
   Small components
============================================================ */
function KPI({ label, value }: { label: string; value: string }) {
  const kpiCard = {
    background: '#fff',
    border: '1px solid #E8EEFF',
    borderRadius: 14,
    padding: 14,
    position: 'relative',
    minHeight: 84,
  } as const;
  const kpiTopBar = {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    height: 4,
    borderRadius: '14px 14px 0 0',
    background: `linear-gradient(90deg,#6D8BFF,${BLUE})`,
  } as const;
  const kpiLabel = {
    fontSize: '.76rem',
    color: '#475569',
    fontWeight: 800,
    marginTop: 2,
  } as const;
  const kpiValue = { fontWeight: 900, fontSize: '1.16rem' } as const;
  return (
    <div style={kpiCard}>
      <div style={kpiTopBar} />
      <div style={kpiLabel}>{label}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

/* ============================================================
   Utilities
============================================================ */
function maturityLabel(n: number) {
  if (n <= 2)
    return 'Early: ad-hoc experiments; big wins from prompt basics + workflow mapping';
  if (n <= 4)
    return 'Emerging: pockets of AI use; templates + enablement unlock compounding gains';
  if (n <= 6)
    return 'Developing: growing adoption; guardrails & analytics standardize outcomes';
  if (n <= 8)
    return 'Scaled: embedded in key workflows; focus on quality & reliability';
  return 'Advanced: pervasive; optimization, automation, and continuous improvement';
}
