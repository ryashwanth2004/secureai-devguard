import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Mail, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function HelpPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I calculate or verify my cart tuition total?",
      a: "When you select academic courses from the catalog, they appear in your Registration Cart with their corresponding semester tuition. The subtotal and applicable facilities tax are computed automatically."
    },
    {
      q: "What should I do if a course calculation or login issue occurs?",
      a: "If you experience any calculation discrepancy, unexpected password acceptance, or system behavior, please submit a report through our 'Report a Problem' page so our engineering team can review it."
    },
    {
      q: "Can I simulate negative tuition amounts or refunds?",
      a: "Our student portal includes a simulated tuition payment sandbox designed for academic evaluation. Production financial transactions require verified banking rails."
    },
    {
      q: "How do I update my degree program or biographical profile?",
      a: "Navigate to your Student Profile via the top right navigation avatar. You can update your display name, department, and student summary bio anytime."
    },
    {
      q: "Where do I view completed course certificates?",
      a: "Certificates are automatically issued upon reaching 100% completion in any enrolled course and can be downloaded from the 'My Courses' view."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Support & Knowledge Base</h1>
        <p className="text-sm text-gray-500 mt-1">Frequently asked questions regarding academic enrollment, tuition billing, and portal features.</p>
      </div>

      {/* Report Banner */}
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 text-sm">Encountering a Technical Bug or Error?</h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Submit problem reports directly to our technical operations team for investigation.
            </p>
          </div>
        </div>
        <Link
          to="/report"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0"
        >
          Report a Problem
        </Link>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-3">
        <h2 className="font-bold text-gray-900 text-lg mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="border-b border-gray-100 last:border-0 pb-3">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between py-2 text-left font-semibold text-sm text-gray-800 hover:text-blue-600 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen && (
                <p className="text-xs text-gray-600 pt-1 pb-2 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact info */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center space-y-2">
        <Mail className="w-6 h-6 text-blue-600 mx-auto" />
        <h4 className="font-bold text-gray-900 text-sm">Need Direct Academic Assistance?</h4>
        <p className="text-xs text-gray-500">Contact the Registrar & Technical Operations team at support@studenthub.edu</p>
      </div>
    </div>
  );
}
