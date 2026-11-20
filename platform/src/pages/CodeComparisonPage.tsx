import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { DiffEditor } from '@monaco-editor/react';
import { GitCompare, FileCode, CheckCircle2, ArrowRight, ShieldCheck, Terminal, Layers } from 'lucide-react';
import PipelineVisualizer from '../components/PipelineVisualizer';
import { Patch, Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function CodeComparisonPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [patches, setPatches] = useState<Patch[]>([]);
  const [activeTab, setActiveTab] = useState<'monaco_diff' | 'unified_diff' | 'side_by_side'>('monaco_diff');

  useEffect(() => {
    fetchDiffData();
  }, [id]);

  const fetchDiffData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      const list: Incident[] = res.data;
      const target = (id && id !== 'latest') ? list.find(i => i.id === id) : list[0];

      if (target) {
        setIncident(target);
        const analysisRes = await axios.get(`${API_BASE_URL}/api/analysis/${target.id}`);
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
        Loading patch diff models and preparing Monaco Editor...
      </div>
    );
  }

  if (!incident || patches.length === 0) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-slate-400 text-xs font-mono">No patch diffs generated for this incident yet.</p>
        <Link to="/reports" className="text-cyan-400 hover:underline text-xs">Return to Reports</Link>
      </div>
    );
  }

  const primaryPatch = patches[0];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Pipeline Breadcrumb */}
      <PipelineVisualizer currentStage="diff" incidentId={incident.id} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              BEFORE / AFTER CODE DIFF
            </span>
            <span className="font-mono text-xs text-slate-400">Target File: {primaryPatch.file_name}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Monaco Side-by-Side Patch Inspection
          </h1>
        </div>

        <Link
          to={`/reports/${incident.id}/validation`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <span>Proceed to Patch Validation</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Patch Metrics Bar */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">{primaryPatch.file_name}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">+{primaryPatch.lines_added} lines</span>
            <span className="text-rose-400 font-bold">-{primaryPatch.lines_removed} lines</span>
          </div>
        </div>

        {/* View mode buttons */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('monaco_diff')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'monaco_diff'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monaco Diff Editor
          </button>
          <button
            onClick={() => setActiveTab('unified_diff')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'unified_diff'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unified Diff View
          </button>
          <button
            onClick={() => setActiveTab('side_by_side')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'side_by_side'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Before & After Panels
          </button>
        </div>
      </div>

      {/* Main Diff Display Area */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        {activeTab === 'monaco_diff' && (
          <div>
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs font-mono">
              <span className="text-rose-400 font-bold">ORIGINAL BUGGY SOURCE (BEFORE)</span>
              <span className="text-emerald-400 font-bold">AI GENERATED SECURE PATCH (AFTER)</span>
            </div>
            <div className="h-[500px]">
              <DiffEditor
                height="100%"
                language="python"
                original={primaryPatch.original_code}
                modified={primaryPatch.patched_code}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  renderSideBySide: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  lineNumbers: 'on',
                  renderWhitespace: 'all'
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'unified_diff' && (
          <div className="p-6">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 mb-3">Unified Git-Style Diff Output:</h3>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto leading-relaxed">
              {primaryPatch.diff_text.split('\n').map((line, i) => {
                const isAdd = line.startsWith('+') && !line.startsWith('+++');
                const isRem = line.startsWith('-') && !line.startsWith('---');
                const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');
                return (
                  <div
                    key={i}
                    className={`${
                      isAdd ? 'text-emerald-400 bg-emerald-950/20' :
                      isRem ? 'text-rose-400 bg-rose-950/20' :
                      isHeader ? 'text-cyan-400 font-bold' :
                      'text-slate-400'
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        )}

        {activeTab === 'side_by_side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {/* BEFORE */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-rose-400 uppercase">Original Code (Before)</span>
                <span className="text-slate-500 text-[10px]">Contains detected defect</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-red-950/50 font-mono text-xs text-slate-300 overflow-x-auto h-[440px]">
                <code>{primaryPatch.original_code}</code>
              </pre>
            </div>

            {/* AFTER */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-emerald-400 uppercase">AI Repaired Code (After)</span>
                <span className="text-slate-500 text-[10px]">Verified patch applied</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-emerald-950/50 font-mono text-xs text-emerald-300 overflow-x-auto h-[440px]">
                <code>{primaryPatch.patched_code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Explanation Banner */}
      <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <Terminal className="w-4 h-4" />
          <span>Patch Generation Rationale & Logic Explanation:</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-mono">
          {primaryPatch.explanation}
        </p>
      </div>
    </div>
  );
}
