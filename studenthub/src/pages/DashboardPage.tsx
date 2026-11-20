import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, Calendar, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COURSES } from '../data/courses';

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const enrolled = [
    { ...COURSES[0], progress: 68, nextLesson: 'Deep Convolutional Networks' },
    { ...COURSES[1], progress: 42, nextLesson: 'PostgreSQL Connection Pooling' },
    { ...COURSES[2], progress: 85, nextLesson: 'OWASP Top 10 Security Audit' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase">
            Active Student Profile
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed">
            Major: <strong>{user?.major}</strong> • Academic Term: Fall 2026. You are in good standing with an active GPA of {user?.gpa}.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/my-courses"
              className="px-4 py-2 bg-white text-blue-700 text-xs font-bold rounded-xl shadow hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
            >
              Resume Courses <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/courses"
              className="px-4 py-2 bg-blue-800/60 border border-white/20 text-white text-xs font-semibold rounded-xl hover:bg-blue-800 transition-colors"
            >
              Add New Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Enrolled Classes</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">3 Courses</div>
          <span className="text-[11px] text-emerald-600 font-medium">Active in term</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Cumulative GPA</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{user?.gpa}</div>
          <span className="text-[11px] text-gray-400 font-medium">Top 5% of class</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Completed Hours</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">74 Hours</div>
          <span className="text-[11px] text-blue-600 font-medium">8 hrs this week</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase">Certificates</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">2 Earned</div>
          <span className="text-[11px] text-gray-400 font-medium">1 in progress</span>
        </div>
      </div>

      {/* Grid: Courses in progress + Upcoming tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Courses in Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg">Active Coursework</h3>
            <Link to="/my-courses" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {enrolled.map((course) => (
              <div key={course.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={course.image} alt={course.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase">{course.category}</span>
                    <h4 className="font-bold text-gray-900 text-sm">{course.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Next: {course.nextLesson}</p>
                  </div>
                </div>

                <div className="w-full sm:w-44 space-y-1.5 shrink-0">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deadlines & Support link */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Academic Deadlines
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="font-semibold text-gray-900">Neural Systems Lab #3</div>
                <div className="text-gray-500 mt-0.5">Due: November 24, 2026 • 11:59 PM</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="font-semibold text-gray-900">Cybersecurity Vulnerability Audit</div>
                <div className="text-gray-500 mt-0.5">Due: November 28, 2026 • 5:00 PM</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="font-semibold text-gray-900">Fall Semester Registration Closes</div>
                <div className="text-gray-500 mt-0.5">Deadline: December 5, 2026</div>
              </div>
            </div>
          </div>

          {/* Quick Problem Report Card */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Experiencing Portal Issues?
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              If course totals, logins, or payments do not behave as expected, file a technical report.
            </p>
            <Link
              to="/report"
              className="inline-block mt-2 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors"
            >
              Report a Technical Issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
