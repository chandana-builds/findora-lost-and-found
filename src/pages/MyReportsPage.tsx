import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/db';
import { ItemReport, ItemMatch } from '../types';
import {
  FileText,
  CheckCircle2,
  Sparkles,
  Trash2,
  ExternalLink,
  PlusCircle,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'lost';

  const [items, setItems] = useState<ItemReport[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const [userReports, userMatches] = await Promise.all([
          db.getUserItems(user.id),
          db.getUserMatches(user.id),
        ]);
        setItems(userReports);
        setMatches(userMatches);
      } catch (err) {
        console.error('Error fetching user reports', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleMarkReunited = async (itemId: string) => {
    if (!window.confirm('Mark this item as successfully reunited?')) return;
    try {
      const updated = await db.updateItem(itemId, { status: 'reunited' }, user?.id);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      showToast('Status Updated', 'Report marked as Reunited!', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Could not update status', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to withdraw and remove this report?')) return;
    try {
      await db.deleteItem(itemId, user?.id);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast('Report Deleted', 'Your report has been removed.', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'Could not delete item', 'error');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Sign In Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          Please sign in to view and manage your reports.
        </p>
        <Link to="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  const lostItems = items.filter((i) => i.report_type === 'lost' && i.status !== 'reunited');
  const foundItems = items.filter((i) => i.report_type === 'found' && i.status !== 'reunited');
  const resolvedItems = items.filter((i) => i.status === 'reunited');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Submitted Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your active notices, view prospective matches, and track reunification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/report/lost" className="btn-primary !bg-rose-600 hover:!bg-rose-700 text-xs">
            <PlusCircle className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link to="/report/found" className="btn-teal text-xs">
            <PlusCircle className="w-3.5 h-3.5" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setTab('lost')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            currentTab === 'lost'
              ? 'border-rose-600 text-rose-700 bg-rose-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Lost Items</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {lostItems.length}
          </span>
        </button>

        <button
          onClick={() => setTab('found')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            currentTab === 'found'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Found Items</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {foundItems.length}
          </span>
        </button>

        <button
          onClick={() => setTab('matches')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            currentTab === 'matches'
              ? 'border-findora-teal-600 text-findora-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-findora-teal-600" />
          <span>Potential Matches</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-200 text-teal-800">
            {matches.length}
          </span>
        </button>

        <button
          onClick={() => setTab('resolved')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
            currentTab === 'resolved'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Reunited / Closed</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {resolvedItems.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-base h-28 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : currentTab === 'matches' ? (
        /* Matches Tab */
        matches.length === 0 ? (
          <div className="card-base p-12 text-center">
            <p className="text-xs text-slate-500">
              No potential matches detected for your items at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="card-base p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-findora-teal-500"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-findora-teal-600 text-white">
                      {match.match_score}% Match Score
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {match.lost_item?.item_name} (Lost) ↔ {match.found_item?.item_name} (Found)
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    {match.match_reasons.map((reason, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        <span className="font-medium text-slate-800">{reason.label}:</span>
                        <span>{reason.details}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/items/${match.found_item_id}`}
                    className="btn-teal !py-1.5 !px-3 text-xs"
                  >
                    View Found Listing
                  </Link>
                  <Link
                    to={`/items/${match.lost_item_id}`}
                    className="btn-secondary !py-1.5 !px-3 text-xs"
                  >
                    View Lost Listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Items List (Lost / Found / Resolved) */
        (() => {
          const displayed =
            currentTab === 'lost'
              ? lostItems
              : currentTab === 'found'
              ? foundItems
              : resolvedItems;

          if (displayed.length === 0) {
            return (
              <div className="card-base p-12 text-center">
                <p className="text-xs text-slate-500">
                  No {currentTab} reports found in this section.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {displayed.map((item) => (
                <div
                  key={item.id}
                  className="card-base p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <img
                      src={item.image_path || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=150&q=80'}
                      alt={item.item_name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {item.category} • {item.organization_type}
                        </span>
                        {item.status === 'reunited' && (
                          <span className="badge-reunited text-[10px]">Reunited</span>
                        )}
                        {item.status === 'in_claim' && (
                          <span className="badge-pending text-[10px]">In Claim</span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">
                        {item.item_name}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.event_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Link
                      to={`/items/${item.id}`}
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                      title="View item public listing"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>

                    {item.status !== 'reunited' && (
                      <button
                        onClick={() => handleMarkReunited(item.id)}
                        className="btn-secondary !py-1.5 !px-3 text-xs text-teal-700 hover:text-teal-800"
                        title="Mark item as recovered"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Reunited</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete / Withdraw"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()
      )}
    </div>
  );
};
