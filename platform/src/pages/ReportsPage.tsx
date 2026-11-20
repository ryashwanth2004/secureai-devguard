import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, ArrowRight, RefreshCw, Cpu, GitCompare, AlertOctagon } from 'lucide-react';
import { Incident } from '../types';

interface ReportsPageProps {
  incidents: Incident[];
  onRerun: (id: string) => void;
}

export default function ReportsPage({ incidents, onRerun }: ReportsPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filtered = incidents.filter((inc) => {
    const matchesSearch = inc.title.toLowerCase().includes(search.toLowerCase()) ||
                          inc.human_id.toLowerCase().includes(search.toLowerCase()) ||
                          inc.affected_page.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter === 'ALL' || inc.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">StudentHub Incident Reports</h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          All problem reports ingested from StudentHub across user sessions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filter by Report ID, Title, or Page..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'pending', 'analyzing', 'awaiting_approval', 'deployed', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                filter === st
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Problem Title</th>
                <th className="py-3.5 px-4">Affected Page</th>
                <th className="py-3.5 px-4">Created Timestamp</th>
                <th className="py-3.5 px-4">Pipeline Status</th>
                <th className="py-3.5 px-4 text-right">DevSecOps Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No problem reports match the selected query.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {inc.human_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {inc.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {inc.affected_page}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(inc.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                        inc.status === 'deployed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : inc.status === 'awaiting_approval'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 animate-pulse'
                          : inc.status === 'analyzing'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {inc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/reports/${inc.id}/summary`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
                          title="Agent 1 Summary"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/reports/${inc.id}/diff`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition-colors"
                          title="Monaco Diff View"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/reports/${inc.id}/risk`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                          title="Agent 3 Risk"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => onRerun(inc.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                          title="Re-run Pipeline"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
