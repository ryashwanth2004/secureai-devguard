import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Send, HelpCircle, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AFFECTED_PAGES = [
  'Cart',
  'Login Page',
  'Payment',
  'Profile',
  'Student Dashboard',
  'Courses Page',
  'Course Detail',
  'My Courses',
  'Help/Support',
  'Other'
];

interface QuickDemoTemplate {
  label: string;
  title: string;
  affected_page: string;
  description: string;
  expected: string;
  actual: string;
}

const DEMO_TEMPLATES: QuickDemoTemplate[] = [
  {
    label: "🛒 Cart Total Bug (Low Risk Demo)",
    title: "Incorrect Cart Total Calculation",
    affected_page: "Cart",
    description: "When I add two or more courses to my enrollment cart, the subtotal amount is lower than the actual sum. The final item appears to be completely omitted from the calculation.",
    expected: "The total should equal the exact mathematical sum of all course prices in the cart.",
    actual: "The total displayed excludes the final course price ($89.99 instead of $209.98)."
  },
  {
    label: "🔐 Empty Password Login Bypass (High Risk Demo)",
    title: "Empty Password Authentication Bypass",
    affected_page: "Login Page",
    description: "I noticed that typing any valid student username (like 'alice') while leaving the password field completely blank logs straight into the account without authentication.",
    expected: "The system should reject empty passwords and require valid credentials.",
    actual: "Immediate login is granted with a blank password string."
  },
  {
    label: "💳 Negative Payment Validation Bug (High Risk Demo)",
    title: "Payment Gateway Accepts Negative Amounts",
    affected_page: "Payment",
    description: "The tuition payment simulation allows submitting negative numerical amounts (e.g. -$50.00), resulting in a successful transaction confirmation rather than an input error.",
    expected: "The payment gateway should enforce that amount is strictly greater than zero.",
    actual: "Negative payment transactions are accepted and return success."
  },
  {
    label: "👤 Unsanitized Profile Bio XSS (High Risk Demo)",
    title: "Unsanitized User Input in Student Profile",
    affected_page: "Profile",
    description: "Entering raw HTML tags into the student biographical bio field renders directly in the public profile without entity escaping, posing an injection risk.",
    expected: "All user inputs should be escaped or sanitized with html.escape() prior to rendering.",
    actual: "Raw HTML tags are rendered directly in the profile display."
  }
];

export default function ReportProblemPage() {
  const [title, setTitle] = useState('');
  const [affectedPage, setAffectedPage] = useState('Cart');
  const [description, setDescription] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ human_id: string; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fillTemplate = (tpl: QuickDemoTemplate) => {
    setTitle(tpl.title);
    setAffectedPage(tpl.affected_page);
    setDescription(tpl.description);
    setExpectedBehavior(tpl.expected);
    setActualBehavior(tpl.actual);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !expectedBehavior.trim() || !actualBehavior.trim()) {
      setErrorMsg('Please complete all required problem reporting fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/incidents/report`, {
        title,
        affected_page: affectedPage,
        description,
        expected_behavior: expectedBehavior,
        actual_behavior: actualBehavior
      });

      setSubmittedData({
        human_id: response.data.human_id,
        message: response.data.message
      });
    } catch (err: any) {
      setErrorMsg(
        `Unable to transmit incident report to technical operations server (${API_BASE_URL}). Please confirm the backend API is active.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setTitle('');
    setDescription('');
    setExpectedBehavior('');
    setActualBehavior('');
    setErrorMsg('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Report an Application Problem</h1>
        <p className="text-sm text-gray-500 mt-1">
          Help improve the StudentHub platform by detailing defects, calculation errors, or system anomalies.
        </p>
      </div>

      {submittedData ? (
        /* Neutral user confirmation following strict architectural requirement */
        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Problem Submitted Successfully</h2>
            <p className="text-xs text-gray-500">Your problem report has been logged with academic engineering support.</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 max-w-sm mx-auto">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Assigned Ticket Reference</span>
            <span className="text-2xl font-black font-mono text-blue-700 tracking-tight block mt-1">
              {submittedData.human_id}
            </span>
          </div>

          <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
            Our support and engineering teams will inspect the reported issue. You will receive email notifications as updates occur.
          </p>

          <div className="pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick Jury Demo Selectors */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Jury Demonstration Quick-Fill Scenarios:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => fillTemplate(tpl)}
                  className="text-left p-2.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:shadow-sm text-xs font-semibold text-gray-800 transition-all"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Problem Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Incorrect Cart Total"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Affected Page / Feature *
              </label>
              <select
                value={affectedPage}
                onChange={(e) => setAffectedPage(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              >
                {AFFECTED_PAGES.map((page) => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Describe Your Problem *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe what occurred, steps to reproduce, and where the defect happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expected Behavior *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What did you expect to happen?"
                  value={expectedBehavior}
                  onChange={(e) => setExpectedBehavior(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Actual Behavior *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What actually happened instead?"
                  value={actualBehavior}
                  onChange={(e) => setActualBehavior(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all"
                />
              </div>
            </div>

            {/* Optional screenshot upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Optional Screenshot
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400 bg-gray-50">
                Click or drag screenshot file here to attach (PNG, JPG up to 5MB)
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting Problem Report...' : 'Submit Problem Report'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
