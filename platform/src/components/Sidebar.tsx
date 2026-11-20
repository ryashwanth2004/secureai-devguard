import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldAlert,
  LayoutDashboard,
  FileText,
  Cpu,
  Bug,
  GitCompare,
  CheckCircle,
  AlertOctagon,
  Rocket,
  ShieldCheck,
  History,
  Download,
  RotateCcw,
  Lock
} from 'lucide-react';

interface SidebarProps {
  pendingCount: number;
  onResetDemo: () => void;
}

export default function Sidebar({ pendingCount, onResetDemo }: SidebarProps) {
  const navItems = [
    { label: 'Platform Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'StudentHub Reports', path: '/reports', icon: FileText },
    { label: 'Agent 1 — Summarizer', path: '/reports/latest/summary', icon: Cpu },
    { label: 'Agent 2 — Bug Repair', path: '/reports/latest/bugs', icon: Bug },
    { label: 'Monaco Code Diff', path: '/reports/latest/diff', icon: GitCompare },
    { label: 'Patch Validation', path: '/reports/latest/validation', icon: CheckCircle },
    { label: 'Agent 3 — Risk Engine', path: '/reports/latest/risk', icon: AlertOctagon },
    { label: 'Deployment Pipeline', path: '/deployments', icon: Rocket },
    {
      label: 'Admin Approval Gate',
      path: '/admin/approvals',
      icon: Lock,
      badge: pendingCount > 0 ? pendingCount : undefined,
      highlight: pendingCount > 0
    },
    { label: 'Audit History', path: '/audit', icon: History },
    { label: 'Executive Export', path: '/export', icon: Download },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/20">
          <ShieldAlert className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="font-extrabold text-sm text-slate-100 tracking-tight flex items-center gap-1.5">
            <span>SecureAI</span>
            <span className="text-cyan-400 font-mono text-xs font-semibold">DevGuard</span>
          </div>
          <span className="block text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            Autonomous DevSecOps
          </span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Operations Center
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30 shadow-sm'
                    : item.highlight
                    ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950 animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Demo Controls at bottom */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono">Demo Environment</span>
          <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
        </div>

        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          title="Reset StudentHub source files back to original demonstration bug baseline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Baseline</span>
        </button>
      </div>
    </aside>
  );
}
