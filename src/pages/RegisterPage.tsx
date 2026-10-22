import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Logo } from '../components/Logo';
import { User, Mail, Lock, AlertCircle, Shield } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreeTerms) {
      setErrorMsg('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email.trim(), password, fullName.trim(), role);
      showToast('Account Created!', `Welcome to Findora, ${fullName}.`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Logo size="lg" showTagline={false} className="justify-center" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500">
            Join Findora to report lost items, verify ownership, and protect your belongings.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-base p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Smith"
                className="input-base pl-10"
                required
              />
            </div>
          </div>

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
                placeholder="jordan@institution.edu"
                className="input-base pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password (Min 6 characters)
            </label>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className="input-base text-xs"
            >
              <option value="user">Community Member / Student / Staff (Standard)</option>
              <option value="admin">Institutional Administrator / Security Officer</option>
            </select>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-findora-teal-600 rounded border-slate-300 focus:ring-findora-teal-500"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600 leading-snug">
              I agree to the{' '}
              <Link to="/terms" className="text-findora-teal-700 underline font-medium">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-findora-teal-700 underline font-medium">
                Privacy Safeguards
              </Link>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs font-semibold !py-3 shadow-md mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-findora-teal-700 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
