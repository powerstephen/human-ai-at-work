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
   Error Boundary
============================================================ */
class EB extends React.Component<{children:React.ReactNode},{err?:Error}> {
  constructor(p:any){ super(p); this.state={}; }
  static getDerivedStateFromError(e:Error){ return { err:e }; }
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
  const [step, setStep] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [team, setTeam] = useState<Team>('all');
  const [employees, setEmployees] = useState<number>(150);
  const [avgSalary, setAvgSalary] = useState<number>(52000);
  const [trainingPerEmployee, setTrainingPerEmployee] = useState<number>(850);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const hourly = useMemo(()=>hourlyFromSalary(avgSalary), [avgSalary]);
  const programCost = trainingPerEmployee * employees * (durationMonths/12);

  /* AI Maturity */
  const [maturity, setMaturity] = useState<number>(3);
  const [useMaturityEstimate, setUseMaturityEstimate] = useState<boolean>(true);
  const maturityHoursMap = [5,4.5,4,3.5,3,2.5,2,1.5,1.2,1];
  const maturityHoursPerPerson = maturityHoursMap[clamp(maturity,1,10)-1] ?? 3;
  const maturityHoursTeam = Math.round(maturityHoursPerPerson * 52 * employees);

  /* Priorities */
  const [selected, setSelected] = useState<Goal[]>(['throughput','retention','upskilling']);
  const toggleGoal = (g:Goal)=>{
    setSelected(prev=>{
      const exists = prev.includes(g);
      if (exists) return prev.filter(x=>x!==g);
      if (prev.length>=3) return prev;
      return [...prev,g];
    });
  };

  /* Goal Inputs */
  const [tpHoursPerWeek, setTpHoursPerWeek] = useState<number>(3.0);
  const [tpUtilPct, setTpUtilPct] = useState<number>(70);
  const [qlEventsPerPersonPerMonth, setQlEventsPerPersonPerMonth] = useState<number>(3);
  const [qlReductionPct, setQlReductionPct] = useState<number>(20);
  const [qlHoursPerFix, setQlHoursPerFix] = useState<number>(1);
  const [obHiresPerYear, setObHiresPerYear] = useState<number>(24);
  const [obBaselineRamp, setObBaselineRamp] = useState<number>(3);
  const [obImprovedRamp, setObImprovedRamp] = useState<number>(2);
  const [rtBaselineTurnoverPct, setRtBaselineTurnoverPct] = useState<number>(20);
  const [rtReductionPct, setRtReductionPct] = useState<number>(10);
  const [rtReplacementCostPct, setRtReplacementCostPct] = useState<number>(50);
  const [csConsolidationPerMonth, setCsConsolidationPerMonth] = useState<number>(0);
  const [csEliminatedTools, setCsEliminatedTools] = useState<number>(0);
  const [csAvgToolCostPerMonth, setCsAvgToolCostPerMonth] = useState<number>(200);
  const [upCoveragePct, setUpCoveragePct] = useState<number>(60);
  const [upHoursPerWeek, setUpHoursPerWeek] = useState<number>(2.0);
  const [upUtilPct, setUpUtilPct] = useState<number>(70);

  /* Derived calculations */
  const hoursPerWeekThroughput = useMaturityEstimate ? maturityHoursPerPerson : tpHoursPerWeek;
  const hoursPerWeekUpskilling = useMaturityEstimate ? maturityHoursPerPerson : upHoursPerWeek;

  const valThroughput = selected.includes('throughput')
    ? hoursPerWeekThroughput * 52 * employees * hourly * clamp(tpUtilPct/100,0,1) : 0;
  const valQuality = selected.includes('quality')
    ? (qlEventsPerPersonPerMonth*employees*12*(qlReductionPct/100)*qlHoursPerFix)*hourly*clamp(tpUtilPct/100,0,1):0;
  const valOnboarding = selected.includes('onboarding')
    ? clamp(obBaselineRamp - Math.min(obBaselineRamp, obImprovedRamp),0,24)*obHiresPerYear*(avgSalary/12)*clamp(tpUtilPct/100,0,1):0;
  const valRetention = selected.includes('retention')
    ? (employees*(rtBaselineTurnoverPct/100)*(rtReductionPct/100))*(avgSalary*(rtReplacementCostPct/100)):0;
  const valCost = selected.includes('cost')
    ? (csConsolidationPerMonth + csEliminatedTools*csAvgToolCostPerMonth)*12:0;
  const upBase = selected.includes('upskilling')
    ? (upCoveragePct/100)*employees*hoursPerWeekUpskilling*52*hourly*clamp(upUtilPct/100,0,1):0;
  const valUpskilling = (selected.includes('throughput')&&selected.includes('upskilling')) ? upBase*0.7 : upBase;

  const annualValue = valThroughput + valQuality + valOnboarding + valRetention + valCost + valUpskilling;
  const monthlySavings = annualValue / 12;
  const roiMultiple = programCost>0 ? (annualValue/programCost) : 0;
  const paybackMonths = monthlySavings>0 ? (programCost/monthlySavings) : Infinity;

  const hoursThroughput = selected.includes('throughput') ? hoursPerWeekThroughput*52*employees : 0;
  const hoursQuality = selected.includes('quality') ? qlEventsPerPersonPerMonth*employees*12*(qlReductionPct/100)*qlHoursPerFix : 0;
  const hoursUpskilling = selected.includes('upskilling')
    ? Math.round(((upCoveragePct/100)*employees*hoursPerWeekUpskilling*52)*(selected.includes('throughput')?0.7:1)) : 0;
  const totalHours = Math.round(hoursThroughput + hoursQuality + hoursUpskilling);

  const steps = useMemo(()=>{
    const arr: {key:string; title:string}[]=[];
    arr.push({key:'team',title:'Team'});
    arr.push({key:'maturity',title:'AI Maturity'});
    arr.push({key:'priorities',title:'Priorities'});
    selected.forEach(g=>arr.push({key:`goal-${g}`,title:GOAL_META[g].label}));
    arr.push({key:'results',title:'Results'});
    return arr;
  },[selected]);

  const gotoNext=()=>setStep(s=>clamp(s+1,0,steps.length-1));
  const gotoPrev=()=>setStep(s=>clamp(s-1,0,steps.length-1));

  /* Styles */
  const container={maxWidth:1120,margin:'0 auto',padding:'24px 20px 32px',fontFamily:'Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial'} as const;
  const hero={backgroundImage:`linear-gradient(135deg,rgba(75,111,255,0.92)0%,rgba(51,102,254,0.96)60%),url('/hero.png')`,
    backgroundSize:'cover',backgroundPosition:'center',color:'#fff',borderRadius:18,boxShadow:'0 18px 40px rgba(15,42,120,.25)',
    padding:18,maxWidth:980,margin:'0 auto 16px',border:'1px solid rgba(255,255,255,.24)'} as const;

  /* Render */
  return (
    <main style={container}>
      <section style={hero}>
        <h1 style={{margin:0,fontSize:'1.2rem',fontWeight:900}}>AI at Work — Human Productivity ROI</h1>
        <p style={{margin:'6px 0 10px',color:'rgba(255,255,255,.92)'}}>
          Quantify time saved, payback, and retention impact from training managers and teams to work effectively with AI.
        </p>
      </section>
      {/* You can re-insert the rest of the render logic from the previous version here — unchanged */}
      <section style={{textAlign:'center',color:'#667085',fontSize:12,padding:'8px 0 24px'}}>
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
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label style={{ fontWeight: 800, display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
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
