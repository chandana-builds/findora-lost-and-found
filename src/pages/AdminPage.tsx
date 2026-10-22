import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/db';
import {
  PlatformStats,
  ItemReport,
  ClaimRequest,
  ActivityLog,
  UserProfile,
  ClaimStatus,
} from '../types';
import {
  ShieldCheck,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  AlertTriangle,
  History,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, switchDemoUser } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'claims' | 'logs'>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [items, setItems] = useState<ItemReport[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & filter in admin
  const [searchFilter, setSearchFilter] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState<{ [claimId: string]: string }>({});

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, itemsData, claimsData, logsData] = await Promise.all([
        db.getPlatformStats(),
        db.getItems({ limit: 100, status: 'all' }),
        db.getAllClaims(),
        db.getActivityLogs(),
      ]);
      setStats(statsData);
      setItems(itemsData.items);
      setClaims(claimsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  // Unauthorized Access Guard
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Admin Privileges Required
        </h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The administrative portal is restricted to authorized personnel. You are currently logged in as {user ? `${user.full_name} (${user.role})` : 'a guest'}.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => switchDemoUser('admin@findora.org')}
            className="btn-teal text-xs font-semibold"
          >
            Switch to Administrator Test Account
          </button>
          <Link to="/" className="btn-secondary text-xs">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Admin Actions
  const handleUpdateClaimStatus = async (claimId: string, status: ClaimStatus) => {
    const notes = reviewerNotes[claimId] || '';
    try {
      await db.updateClaimStatus(claimId, status, user.id, notes);
      showToast('Claim Updated', `Claim status changed to "${status}"`, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update claim', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing as administrator?')) return;
    try {
      await db.deleteItem(itemId, user.id);
      showToast('Report Deleted', 'Listing successfully removed from portal.', 'info');
      loadAdminData();
    } catch (err: any) {
      showToast('Error', err.message || 'Could not delete item', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.item_name.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-found bg-findora-teal-50 text-findora-teal-700 text-xs font-bold uppercase tracking-wider">
              Administration Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            System Moderation & Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized administrator session: {user.email}
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="btn-secondary !py-2 text-xs font-semibold flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-findora-teal-600 text-findora-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'claims'
              ? 'border-findora-teal-600 text-findora-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Claim Moderation</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-800">
            {claims.filter((c) => ['pending', 'under_review'].includes(c.status)).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-findora-teal-600 text-findora-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          All Reports ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-findora-teal-600 text-findora-teal-700 bg-teal-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-base p-5">
              <span className="text-xs font-medium text-slate-500">Active Lost Reports</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">
                {stats?.activeLostCount ?? 0}
              </p>
            </div>
            <div className="card-base p-5">
              <span className="text-xs font-medium text-slate-500">Active Found Reports</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
                {stats?.activeFoundCount ?? 0}
              </p>
            </div>
            <div className="card-base p-5">
              <span className="text-xs font-medium text-slate-500">Reunited Items</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 mt-2">
                {stats?.reunitedCount ?? 0}
              </p>
            </div>
            <div className="card-base p-5">
              <span className="text-xs font-medium text-slate-500">Registered Accounts</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-findora-navy-800 mt-2">
                {stats?.totalUsersCount ?? 0}
              </p>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="card-base p-6 bg-slate-900 text-white">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-findora-teal-400" />
              Administrative Protocol Enforcement
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Findora applies strict server-level and Row Level Security authorization. Administrators can review submitted proof, resolve ownership disputes, or remove inappropriate listings while protecting claimant privacy.
            </p>
          </div>
        </div>
      )}

      {/* CLAIMS MODERATION TAB */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Inspect claimant messages and confidential proof before approving a physical handover.
          </div>

          {claims.length === 0 ? (
            <div className="card-base p-12 text-center text-xs text-slate-500">
              No verification claims logged in the database.
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="card-base p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        Claim from: {claim.claimant_name} ({claim.claimant_email})
                      </span>
                      <p className="text-xs text-slate-400">
                        Claim ID: {claim.id} • Submitted: {new Date(claim.created_at).toLocaleString()}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                      Status: {claim.status}
                    </span>
                  </div>

                  {/* Associated Item */}
                  {claim.item && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={claim.item.image_path || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=100&q=80'}
                          alt={claim.item.item_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-900 text-xs">
                            Target Item: {claim.item.item_name} ({claim.item.id})
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Location: {claim.item.location}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/items/${claim.item_id}`}
                        className="btn-secondary !py-1 !px-2.5 text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* Public Message */}
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-slate-700">Claimant Statement:</span>
                    <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700">
                      {claim.message}
                    </p>
                  </div>

                  {/* Private Proof */}
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-teal-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Confidential Ownership Proof (Internal Verification):
                    </span>
                    <p className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-mono text-[11px]">
                      {claim.private_verification_details}
                    </p>
                  </div>

                  {/* Reviewer Note Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reviewer Feedback / Instructions to Claimant:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified with library reception desk. Please present student ID upon collection."
                      value={reviewerNotes[claim.id] || claim.reviewer_notes || ''}
                      onChange={(e) =>
                        setReviewerNotes({ ...reviewerNotes, [claim.id]: e.target.value })
                      }
                      className="input-base text-xs !py-1.5"
                    />
                  </div>

                  {/* Moderation Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateClaimStatus(claim.id, 'under_review')}
                      className="btn-secondary text-xs !py-1.5"
                    >
                      Mark Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateClaimStatus(claim.id, 'rejected')}
                      className="btn-danger text-xs !py-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject Claim
                    </button>
                    <button
                      onClick={() => handleUpdateClaimStatus(claim.id, 'approved')}
                      className="btn-primary text-xs !py-1.5 !bg-blue-600 hover:!bg-blue-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Ownership
                    </button>
                    <button
                      onClick={() => handleUpdateClaimStatus(claim.id, 'completed')}
                      className="btn-teal text-xs !py-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Reunited & Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ALL REPORTS MODERATION TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search reports by title, ID, or location..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto card-base">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Item</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image_path || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=50&q=80'}
                          alt=""
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="truncate max-w-[180px]">{item.item_name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 uppercase font-bold text-[11px]">
                      <span className={item.report_type === 'lost' ? 'text-rose-600' : 'text-emerald-600'}>
                        {item.report_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{item.category}</td>
                    <td className="p-3.5 text-slate-600 truncate max-w-[150px]">{item.location}</td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">{item.event_date}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/items/${item.id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-800"
                          title="View"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-findora-teal-600" />
            Audit Trail & Event History
          </h3>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800">{log.action}</span>
                  <span className="text-slate-500 ml-2">by {log.actor_name || log.actor_id}</span>
                  <span className="text-slate-400 ml-2 font-mono">({log.entity_type}: {log.entity_id})</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
