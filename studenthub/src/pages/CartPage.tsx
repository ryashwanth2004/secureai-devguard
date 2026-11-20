import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, getSubtotal, isPatched } = useCart();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const estimatedTax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + estimatedTax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Academic Registration Cart</h1>
        <p className="text-sm text-gray-500 mt-1">Review your selected courses prior to final enrollment checkout.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Your Registration Cart is Empty</h3>
          <p className="text-xs text-gray-500">You have not selected any courses for the current registration window.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">{item.category}</span>
                    <h4 className="font-bold text-gray-900 text-sm leading-snug">{item.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{item.instructor}</p>
                    <span className="text-sm font-extrabold text-gray-900 mt-2 block">${item.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors self-end sm:self-center"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Educational Help Notice (Normal portal support link) */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <span className="font-semibold">Notice something incorrect about your cart total?</span>
                <p className="mt-0.5 text-amber-700">
                  If the calculated total does not accurately reflect all course prices in your cart, please{' '}
                  <Link to="/report" className="font-bold underline text-amber-900 hover:text-black">
                    Report the problem
                  </Link>{' '}
                  so our engineering team can inspect the issue.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Selected Courses ({items.length})</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Academic Facilities Tax (8%)</span>
                <span className="font-semibold">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-gray-900">
                <span>Total Due</span>
                <span className="text-xl font-black text-blue-700">${total.toFixed(2)}</span>
              </div>

              {isPatched && (
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Verified: All enrolled courses calculated.</span>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/payment')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Tuition Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Simulated Enrollment & Tuition Portal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
