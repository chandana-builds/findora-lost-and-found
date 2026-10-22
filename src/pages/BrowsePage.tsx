import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../services/db';
import { ItemReport, ReportType, Category, OrganizationType } from '../types';
import { ItemCard } from '../components/ItemCard';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Electronics',
  'Documents & IDs',
  'Bags & Wallets',
  'Keys',
  'Clothing & Footwear',
  'Books & Stationery',
  'Jewelry & Accessories',
  'Medical & Health',
  'Other',
];

const ORGANIZATION_TYPES: OrganizationType[] = [
  'College / University',
  'School',
  'Hospital / Healthcare',
  'Office / Corporate',
  'Shopping Mall',
  'Library',
  'Public Transit / Station',
  'Public Park / Street',
  'Airport',
  'Other Location',
];

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters
  const search = searchParams.get('search') || '';
  const reportType = (searchParams.get('type') as ReportType | 'all') || 'all';
  const category = searchParams.get('category') || '';
  const organizationType = searchParams.get('organization') || '';
  const status = searchParams.get('status') || 'active';
  const sortBy = (searchParams.get('sortBy') as 'newest' | 'oldest') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [items, setItems] = useState<ItemReport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  const limit = 9;

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const result = await db.getItems({
          search,
          reportType,
          category,
          organizationType,
          status,
          sortBy,
          page,
          limit,
        });
        setItems(result.items);
        setTotalCount(result.totalCount);
      } catch (err) {
        console.error('Error browsing items', err);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [search, reportType, category, organizationType, status, sortBy, page]);

  // Update query params helper
  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page to 1 when filters change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Browse Lost & Found Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search verified listings across community centers, campuses, and transit points.
          </p>
        </div>

        {/* Total results count */}
        <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm self-start md:self-auto">
          Showing {items.length} of {totalCount} matching report{totalCount === 1 ? '' : 's'}
        </div>
      </div>

      {/* Main Search Bar & Quick Toggles */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search by keywords, model, color, or location..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-findora-teal-500/20 focus:border-findora-teal-600"
          />
        </div>

        {/* Report Type Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0">
          <button
            onClick={() => updateParam('type', 'all')}
            className={`flex-1 md:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => updateParam('type', 'lost')}
            className={`flex-1 md:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportType === 'lost' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost
          </button>
          <button
            onClick={() => updateParam('type', 'found')}
            className={`flex-1 md:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              reportType === 'found' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found
          </button>
        </div>

        {/* Mobile filter toggle button */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden btn-secondary w-full text-xs font-medium"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside
          className={`md:block ${
            showMobileFilters ? 'block' : 'hidden'
          } md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm h-fit space-y-6`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-findora-teal-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-findora-teal-700 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="input-base text-xs !py-2"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location / Organization Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Facility / Organization
            </label>
            <select
              value={organizationType}
              onChange={(e) => updateParam('organization', e.target.value)}
              className="input-base text-xs !py-2"
            >
              <option value="">All Facilities</option>
              {ORGANIZATION_TYPES.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="input-base text-xs !py-2"
            >
              <option value="active">Active Reports Only</option>
              <option value="reunited">Reunited Only</option>
              <option value="all">All Statuses</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="input-base text-xs !py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card-base h-80 animate-pulse bg-slate-100 p-4" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card-base p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching reports found</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Try loosening your filters, checking for typos, or search using a broader keyword.
              </p>
              <button
                onClick={clearAllFilters}
                className="btn-secondary text-xs font-semibold mt-5"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', (page - 1).toString())}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-medium text-slate-600 px-3">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', (page + 1).toString())}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
