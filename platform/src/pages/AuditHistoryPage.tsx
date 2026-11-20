import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Shield, Clock, FileCode, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { Incident } from '../types';
import { API_BASE_URL } from '../config/api';

export default function AuditHistoryPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/incidents/`);
      setIncidents(res.data);
      if (res.data.length > 0) {
        setSelectedIncidentId(res.data[0].id);
        fetchAuditTrail(res.data[0].id);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async (incId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analysis/${incId}/audit`);
      setAuditLogs(res.data);
    } catch {
      setAuditLogs([]);
    }
  };

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    fetchAuditTrail(id);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Immutable DevSecOps Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Cryptographic and timestamped ledger tracking every action across Agent 1, Agent 2, Validator, Agent 3, and Deployment.
          </p>
        </div>

        <button
          onClick={() => selectedIncidentId && fetchAuditTrail(selectedIncidentId)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Audit Log"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Incident Selector */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Problem Report:
          </h3>

          <div className="space-y-2">
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              return (
                <button
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc.id)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold">{inc.human_id}</span>
                    <span className="text-[10px] font-mono text-slate-500">{new Date(inc.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="font-medium text-slate-200 truncate">{inc.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chronological Audit Trail */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-300 border-b border-slate-800 pb-4">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Chronological Lifecycle Ledger:</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No audit log entries found for this report.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {auditLogs.map((log, i) => (
                <div key={log.id || i} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-cyan-500 border-4 border-slate-900 group-hover:scale-125 transition-transform" />
                  
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-cyan-400 tracking-wide">{log.event_type}</span>
                      <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <pre className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                      <code>{JSON.stringify(log.event_data, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
