import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">StudentHub</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              University Academic & Course Portal. Providing students worldwide with high-impact computer science, data intelligence, and engineering curricula.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Academics</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/courses" className="hover:text-white transition-colors">Course Catalog</Link></li>
              <li><Link to="/courses" className="hover:text-white transition-colors">Specializations</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Student Progress</Link></li>
              <li><Link to="/my-courses" className="hover:text-white transition-colors">Enrolled Classes</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Student Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/help" className="hover:text-white transition-colors">Help Desk & FAQ</Link></li>
              <li><Link to="/report" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Report an Issue / Bug</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Academic Advising</Link></li>
              <li><Link to="/payment" className="hover:text-white transition-colors">Tuition & Billing Simulation</Link></li>
            </ul>
          </div>

          {/* Institutional Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Institution</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>support@studenthub.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Academic Hall, Campus West</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] text-gray-400">SOC2 Type II Certified Portal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 StudentHub Academic Systems. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Student Honor Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
