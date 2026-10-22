import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, Mail, Phone, ShieldCheck, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      showToast('Profile Updated', 'Your profile details have been saved.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and contact preferences for safe item recovery.
        </p>
      </div>

      <div className="card-base p-6 sm:p-8 space-y-6">
        {/* User Avatar & Role Banner */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-findora-navy-900 text-white flex items-center justify-center text-xl font-extrabold">
            {user.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.full_name}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="badge-found text-[10px] uppercase font-bold tracking-wider">
                Role: {user.role}
              </span>
              <span className="text-[11px] text-slate-400">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-base pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user.email}
                disabled
                className="input-base pl-10 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Primary email address managed via authentication security settings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="input-base pl-10"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used solely for verified ownership handover coordination; never displayed publicly on listings.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-teal text-xs font-semibold !px-6"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
