import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Search,
  PlusCircle,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  CheckCircle,
  LayoutDashboard,
  Users,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, signOut, switchDemoUser } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Demo Context Bar for quick user switching & test transparency */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">Active Mode:</span>
          <span>{user ? `${user.full_name} (${user.role.toUpperCase()})` : 'Public Visitor (Unauthenticated)'}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-md text-[11px] transition-colors"
          >
            <span>Switch Role / User</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Test Account
              </div>
              <button
                onClick={() => {
                  switchDemoUser('alex.rivera@campus.edu');
                  setRoleSwitcherOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Alex Rivera (Student/User)</span>
                {user?.email === 'alex.rivera@campus.edu' && <CheckCircle className="w-3.5 h-3.5 text-teal-400" />}
              </button>
              <button
                onClick={() => {
                  switchDemoUser('sarah.chen@hospital.med');
                  setRoleSwitcherOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Dr. Sarah Chen (Hospital Finder)</span>
                {user?.email === 'sarah.chen@hospital.med' && <CheckCircle className="w-3.5 h-3.5 text-teal-400" />}
              </button>
              <button
                onClick={() => {
                  switchDemoUser('admin@findora.org');
                  setRoleSwitcherOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-teal-300 font-medium hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Findora Admin (Staff)</span>
                {user?.email === 'admin@findora.org' && <CheckCircle className="w-3.5 h-3.5 text-teal-400" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Logo size="md" showTagline={false} />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'text-findora-navy-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/browse') ? 'text-findora-navy-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              Browse Listings
            </Link>
            <Link
              to="/report/lost"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/report/lost') ? 'text-rose-700 bg-rose-50 font-semibold' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/50'
              }`}
            >
              Report Lost
            </Link>
            <Link
              to="/report/found"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/report/found') ? 'text-emerald-700 bg-emerald-50 font-semibold' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'
              }`}
            >
              Report Found
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'text-findora-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-findora-teal-700 hover:bg-teal-50/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-findora-teal-600" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Report Button */}
            <Link
              to="/report/lost"
              className="btn-teal !py-2 !px-3.5 text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </Link>

            {/* Notification Bell */}
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="View in-app notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Profile Dropdown or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-findora-navy-800 text-white flex items-center justify-center text-xs font-bold">
                    {user.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                  <span className="text-xs font-medium text-slate-800 max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/my-reports"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        My Reports
                      </Link>
                      <Link
                        to="/my-claims"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-400" />
                        My Claims
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-findora-teal-700 font-medium hover:bg-teal-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-findora-teal-600" />
                          Admin Portal
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary !py-2 !px-3.5 text-xs font-semibold"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 text-slate-600 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 rounded-full" />
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Listings
          </Link>
          <Link
            to="/report/lost"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            Report Lost Item
          </Link>
          <Link
            to="/report/found"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Report Found Item
          </Link>

          {user ? (
            <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
              <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">
                {user.full_name} ({user.role})
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Reports
              </Link>
              <Link
                to="/my-claims"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                My Claims
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Notifications ({unreadCount})
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-teal-700 bg-teal-50"
                >
                  Admin Portal
                </Link>
              )}

              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary w-full"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
