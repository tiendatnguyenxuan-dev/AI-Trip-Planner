import React from 'react';
import { X, MapPin, DollarSign, Phone, Globe, Star, Navigation } from 'lucide-react';
import type { ActivityResponse } from '../../../types/trip';

interface PlacePreviewCardProps {
  activity: ActivityResponse | null;
  onClose: () => void;
}

export const PlacePreviewCard: React.FC<PlacePreviewCardProps> = ({ activity, onClose }) => {
  if (!activity) return null;

  const rating = 4.8;
  const reviewCount = 240;
  const phone = "+84 263 3822 666";
  const website = "https://travel-vietnam.example.com";
  const editorialSummary = activity.description || `Địa điểm hấp dẫn tại ${activity.location || 'điểm đến'}. Phù hợp cho hoạt động tham quan và trải nghiệm văn hóa.`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-91/100 max-w-lg bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-5 z-50 text-slate-100 transition-all transform animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-1">
            {activity.startTime ? `${activity.startTime} - ${activity.endTime || ''}` : 'Hoạt động'}
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">{activity.name}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            {activity.location || 'Việt Nam'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-850 p-2.5 rounded-xl border border-slate-800">
          {editorialSummary}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div>
              <span className="font-bold text-amber-300">{rating}</span>
              <span className="text-slate-400 ml-1">({reviewCount} Đánh giá)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-400">Chi phí:</span>
              <span className="font-semibold text-emerald-300 ml-1">
                {activity.cost ? `${activity.cost.toLocaleString('vi-VN')} đ` : 'Miễn phí'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 hover:text-white">
              <Phone className="w-3.5 h-3.5 text-sky-400" /> {phone}
            </span>
            <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-sky-300 text-sky-400 underline">
              <Globe className="w-3.5 h-3.5" /> Website
            </a>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition text-xs">
            <Navigation className="w-3.5 h-3.5" /> Chỉ đường
          </button>
        </div>
      </div>
    </div>
  );
};
