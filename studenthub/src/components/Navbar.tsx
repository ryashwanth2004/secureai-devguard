import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, ShoppingCart, User, HelpCircle, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
    ...(isLoggedIn ? [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'My Courses', path: '/my-courses' }
    ] : [])
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Student<span className="text-blue-600">Hub</span></span>
              <span className="block text-[10px] uppercase font-semibold text-gray-400 tracking-wider">University Portal</span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Report a Problem Link */}
            <Link
              to="/report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              title="Report an application defect or issue"
            >
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Report a Problem</span>
              <span className="sm:hidden">Report</span>
            </Link>

            {/* Help Link */}
            <Link
              to="/help"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>

            {/* Cart Icon with Counter */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                    {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-gray-800">{user?.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
