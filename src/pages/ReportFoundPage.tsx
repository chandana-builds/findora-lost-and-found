import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { db } from '../services/db';
import { Category, OrganizationType } from '../types';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Building2,
  Tag,
  ShieldCheck,
  ArrowRight,
  Info,
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

export const ReportFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Form State
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<Category>('Electronics');
  const [description, setDescription] = useState('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('College / University');
  const [contactPreference, setContactPreference] = useState<'in_app' | 'email' | 'phone'>('in_app');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in to file an official found item report.');
      return;
    }

    if (!itemName.trim() || !description.trim() || !location.trim() || !eventDate) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (eventDate > todayStr) {
      setErrorMsg('Date found cannot be in the future.');
      return;
    }

    setLoading(true);

    try {
      let uploadedUrl = '';
      if (imageFile) {
        uploadedUrl = await db.uploadItemImage(imageFile);
      }

      const created = await db.createItem({
        user_id: user.id,
        user_name: user.full_name,
        report_type: 'found',
        item_name: itemName.trim(),
        category,
        description: description.trim(),
        identifying_features: identifyingFeatures.trim() || undefined,
        color: color.trim() || undefined,
        brand: brand.trim() || undefined,
        event_date: eventDate,
        location: location.trim(),
        organization_type: organizationType,
        image_path: uploadedUrl || undefined,
        status: 'active',
        contact_preference: contactPreference,
      });

      setCreatedItemId(created.id);
      showToast('Found Report Published', 'Thank you! Your found report is active and cross-referencing lost items.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Confirmation Success View
  if (createdItemId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Found Item Registered!
        </h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
          Thank you for being a responsible community member. If any potential owner is matched, you will receive an in-app notification to review their claim.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={`/items/${createdItemId}`} className="btn-teal w-full sm:w-auto text-xs font-semibold">
            <span>View Published Report</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/my-reports" className="btn-secondary w-full sm:w-auto text-xs font-semibold">
            Go to My Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* Header */}
      <div className="mb-8">
        <span className="badge-found text-xs font-bold uppercase tracking-wider mb-2">
          Found Item Registration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          I Found an Unattended Item
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register the item to help the rightful owner locate it. For security, withhold confidential details such as exact cash amounts or full ID numbers.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-base p-6 sm:p-8 space-y-6">
        {/* Item Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Item Name / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Set of 3 Keys with Toyota Fob, Black Leather Wallet"
            className="input-base"
            required
          />
        </div>

        {/* Category & Organization Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="input-base"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Facility / Location Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value as OrganizationType)}
              className="input-base"
              required
            >
              {ORGANIZATION_TYPES.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand & Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Brand / Manufacturer (If visible)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Dell, Sony, Samsonite"
              className="input-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Silver, Black, Red"
              className="input-base"
            />
          </div>
        </div>

        {/* Date Found & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date Found <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              max={todayStr}
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Location Found <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Student Union cafeteria, table near east entrance"
              className="input-base"
              required
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Public Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the item general appearance and current safe holding location (e.g. handed to reception desk)."
            className="input-base"
            required
          />
        </div>

        {/* Identifying features */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Public Identifying Marks (Optional)
          </label>
          <input
            type="text"
            value={identifyingFeatures}
            onChange={(e) => setIdentifyingFeatures(e.target.value)}
            placeholder="e.g. Keyring with blue tag, has scratch near logo"
            className="input-base"
          />
          <div className="mt-1.5 p-3 rounded-xl bg-teal-50 border border-teal-200/70 text-[11px] text-teal-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Protection:</strong> Do not publicly disclose sensitive IDs or security codes. Keep them private so genuine claimants can verify ownership.
            </span>
          </div>
        </div>

        {/* Photograph Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Photograph of Found Item (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-200 hover:border-findora-teal-500 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50/50">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {imagePreview ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl shadow-sm"
                />
                <span className="text-xs text-slate-500 font-medium">Click to choose a different photo</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                  <Upload className="w-5 h-5 text-findora-teal-600" />
                </div>
                <p className="text-xs font-medium text-slate-700">
                  Click to upload a photograph of the item
                </p>
                <p className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/browse" className="btn-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-teal text-xs font-semibold !px-6"
          >
            {loading ? 'Submitting...' : 'Register Found Item'}
          </button>
        </div>
      </form>
    </div>
  );
};
