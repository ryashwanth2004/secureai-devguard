import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
  Cpu,
  Bug,
  CheckCircle2,
  Lock,
  Rocket,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import PipelineVisualizer from '../components/PipelineVisualizer';
import { PlatformStats, Incident } from '../types';

interface DashboardProps {
  stats: PlatformStats;
  incidents: Incident[];
  liveEvents: Array<{ time: string; text: string; type: string }>;
  onRefresh: () => void;
}

export default function DashboardPage({ stats, incidents, liveEvents, onRefresh }: DashboardProps) {
  const latestIncident = incidents[0];

  const metricCards = [
    { label: 'Total Incident Reports', val: stats.total_reports, icon: Layers, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { label: 'Reports Under Analysis', val: stats.reports_under_analysis, icon: Cpu, color: 'text-amber-400', border: 'border-amber-500/30', pulse: stats.reports_under_analysis > 0 },
    { label: 'Software Bugs Detected', val: stats.bugs_detected, icon: Bug, color: 'text-red-400', border: 'border-red-500/30' },
    { label: 'Candidate Patches Generated', val: stats.patches_generated, icon: RefreshCw, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'Patches Formally Validated', val: stats.patches_validated, icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Low-Risk Auto Deployments', val: stats.low_risk_deployments, icon: Rocket, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'High-Risk Gated Changes', val: stats.high_risk_changes, icon: AlertTriangle, color: 'text-rose-400', border: 'border-rose-500/30' },
    { label: 'Pending Admin Approvals', val: stats.pending_admin_approvals, icon: Lock, color: 'text-amber-400', border: 'border-amber-500/40', pulse: stats.pending_admin_approvals > 0 },
    { label: 'Total Deployed in Production', val: stats.successful_deployments, icon: ShieldAlert, color: 'text-cyan-300', border: 'border-cyan-500/30' },
    { label: 'Administrator Rejected', val: stats.rejected_patches, icon: AlertTriangle, color: 'text-slate-400', border: 'border-slate-700' },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Title + Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>DevSecOps Autonomous Multi-Agent Command Center</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              LIVE SYSTEM
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Autonomous Detection • AST Program Repair • Multi-Check Validation • Binary Risk Policy • Gated Deployment
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Visual System Flow Banner */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase font-bold text-[10px] tracking-wider text-slate-400">
            Active Multi-Agent Orchestration Flow
          </span>
          {latestIncident && (
            <span className="font-mono text-cyan-400 text-[11px]">
              Inspecting Report: <strong className="text-white">{latestIncident.human_id}</strong> ({latestIncident.title})
            </span>
          )}
        </div>
        <PipelineVisualizer
          currentStage={latestIncident ? (latestIncident.status === 'deployed' ? 'deployment' : 'risk') : 'report'}
          incidentId={latestIncident?.id}
        />
      </div>

      {/* Key Metric Grid (10 DevSecOps Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900/90 rounded-2xl p-4 border ${card.border} shadow-sm space-y-2 relative overflow-hidden`}
            >
              {card.pulse && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-2xl font-black font-mono text-white tracking-tight">
                  {card.val}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-400 leading-tight">
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Recent Reports & Real-time Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Recent StudentHub Incident Reports */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Recent StudentHub Problem Reports</span>
            </div>
            <Link to="/reports" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1">
              View All ({incidents.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {incidents.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              No problem reports received yet. Submit an issue from the StudentHub demo portal.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {incidents.slice(0, 5).map((inc) => (
                <div key={inc.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                        {inc.human_id}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{inc.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Page: <strong className="text-slate-300">{inc.affected_page}</strong> • {new Date(inc.created_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
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

                    <Link
                      to={`/reports/${inc.id}/summary`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Event Stream Feed */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-96">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Agent Telemetry</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-2 font-mono text-[11px]">
            {liveEvents.length === 0 ? (
              <div className="text-slate-500 text-center pt-8">
                Listening for real-time multi-agent pipeline events...
              </div>
            ) : (
              liveEvents.map((ev, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start gap-2">
                  <span className="text-slate-500 shrink-0 text-[10px]">{ev.time}</span>
                  <span className={`text-[11px] ${
                    ev.type === 'deployed' ? 'text-emerald-400 font-bold' :
                    ev.type === 'awaiting_approval' ? 'text-amber-400 font-bold' :
                    ev.type === 'agent2_complete' ? 'text-cyan-300' :
                    'text-slate-300'
                  }`}>
                    {ev.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
