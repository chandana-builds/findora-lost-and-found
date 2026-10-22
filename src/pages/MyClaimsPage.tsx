import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import { ClaimRequest } from '../types';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const MyClaimsPage: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClaims() {
      if (!user) return;
      setLoading(true);
      try {
        const userClaims = await db.getUserClaims(user.id);
        setClaims(userClaims);
      } catch (err) {
        console.error('Error fetching claims', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Sign In Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          Please sign in to track your ownership verification requests.
        </p>
        <Link to="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: ClaimRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Under Verification
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Claim Approved
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Item Returned
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Verification Denied
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Ownership Claims
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor verification requests filed for found belongings.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card-base h-36 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="card-base p-12 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Claims Filed</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            When you discover an item in the directory that belongs to you, submit a claim request to commence verification.
          </p>
          <Link to="/browse?type=found" className="btn-teal text-xs mt-5">
            Browse Found Items
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="card-base p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400">{claim.id}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    Filed on {new Date(claim.created_at).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(claim.status)}
              </div>

              {/* Item Details preview */}
              {claim.item && (
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <img
                      src={claim.item.image_path || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=100&q=80'}
                      alt={claim.item.item_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {claim.item.item_name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {claim.item.location} • {claim.item.category}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/items/${claim.item_id}`}
                    className="btn-secondary !py-1 !px-2.5 text-xs flex items-center gap-1"
                  >
                    <span>View Listing</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Claimant statement */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-700">Your Explanation:</span>
                <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  {claim.message}
                </p>
              </div>

              {/* Confidential verification details */}
              <div className="text-xs space-y-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Private Proof Submitted:
                </span>
                <p className="text-slate-600 bg-teal-50/40 p-3 rounded-xl border border-teal-200/60 font-mono text-[11px]">
                  {claim.private_verification_details}
                </p>
              </div>

              {/* Reviewer notes if available */}
              {claim.reviewer_notes && (
                <div className="text-xs space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
                  <span className="font-semibold text-amber-900">Reviewer Feedback:</span>
                  <p className="text-amber-800">{claim.reviewer_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
