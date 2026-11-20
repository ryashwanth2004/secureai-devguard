import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Cpu,
  Bug,
  CheckCircle,
  GitCompare,
  AlertOctagon,
  Rocket,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface PipelineProps {
  currentStage?: 'report' | 'agent1' | 'agent2' | 'validation' | 'diff' | 'risk' | 'deployment';
  riskLevel?: 'LOW RISK' | 'HIGH RISK' | null;
  incidentId?: string;
}

export default function PipelineVisualizer({ currentStage, riskLevel, incidentId }: PipelineProps) {
  const targetId = incidentId || 'latest';

  const steps = [
    { key: 'report', label: '1. Incident Report', path: `/reports`, icon: FileText },
    { key: 'agent1', label: '2. Agent 1 Summary', path: `/reports/${targetId}/summary`, icon: Cpu },
    { key: 'agent2', label: '3. Agent 2 Bug & Patch', path: `/reports/${targetId}/bugs`, icon: Bug },
    { key: 'validation', label: '4. Testing & Validation', path: `/reports/${targetId}/validation`, icon: CheckCircle },
    { key: 'diff', label: '5. Before / After Diff', path: `/reports/${targetId}/diff`, icon: GitCompare },
    { key: 'risk', label: '6. Agent 3 Risk Engine', path: `/reports/${targetId}/risk`, icon: AlertOctagon },
    { key: 'deployment', label: '7. Secure Deployment', path: `/deployments`, icon: Rocket },
  ];

  const getStepIndex = (key: string) => steps.findIndex(s => s.key === key);
  const activeIdx = currentStage ? getStepIndex(currentStage) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm overflow-x-auto">
      <div className="flex items-center min-w-max gap-1">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <React.Fragment key={step.key}>
              <Link
                to={step.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : isPassed
                    ? 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
                    : 'bg-slate-950/60 text-slate-500 hover:text-slate-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400 animate-pulse' : isPassed ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{step.label}</span>
                {step.key === 'risk' && riskLevel && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    riskLevel === 'HIGH RISK' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {riskLevel}
                  </span>
                )}
              </Link>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-700 mx-1 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
