import React from 'react';
import { motion } from 'framer-motion';
import type { SharedContentResponse } from '../../types/trip';

interface CommunityActivityCardProps {
  item: SharedContentResponse;
  onUpvote?: (id: string) => void;
}

const CommunityActivityCard: React.FC<CommunityActivityCardProps> = ({ item, onUpvote }) => {
  const activity = item.referenceData; // ActivityResponse
  const parsedContent = React.useMemo(() => {
    try {
      return JSON.parse(item.content);
    } catch {
      return { description: item.content, tip: '', specificLocation: '' };
    }
  }, [item.content]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-emerald-100/50 shadow-sm hover:shadow-md transition-all group flex flex-col"
    >
      {item.imageUrl && (
        <div className="h-32 w-full overflow-hidden">
          <img
            src={`http://localhost:8081${item.imageUrl}`}
            alt="Activity"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-bold text-emerald-950 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-[18px]">location_on</span>
              {parsedContent.specificLocation || activity?.name || 'Địa điểm thú vị'}
            </h4>
            <span className="text-xs text-emerald-600 font-medium ml-6">{activity?.location}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-sm font-bold">{item.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm italic mb-2">"{item.description || parsedContent.description}"</p>
        {parsedContent.tip && (
          <div className="flex items-start gap-2 text-xs bg-emerald-50/50 p-2 rounded-lg text-emerald-800">
            <span className="material-symbols-outlined text-[14px] text-emerald-500 mt-0.5">lightbulb</span>
            <span>{parsedContent.tip}</span>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
            {item.user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-slate-500">{item.user.name}</span>
        </div>

        <button
          onClick={() => onUpvote?.(item.id)}
          className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">stars</span>
          <span className="text-xs font-bold">{item.totalVotes}</span>
        </button>
      </div>
    </div>
  </motion.div>
);
};

export default CommunityActivityCard;
