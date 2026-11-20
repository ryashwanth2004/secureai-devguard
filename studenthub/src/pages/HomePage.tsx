import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Users, Award, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { COURSES } from '../data/courses';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const { addToCart } = useCart();
  const featured = COURSES.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-gray-50 pt-16 pb-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Fall 2026 Academic Enrollment Open
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Empowering the Next Generation of <span className="text-blue-600">Engineers & Leaders</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              Explore university-accredited computing, cybersecurity, and artificial intelligence programs taught by industry pioneers and research faculty.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Browse Course Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm shadow-sm"
              >
                Student Portal Sign In
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-gray-200/60 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">45,000+</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">120+</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Accredited Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">98.4%</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Course Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">4.9 / 5.0</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Average Student Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Featured Academic Curricula</h2>
            <p className="text-sm text-gray-500 mt-1">High-demand programs currently open for direct student registration.</p>
          </div>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1 mt-3 md:mt-0">
            View All Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 shadow-sm">
                  {course.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-gray-400">({course.students.toLocaleString()} enrolled)</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-snug hover:text-blue-600 transition-colors">
                    <Link to={`/courses/${course.id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{course.description}</p>
                </div>

                <div className="pt-5 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Tuition</span>
                    <span className="text-xl font-extrabold text-gray-900">${course.price}</span>
                  </div>
                  <button
                    onClick={() => addToCart(course)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Highlights */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Verified University Credentials</h4>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  Earn accredited certificates and digital transcript badges recognized by premier technology employers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-lg">World-Class Research Faculty</h4>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  Receive personalized feedback, live office hours, and project reviews directly from leading researchers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Industry-Standard Labs</h4>
                <p className="text-xs text-blue-200 mt-1 leading-relaxed">
                  Practice on live cloud sandbox environments configured with realistic enterprise stacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
