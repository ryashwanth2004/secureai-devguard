import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, BookOpen, Check } from 'lucide-react';
import { COURSES } from '../data/courses';
import { useCart } from '../context/CartContext';

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const { addToCart, items: cartItems } = useCart();

  const categories = ['All', 'AI & Data Science', 'Software Engineering', 'Cybersecurity', 'Cloud & DevOps'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Catalog Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">University Course Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and enroll in high-impact academic programs for the current term.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search courses by keyword, technology, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Difficulty:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const inCart = cartItems.some((c) => c.id === course.id);
          return (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-blue-700 shadow-sm">
                    {course.category}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-gray-900/80 text-white px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-sm">
                    {course.level}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-2">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-gray-400 font-normal">({course.students.toLocaleString()} students)</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug hover:text-blue-600 transition-colors">
                    <Link to={`/courses/${course.id}`}>{course.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
                  <p className="text-xs text-gray-600 mt-2.5 line-clamp-2 leading-relaxed">{course.description}</p>

                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.topics.length} Units</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Tuition</span>
                  <span className="text-lg font-black text-gray-900">${course.price}</span>
                </div>

                <button
                  onClick={() => addToCart(course)}
                  disabled={inCart}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    inCart
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added to Cart
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
