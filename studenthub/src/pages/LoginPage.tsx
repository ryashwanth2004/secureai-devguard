import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Lock, User, AlertCircle, Info, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthPatched } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white shadow-md shadow-blue-500/20 mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Student Portal Sign In</h2>
          <p className="text-xs text-gray-500 mt-1">Access your enrolled courses, transcripts, and academic records.</p>
        </div>

        {/* Security Patch Status Indicator */}
        <div className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-between ${
          isAuthPatched
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            {isAuthPatched ? <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />}
            <span>
              {isAuthPatched
                ? 'Security Status: Patched (Empty password blocked)'
                : 'Security Status: Vulnerable (Empty password bypass active)'}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Student Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alice, bob, or student"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setPassword('')}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Clear to Empty
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAuthPatched ? "Enter password (required)" : "Leave blank to test defect"}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all mt-2"
          >
            Sign In to Student Account
          </button>
        </form>

        {/* Credentials and Testing Guide */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-blue-800">
            <Info className="w-3.5 h-3.5" />
            <span>How to Demonstrate this Scenario to Teachers:</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            {isAuthPatched ? (
              <>
                <strong className="text-emerald-700">Patch Deployed:</strong> Submitting with an empty password is now strictly rejected. Type <code className="bg-white px-1 py-0.5 rounded border border-blue-200">alice2024</code> to log in.
              </>
            ) : (
              <>
                <strong className="text-amber-800">Before Patch:</strong> Leave the password completely blank and click Sign In. You will log straight in without password verification.
              </>
            )}
          </p>
        </div>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Need to report this vulnerability?{' '}
            <Link to="/report" className="text-amber-600 font-semibold hover:underline">
              Submit an Incident Report
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
