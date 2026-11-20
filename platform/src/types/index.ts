export interface Incident {
  id: string;
  human_id: string;
  title: string;
  description: string;
  affected_page: string;
  expected_behavior: string;
  actual_behavior: string;
  status: string; // pending, analyzing, awaiting_approval, deployed, rejected, error
  created_at: string;
  updated_at: string;
}

export interface Agent1Summary {
  report_id: string;
  title: string;
  project_name: string;
  project_overview: string;
  affected_component: string;
  affected_file: string;
  component_description: string;
  security_classification: string;
  is_security_critical: boolean;
  technologies_used: string[];
  main_modules: string[];
  application_workflow: string;
  security_sensitive_components: string[];
  incident_analysis: string;
  potential_bug_areas: string[];
  source_loc: number;
  identified_functions: string[];
}

export interface Bug {
  bug_id: string;
  title: string;
  bug_type: string;
  cwe: string;
  severity: 'LOW' | 'HIGH';
  file_name: string;
  line_number: number;
  affected_function: string;
  description: string;
  why_problem: string;
  evidence: string;
  root_cause: string;
  suggested_fix: string;
}

export interface Patch {
  patch_id: string;
  bug_id: string;
  file_name: string;
  original_code: string;
  patched_code: string;
  diff_text: string;
  explanation: string;
  lines_added: number;
  lines_removed: number;
}

export interface ValidationItem {
  item: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export interface ValidationResult {
  syntax_check: boolean;
  compile_check: boolean;
  unit_tests_passed: number;
  unit_tests_failed: number;
  unit_tests_skipped: number;
  security_check: boolean;
  regression_check: boolean;
  overall_status: 'VALIDATED' | 'FAILED';
  checklist: ValidationItem[];
  details: {
    unit_suite?: Array<{ name: string; status: string; message: string }>;
  };
}

export interface RiskFactor {
  factor: string;
  value: string;
  impact: string;
  category: string;
}

export interface RiskAssessment {
  risk_level: 'LOW RISK' | 'HIGH RISK';
  score: number;
  reason: string;
  factors: RiskFactor[];
  deployment_decision: 'AUTOMATIC_DEPLOYMENT' | 'AWAITING_ADMIN_APPROVAL';
  confidence: number;
  requires_admin_review: boolean;
  auto_deployable: boolean;
}

export interface DeploymentRecord {
  id: string;
  incident_id: string;
  human_id?: string;
  title?: string;
  status: string; // auto_deployed, awaiting_approval, deployed, rejected
  deployed_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface PlatformStats {
  total_reports: number;
  reports_under_analysis: number;
  bugs_detected: number;
  patches_generated: number;
  patches_validated: number;
  low_risk_deployments: number;
  high_risk_changes: number;
  pending_admin_approvals: number;
  successful_deployments: number;
  rejected_patches: number;
}

export interface AuditLogItem {
  id: string;
  event_type: string;
  event_data: any;
  timestamp: string;
}
