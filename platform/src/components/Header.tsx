import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Radio, Server, UserCheck, Lock } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface HeaderProps {
  sseConnected: boolean;
}

export default function Header({ sseConnected }: HeaderProps) {
  const { isAdminLoggedIn, adminUser, logout } = useAdminAuth();

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-30 sticky top-0">
      {/* Left side: System status pills */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Backend API:</span>
          <span className="text-slate-200 font-mono font-medium">8000</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Telemetry Stream:</span>
          <span className={sseConnected ? "text-emerald-400 font-mono font-medium" : "text-slate-500 font-mono"}>
            {sseConnected ? "CONNECTED" : "STANDBY"}
          </span>
        </div>
      </div>

      {/* Right side: Security administrator info */}
      <div className="flex items-center gap-3">
        {isAdminLoggedIn ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-xs text-cyan-300">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin: <strong className="font-mono text-white">{adminUser}</strong></span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono">SecOps</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Authorization</span>
          </Link>
        )}
      </div>
    </header>
  );
}
