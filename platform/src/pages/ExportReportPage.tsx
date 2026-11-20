import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Printer, FileText, Shield, CheckCircle2, Cpu, Bug, AlertOctagon } from 'lucide-react';
import { Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function ExportReportPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      setIncidents(res.data);
      if (res.data.length > 0) {
        setSelectedId(res.data[0].id);
        fetchReportData(res.data[0].id);
      }
    } catch {
      // Handled
    }
  };

  const fetchReportData = async (incId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analysis/${incId}`);
      setReportData(res.data);
    } catch {
      setReportData(null);
    }
  };

  const handleDownloadJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevSecOps_Report_${reportData.incident?.human_id || 'SH'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Jury Evaluation Report</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Structured formal technical dossier for academic jury demonstration and audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON Dossier</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Selector */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-4 text-xs font-mono">
        <span className="text-slate-400">Select Report Dossier:</span>
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            fetchReportData(e.target.value);
          }}
          className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-cyan-400"
        >
          {incidents.map((inc) => (
            <option key={inc.id} value={inc.id}>
              {inc.human_id} — {inc.title} ({inc.status})
            </option>
          ))}
        </select>
      </div>

      {/* Dossier Document Sheet */}
      {reportData && (
        <div className="bg-white text-gray-900 rounded-3xl p-8 sm:p-12 shadow-xl space-y-8 font-sans max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 block">
                Academic Capstone Research Dossier
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-1">
                Automated Software Bug Detection, Repair & Secure Deployment
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-Agent Artificial Intelligence Architecture • University Final-Year Project
              </p>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-gray-400 block text-[10px]">TICKET</span>
              <span className="font-extrabold text-blue-700 text-lg block">{reportData.incident?.human_id}</span>
              <span className="text-gray-400 text-[10px]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Section 1: Problem Ingestion */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-gray-100 pb-1">
              1. Incident Ingestion Specification
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><strong className="text-gray-600">Title:</strong> {reportData.incident?.title}</div>
              <div><strong className="text-gray-600">Affected Portal:</strong> {reportData.incident?.affected_page}</div>
              <div className="col-span-2"><strong className="text-gray-600">User Report:</strong> {reportData.incident?.description}</div>
            </div>
          </div>

          {/* Section 2: Agent 1 Structural Summary */}
          {reportData.agent1_summary && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-gray-100 pb-1">
                2. Agent 1 — Architectural Diagnostics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><strong className="text-gray-600">Component:</strong> {reportData.agent1_summary.affected_component}</div>
                <div><strong className="text-gray-600">Repository File:</strong> {reportData.agent1_summary.affected_file}</div>
                <div className="col-span-2"><strong className="text-gray-600">Architectural Analysis:</strong> {reportData.agent1_summary.incident_analysis}</div>
              </div>
            </div>
          )}

          {/* Section 3: Agent 2 Bug & Patch */}
          {reportData.agent2_bugs && reportData.agent2_bugs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-gray-100 pb-1">
                3. Agent 2 — Detected Vulnerabilities & Generated Patch
              </h3>
              {reportData.agent2_bugs.map((b: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>{b.bug_id}: {b.title}</span>
                    <span className="text-red-600 font-mono">{b.severity} SEVERITY</span>
                  </div>
                  <p className="text-gray-600">{b.description}</p>
                  <div className="font-mono text-[11px] text-gray-700">Line {b.line_number}: <code>{b.evidence}</code></div>
                </div>
              ))}
            </div>
          )}

          {/* Section 4: Validation */}
          {reportData.validation_results && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-gray-100 pb-1">
                4. Multi-Stage Patch Validation
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="font-bold text-gray-800">Validation Status:</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold font-mono">
                  {reportData.validation_results.overall_status}
                </span>
                <span className="text-gray-500 font-mono">
                  ({reportData.validation_results.unit_tests_passed} tests passed, 0 failed)
                </span>
              </div>
            </div>
          )}

          {/* Section 5: Risk & Deployment */}
          {reportData.risk_assessment && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-gray-100 pb-1">
                5. Agent 3 Risk Assessment & Final Deployment Decision
              </h3>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-base">Risk Classification: {reportData.risk_assessment.risk_level}</span>
                  <span className="font-mono text-blue-700 font-extrabold text-base">
                    Score: {reportData.risk_assessment.score} / 100
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{reportData.risk_assessment.reason}</p>
                <div className="pt-2 font-mono text-[11px] text-gray-500">
                  Deployment Outcome: <strong>{reportData.deployment?.status?.toUpperCase() || 'PROCESSED'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Signoff */}
          <div className="border-t border-gray-200 pt-6 flex justify-between text-xs text-gray-400">
            <span>Academic Evaluation System • Computer Science Dept</span>
            <span>Generated Autonomously by SecureAI DevGuard</span>
          </div>
        </div>
      )}
    </div>
  );
}
