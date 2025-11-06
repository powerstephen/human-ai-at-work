'use client';
import React, { useMemo, useState } from 'react';

/* ============================================================
   Types, constants, helpers
============================================================ */
type Team = 'all'|'hr'|'ops'|'marketing'|'sales'|'support'|'product';
type Currency = 'EUR'|'USD'|'GBP';
type Goal = 'throughput'|'quality'|'onboarding'|'retention'|'cost'|'upskilling';

const BLUE = '#3366FE';

const TEAMS: {label:string; value:Team}[] = [
  { label: 'Company-wide', value: 'all' },
  { label: 'HR / People Ops', value: 'hr' },
  { label: 'Operations', value: 'ops' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Sales', value: 'sales' },
  { label: 'Customer Support', value: 'support' },
  { label: 'Product', value: 'product' },
];

const GOAL_META: Record<Goal, {label:string; hint:string}> = {
  throughput: { label: 'Throughput',              hint: 'Ship more, remove blockers' },
  quality:    { label: 'Quality / Rework',        hint: 'Cut rework & error rates'   },
  onboarding: { label: 'Onboarding speed',        hint: 'Faster time-to-productivity'},
  retention:  { label: 'Retention',               hint: 'Avoid regretted churn cost' },
  cost:       { label: 'Cost',                    hint: 'Tool consolidation savings' },
  upskilling: { label: 'Upskilling',              hint: 'Competency coverage → gains'},
};

const symbol = (c: Currency) => (c === 'EUR' ? '€' : c === 'USD' ? '$' : '£');
const fmtMoney = (n:number, c:Currency) =>
  new Intl.NumberFormat('en', { style:'currency', currency:c, maximumFractionDigits:0 }).format(n);
const clamp = (n:number, lo:number, hi:number)=>Math.max(lo, Math.min(hi, n));
const hourlyFromSalary = (s:number) => s / (52 * 40);

/* ============================================================
   Error Boundary (prevents blank white screen)
============================================================ */
class EB extends React.Component<{children:React.ReactNode},{err?:Error}> {
  constructor(p:any){ super(p); this.state={}; }
  static getDerivedStateFromError(e:Error){ return { err:e }; }
  componentDidCatch(e:Error, info:any){ console.error('Crash:', e, info); }
  render(){
    if (this.state.err) {
      return (
        <main style={{ maxWidth: 1120, margin:'24px auto', padding:'0 20px' }}>
          <div style={{ background:'#fff5f5', border:'1px solid #ffd6d6', color:'#7a1f1f', borderRadius:12, padding:16 }}>
            <h2 style={{ marginTop:0 }}>Something went wrong</h2>
            <pre style={{ whiteSpace:'pre-wrap' }}>{String(this.state.err?.message||this.state.err)}</pre>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   Main page
============================================================ */
export default function Page(){
  return (
    <EB>
      <Calculator />
    </EB>
  );
}

/* ============================================================
   Calculator
============================================================ */
function Calculator(){
  /* ------ Global/basic state ------ */
  const [step, setStep] = useState<number>(0); // 0 Team, 1 Maturity, 2 Priorities, then goal steps..., last Results

  const [currency, setCurrency] = useState<Currency>('EUR');
  const [team, setTeam] = useState<Team>('all');
  const [employees, setEmployees] = useState<number>(150);

  // Program cost
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const hourly = useMemo(()=>hourlyFromSalary(avgSalary), [avgSalary]);
  const programCost = trainingPerEmployee * employees * (durationMonths/12);

  /* ------ AI Maturity ------ */
  const [maturity, setMaturity] = useState<number>(3); // 1..10
  const [useMaturityEstimate, setUseMaturityEstimate] = useState<boolean>(true);
  // Map maturity → suggested hours saved / person / week (1→5h, 10→1h)
  const maturityHoursMap = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1.2, 1];
  const maturityHoursPerPerson = maturityHoursMap[clamp(maturity,1,10)-1] ?? 3;
  const maturityHoursTeam = Math.round(maturityHoursPerPerson * 52 * employees);

  /* ------ Choose Top-3 priorities (tick boxes) ------ */
  const [selected, setSelected] = useState<Goal[]>(['throughput','retention','upskilling']); // defaults
  const toggleGoal = (g:Goal)=>{
    setSelected(prev=>{
      const exists = prev.includes(g);
      if (exists) return prev.filter(x=>x!==g);
      if (prev.length>=3) return prev; // cap at 3
      return [...prev, g];
    });
  };

  /* ------ Goal-specific inputs ------ */
  // Throughput
  const [tpHoursPerWeek, setTpHoursPerWeek] = useState<number>(3.0);
  const [tpUtilPct, setTpUtilPct] = useState<number>(70);

  // Quality
  const [qlEventsPerPersonPerMonth, setQlEventsPerPersonPerMonth] = useState<number>(3);
  const [qlReductionPct, setQlReductionPct] = useState<number>(20);
  const [qlHoursPerFix, setQlHoursPerFix] = useState<number>(1);

  // Onboarding
  const [obHiresPerYear, setObHiresPerYear] = useState<number>(24);
  const [obBaselineRamp, setObBaselineRamp] = useState<number>(3);
  const [obImprovedRamp, setObImprovedRamp] = useState<number>(2);

  // Retention
  const [rtBaselineTurnoverPct, setRtBaselineTurnoverPct] = useState<number>(20);
  const [rtReductionPct, setRtReductionPct] = useState<number>(10);
  const [rtReplacementCostPct, setRtReplacementCostPct] = useState<number>(50);

  // Cost
  const [csConsolidationPerMonth, setCsConsolidationPerMonth] = useState<number>(0);
  const [csEliminatedTools, setCsEliminatedTools] = useState<number>(0);
  const [csAvgToolCostPerMonth, setCsAvgToolCostPerMonth] = useState<number>(200);

  // Upskilling
  const [upCoveragePct, setUpCoveragePct] = useState<number>(60);
  const [upHoursPerWeek, setUpHoursPerWeek] = useState<number>(2.0);
  const [upUtilPct, setUpUtilPct] = useState<number>(70);

  /* ------ Formulas (maturity can drive hours) ------ */
  const hoursPerWeekThroughput = useMaturityEstimate ? maturityHoursPerPerson : tpHoursPerWeek;
  const hoursPerWeekUpskilling = useMaturityEstimate ? maturityHoursPerPerson : upHoursPerWeek;

  const valThroughput = selected.includes('throughput')
    ? hoursPerWeekThroughput * 52 * employees * hourly * clamp(tpUtilPct/100,0,1)
    : 0;

  const valQuality = selected.includes('quality')
    ? (qlEventsPerPersonPerMonth * employees * 12 * (qlReductionPct/100) * qlHoursPerFix) * hourly * clamp(tpUtilPct/100,0,1)
    : 0;

  const valOnboarding = selected.includes('onboarding')
    ? clamp(obBaselineRamp - Math.min(obBaselineRamp, obImprovedRamp), 0, 24) * obHiresPerYear * (avgSalary/12) * clamp(tpUtilPct/100,0,1)
    : 0;

  const valRetention = selected.includes('retention')
    ? (employees * (rtBaselineTurnoverPct/100) * (rtReductionPct/100)) * (avgSalary * (rtReplacementCostPct/100))
    : 0;

  const valCost = selected.includes('cost')
    ? (csConsolidationPerMonth + csEliminatedTools*csAvgToolCostPerMonth) * 12
    : 0;

  // Upskilling base (before overlap guard)
  const upBase = selected.includes('upskilling')
    ? (upCoveragePct/100) * employees * hoursPerWeekUpskilling * 52 * hourly * clamp(upUtilPct/100,0,1)
    : 0;
  // Overlap guard with Throughput
  const valUpskilling = (selected.includes('throughput') && selected.includes('upskilling'))
    ? upBase * 0.7
    : upBase;

  const annualValue = valThroughput + valQuality + valOnboarding + valRetention + valCost + valUpskilling;
  const monthlySavings = annualValue / 12;
  const roiMultiple = programCost>0 ? (annualValue/programCost) : 0;
  const paybackMonths = monthlySavings>0 ? (programCost / monthlySavings) : Infinity;

  // hours for results (annual totals)
  const hoursThroughput = selected.includes('throughput') ? hoursPerWeekThroughput*52*employees : 0;
  const hoursQuality = selected.includes('quality') ? qlEventsPerPersonPerMonth*employees*12*(qlReductionPct/100)*qlHoursPerFix : 0;
  const hoursUpskilling = selected.includes('upskilling')
    ? Math.round(((upCoveragePct/100)*employees*hoursPerWeekUpskilling*52) * (selected.includes('throughput') ? 0.7 : 1))
    : 0;
  const totalHours = Math.round(hoursThroughput + hoursQuality + hoursUpskilling);

  /* ------ Steps ------ */
  const steps = useMemo(()=>{
    const arr: {key:string; title:string}[] = [];
    arr.push({ key:'team',      title:'Team' });
    arr.push({ key:'maturity',  title:'AI Maturity' });
    arr.push({ key:'priorities',title:'Priorities' });
    selected.forEach(g => arr.push({ key:`goal-${g}`, title: GOAL_META[g].label }));
    arr.push({ key:'results',   title:'Results' });
    return arr;
  }, [selected]);

  const gotoNext = ()=> setStep(s => clamp(s+1, 0, steps.length-1));
  const gotoPrev = ()=> setStep(s => clamp(s-1, 0, steps.length-1));

  /* ============================================================
     Styles
  ============================================================ */
  const container = { maxWidth: 1120, margin:'0 auto', padding:'24px 20px 32px', fontFamily:'Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial', boxSizing:'border-box' } as const;

  // 👉 Hero uses your PNG and aligns flush with card width
  const hero = {
    backgroundImage: `linear-gradient(135deg, rgba(75,111,255,0.92) 0%, rgba(51,102,254,0.96) 60%), url('/hero.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color:'#fff', borderRadius:18, boxShadow:'0 18px 40px rgba(15,42,120,.25)',
    padding:18, maxWidth:980, margin:'0 auto 16px', border:'1px solid rgba(255,255,255,.24)'
  } as const;

  const heroGrid = { display:'grid', gap:8, gridTemplateColumns:'repeat(4, minmax(120px, 1fr))' } as const;
  const heroStat = { border:'1px solid rgba(255,255,255,.35)', borderRadius:12, padding:'8px 10px', background:'rgba(255,255,255,.10)', fontWeight:800, minHeight:46, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 } as const;

  const card = { background:'#fff', border:'1px solid #E7ECF7', borderRadius:16, boxShadow:'0 10px 28px rgba(12,20,38,.08)', padding:18, maxWidth:980, margin:'16px auto' } as const;
  const h3 = { margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900, color:'#0F172A' } as const;

  const gridAuto = { display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', alignItems:'start' } as const;
  const centerRow = { maxWidth:980, margin:'16px auto 0', display:'flex', gap:8, justifyContent:'space-between', flexWrap:'wrap' } as const;

  const input = { width:'100%', border:'1px solid #E2E8F5', borderRadius:12, padding:'10px 12px', display:'block', boxSizing:'border-box', minHeight:42 } as const;
  const label = { fontWeight:800, display:'block', marginBottom:6 } as const;
  const help = { fontSize:'.86rem', color:'#667085' } as const;

  const btn = { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, fontWeight:800, border:'1px solid #E7ECF7', cursor:'pointer', background:'#fff' } as const;
  const btnPrimary = { ...btn, background:`linear-gradient(90deg,#5A7BFF,${BLUE})`, color:'#fff', borderColor:'transparent', boxShadow:'0 8px 20px rgba(31,77,255,.25)' } as const;
  const chip = (active:boolean)=>({
    display:'inline-flex', alignItems:'center', gap:8, padding:'8px 10px',
    borderRadius:999, border:`1px solid ${active?'transparent':'#E7ECF7'}`,
    background: active ? BLUE : '#fff', color: active ? '#fff' : '#0E1320', fontWeight:800, cursor:'pointer'
  } as const);

  const stepperWrap = { display:'flex', alignItems:'center', gap:10, marginTop:10, flexWrap:'wrap' } as const;
  const stepperLabels = { display:'flex', justifyContent:'space-between', width:'100%', gap:8, flexWrap:'nowrap' } as const;

  const stepPct = steps.length>1 ? (step/(steps.length-1)) : 0;

  /* ============================================================
     Render
  ============================================================ */
  return (
    <main style={container}>
      {/* HERO */}
      <section style={hero}>
        <h1 style={{ margin:0, fontSize:'1.2rem', fontWeight:900 }}>AI at Work — Human Productivity ROI</h1>
        <p style={{ margin:'6px 0 10px', color:'rgba(255,255,255,.92)' }}>
          Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
        </p>
        <div style={heroGrid}>
          <div style={heroStat}>Payback (months)</div>
          <div style={heroStat}>Annual ROI (×)</div>
          <div style={heroStat}>Total Annual Value</div>
          <div style={heroStat}>Total Hours Saved</div>
        </div>
      </section>

      {/* STEPPER */}
      <section style={{ ...card, padding:12 }}>
        <div style={{ height:10, background:'#E9EDFB', borderRadius:999, overflow:'hidden' }}>
          <span style={{ display:'block', height:'100%', width:`${stepPct*100}%`, background:`linear-gradient(90deg,#6D8BFF,${BLUE})` }} />
        </div>
        <div style={stepperWrap}>
          <div style={stepperLabels}>
            {steps.map((s, i)=>(
              <div key={s.key} style={{ display:'flex', alignItems:'center', gap:6, minWidth:0, opacity:i<=step?1:.55 }}>
                <div style={{
                  width:26, height:26, borderRadius:999,
                  border: i<=step ? 'none' : '2px solid #CFD8FF',
                  background: i<=step ? BLUE : '#fff',
                  color: i<=step ? '#fff' : '#0E1320',
                  display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, flex:'0 0 auto'
                }}>{i+1}</div>
                <span style={{ fontWeight:800, fontSize:12, whiteSpace:'nowrap' }}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 0: TEAM */}
      {steps[step]?.key==='team' && (
        <section style={card}>
          <h3 style={h3}>Team</h3>
          <div style={gridAuto}>
            <div>
              <label style={label}>Department</label>
              <select value={team} onChange={e=>setTeam(e.target.value as Team)} style={input}>
                {TEAMS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <p style={help}>Choose a function or “Company-wide”.</p>
            </div>

            <div>
              <label style={label}>Employees in scope</label>
              <input type="number" min={1} value={employees} onChange={e=>setEmployees(Number(e.target.value||0))} style={input}/>
            </div>

            <div>
              <label style={label}>Currency</label>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {(['EUR','USD','GBP'] as Currency[]).map(c=>{
                  const active = currency===c;
                  return (
                    <button key={c} type="button" style={chip(active)} onClick={()=>setCurrency(c)}>{c}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop:14 }}>
            <h4 style={{ margin:'0 0 8px', fontSize:'.95rem', fontWeight:900 }}>Program cost assumptions</h4>
            <div style={gridAuto}>
              <FieldNumber label={`Average annual salary (${symbol(currency)})`} value={avgSalary} onChange={setAvgSalary} step={1000}/>
              <FieldNumber label={`Training per employee (${symbol(currency)})`} value={trainingPerEmployee} onChange={setTrainingPerEmployee} step={25}/>
              <FieldNumber label="Program duration (months)" value={durationMonths} onChange={setDurationMonths} min={1} step={1}/>
            </div>
          </div>

          <div style={centerRow}>
            <div />
            <button style={btnPrimary} onClick={gotoNext}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 1: AI MATURITY */}
      {steps[step]?.key==='maturity' && (
        <section style={card}>
          <h3 style={h3}>AI Maturity</h3>
          <p style={help}>Slide to rate current adoption. Use it to estimate baseline hours saved.</p>

          <div style={{ display:'grid', gap:16, gridTemplateColumns:'1.3fr .7fr', alignItems:'start' }}>
            <div>
              <label style={{ fontWeight:800, display:'block', marginBottom:6 }}>Current level (1–10)</label>
              <input
                type="range" min={1} max={10} value={maturity}
                onChange={e=>setMaturity(Number(e.target.value))}
                style={{ width:'100%' }}
              />
              {/* evenly spaced 1..10 under the slider */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(10,1fr)', marginTop:6 }}>
                {Array.from({length:10}).map((_,i)=>(
                  <div key={i} style={{ textAlign:'center', fontSize:12, color:'#667085' }}>{i+1}</div>
                ))}
              </div>

              <div style={{ marginTop:8, padding:'10px 12px', border:'1px solid #E7ECF7', borderRadius:12, background:'#F8FAFF' }}>
                <strong style={{ display:'block' }}>
                  {maturity}. {maturityLabel(maturity)}
                </strong>
                <small style={{ color:'#475569' }}>
                  Guidance: at this level we often see ~{maturityHoursPerPerson.toFixed(1)}h saved per person/week once trained.
                </small>
              </div>

              <label style={{ display:'flex', gap:8, alignItems:'center', marginTop:10, cursor:'pointer' }}>
                <input type="checkbox" checked={useMaturityEstimate} onChange={e=>setUseMaturityEstimate(e.target.checked)} />
                <span style={{ fontWeight:800 }}>Use maturity-based hours in calculations</span>
              </label>
            </div>

            <div style={{ border:'1px solid #E7ECF7', borderRadius:14, padding:14 }}>
              <div style={{ fontSize:12, color:'#64748B', fontWeight:900, textTransform:'uppercase', letterSpacing:'.02em' }}>Estimated Hours Saved</div>
              <div style={{ marginTop:8, display:'grid', gap:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:900 }}>Per person / week</span>
                  <span style={{ fontWeight:900 }}>{maturityHoursPerPerson.toFixed(1)}h</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontWeight:900 }}>Team / year</span>
                  <span style={{ fontWeight:900 }}>{maturityHoursTeam.toLocaleString()}h</span>
                </div>
              </div>
            </div>
          </div>

          <div style={centerRow}>
            <button style={btn} onClick={gotoPrev}>← Back</button>
            <button style={btnPrimary} onClick={gotoNext}>Continue →</button>
          </div>
        </section>
      )}

      {/* STEP 2: PRIORITIES (tick boxes) */}
      {steps[step]?.key==='priorities' && (
        <section style={card}>
          <h3 style={h3}>Priorities</h3>
          <p style={help}>Select up to three priorities to focus your business case.</p>

          <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))' }}>
            {(Object.keys(GOAL_META) as Goal[]).map(g=>{
              const on = selected.includes(g);
              return (
                <label key={g} style={{
                  border:'1px solid #E7ECF7', borderRadius:14, padding:12, background:on?'rgba(51,102,254,.06)':'#fff',
                  display:'grid', gap:8, gridTemplateColumns:'auto 1fr', alignItems:'start'
                }}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={()=>toggleGoal(g)}
                    style={{ transform:'scale(1.2)', marginTop:2 }}
                  />
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontWeight:900 }}>{GOAL_META[g].label}</span>
                    </div>
                    <div style={{ marginTop:4, fontSize:'.86rem', color:'#667085' }}>{GOAL_META[g].hint}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={{ marginTop:8, color:'#64748B', fontSize:12 }}>
            Selected: <strong>{selected.length}</strong> / 3
          </div>

          <div style={centerRow}>
            <button style={btn} onClick={gotoPrev}>← Back</button>
            <button style={btnPrimary} onClick={gotoNext} disabled={selected.length===0}>Continue →</button>
          </div>
        </section>
      )}

      {/* AUTO-GENERATED GOAL STEPS */}
      {steps[step]?.key?.startsWith('goal-') && (
        <GoalStep
          keyStr={steps[step].key}
          goal={steps[step].key.replace('goal-','') as Goal}
          currency={currency}
          employees={employees}
          hourly={hourly}
          // throughput
          tpHoursPerWeek={tpHoursPerWeek} setTpHoursPerWeek={setTpHoursPerWeek}
          tpUtilPct={tpUtilPct} setTpUtilPct={setTpUtilPct}
          // quality
          qlEventsPerPersonPerMonth={qlEventsPerPersonPerMonth} setQlEventsPerPersonPerMonth={setQlEventsPerPersonPerMonth}
          qlReductionPct={qlReductionPct} setQlReductionPct={setQlReductionPct}
          qlHoursPerFix={qlHoursPerFix} setQlHoursPerFix={setQlHoursPerFix}
          // onboarding
          obHiresPerYear={obHiresPerYear} setObHiresPerYear={setObHiresPerYear}
          obBaselineRamp={obBaselineRamp} setObBaselineRamp={setObBaselineRamp}
          obImprovedRamp={obImprovedRamp} setObImprovedRamp={setObImprovedRamp}
          // retention
          rtBaselineTurnoverPct={rtBaselineTurnoverPct} setRtBaselineTurnoverPct={setRtBaselineTurnoverPct}
          rtReductionPct={rtReductionPct} setRtReductionPct={setRtReductionPct}
          rtReplacementCostPct={rtReplacementCostPct} setRtReplacementCostPct={setRtReplacementCostPct}
          // cost
          csConsolidationPerMonth={csConsolidationPerMonth} setCsConsolidationPerMonth={setCsConsolidationPerMonth}
          csEliminatedTools={csEliminatedTools} setCsEliminatedTools={setCsEliminatedTools}
          csAvgToolCostPerMonth={csAvgToolCostPerMonth} setCsAvgToolCostPerMonth={setCsAvgToolCostPerMonth}
          // upskilling
          upCoveragePct={upCoveragePct} setUpCoveragePct={setUpCoveragePct}
          upHoursPerWeek={upHoursPerWeek} setUpHoursPerWeek={setUpHoursPerWeek}
          upUtilPct={upUtilPct} setUpUtilPct={setUpUtilPct}
          // nav
          onBack={gotoPrev}
          onNext={gotoNext}
        />
      )}

      {/* RESULTS (with headers & spaced columns) */}
      {steps[step]?.key==='results' && (
        <section style={card}>
          <h3 style={h3}>Results</h3>

          {/* KPI ROW */}
          <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', marginBottom:10 }}>
            <KPI label="Total annual value" value={fmtMoney(annualValue, currency)} />
            <KPI label="Annual ROI" value={`${(roiMultiple||0).toFixed(1)}×`} />
            <KPI label="Payback" value={Number.isFinite(paybackMonths)?`${paybackMonths.toFixed(1)} mo`:'—'} />
            <KPI label="Total hours saved (est.)" value={totalHours.toLocaleString()} />
          </div>

          {/* PRIORITIES TABLE */}
          <PrioritiesTable
            currency={currency}
            rows={buildBreakdownRows({
              currency, hourly, employees,
              // values
              valThroughput, valQuality, valOnboarding, valRetention, valCost, valUpskilling,
              // hours (annual totals converted to weekly money in table helper)
              hoursThroughput, hoursQuality, hoursUpskilling,
              // flags/context
              selected, avgSalary, obHiresPerYear, obBaselineRamp, obImprovedRamp, rtBaselineTurnoverPct, rtReductionPct, rtReplacementCostPct, csConsolidationPerMonth, csEliminatedTools, csAvgToolCostPerMonth, upCoveragePct, upHoursPerWeek: hoursPerWeekUpskilling
            })}
          />

          {/* NEXT STEPS */}
          <div style={{ marginTop:16, padding:'12px 14px', border:'1px solid #E7ECF7', borderRadius:12, background:'#F8FAFF' }}>
            <strong>Next steps</strong>
            <ul style={{ margin:'8px 0 0', paddingLeft:18, color:'#475569', fontSize:'.95rem' }}>
              <li>Validate assumptions with a 2–4 week pilot</li>
              <li>Lock scope (team, tools, workflows) and success metrics</li>
              <li>Create enablement plan for managers and ICs</li>
            </ul>
          </div>

          <div style={{ ...centerRow, marginTop:16 }}>
            <button style={btn} onClick={gotoPrev}>← Back</button>
            <button style={btnPrimary} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>Start again ↑</button>
          </div>
        </section>
      )}

      <section style={{ textAlign:'center', color:'#667085', fontSize:12, padding:'8px 0 24px' }}>
        Build: {new Date().toISOString()}
      </section>
    </main>
  );
}

/* ============================================================
   Helpers & Subcomponents
============================================================ */

function FieldNumber({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div>
      <label style={{ fontWeight: 800, display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        style={{
          width: '100%',
          border: '1px solid #E2E8F5',
          borderRadius: 12,
          padding: '10px 12px',
          display: 'block',
          boxSizing: 'border-box',
          minHeight: 42,
        }}
      />
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8EEFF', borderRadius: 14, padding: 14, position: 'relative', minHeight: 84 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 4, borderRadius: '14px 14px 0 0', background: 'linear-gradient(90deg,#6D8BFF,#3366FE)' }} />
      <div style={{ fontSize: '.76rem', color: '#64748B', fontWeight: 800, marginTop: 2 }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: '1.16rem', marginTop: 6 }}>{value}</div>
    </div>
  );
}

function maturityLabel(n: number) {
  if (n <= 1) return 'Ad-hoc';
  if (n <= 3) return 'Experimenting';
  if (n <= 5) return 'Emerging';
  if (n <= 7) return 'Operational';
  if (n <= 9) return 'Strategic';
  return 'Scaled';
}

/* ---------- GoalStep: renders the per-goal inputs ---------- */
function GoalStep(props: {
  keyStr: string;
  goal: Goal;
  currency: Currency;
  employees: number;
  hourly: number;

  // throughput
  tpHoursPerWeek: number; setTpHoursPerWeek: (n:number)=>void;
  tpUtilPct: number; setTpUtilPct: (n:number)=>void;

  // quality
  qlEventsPerPersonPerMonth: number; setQlEventsPerPersonPerMonth: (n:number)=>void;
  qlReductionPct: number; setQlReductionPct: (n:number)=>void;
  qlHoursPerFix: number; setQlHoursPerFix: (n:number)=>void;

  // onboarding
  obHiresPerYear: number; setObHiresPerYear: (n:number)=>void;
  obBaselineRamp: number; setObBaselineRamp: (n:number)=>void;
  obImprovedRamp: number; setObImprovedRamp: (n:number)=>void;

  // retention
  rtBaselineTurnoverPct: number; setRtBaselineTurnoverPct: (n:number)=>void;
  rtReductionPct: number; setRtReductionPct: (n:number)=>void;
  rtReplacementCostPct: number; setRtReplacementCostPct: (n:number)=>void;

  // cost
  csConsolidationPerMonth: number; setCsConsolidationPerMonth: (n:number)=>void;
  csEliminatedTools: number; setCsEliminatedTools: (n:number)=>void;
  csAvgToolCostPerMonth: number; setCsAvgToolCostPerMonth: (n:number)=>void;

  // upskilling
  upCoveragePct: number; setUpCoveragePct: (n:number)=>void;
  upHoursPerWeek: number; setUpHoursPerWeek: (n:number)=>void;
  upUtilPct: number; setUpUtilPct: (n:number)=>void;

  onBack: ()=>void;
  onNext: ()=>void;
}) {
  const {
    goal, currency,
    // tp
    tpHoursPerWeek, setTpHoursPerWeek, tpUtilPct, setTpUtilPct,
    // ql
    qlEventsPerPersonPerMonth, setQlEventsPerPersonPerMonth, qlReductionPct, setQlReductionPct, qlHoursPerFix, setQlHoursPerFix,
    // ob
    obHiresPerYear, setObHiresPerYear, obBaselineRamp, setObBaselineRamp, obImprovedRamp, setObImprovedRamp,
    // rt
    rtBaselineTurnoverPct, setRtBaselineTurnoverPct, rtReductionPct, setRtReductionPct, rtReplacementCostPct, setRtReplacementCostPct,
    // cost
    csConsolidationPerMonth, setCsConsolidationPerMonth, csEliminatedTools, setCsEliminatedTools, csAvgToolCostPerMonth, setCsAvgToolCostPerMonth,
    // up
    upCoveragePct, setUpCoveragePct, upHoursPerWeek, setUpHoursPerWeek, upUtilPct, setUpUtilPct,
    onBack, onNext,
  } = props;

  const card = { background:'#fff', border:'1px solid #E7ECF7', borderRadius:16, boxShadow:'0 10px 28px rgba(12,20,38,.08)', padding:18, maxWidth:980, margin:'16px auto' } as const;
  const h3 = { margin:'0 0 .7rem', fontSize:'1.06rem', fontWeight:900, color:'#0F172A' } as const;
  const gridAuto = { display:'grid', gap:14, gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', alignItems:'start' } as const;
  const help = { fontSize:'.86rem', color:'#667085' } as const;
  const btn = { display:'inline-flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:12, fontWeight:800, border:'1px solid #E7ECF7', cursor:'pointer', background:'#fff' } as const;
  const btnPrimary = { ...btn, background:`linear-gradient(90deg,#5A7BFF,${BLUE})`, color:'#fff', borderColor:'transparent', boxShadow:'0 8px 20px rgba(31,77,255,.25)' } as const;

  if (goal==='throughput') {
    const value = tpHoursPerWeek * 52 * props.employees * props.hourly * clamp(tpUtilPct/100,0,1);
    return (
      <section style={card}>
        <h3 style={h3}>Throughput</h3>
        <p style={help}>Estimate cycle-time gains from AI-augmented workflows.</p>
        <div style={gridAuto}>
          <FieldNumber label="Hours saved per person / week" value={tpHoursPerWeek} onChange={setTpHoursPerWeek} step={0.5}/>
          <FieldNumber label="Utilization factor (%)" value={tpUtilPct} onChange={setTpUtilPct} min={0} max={100} step={5}/>
        </div>
        <p style={{ ...help, marginTop:10 }}>
          ≈ Value / year: <strong>{fmtMoney(value, currency)}</strong>
        </p>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
          <button style={btn} onClick={onBack}>← Back</button>
          <button style={btnPrimary} onClick={onNext}>Continue →</button>
        </div>
      </section>
    );
  }

  if (goal==='quality') {
    const hours = qlEventsPerPersonPerMonth * props.employees * 12 * (qlReductionPct/100) * qlHoursPerFix;
    const value = hours * props.hourly * clamp(tpUtilPct/100,0,1);
    return (
      <section style={card}>
        <h3 style={h3}>Quality / Rework</h3>
        <p style={help}>Fewer rework cycles; better first-pass quality.</p>
        <div style={gridAuto}>
          <FieldNumber label="Rework events / person / month" value={qlEventsPerPersonPerMonth} onChange={setQlEventsPerPersonPerMonth} step={1}/>
          <FieldNumber label="Expected reduction (%)" value={qlReductionPct} onChange={setQlReductionPct} min={0} max={100} step={1}/>
          <FieldNumber label="Hours per fix" value={qlHoursPerFix} onChange={setQlHoursPerFix} step={0.5}/>
        </div>
        <p style={{ ...help, marginTop:10 }}>
          ≈ Hours avoided / year: <strong>{Math.round(hours).toLocaleString()}</strong> · Value / year: <strong>{fmtMoney(value, currency)}</strong>
        </p>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
          <button style={btn} onClick={onBack}>← Back</button>
          <button style={btnPrimary} onClick={onNext}>Continue →</button>
        </div>
      </section>
    );
  }

  if (goal==='onboarding') {
    const monthsSaved = clamp(obBaselineRamp - Math.min(obBaselineRamp, obImprovedRamp), 0, 24);
    return (
      <section style={card}>
        <h3 style={h3}>Onboarding speed</h3>
        <p style={help}>Faster ramp from AI playbooks & guided practice.</p>
        <div style={gridAuto}>
          <FieldNumber label="New hires / year" value={obHiresPerYear} onChange={setObHiresPerYear} step={1}/>
          <FieldNumber label="Baseline ramp (months)" value={obBaselineRamp} onChange={setObBaselineRamp} step={0.5}/>
          <FieldNumber label="Improved ramp (months)" value={obImprovedRamp} onChange={setObImprovedRamp} step={0.5}/>
        </div>
        <p style={{ ...help, marginTop:10 }}>
          ≈ Months saved / hire: <strong>{monthsSaved.toFixed(1)}</strong>
        </p>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
          <button style={btn} onClick={onBack}>← Back</button>
          <button style={btnPrimary} onClick={onNext}>Continue →</button>
        </div>
      </section>
    );
  }

  if (goal==='retention') {
    return (
      <section style={card}>
        <h3 style={h3}>Retention</h3>
        <p style={help}>Keep skilled talent; avoid replacement costs.</p>
        <div style={gridAuto}>
          <FieldNumber label="Baseline annual turnover (%)" value={rtBaselineTurnoverPct} onChange={setRtBaselineTurnoverPct} min={0} max={100} step={1}/>
          <FieldNumber label="Expected reduction (%)" value={rtReductionPct} onChange={setRtReductionPct} min={0} max={100} step={1}/>
          <FieldNumber label="Replacement cost (% of salary)" value={rtReplacementCostPct} onChange={setRtReplacementCostPct} min={0} max={200} step={5}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
          <button style={btn} onClick={onBack}>← Back</button>
          <button style={btnPrimary} onClick={onNext}>Continue →</button>
        </div>
      </section>
    );
  }

  if (goal==='cost') {
    return (
      <section style={card}>
        <h3 style={h3}>Cost</h3>
        <p style={help}>Do more with fewer overlapping tools.</p>
        <div style={gridAuto}>
          <FieldNumber label={`Consolidation savings / month (${symbol(currency)})`} value={csConsolidationPerMonth} onChange={setCsConsolidationPerMonth} step={50}/>
          <FieldNumber label="Eliminated tools (count)" value={csEliminatedTools} onChange={setCsEliminatedTools} step={1}/>
          <FieldNumber label={`Avg tool cost / month (${symbol(currency)})`} value={csAvgToolCostPerMonth} onChange={setCsAvgToolCostPerMonth} step={20}/>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
          <button style={btn} onClick={onBack}>← Back</button>
          <button style={btnPrimary} onClick={onNext}>Continue →</button>
        </div>
      </section>
    );
  }

  // UPSKILLING
  const baseHours = (upCoveragePct/100) * props.employees * upHoursPerWeek * 52;
  return (
    <section style={card}>
      <h3 style={h3}>Upskilling</h3>
      <p style={help}>Competency coverage after training drives steady time savings per competent employee.</p>
      <div style={gridAuto}>
        <FieldNumber label="Competency coverage after program (%)" value={upCoveragePct} onChange={setUpCoveragePct} min={0} max={100} step={5}/>
        <FieldNumber label="Hours saved per competent person / week" value={upHoursPerWeek} onChange={setUpHoursPerWeek} step={0.5}/>
        <FieldNumber label="Utilization factor (%)" value={upUtilPct} onChange={setUpUtilPct} min={0} max={100} step={5}/>
      </div>
      <p style={{ ...help, marginTop:10 }}>
        ≈ Hours / year (before overlap): <strong>{Math.round(baseHours).toLocaleString()}</strong>
      </p>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
        <button style={btn} onClick={onBack}>← Back</button>
        <button style={btnPrimary} onClick={onNext}>Continue →</button>
      </div>
    </section>
  );
}

/* ---------- Priorities table (Hours centered, Money right) ---------- */
type BreakdownRow = {
  label: string;
  hoursSaved: number; // weekly or annual depending on row usage
  moneySaved: number; // same
};

function PrioritiesTable({
  currency,
  rows,
}: {
  currency: Currency;
  rows: BreakdownRow[];
}) {
  return (
    <div style={{ marginTop: 12, border: '1px solid #E7ECF7', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', background: '#F8FAFF', padding: '10px 12px', fontWeight: 900, color: '#0F172A' }}>
        <div>Priority</div>
        <div style={{ textAlign: 'center' }}>Hours saved (weekly)</div>
        <div style={{ textAlign: 'right' }}>Money saved (weekly)</div>
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: 12, color: '#64748B' }}>No priorities selected.</div>
      ) : (
        rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 12px', borderTop: '1px solid #EEF2FF', alignItems: 'center' }}>
            <div style={{ fontWeight: 800 }}>{r.label}</div>
            <div style={{ textAlign: 'center', fontWeight: 800 }}>{r.hoursSaved.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
            <div style={{ textAlign: 'right', fontWeight: 800 }}>{fmtMoney(r.moneySaved, currency)}</div>
          </div>
        ))
      )}
    </div>
  );
}

function buildBreakdownRows(args: {
  currency: Currency;
  hourly: number;
  employees: number;

  // values (money, annual — not used directly here)
  valThroughput: number;
  valQuality: number;
  valOnboarding: number;
  valRetention: number;
  valCost: number;
  valUpskilling: number;

  // hours (annual totals)
  hoursThroughput: number;
  hoursQuality: number;
  hoursUpskilling: number;

  // flags/context
  selected: Goal[];
  avgSalary: number;
  obHiresPerYear: number;
  obBaselineRamp: number;
  obImprovedRamp: number;
  rtBaselineTurnoverPct: number;
  rtReductionPct: number;
  rtReplacementCostPct: number;
  csConsolidationPerMonth: number;
  csEliminatedTools: number;
  csAvgToolCostPerMonth: number;
  upCoveragePct: number;
  upHoursPerWeek: number;
}) : BreakdownRow[] {
  const rows: BreakdownRow[] = [];

  const add = (label: string, annualHours: number, hourly: number) => {
    const weeklyHours = annualHours / 52;
    rows.push({
      label,
      hoursSaved: Math.max(0, weeklyHours),
      moneySaved: Math.max(0, weeklyHours * hourly),
    });
  };

  if (args.hoursThroughput > 0) add(GOAL_META.throughput.label, args.hoursThroughput, args.hourly);
  if (args.hoursQuality > 0) add(GOAL_META.quality.label, args.hoursQuality, args.hourly);
  if (args.hoursUpskilling > 0) add(GOAL_META.upskilling.label, args.hoursUpskilling, args.hourly);

  // Money-only rows for non-hour goals (weekly approximations)
  if (args.selected.includes('onboarding')) {
    const weeklyMoney = args.valOnboarding / 52;
    rows.push({ label: GOAL_META.onboarding.label, hoursSaved: 0, moneySaved: weeklyMoney });
  }
  if (args.selected.includes('retention')) {
    const weeklyMoney = args.valRetention / 52;
    rows.push({ label: GOAL_META.retention.label, hoursSaved: 0, moneySaved: weeklyMoney });
  }
  if (args.selected.includes('cost')) {
    const weeklyMoney = args.valCost / 52;
    rows.push({ label: GOAL_META.cost.label, hoursSaved: 0, moneySaved: weeklyMoney });
  }

  return rows;
}
