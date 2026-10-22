import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Shield, Sparkles, MapPin, Heart, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-findora-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" light showTagline />
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              Findora is a dedicated lost and found recovery portal connecting communities, campuses, hospitals, and public facilities to restore misplaced belongings securely.
            </p>
            <div className="flex items-center gap-2 text-xs text-findora-teal-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Verified Ownership Protocols</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Explore Portal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  Browse All Items
                </Link>
              </li>
              <li>
                <Link to="/report/lost" className="hover:text-white transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report/found" className="hover:text-white transition-colors">
                  Report a Found Item
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutions & Use Cases */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Environments
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-findora-teal-500" />
                <span>Colleges & Universities</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-findora-teal-500" />
                <span>Hospitals & Medical Centers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-findora-teal-500" />
                <span>Libraries & Public Buildings</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-findora-teal-500" />
                <span>Shopping Malls & Transit Hubs</span>
              </li>
            </ul>
          </div>

          {/* Legal & Safety */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Trust & Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & Safeguards
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Help Center & Contact
                </Link>
              </li>
              <li>
                <div className="pt-2 text-[11px] text-slate-400">
                  Support: support@findora.portal
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Findora Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <Link to="/contact" className="hover:text-slate-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
