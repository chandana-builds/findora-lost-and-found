import React from 'react';
import { Link } from 'react-router-dom';
import { ItemReport } from '../types';
import { MapPin, Calendar, Tag, Building2, CheckCircle2 } from 'lucide-react';

interface ItemCardProps {
  item: ItemReport;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const isLost = item.report_type === 'lost';
  const isReunited = item.status === 'reunited';

  // Professional fallback placeholder based on category
  const fallbackImage = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card-base overflow-hidden flex flex-col group h-full">
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={item.image_path || fallbackImage}
          alt={item.item_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          loading="lazy"
        />

        {/* Status Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isReunited ? (
            <span className="badge-reunited bg-teal-600 text-white border-transparent shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reunited
            </span>
          ) : isLost ? (
            <span className="badge-lost bg-rose-600 text-white border-transparent shadow-sm">
              Lost Item
            </span>
          ) : (
            <span className="badge-found bg-emerald-600 text-white border-transparent shadow-sm">
              Found Item
            </span>
          )}

          {item.status === 'in_claim' && (
            <span className="badge-pending bg-amber-500 text-white border-transparent shadow-sm">
              Claim Pending
            </span>
          )}
        </div>

        {/* Category tag on image */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-black/60 backdrop-blur-md text-white">
            <Tag className="w-3 h-3" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Organization Type */}
          <div className="flex items-center gap-1.5 text-[11px] text-findora-navy-500 font-medium mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-findora-teal-600 shrink-0" />
            <span className="truncate">{item.organization_type}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 group-hover:text-findora-teal-700 transition-colors line-clamp-1 text-base">
            {item.item_name}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Color & Brand */}
          {(item.brand || item.color) && (
            <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-600">
              {item.brand && (
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                  {item.brand}
                </span>
              )}
              {item.color && (
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {item.color}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Location & Date Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(item.event_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>

            <Link
              to={`/items/${item.id}`}
              className="text-xs font-semibold text-findora-teal-700 hover:text-findora-teal-800 hover:underline"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
