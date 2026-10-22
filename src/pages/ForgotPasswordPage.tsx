import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Logo } from '../components/Logo';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await db.resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to send password recovery instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" showTagline={false} className="justify-center" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500">
            Enter your registered email address and we will provide password recovery instructions.
          </p>
        </div>

        {sent ? (
          <div className="card-base p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Recovery Instructions Dispatched
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account exists for <strong>{email}</strong>, password reset steps have been processed.
            </p>
            <Link to="/login" className="btn-primary text-xs w-full">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-base p-6 sm:p-8 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.edu"
                  className="input-base pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs font-semibold !py-3 shadow-md"
            >
              {loading ? 'Sending...' : 'Send Recovery Instructions'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
