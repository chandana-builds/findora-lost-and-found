import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Inquiry Received', 'Our support team will respond shortly.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="badge-found text-xs font-bold uppercase tracking-wider">
          Help Center
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Contact & Community Support
        </h1>
        <p className="text-xs text-slate-500">
          Have questions about a claim, need assistance with a report, or want to deploy Findora in your institution?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-4">
          <div className="card-base p-5 space-y-2">
            <Mail className="w-5 h-5 text-findora-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Email Assistance</h3>
            <p className="text-xs text-slate-500">
              support@findora.portal
            </p>
          </div>

          <div className="card-base p-5 space-y-2">
            <ShieldCheck className="w-5 h-5 text-findora-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Security Escalations</h3>
            <p className="text-xs text-slate-500">
              security@findora.portal
            </p>
          </div>

          <div className="card-base p-5 space-y-2">
            <MapPin className="w-5 h-5 text-findora-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Institutional Inquiries</h3>
            <p className="text-xs text-slate-500">
              Available for universities, hospitals, corporate parks, and transit authorities.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="card-base p-10 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Message Received
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Thank you for contacting Findora support. A representative will review your message and reply to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="btn-secondary text-xs mt-4"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card-base p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Robin Taylor"
                    className="input-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="robin@example.com"
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Subject / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-base text-xs"
                >
                  <option value="General Support">General Support</option>
                  <option value="Claim Dispute">Claim Dispute / Verification Help</option>
                  <option value="Report Inappropriate Listing">Report Inappropriate Listing</option>
                  <option value="Institutional Integration">Campus / Organization Deployment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you with Findora?"
                  className="input-base"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="btn-teal text-xs font-semibold !px-6"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
