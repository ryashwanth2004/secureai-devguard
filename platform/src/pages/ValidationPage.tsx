import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, XCircle, ShieldCheck, ArrowRight, Check, AlertTriangle, Terminal } from 'lucide-react';
import PipelineVisualizer from '../components/PipelineVisualizer';
import { ValidationResult, Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function ValidationPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    fetchValidationData();
  }, [id]);

  const fetchValidationData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      const list: Incident[] = res.data;
      const target = (id && id !== 'latest') ? list.find(i => i.id === id) : list[0];

      if (target) {
        setIncident(target);
        const analysisRes = await axios.get(`${API_BASE_URL}/api/analysis/${target.id}`);
        setValidation(analysisRes.data.validation_results);
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
        Executing automated patch validation test suite in isolated workspace...
      </div>
    );
  }

  if (!incident || !validation) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-400 text-xs font-mono">No validation results available for this incident.</p>
        <Link to="/reports" className="text-cyan-400 hover:underline text-xs">Return to Reports</Link>
      </div>
    );
  }

  const isValidated = validation.overall_status === 'VALIDATED';

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Pipeline Breadcrumb */}
      <PipelineVisualizer currentStage="validation" incidentId={incident.id} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              PATCH VALIDATION PIPELINE
            </span>
            <span className="font-mono text-xs text-slate-400">Target: {incident.human_id}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Automated Multi-Stage Verification Suite
          </h1>
        </div>

        <Link
          to={`/reports/${incident.id}/risk`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <span>Proceed to Agent 3 (Risk Assessment)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Primary Status Banner */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        isValidated
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          : 'bg-red-950/30 border-red-500/40 text-red-300'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isValidated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isValidated ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider block text-slate-400">
              Overall Patch Validation Outcome
            </span>
            <div className="text-2xl font-black font-mono tracking-tight mt-0.5">
              {validation.overall_status}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isValidated
                ? 'All candidate patch verification checks passed with zero regressions.'
                : 'Validation suite detected failures. Deployment automatically blocked.'}
            </p>
          </div>
        </div>

        {/* Counter cards */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-emerald-400 font-bold text-lg block">{validation.unit_tests_passed}</span>
            <span className="text-slate-400 text-[10px] uppercase">Passed</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-rose-400 font-bold text-lg block">{validation.unit_tests_failed}</span>
            <span className="text-slate-400 text-[10px] uppercase">Failed</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 font-bold text-lg block">{validation.unit_tests_skipped}</span>
            <span className="text-slate-400 text-[10px] uppercase">Skipped</span>
          </div>
        </div>
      </div>

      {/* Jury Validation Checklist */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
          Validation Verification Checklist:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {validation.checklist.map((chk, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">{chk.item}</span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{chk.details}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                chk.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {chk.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Test Detail Log */}
      {validation.details?.unit_suite && validation.details.unit_suite.length > 0 && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Targeted Sandbox Unit Test Execution:</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {validation.details.unit_suite.map((test, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold">{test.name}</span>
                  <span className="text-slate-400 block text-[11px]">{test.message}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  test.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {test.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
