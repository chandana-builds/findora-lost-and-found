import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Logo } from '../components/Logo';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, switchDemoUser } = useAuth();
  const { showToast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      showToast('Welcome back!', 'Successfully signed in to Findora.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" showTagline={false} className="justify-center" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Findora
          </h2>
          <p className="text-xs text-slate-500">
            Access your lost & found reports, track claims, and manage notifications.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-base p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-findora-teal-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="card-base p-4 bg-slate-50 border-dashed space-y-2">
          <p className="text-[11px] font-semibold text-slate-600 text-center uppercase tracking-wider">
            Quick 1-Click Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                switchDemoUser('alex.rivera@campus.edu');
                navigate('/dashboard');
              }}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-left"
            >
              <div className="font-semibold text-slate-800">Alex Rivera</div>
              <div className="text-[10px] text-slate-500">Student (User)</div>
            </button>
            <button
              onClick={() => {
                switchDemoUser('admin@findora.org');
                navigate('/admin');
              }}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-left"
            >
              <div className="font-semibold text-teal-800">Findora Admin</div>
              <div className="text-[10px] text-slate-500">Administrator</div>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-findora-teal-700 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
