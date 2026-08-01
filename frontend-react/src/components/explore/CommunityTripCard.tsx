import React from 'react';
import type { SharedContentResponse } from '../../types/trip';
import { useNavigate } from 'react-router-dom';
import BaseContentCard from './BaseContentCard';

interface CommunityTripCardProps {
  item: SharedContentResponse;
  onUpvote: (id: string, isLike: boolean) => void;
  onClick?: (item: SharedContentResponse) => void;
  onImageOpen?: (images: string[], index: number) => void;
}

const CommunityTripCard: React.FC<CommunityTripCardProps> = ({ item, onUpvote, onClick, onImageOpen }) => {
  const navigate = useNavigate();
  const trip = item.referenceData; // TripResponse
  const parsedContent = React.useMemo(() => {
    try {
      return JSON.parse(item.content);
    } catch {
      return { description: item.content };
    }
  }, [item.content]);

  const handleCardClick = (item: SharedContentResponse) => {
    if (onClick) {
      onClick(item);
    } else {
      navigate(`/itinerary/${trip?.id}`);
    }
  };

  return (
    <BaseContentCard
      item={item}
      onUpvote={onUpvote}
      onClick={handleCardClick}
      onImageOpen={onImageOpen}
      className="bg-white/80 rounded-[2rem] border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(16,185,129,0.1)]"
      imageClassName="h-48 sm:h-56 w-full"
    >


      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-emerald-950 mb-1 line-clamp-1">{trip?.title || 'Chuyến đi tuyệt vời'}</h3>
          <p className="text-emerald-700/80 text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {trip?.destination}
          </p>
        </div>
      </div>

      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
        "{item.description || parsedContent.description}"
      </p>

      <div className="flex flex-wrap gap-2">
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
    </BaseContentCard>
  );
};

export default CommunityTripCard;

