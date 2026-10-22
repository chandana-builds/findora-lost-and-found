import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ItemReport, PlatformStats, Category } from '../types';
import { ItemCard } from '../components/ItemCard';
import {
  Search,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Laptop,
  CreditCard,
  Briefcase,
  Key,
  Shirt,
  BookOpen,
  Gem,
  Stethoscope,
  HelpCircle,
  MapPin,
  Users,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState<ItemReport[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { items } = await db.getItems({ limit: 6, sortBy: 'newest' });
        setRecentItems(items);
        const statsData = await db.getPlatformStats();
        setStats(statsData);
      } catch (err) {
        console.error('Error loading homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const categories: { label: Category; icon: any; color: string }[] = [
    { label: 'Electronics', icon: Laptop, color: 'text-blue-600 bg-blue-50' },
    { label: 'Documents & IDs', icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
    { label: 'Bags & Wallets', icon: Briefcase, color: 'text-purple-600 bg-purple-50' },
    { label: 'Keys', icon: Key, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Clothing & Footwear', icon: Shirt, color: 'text-rose-600 bg-rose-50' },
    { label: 'Books & Stationery', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Jewelry & Accessories', icon: Gem, color: 'text-teal-600 bg-teal-50' },
    { label: 'Medical & Health', icon: Stethoscope, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Other', icon: HelpCircle, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-findora-navy-900 via-findora-navy-950 to-findora-navy-900 text-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-findora-teal-500/10 border border-findora-teal-500/30 text-findora-teal-300 text-xs font-semibold mb-6 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-findora-teal-400" />
            <span>Community-Powered Lost & Found Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lost Something? <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
              Let's Bring It Back.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Findora connects people with their lost belongings through community-powered reporting, smart matching, and secure item recovery in campuses, hospitals, and public facilities.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 sm:mt-10 max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 border border-slate-200"
          >
            <div className="flex items-center gap-3 px-3 w-full text-slate-400">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, categories, or locations..."
                className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="btn-teal w-full sm:w-auto text-sm font-semibold shrink-0"
            >
              Search
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/report/lost" className="btn-primary !bg-rose-600 hover:!bg-rose-700 !px-6 !py-3 text-sm">
              <PlusCircle className="w-4 h-4" />
              Report a Lost Item
            </Link>
            <Link to="/report/found" className="btn-teal !px-6 !py-3 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              I Found Something
            </Link>
          </div>
        </div>
      </section>

      {/* 2. REAL DATABASE-DERIVED STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
          <div className="flex flex-col items-center text-center p-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-600">
              {stats?.activeLostCount ?? 0}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Active Lost Reports
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
              {stats?.activeFoundCount ?? 0}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Active Found Reports
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-600">
              {stats?.reunitedCount ?? 0}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Successfully Reunited
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-findora-navy-800">
              {stats?.totalReportsCount ?? 0}
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
              Total Managed Cases
            </span>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Browse by Category
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Quickly filter reports by item classification to find exactly what you are looking for.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                to={`/browse?category=${encodeURIComponent(cat.label)}`}
                className="card-base p-4 flex flex-col items-center text-center gap-2.5 hover:border-findora-teal-500 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-findora-teal-700">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. RECENT REPORTS (REAL DATABASE RECORDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Recently Reported Items
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Active lost and found notices submitted across community facilities.
            </p>
          </div>
          <Link
            to="/browse"
            className="btn-secondary !py-2 text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-base h-80 animate-pulse bg-slate-100 p-4" />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="card-base p-12 text-center">
            <p className="text-slate-500">No recent reports found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW FINDORA WORKS WORKFLOW */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-findora-teal-700 uppercase tracking-wider">
              Transparent & Secure Recovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              How Findora Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Three streamlined steps to restore lost property while safeguarding owner privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-findora-navy-900 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Report</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Submit comprehensive information about a lost or found item. Withhold sensitive private serial numbers or distinguishing traits for proof during claim verification.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-findora-teal-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Discover & Match</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Our algorithmic engine automatically scores compatibility between opposite reports based on category, title, description, time proximity, and location.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verify & Reconnect</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Submit an ownership claim with private proof. Once verified by the finder or administrator, coordinate safe return and mark the item reunited!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-findora-navy-900 to-findora-navy-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Found something unattended in a public area?
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Every found report helps someone recover their essentials. It takes less than 60 seconds to file a found item notice.
            </p>
          </div>
          <Link
            to="/report/found"
            className="btn-teal !py-3.5 !px-7 font-bold text-sm shrink-0 whitespace-nowrap shadow-lg"
          >
            File a Found Report
          </Link>
        </div>
      </section>
    </div>
  );
};
