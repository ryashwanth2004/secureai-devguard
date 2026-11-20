import React, { useState } from 'react';
import { User, Mail, GraduationCap, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || 'Alice Johnson');
  const [email] = useState(user?.email || 'alice.johnson@studenthub.edu');
  const [major, setMajor] = useState(user?.major || 'Computer Science & AI');
  
  // Bug #4 input: raw HTML bio that renders unsanitized
  const [bio, setBio] = useState('Passionate about deep learning, distributed systems, and security automation.');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Academic Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your institutional identity, academic credentials, and public student bio.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 font-extrabold text-2xl mx-auto flex items-center justify-center border-4 border-blue-50">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
            <p className="text-xs text-blue-600 font-medium">{major}</p>
            <p className="text-xs text-gray-400 mt-0.5">{email}</p>
          </div>

          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-gray-50">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">GPA</span>
              <span className="font-extrabold text-gray-800 text-base">{user?.gpa || 3.88}</span>
            </div>
            <div className="p-2 rounded-xl bg-gray-50">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Standing</span>
              <span className="font-bold text-emerald-600">Honors</span>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 text-lg">Edit Personal Information</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Full Student Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Academic Email (Verified)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Major & Department
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Biographical Description
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Live Rendered Bio Preview (Demonstrates XSS vulnerability surface without crashing) */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Public Profile Bio Preview
              </span>
              <div
                className="text-xs text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
            >
              Save Profile Updates
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
