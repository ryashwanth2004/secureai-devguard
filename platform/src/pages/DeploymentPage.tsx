import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Rocket, CheckCircle2, Clock, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { DeploymentRecord } from '../types';
import { API_BASE_URL } from '../config/api';

export default function DeploymentPage() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/deployment/`);
      setDeployments(res.data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Production Deployment Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Audit history of all autonomous and administrator-authorized releases to StudentHub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <span>Open StudentHub Demo Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={fetchDeployments}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Deployments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deployment Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Ticket</th>
                <th className="py-3.5 px-4">Problem Scope</th>
                <th className="py-3.5 px-4">Deployment Type</th>
                <th className="py-3.5 px-4">Authorized By</th>
                <th className="py-3.5 px-4">Deployed Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No production deployments recorded yet.
                  </td>
                </tr>
              ) : (
                deployments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-cyan-400">
                      {d.human_id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans font-medium">
                      {d.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {d.status === 'auto_deployed' ? (
                        <span className="text-emerald-400 font-semibold">Low-Risk Autonomous</span>
                      ) : (
                        <span className="text-cyan-400 font-semibold">Admin Authorized</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {d.approved_by || 'DevGuard Agent 3'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {d.deployed_at ? new Date(d.deployed_at).toLocaleString() : 'Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        d.status === 'auto_deployed' || d.status === 'deployed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : d.status === 'awaiting_approval'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
