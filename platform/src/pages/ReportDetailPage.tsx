import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Cpu, FileCode, Shield, Layers, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import PipelineVisualizer from '../components/PipelineVisualizer';
import { Agent1Summary, Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [summary, setSummary] = useState<Agent1Summary | null>(null);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      // Fetch incident list to find target or latest
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      const list: Incident[] = res.data;
      const target = (id && id !== 'latest') ? list.find(i => i.id === id) : list[0];

      if (target) {
        setIncident(target);
        // Fetch analysis
        const analysisRes = await axios.get(`${API_BASE_URL}/api/analysis/${target.id}`);
        setSummary(analysisRes.data.agent1_summary);
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
        Ingesting report and executing Agent 1 architecture summarization...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-400 text-xs font-mono">No incident reports available to summarize.</p>
        <Link to="/reports" className="text-cyan-400 hover:underline text-xs">Return to Reports</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Pipeline Breadcrumb */}
      <PipelineVisualizer currentStage="agent1" incidentId={incident.id} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              AGENT 1 ENGINE
            </span>
            <span className="font-mono text-xs text-slate-400">Target: {incident.human_id}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Architectural Ingestion & Technical Summary
          </h1>
        </div>

        <Link
          to={`/reports/${incident.id}/bugs`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <span>Proceed to Agent 2 (Bug Repair)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Submitted User Report */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Ingested StudentHub Report</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">Ticket ID</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{incident.human_id}</span>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">Problem Title</span>
              <span className="font-semibold text-white">{incident.title}</span>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">Affected Portal Page</span>
              <span className="text-slate-300 font-mono">{incident.affected_page}</span>
            </div>

            <div>
              <span className="text-slate-500 font-mono text-[10px] uppercase block">User Observed Description</span>
              <p className="text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800 mt-1">
                {incident.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Expected</span>
                <p className="text-slate-300 mt-1 text-[11px]">{incident.expected_behavior}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-rose-400 font-semibold uppercase block">Actual</span>
                <p className="text-slate-300 mt-1 text-[11px]">{incident.actual_behavior}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agent 1 Architectural Ingestion */}
        <div className="lg:col-span-2 space-y-6">
          {summary ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-cyan-400">
                  <Cpu className="w-4 h-4" />
                  <span>Agent 1 Structural Project Analysis</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {summary.security_classification}
                </span>
              </div>

              {/* Component & File Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Identified Target Component</span>
                  <span className="font-bold text-slate-100 text-sm">{summary.affected_component}</span>
                  <p className="text-[11px] text-slate-400 leading-tight">{summary.component_description}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Mapped Repository File</span>
                  <div className="flex items-center gap-2 font-mono font-bold text-cyan-400 text-sm">
                    <FileCode className="w-4 h-4" />
                    <span>{summary.affected_file}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block font-mono">{summary.source_loc} Lines of Source Code</span>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <span className="text-slate-400 text-xs font-mono font-semibold block mb-2">Technologies & Stack Detected:</span>
                <div className="flex flex-wrap gap-2">
                  {summary.technologies_used.map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Workflow & Incident Analysis */}
              <div className="space-y-3">
                <span className="text-slate-400 text-xs font-mono font-semibold block">Incident Correlation Analysis:</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed font-mono">
                  {summary.incident_analysis}
                </p>
              </div>

              {/* Security Sensitive Modules */}
              <div>
                <span className="text-slate-400 text-xs font-mono font-semibold block mb-2">Security-Sensitive Surface Components:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {summary.security_sensitive_components.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-red-950/30 border border-red-900/40 text-red-300 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 shrink-0 text-red-400" />
                      <span className="truncate">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
              Agent 1 has not completed analysis for this report yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
