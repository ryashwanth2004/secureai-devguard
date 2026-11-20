import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Bug, GitCompare, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight, Code } from 'lucide-react';
import PipelineVisualizer from '../components/PipelineVisualizer';
import { Bug as BugType, Patch, Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function BugAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [bugs, setBugs] = useState<BugType[]>([]);
  const [patches, setPatches] = useState<Patch[]>([]);

  useEffect(() => {
    fetchBugData();
  }, [id]);

  const fetchBugData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      const list: Incident[] = res.data;
      const target = (id && id !== 'latest') ? list.find(i => i.id === id) : list[0];

      if (target) {
        setIncident(target);
        const analysisRes = await axios.get(`${API_BASE_URL}/api/analysis/${target.id}`);
        setBugs(analysisRes.data.agent2_bugs || []);
        setPatches(analysisRes.data.agent2_patches || []);
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
        Scanning AST and generating patches with Agent 2...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-400 text-xs font-mono">No incident reports available.</p>
        <Link to="/reports" className="text-cyan-400 hover:underline text-xs">Return to Reports</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Pipeline Breadcrumb */}
      <PipelineVisualizer currentStage="agent2" incidentId={incident.id} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              AGENT 2 ENGINE
            </span>
            <span className="font-mono text-xs text-slate-400">Target: {incident.human_id}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Defect Detection & Automated Program Repair
          </h1>
        </div>

        <Link
          to={`/reports/${incident.id}/diff`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <span>Inspect Monaco Code Diff</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {bugs.length === 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No bugs detected.</h3>
          <p className="text-xs text-slate-400 font-mono">
            Static AST analysis and pattern matching scanned the affected component with zero security defects.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bugs.map((bug, idx) => (
            <div key={bug.bug_id || idx} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    bug.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{bug.bug_id}</span>
                      <h2 className="font-bold text-slate-100 text-base">{bug.title}</h2>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      CWE Identifier: <strong className="text-slate-300">{bug.cwe}</strong> • {bug.bug_type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                    bug.severity === 'HIGH'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {bug.severity} SEVERITY
                  </span>
                </div>
              </div>

              {/* Location metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Target File</span>
                  <span className="text-cyan-400 font-bold">{bug.file_name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Exact Fault Line</span>
                  <span className="text-white font-bold">Line {bug.line_number}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Enclosing Function</span>
                  <span className="text-slate-200 font-bold">{bug.affected_function}()</span>
                </div>
              </div>

              {/* Description & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-mono font-bold text-slate-400 text-[11px] uppercase">Defect Description</span>
                  <p className="text-slate-300 leading-relaxed">{bug.description}</p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-mono font-bold text-rose-400 text-[11px] uppercase">Why It Is A Problem</span>
                  <p className="text-slate-300 leading-relaxed">{bug.why_problem}</p>
                </div>
              </div>

              {/* Code Evidence snippet */}
              <div className="space-y-2">
                <span className="text-slate-400 text-xs font-mono font-semibold block">
                  Source Code Evidence (Line {bug.line_number}):
                </span>
                <pre className="p-4 rounded-xl bg-slate-950 border border-red-900/40 text-red-400 font-mono text-xs overflow-x-auto">
                  <code>{bug.evidence}</code>
                </pre>
              </div>

              {/* Root Cause & Fix Recommendation */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2 text-xs">
                <span className="font-mono font-bold text-cyan-300 uppercase block">
                  Root Cause & Recommended Repair:
                </span>
                <p className="text-slate-300 leading-relaxed font-mono">
                  {bug.suggested_fix}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
