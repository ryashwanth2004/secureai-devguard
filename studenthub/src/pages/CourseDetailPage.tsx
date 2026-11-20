import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, BookOpen, CheckCircle, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';
import { COURSES } from '../data/courses';
import { useCart } from '../context/CartContext';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, items: cartItems } = useCart();

  const course = COURSES.find((c) => c.id === id) || COURSES[0];
  const inCart = cartItems.some((c) => c.id === course.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link to="/courses" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Course Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details & Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
              {course.category} • {course.level}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Instructed by <strong className="text-gray-800">{course.instructor}</strong> • Department of Computer Science
            </p>

            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{course.rating}</span>
                <span className="text-gray-400 font-normal">({course.students.toLocaleString()} students)</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 text-gray-500 font-medium">
                <Clock className="w-4 h-4" /> {course.duration} comprehensive instruction
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Curriculum Overview</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{course.fullDescription}</p>
          </div>

          {/* Topics Covered */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900 text-lg">Key Competencies & Syllabus</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {course.topics.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 text-xs text-gray-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-900 text-lg">Recommended Prerequisites</h2>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
              {course.prerequisites.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Sticky Card */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-md sticky top-24 space-y-6 p-6">
          <img src={course.image} alt={course.title} className="w-full h-48 object-cover rounded-2xl" />

          <div>
            <span className="text-xs uppercase font-semibold text-gray-400 block">Registration Fee</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-900">${course.price}</span>
              <span className="text-xs text-gray-400">USD / semester</span>
            </div>
          </div>

          <button
            onClick={() => addToCart(course)}
            disabled={inCart}
            className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
              inCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {inCart ? 'Already in Cart' : 'Add Course to Cart'}
          </button>

          <Link
            to="/cart"
            className="w-full block text-center py-3 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          >
            View Shopping Cart
          </Link>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Full institutional academic credit</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Lifetime access to course materials</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
