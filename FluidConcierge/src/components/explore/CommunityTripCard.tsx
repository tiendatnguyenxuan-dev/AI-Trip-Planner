import React from 'react';
import { motion } from 'framer-motion';
import type { SharedContentResponse } from '../../types/trip';
import { useNavigate } from 'react-router-dom';

interface CommunityTripCardProps {
  item: SharedContentResponse;
  onUpvote: (id: string) => void;
}

const CommunityTripCard: React.FC<CommunityTripCardProps> = ({ item, onUpvote }) => {
  const navigate = useNavigate();
  const trip = item.referenceData; // TripResponse
  const parsedContent = React.useMemo(() => {
    try {
      return JSON.parse(item.content);
    } catch {
      return { description: item.content };
    }
  }, [item.content]);

  // Use the uploaded image, reference image, or a fallback
  const imageUrl = item.imageUrl 
    ? `http://localhost:8081${item.imageUrl}` 
    : `/assets/explore/phuquoc_luxury.png`;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative flex flex-col bg-white/80 backdrop-blur-md rounded-[2rem] overflow-hidden border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.1)] transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/itinerary/${trip?.id}`)} // Or open a modal
    >
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply group-hover:bg-transparent transition-colors z-10" />
        <img
          src={imageUrl}
          alt={trip?.destination || 'Trip'}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <div className="px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white text-sm font-medium flex items-center gap-1 border border-white/20">
            <span className="material-symbols-outlined text-[16px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            {item.rating.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-emerald-950 mb-1 line-clamp-1">{trip?.title || 'Chuyến đi tuyệt vời'}</h3>
            <p className="text-emerald-700/80 text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {trip?.destination}
            </p>
          </div>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
          "{item.description || parsedContent.description}"
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
           {item.cost && (
             <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
               <span className="material-symbols-outlined text-[14px]">payments</span>
               {(item.cost / 1000000).toFixed(1)}M VNĐ
             </div>
           )}
           {item.duration && (
             <div className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-md">
               <span className="material-symbols-outlined text-[14px]">schedule</span>
               {item.duration} Ngày
             </div>
           )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {item.user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-emerald-900">{item.user.name}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpvote(item.id);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            <span className="text-sm font-bold">{item.totalVotes}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityTripCard;
