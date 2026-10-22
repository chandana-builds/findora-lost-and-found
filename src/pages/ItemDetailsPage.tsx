import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ItemReport, ItemMatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  MapPin,
  Calendar,
  Building2,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Share2,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [item, setItem] = useState<ItemReport | null>(null);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Claim Modal State
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimMessage, setClaimMessage] = useState<string>('');
  const [claimPrivateDetails, setClaimPrivateDetails] = useState<string>('');
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadItemAndMatches() {
      if (!id) return;
      setLoading(true);
      try {
        const itemData = await db.getItemById(id);
        setItem(itemData);

        if (itemData) {
          const matchResults = await db.getMatchesForItem(id);
          setMatches(matchResults);
        }
      } catch (err) {
        console.error('Error loading item details', err);
      } finally {
        setLoading(false);
      }
    }
    loadItemAndMatches();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-8" />
        <div className="aspect-video bg-slate-200 rounded-2xl mb-8" />
        <div className="h-8 w-2/3 bg-slate-200 rounded mb-4" />
        <div className="h-24 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">
          This lost or found report may have been deleted, withdrawn, or does not exist.
        </p>
        <Link to="/browse" className="btn-primary mt-6">
          Return to Directory
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === item.user_id;
  const canManage = isOwner || isAdmin;
  const isLost = item.report_type === 'lost';
  const isFound = item.report_type === 'found';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Report URL copied to clipboard!', 'info');
    }
  };

  const handleMarkReunited = async () => {
    if (!window.confirm('Are you sure you want to mark this item as successfully reunited?')) return;
    try {
      const updated = await db.updateItem(item.id, { status: 'reunited' }, user?.id);
      setItem(updated);
      showToast('Status Updated', 'Item successfully marked as Reunited!', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Could not update status', 'error');
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to withdraw/delete this report?')) return;
    try {
      await db.deleteItem(item.id, user?.id);
      showToast('Report Withdrawn', 'Your report has been removed.', 'info');
      navigate('/my-reports');
    } catch (err: any) {
      showToast('Error', err.message || 'Could not delete report', 'error');
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!claimMessage.trim() || !claimPrivateDetails.trim()) {
      showToast('Incomplete Form', 'Please complete both the explanation and private proof fields.', 'warning');
      return;
    }

    setSubmittingClaim(true);
    try {
      await db.submitClaim({
        item_id: item.id,
        claimant_id: user.id,
        claimant_name: user.full_name,
        claimant_email: user.email,
        message: claimMessage.trim(),
        private_verification_details: claimPrivateDetails.trim(),
      });
      setClaimSuccess(true);
      showToast('Claim Submitted', 'Your ownership verification claim has been sent to the finder.', 'success');
      // Refresh item state
      const refreshed = await db.getItemById(item.id);
      if (refreshed) setItem(refreshed);
    } catch (err: any) {
      showToast('Claim Error', err.message || 'Unable to submit claim request.', 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>

        <button
          onClick={handleShare}
          className="btn-secondary !py-1.5 !px-3 text-xs"
          title="Share link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photograph Card */}
          <div className="card-base overflow-hidden">
            <div className="relative aspect-[16/10] bg-slate-900 flex items-center justify-center">
              <img
                src={item.image_path || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1000&q=80'}
                alt={item.item_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                {item.status === 'reunited' ? (
                  <span className="badge-reunited bg-teal-600 text-white font-bold px-3 py-1 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Reunited
                  </span>
                ) : isLost ? (
                  <span className="badge-lost bg-rose-600 text-white font-bold px-3 py-1 text-xs">
                    Lost Report
                  </span>
                ) : (
                  <span className="badge-found bg-emerald-600 text-white font-bold px-3 py-1 text-xs">
                    Found Item
                  </span>
                )}

                {item.status === 'in_claim' && (
                  <span className="badge-pending bg-amber-500 text-white font-bold px-3 py-1 text-xs">
                    Claim Under Review
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-findora-teal-700 mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>{item.category}</span>
                <span>•</span>
                <Building2 className="w-3.5 h-3.5 ml-1" />
                <span>{item.organization_type}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {item.item_name}
              </h1>

              {/* Attributes row */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                {item.brand && (
                  <div className="bg-slate-100 px-3 py-1 rounded-lg">
                    <span className="text-slate-500">Brand: </span>
                    <span className="font-semibold text-slate-800">{item.brand}</span>
                  </div>
                )}
                {item.color && (
                  <div className="bg-slate-100 px-3 py-1 rounded-lg">
                    <span className="text-slate-500">Color: </span>
                    <span className="font-semibold text-slate-800">{item.color}</span>
                  </div>
                )}
                <div className="bg-slate-100 px-3 py-1 rounded-lg">
                  <span className="text-slate-500">Report ID: </span>
                  <span className="font-mono text-slate-800">{item.id}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Public Description
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Distinguishing Features */}
              {item.identifying_features && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-findora-teal-600" />
                    Public Distinguishing Traits
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.identifying_features}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Potential Matches Section (Section 11) */}
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-findora-teal-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Potential Matches ({matches.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Smart Cross-Referencing Engine
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl p-4">
                No active complementary reports match this listing at this moment. You will receive an in-app notification when a compatible report is submitted.
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => {
                  const counterpart = isLost ? match.found_item : match.lost_item;
                  if (!counterpart) return null;

                  return (
                    <div
                      key={match.id}
                      className="p-4 rounded-xl border border-teal-200/70 bg-teal-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={counterpart.image_path || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=150&q=80'}
                          alt={counterpart.item_name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white">
                              {match.match_score}% Match
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {counterpart.report_type.toUpperCase()} • {counterpart.location}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm truncate mt-0.5">
                            {counterpart.item_name}
                          </h4>
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {match.match_reasons.map((r) => r.label).join(' • ')}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/items/${counterpart.id}`}
                        className="btn-teal !py-1.5 !px-3 text-xs shrink-0 whitespace-nowrap self-end sm:self-auto"
                      >
                        Compare Report →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info & Contextual Actions */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="card-base p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Item Recovery Actions
            </h3>

            {/* Contextual actions based on item type and ownership */}
            <div className="space-y-3">
              {isFound && item.status !== 'reunited' && (
                <button
                  onClick={() => setShowClaimModal(true)}
                  className="btn-teal w-full text-sm font-semibold !py-3 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  This Might Be My Item
                </button>
              )}

              {canManage && item.status !== 'reunited' && (
                <button
                  onClick={handleMarkReunited}
                  className="btn-secondary w-full text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Mark as Reunited
                </button>
              )}

              {canManage && (
                <button
                  onClick={handleDeleteItem}
                  className="btn-secondary w-full text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Withdraw This Report
                </button>
              )}
            </div>

            {/* Privacy note */}
            <div className="mt-5 pt-5 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-findora-teal-600 shrink-0 mt-0.5" />
              <span>
                Personal owner telephone numbers and emails are safeguarded behind verified claim protocols.
              </span>
            </div>
          </div>

          {/* Location & Timeline Card */}
          <div className="card-base p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Location & Timeline
            </h3>

            <div className="flex items-start gap-3 text-xs">
              <MapPin className="w-4 h-4 text-findora-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Reported Location</p>
                <p className="text-slate-600 mt-0.5">{item.location}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{item.organization_type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <Calendar className="w-4 h-4 text-findora-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">
                  {isLost ? 'Date Lost' : 'Date Found'}
                </p>
                <p className="text-slate-600 mt-0.5">
                  {new Date(item.event_date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Notice Filed</p>
                <p className="text-slate-500 mt-0.5">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CLAIM SUBMISSION MODAL */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            {claimSuccess ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Claim Submitted Successfully
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  The finder and administrators have received your verification request. You will be notified in your notifications tab once reviewed.
                </p>
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setClaimSuccess(false);
                  }}
                  className="btn-primary mt-6 text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Verify Ownership for "{item.item_name}"
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    To prevent fraudulent claims, supply verification details only the genuine owner would know.
                  </p>
                </div>

                {!user && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    You must sign in before submitting an ownership claim.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Explanation to Finder <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    placeholder="Briefly state when and where you misplaced this item and why it belongs to you..."
                    className="input-base text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confidential Proof & Distinguishing Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={claimPrivateDetails}
                    onChange={(e) => setClaimPrivateDetails(e.target.value)}
                    placeholder="Private serial numbers, internal engravings, home screen wallpaper, unique scratches, or contents inside..."
                    className="input-base text-xs"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This confidential information is hidden from the public and shared solely with authorized reviewers.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="btn-secondary text-xs"
                    disabled={submittingClaim}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim || !user}
                    className="btn-teal text-xs font-semibold"
                  >
                    {submittingClaim ? 'Submitting...' : 'Submit Claim Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
