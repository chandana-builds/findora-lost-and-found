import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCheck,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Inbox,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Sign In Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          Please sign in to view your in-app alerts and notifications.
        </p>
        <Link to="/login" className="btn-primary mt-4">
          Sign In
        </Link>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates regarding item matches, verification claims, and status changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary !py-2 !px-3 text-xs font-semibold flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-findora-teal-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-base p-16 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            You will receive updates here whenever a potential match is found for your reports or a claim status changes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            let icon = <Bell className="w-5 h-5 text-findora-teal-600" />;
            if (notif.event_type === 'match_found') {
              icon = <Sparkles className="w-5 h-5 text-teal-600" />;
            } else if (notif.event_type === 'claim_submitted') {
              icon = <ShieldAlert className="w-5 h-5 text-amber-500" />;
            } else if (notif.event_type === 'claim_status_updated') {
              icon = <CheckCircle2 className="w-5 h-5 text-blue-500" />;
            }

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                }}
                className={`card-base p-4 sm:p-5 flex items-start gap-4 transition-all cursor-pointer ${
                  !notif.is_read
                    ? 'border-l-4 border-l-findora-teal-500 bg-teal-50/20'
                    : 'opacity-85'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-sm">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    {notif.related_item_id && (
                      <Link
                        to={`/items/${notif.related_item_id}`}
                        className="text-xs font-semibold text-findora-teal-700 hover:underline inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Open Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {notif.related_claim_id && (
                      <Link
                        to="/my-claims"
                        className="text-xs font-semibold text-findora-navy-700 hover:underline inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Review Claim</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
