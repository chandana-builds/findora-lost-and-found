import React from 'react';
import { Scale, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <div>
        <span className="badge-found text-xs font-bold uppercase tracking-wider mb-2">
          Legal Agreement
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
          Terms of Use & Community Standards
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Last updated: October 2026 • Findora Portal Terms
        </p>
      </div>

      <div className="card-base p-6 sm:p-8 space-y-6 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-4 h-4 text-findora-teal-600" />
            1. Truthful Reporting
          </h2>
          <p>
            Users must submit truthful and accurate reports. Submitting fraudulent claims for items that do not belong to you or falsely claiming ownership is strictly prohibited and subject to account suspension and escalation to relevant institutional security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-findora-teal-600" />
            2. Prohibited Content
          </h2>
          <p>
            Findora does not allow listings involving illegal substances, dangerous weapons, counterfeit merchandise, or defamatory remarks. Any listing in violation will be removed immediately by administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-findora-teal-600" />
            3. Safe Exchange Protocols
          </h2>
          <p>
            When reuniting items, users are urged to conduct handovers in public, well-lit spaces such as campus security desks, library reception counters, or hospital helpdesks.
          </p>
        </section>
      </div>
    </div>
  );
};
