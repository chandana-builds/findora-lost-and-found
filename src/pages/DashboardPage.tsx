import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { ItemReport, ItemMatch, ClaimRequest } from '../types';
import { ItemCard } from '../components/ItemCard';
import {
  FileText,
  Sparkles,
  CheckCircle,
  PlusCircle,
  Search,
  Bell,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building2,
  Tag,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userItems, setUserItems] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoading(true);
      try {
        const [itemsData, matchesData, claimsData] = await Promise.all([
          db.getUserItems(user.id),
          db.getUserMatches(user.id),
          db.getUserClaims(user.id),
        ]);
        setUserItems(itemsData);
        setMatches(matchesData);
        setClaims(claimsData);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Sign In Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          Please sign in to access your personal Findora portal dashboard.
        </p>
        <Link to="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  const lostCount = userItems.filter((i) => i.report_type === 'lost').length;
  const foundCount = userItems.filter((i) => i.report_type === 'found').length;
  const reunitedCount = userItems.filter((i) => i.status === 'reunited').length;
  const pendingClaimsCount = claims.filter((c) => ['pending', 'under_review'].includes(c.status)).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-findora-navy-900 to-findora-navy-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div>
          <span className="text-xs font-semibold text-findora-teal-400 uppercase tracking-wider">
            Personal Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your lost property notices, manage found item handovers, and review real-time potential matches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/report/lost" className="btn-primary !bg-rose-600 hover:!bg-rose-700 text-xs">
            <PlusCircle className="w-4 h-4" />
            Report Lost
          </Link>
          <Link to="/report/found" className="btn-teal text-xs">
            <CheckCircle className="w-4 h-4" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/my-reports?tab=lost"
          className="card-base p-5 hover:border-rose-400 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Lost Reports</span>
            <FileText className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            {lostCount}
          </span>
        </Link>

        <Link
          to="/my-reports?tab=found"
          className="card-base p-5 hover:border-emerald-400 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Found Reports</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            {foundCount}
          </span>
        </Link>

        <div className="card-base p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Potential Matches</span>
            <Sparkles className="w-4 h-4 text-findora-teal-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-3">
            {matches.length}
          </span>
        </div>

        <Link
          to="/my-claims"
          className="card-base p-5 hover:border-amber-400 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Claims</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-3">
            {pendingClaimsCount}
          </span>
        </Link>
      </div>

      {/* Potential Matches Spotlight Section */}
      {matches.length > 0 && (
        <div className="card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-findora-teal-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Discovered Potential Matches ({matches.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Auto-detected compatibility</span>
          </div>

          <div className="space-y-3">
            {matches.slice(0, 3).map((match) => (
              <div
                key={match.id}
                className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-findora-teal-600 text-white">
                      {match.match_score}% Score
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {match.lost_item?.item_name} ↔ {match.found_item?.item_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {match.match_reasons.map((r) => r.label).join(' • ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    to={`/items/${match.found_item_id}`}
                    className="btn-teal !py-1.5 !px-3 text-xs"
                  >
                    Inspect Found Item →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent User Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            My Recent Reports
          </h2>
          <Link
            to="/my-reports"
            className="text-xs font-semibold text-findora-teal-700 hover:underline flex items-center gap-1"
          >
            <span>Manage All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card-base h-64 bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : userItems.length === 0 ? (
          <div className="card-base p-10 text-center">
            <p className="text-xs text-slate-500">You haven't submitted any reports yet.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link to="/report/lost" className="btn-primary text-xs">
                Report a Lost Item
              </Link>
              <Link to="/report/found" className="btn-teal text-xs">
                Report a Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userItems.slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
