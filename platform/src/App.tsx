import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import BugAnalysisPage from './pages/BugAnalysisPage';
import CodeComparisonPage from './pages/CodeComparisonPage';
import ValidationPage from './pages/ValidationPage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import DeploymentPage from './pages/DeploymentPage';
import AdminApprovalPage from './pages/AdminApprovalPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AuditHistoryPage from './pages/AuditHistoryPage';
import ExportReportPage from './pages/ExportReportPage';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { PlatformStats, Incident } from './types';
import { API_BASE_URL } from './config/api';

const INITIAL_STATS: PlatformStats = {
  total_reports: 0,
  reports_under_analysis: 0,
  bugs_detected: 0,
  patches_generated: 0,
  patches_validated: 0,
  low_risk_deployments: 0,
  high_risk_changes: 0,
  pending_admin_approvals: 0,
  successful_deployments: 0,
  rejected_patches: 0
};

export default function App() {
  const [stats, setStats] = useState<PlatformStats>(INITIAL_STATS);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState<Array<{ time: string; text: string; type: string }>>([]);

  const refreshAll = async () => {
    try {
      const [statsRes, incRes, pendRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`),
        axios.get(`${API_BASE_URL}/api/incidents/`),
        axios.get(`${API_BASE_URL}/api/admin/pending`)
      ]);
      setStats(statsRes.data);
      setIncidents(incRes.data);
      setPendingApprovals(pendRes.data);
    } catch {
      // Backend offline or starting up
    }
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 4000);
    return () => clearInterval(interval);
  }, []);

  // SSE Stream integration for live multi-agent updates
  useEffect(() => {
    let evtSource: EventSource | null = null;
    try {
      evtSource = new EventSource(`${API_BASE_URL}/api/events/`);
      evtSource.onopen = () => setSseConnected(true);
      evtSource.onerror = () => setSseConnected(false);
      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') return;

          const time = new Date().toLocaleTimeString();
          let text = `Event: ${data.type}`;
          if (data.type === 'agent1_complete') text = `[Agent 1] Mapped component: ${data.summary}`;
          if (data.type === 'agent2_complete') text = `[Agent 2] Scanned & repaired ${data.bugs_found} bug(s)`;
          if (data.type === 'validation_complete') text = `[Validator] Patch status: ${data.status}`;
          if (data.type === 'risk_assessed') text = `[Agent 3] Evaluated Risk: ${data.risk_level}`;
          if (data.type === 'deployed') text = `[Deploy] Production release: ${data.status}`;
          if (data.type === 'awaiting_approval') text = `[Gate] HIGH RISK change blocked for admin approval`;

          setLiveEvents(prev => [{ time, text, type: data.type }, ...prev.slice(0, 30)]);
          refreshAll();
        } catch {
          // Non-JSON packet
        }
      };
    } catch {
      // Handled
    }

    return () => {
      if (evtSource) evtSource.close();
    };
  }, []);

  const handleResetDemo = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/incidents/reset-demo`);
      alert('StudentHub demonstration source modules successfully restored to clean buggy baseline.');
      refreshAll();
    } catch {
      alert('Unable to reset demo baseline. Please check if backend is running.');
    }
  };

  const handleRerun = async (incidentId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/analysis/${incidentId}/run`);
      refreshAll();
    } catch {
      // Handled
    }
  };

  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
          {/* DevSecOps Sidebar */}
          <Sidebar
            pendingCount={pendingApprovals.length}
            onResetDemo={handleResetDemo}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header sseConnected={sseConnected} />

            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route
                  path="/"
                  element={
                    <DashboardPage
                      stats={stats}
                      incidents={incidents}
                      liveEvents={liveEvents}
                      onRefresh={refreshAll}
                    />
                  }
                />
                <Route
                  path="/reports"
                  element={<ReportsPage incidents={incidents} onRerun={handleRerun} />}
                />
                <Route path="/reports/:id/summary" element={<ReportDetailPage />} />
                <Route path="/reports/:id/bugs" element={<BugAnalysisPage />} />
                <Route path="/reports/:id/diff" element={<CodeComparisonPage />} />
                <Route path="/reports/:id/validation" element={<ValidationPage />} />
                <Route path="/reports/:id/risk" element={<RiskAssessmentPage />} />
                <Route path="/deployments" element={<DeploymentPage />} />
                <Route path="/admin/approvals" element={<AdminApprovalPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/audit" element={<AuditHistoryPage />} />
                <Route path="/export" element={<ExportReportPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
