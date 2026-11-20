import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, CheckCircle2, ShieldCheck, ShieldAlert, AlertCircle, ArrowLeft, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL } from '../config/api';

export default function PaymentPage() {
  const { getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('4532 8920 1938 4920');
  const [cardHolder, setCardHolder] = useState('Alice Johnson');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('782');
  
  // Stored as string so user can freely type minus '-' without number parser converting to 0
  const [amountStr, setAmountStr] = useState<string>(
    getSubtotal() > 0 ? getSubtotal().toString() : '89.99'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ txnId: string; amount: number; cardLast4: string } | null>(null);
  const [paymentError, setPaymentError] = useState<string>('');

  const [isPaymentPatched, setIsPaymentPatched] = useState(false);

  // Poll backend deployments to dynamically detect when Admin approves the payment patch
  const refreshPaymentStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/deployment/`);
      if (Array.isArray(res.data)) {
        const payDeploy = res.data.find(d =>
          (d.status === 'deployed') &&
          (d.title?.toLowerCase().includes('payment') ||
           d.title?.toLowerCase().includes('negative') ||
           d.title?.toLowerCase().includes('amount') ||
           d.title?.toLowerCase().includes('gateway'))
        );
        setIsPaymentPatched(!!payDeploy);
      }
    } catch {
      // Backend not reached
    }
  };

  useEffect(() => {
    refreshPaymentStatus();
    const interval = setInterval(refreshPaymentStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setIsProcessing(true);

    const parsed = parseFloat(amountStr);

    setTimeout(() => {
      // AFTER PATCH DEPLOYED: Validate amount > 0 strictly
      if (isPaymentPatched) {
        if (isNaN(parsed) || parsed <= 0) {
          setIsProcessing(false);
          setPaymentError(
            `Payment Gateway Error (CWE-20 Blocked): Invalid payment amount ($${amountStr}). Following Security Officer patch deployment, payment amounts must be strictly greater than 0. Negative payment rejected.`
          );
          return;
        }
      }

      // If valid or unpatched demo mode (which accepts negative numbers)
      const txnId = `TXN-${Math.floor(Math.random() * 900000 + 100000)}`;
      setReceipt({
        txnId,
        amount: isNaN(parsed) ? 89.99 : parsed,
        cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '4920'
      });
      setIsProcessing(false);
      clearCart();
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Simulated Tuition Payment Gateway</h1>
        <p className="text-xs text-gray-500 mt-1">Simulated test environment for academic registration transactions.</p>
      </div>

      {/* Security Patch Status Pill */}
      <div className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
        isPaymentPatched
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-2">
          {isPaymentPatched ? <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />}
          <span>
            {isPaymentPatched
              ? 'Security Status: Patched (Negative amounts strictly blocked)'
              : 'Security Status: Vulnerable (Negative payment amounts accepted)'}
          </span>
        </div>
      </div>

      {/* Payment Rejected Alert (After Patch) */}
      {paymentError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-red-900">
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>Transaction Blocked by Security Filter</span>
          </div>
          <p className="leading-relaxed pl-6">{paymentError}</p>
        </div>
      )}

      {receipt ? (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transaction Confirmed</h2>
            <p className="text-xs text-gray-500 mt-1">Your academic course enrollment transaction has been processed.</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-2 max-w-sm mx-auto text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction Reference:</span>
              <span className="font-mono font-bold text-gray-800">{receipt.txnId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Billed Amount:</span>
              <span className={`font-mono font-bold text-sm ${receipt.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {receipt.amount < 0 ? `-$${Math.abs(receipt.amount).toFixed(2)}` : `$${receipt.amount.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="text-gray-700">Card ending in {receipt.cardLast4}</span>
            </div>
          </div>

          {receipt.amount < 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono text-left max-w-sm mx-auto flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Defect Observed:</strong> Negative payment of <strong>-${Math.abs(receipt.amount).toFixed(2)}</strong> was accepted without validation!
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => { setReceipt(null); setPaymentError(''); }}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
            >
              Simulate Another Payment
            </button>
            <Link
              to="/report"
              className="px-4 py-2.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Report this Defect to AI Platform
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handlePayment} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Cardholder Full Name
              </label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Credit / Debit Card Number
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Expiration Date
                </label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  CVV / Security Code
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Editable Amount field with Quick Preset Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Payment Amount ($ USD)
                </label>
                <span className="text-[11px] text-gray-400">Type or select a test amount</span>
              </div>
              
              <input
                type="text"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="e.g. -50.00 or 89.99"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />

              {/* Demo Quick Fill Buttons */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAmountStr('-50.00')}
                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-mono font-semibold transition-colors"
                >
                  ⚡ Preset: -$50.00 (Test Defect)
                </button>
                <button
                  type="button"
                  onClick={() => setAmountStr('89.99')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-mono font-semibold transition-colors"
                >
                  Preset: $89.99 (Standard)
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Authorizing Payment...' : `Authorize Payment ($${amountStr})`}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit SSL Encrypted Academic Transaction</span>
          </div>
        </form>
      )}
    </div>
  );
}
