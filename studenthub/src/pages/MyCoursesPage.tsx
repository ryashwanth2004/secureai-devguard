import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { COURSES } from '../data/courses';

export default function MyCoursesPage() {
  const enrolled = [
    { ...COURSES[0], progress: 68, completedUnits: 8, totalUnits: 12 },
    { ...COURSES[1], progress: 42, completedUnits: 5, totalUnits: 14 },
    { ...COURSES[2], progress: 85, completedUnits: 10, totalUnits: 12 },
    { ...COURSES[3], progress: 100, completedUnits: 10, totalUnits: 10, certificateEarned: true }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Registered Coursework</h1>
        <p className="text-sm text-gray-500 mt-1">Access lecture modules, submit laboratory assignments, and review instructor notes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolled.map((course) => (
          <div key={course.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">
                    {course.category}
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg mt-0.5">{course.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{course.instructor}</p>
                </div>
                {course.progress === 100 ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full shrink-0">
                    In Progress
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-500">{course.completedUnits} of {course.totalUnits} Units Completed</span>
                  <span className="text-blue-600">{course.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Last accessed 2 days ago</span>
              </div>

              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                <PlayCircle className="w-3.5 h-3.5" />
                {course.progress === 100 ? 'Review Lectures' : 'Continue Lesson'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
