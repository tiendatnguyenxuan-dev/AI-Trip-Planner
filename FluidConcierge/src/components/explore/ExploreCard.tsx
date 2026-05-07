import React from 'react';
import { motion } from 'framer-motion';
import type { ExploreItem } from '../../services/api';
import TagBadge from './TagBadge';

interface ExploreCardProps {
  item: ExploreItem;
  onClick: (item: ExploreItem) => void;
}

const ExploreCard: React.FC<ExploreCardProps> = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={() => onClick(item)}
      className="group relative bg-surface rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-primary/5 h-full flex flex-col cursor-pointer"
    >
      {/* Image Header */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <TagBadge label={item.type} variant="glass" />
        </div>
        
        {/* Popularity score if high */}
        {item.popularityScore >= 9.5 && (
          <div className="absolute top-4 right-4 bg-cta text-white rounded-full p-1.5 shadow-lg">
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-1 rounded-lg">
          <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="text-white text-xs font-bold">{item.averageRating?.toFixed(1) || '0.0'}</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">{item.destination}</span>
          <h3 className="text-white text-xl font-bold line-clamp-1">{item.title}</h3>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map(tag => (
            <TagBadge key={tag} label={tag} variant="secondary" />
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">Ngân sách</span>
            <span className="text-sm font-bold text-text">
              {item.minBudget.toLocaleString()} - {item.maxBudget.toLocaleString()} <span className="text-[10px]">VND</span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">Thời gian</span>
            <div className="flex items-center gap-1 text-sm font-bold text-text">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {item.durationDays} ngày
            </div>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onClick(item); }}
          className="w-full py-4 bg-cta text-white rounded-2xl font-bold text-sm shadow-lg shadow-cta/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
        >
          Khám phá
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ExploreCard;
