import React from 'react';
import type { SharedContentResponse } from '../../types/trip';
import BaseContentCard from './BaseContentCard';

interface CommunityActivityCardProps {
  item: SharedContentResponse;
  onUpvote?: (id: string, isLike: boolean) => void;
  onClick?: (item: SharedContentResponse) => void;
  onImageOpen?: (images: string[], index: number) => void;
}

const CommunityActivityCard: React.FC<CommunityActivityCardProps> = ({ item, onUpvote, onClick, onImageOpen }) => {
  const activity = item.referenceData; // ActivityResponse
  const parsedContent = React.useMemo(() => {
    try {
      return JSON.parse(item.content);
    } catch {
      return { description: item.content, tip: '', specificLocation: '' };
    }
  }, [item.content]);

  return (
    <BaseContentCard
      item={item}
      onUpvote={onUpvote}
      onClick={onClick}
      onImageOpen={onImageOpen}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-emerald-950 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-[18px]">location_on</span>
            {parsedContent.specificLocation || activity?.name || 'Địa điểm thú vị'}
          </h4>
          <span className="text-xs text-emerald-600 font-medium ml-6">{activity?.location}</span>
        </div>
      </div>

      <p className="text-slate-600 text-sm italic mb-2">"{item.description || parsedContent.description}"</p>
      {parsedContent.tip && (
        <div className="flex items-start gap-2 text-xs bg-emerald-50/50 p-2 rounded-lg text-emerald-800">
          <span className="material-symbols-outlined text-[14px] text-emerald-500 mt-0.5">lightbulb</span>
          <span>{parsedContent.tip}</span>
        </div>
      )}
    </BaseContentCard>
  );
};

export default CommunityActivityCard;

