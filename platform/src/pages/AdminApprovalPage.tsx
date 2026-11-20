import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, ShieldAlert, CheckCircle, XCircle, AlertTriangle, GitCompare, RefreshCw, UserCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { API_BASE_URL } from '../config/api';

export default function AdminApprovalPage() {
  const { isAdminLoggedIn, authHeaders, login } = useAdminAuth();
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick inline login credentials for demo jury
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('admin123');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/pending`);
      setPendingItems(res.data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/admin/login`, {
        username: loginUser,
        password: loginPass
      });
      login(res.data.token, res.data.username);
      setActionMessage({ type: 'success', text: 'Administrator credentials verified. Approval gate unlocked.' });
    } catch {
      setActionMessage({ type: 'error', text: 'Invalid administrator credentials.' });
    }
  };

  const handleApprove = async (incidentId: string) => {
    if (!isAdminLoggedIn) {
      setActionMessage({ type: 'error', text: 'Administrator authorization required to unlock the deployment gate.' });
      return;
    }
    setProcessingId(incidentId);
    setActionMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/deployment/${incidentId}/approve`, {}, authHeaders);
      setActionMessage({
        type: 'success',
        text: 'High-risk patch approved by Administrator. Deployed live to StudentHub environment.'
      });
      fetchPending();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Approval authorization failed.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (incidentId: string) => {
    if (!isAdminLoggedIn) {
      setActionMessage({ type: 'error', text: 'Administrator authorization required.' });
      return;
    }
    setProcessingId(incidentId);
    setActionMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/deployment/${incidentId}/reject`, {}, authHeaders);
      setActionMessage({
        type: 'success',
        text: 'Candidate patch rejected by Administrator. Production deployment blocked.'
      });
      fetchPending();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Rejection failed.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              HIGH RISK GATEWAY
            </span>
            <span className="font-mono text-xs text-slate-400">Strict DevSecOps Governance</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">
            Administrator High-Risk Approval Gate
          </h1>
        </div>

        <button
          onClick={fetchPending}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Pending Queue</span>
        </button>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-center gap-2.5 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Auth Status Box */}
      {!isAdminLoggedIn && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Lock className="w-4 h-4" />
            <span>Administrator Authorization Required</span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            High-risk changes are protected by policy gates. Sign in with the administrator credentials to approve or reject gated deployments.
          </p>

          <form onSubmit={handleQuickLogin} className="flex flex-wrap items-center gap-3 pt-1">
            <input
              type="text"
              placeholder="Username"
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Unlock Approval Gate
            </button>
          </form>
        </div>
      )}

      {/* Pending Items */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs font-mono">
          Loading pending approval gate queue...
        </div>
      ) : pendingItems.length === 0 ? (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No High-Risk Changes Awaiting Approval</h3>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            All submitted patches are either auto-deployed under Low-Risk policies or currently resolved.
            Submit a high-risk scenario (e.g. Login Authentication Bypass) from StudentHub to test this gate.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingItems.map((item) => (
            <div key={item.incident_id} className="bg-slate-900 rounded-3xl border border-amber-500/40 p-6 space-y-6 shadow-sm">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{item.human_id}</span>
                      <h3 className="font-bold text-slate-100 text-base">{item.title}</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Affected Page: <strong className="text-slate-300">{item.affected_page}</strong> • {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    HIGH RISK BLOCKED
                  </span>
                </div>
              </div>

              {/* Risk reason */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <span className="font-bold text-amber-400 uppercase block">Agent 3 Governance Finding:</span>
                <p className="text-slate-300 leading-relaxed">{item.risk_reason}</p>
              </div>

              {/* Diff Snippet preview */}
              {item.primary_diff && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Generated Candidate Patch Diff Preview:</span>
                    <Link to={`/reports/${item.incident_id}/diff`} className="text-cyan-400 hover:underline flex items-center gap-1">
                      Full Monaco Diff <GitCompare className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 max-h-48">
                    <code>{item.primary_diff}</code>
                  </pre>
                </div>
              )}

              {/* Action Buttons: APPROVE vs REJECT */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800">
                <button
                  onClick={() => handleReject(item.incident_id)}
                  disabled={processingId === item.incident_id}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/80 hover:text-red-400 text-slate-300 border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Patch</span>
                </button>

                <button
                  onClick={() => handleApprove(item.incident_id)}
                  disabled={processingId === item.incident_id}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{processingId === item.incident_id ? 'Deploying to StudentHub...' : 'Approve & Deploy Patch'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
