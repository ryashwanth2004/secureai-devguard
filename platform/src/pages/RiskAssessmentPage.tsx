import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AlertOctagon, ShieldCheck, ShieldAlert, Rocket, Lock, ArrowRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import PipelineVisualizer from '../components/PipelineVisualizer';
import { RiskAssessment, Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function RiskAssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);

  useEffect(() => {
    fetchRiskData();
  }, [id]);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      const list: Incident[] = res.data;
      const target = (id && id !== 'latest') ? list.find(i => i.id === id) : list[0];

      if (target) {
        setIncident(target);
        const analysisRes = await axios.get(`${API_BASE_URL}/api/analysis/${target.id}`);
        setRisk(analysisRes.data.risk_assessment);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-mono">
        Evaluating security risk factors with Agent 3...
      </div>
    );
  }

  if (!incident || !risk) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-400 text-xs font-mono">No risk assessment available for this incident.</p>
        <Link to="/reports" className="text-cyan-400 hover:underline text-xs">Return to Reports</Link>
      </div>
    );
  }

  const isHighRisk = risk.risk_level === 'HIGH RISK';

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Pipeline Breadcrumb */}
      <PipelineVisualizer currentStage="risk" riskLevel={risk.risk_level} incidentId={incident.id} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              AGENT 3 RISK ENGINE
            </span>
            <span className="font-mono text-xs text-slate-400">Target: {incident.human_id}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Security Risk Assessment & Deployment Governance
          </h1>
        </div>

        {isHighRisk ? (
          <Link
            to="/admin/approvals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
          >
            <Lock className="w-4 h-4" />
            <span>Open Administrator Approval Gate</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            to="/deployments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Rocket className="w-4 h-4" />
            <span>View Production Deployment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Main Risk Decision Card */}
      <div className={`p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm ${
        isHighRisk
          ? 'bg-red-950/20 border-red-500/40'
          : 'bg-emerald-950/20 border-emerald-500/40'
      }`}>
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
            isHighRisk ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isHighRisk ? <ShieldAlert className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Agent 3 Risk Classification (Binary: LOW / HIGH)
            </span>
            <div className={`text-3xl font-black font-mono tracking-tight ${
              isHighRisk ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {risk.risk_level}
            </div>
            <div className="text-xs text-slate-300 font-mono mt-1">
              Governance Decision:{' '}
              <strong className={isHighRisk ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {risk.deployment_decision.replace(/_/g, ' ')}
              </strong>
            </div>
          </div>
        </div>

        {/* Score and confidence */}
        <div className="flex items-center gap-4 font-mono">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[100px]">
            <span className={`text-2xl font-black ${isHighRisk ? 'text-red-400' : 'text-emerald-400'}`}>
              {risk.score}
            </span>
            <span className="text-slate-400 text-[10px] uppercase block mt-0.5">Risk Score</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[100px]">
            <span className="text-2xl font-black text-cyan-400">
              {Math.round(risk.confidence * 100)}%
            </span>
            <span className="text-slate-400 text-[10px] uppercase block mt-0.5">Confidence</span>
          </div>
        </div>
      </div>

      {/* Rationale explanation */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
          Agent 3 Rationale & Risk Policy Explanation:
        </h3>
        <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
          {risk.reason}
        </p>
      </div>

      {/* Factor Breakdown Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
          Evaluated DevSecOps Risk Factors:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {risk.factors.map((f, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-slate-200 font-bold block">{f.factor}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">{f.value}</span>
              </div>
              <div className="text-right shrink-0">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  f.impact.startsWith('+') ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {f.impact}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{f.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
