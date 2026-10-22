import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <div>
        <span className="badge-found text-xs font-bold uppercase tracking-wider mb-2">
          Security & Privacy
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
          Privacy Policy & Safeguards
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last updated: October 2026 • Findora Protocol Standards
        </p>
      </div>

      <div className="card-base p-6 sm:p-8 space-y-6 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-findora-teal-600" />
            1. Protection of Identifying Information
          </h2>
          <p>
            Findora is designed with privacy-by-default architecture. When filing lost or found reports, users are instructed not to publish sensitive credentials, government identity card numbers, or proprietary serial codes publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-findora-teal-600" />
            2. Confidential Ownership Proof
          </h2>
          <p>
            Details provided in the "Confidential Proof & Distinguishing Details" field of a claim request are encrypted and stored in secure database records accessible solely to the finder and institutional administrators evaluating the claim.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-findora-teal-600" />
            3. Contact Privacy
          </h2>
          <p>
            Owner email addresses and telephone numbers are never exposed on public listing cards. All initial inquiries and match notifications are mediated through in-app notifications.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-findora-teal-600" />
            4. Data Retention & Report Withdrawal
          </h2>
          <p>
            Users have the right to withdraw or delete their submitted reports at any time. Once an item is marked as reunited, public listings cease showing active alerts.
          </p>
        </section>
      </div>
    </div>
  );
};
