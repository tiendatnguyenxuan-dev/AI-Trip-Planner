import React from 'react';
import { motion } from 'framer-motion';
import type { SharedContentResponse } from '../../types/trip';
import ImageCarousel from './ImageCarousel';
import { useWebSocket } from '../../hooks/useWebSocket';

export interface BaseContentCardProps {
  item: SharedContentResponse;
  onUpvote?: (id: string, isLike: boolean) => void;
  onClick?: (item: SharedContentResponse) => void;
  onImageOpen?: (images: string[], index: number) => void;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
}

const BaseContentCard: React.FC<BaseContentCardProps> = ({
  item,
  onUpvote,
  onClick,
  onImageOpen,
  children,
  className = "",
  imageClassName = "h-40 w-full"
}) => {
  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [];
  const [isLiked, setIsLiked] = React.useState(item.hasUpvoted || false);
  const [localVotes, setLocalVotes] = React.useState(item.totalVotes);
  const { isConnected, subscribe } = useWebSocket();

  // Sync state with props when they change (critical for F5 persistence and real-time updates)
  React.useEffect(() => {
    setIsLiked(item.hasUpvoted || false);
    setLocalVotes(item.totalVotes);
  }, [item.hasUpvoted, item.totalVotes]);

  // Real-time WebSocket subscription for like count
  React.useEffect(() => {
    if (isConnected) {
      const topic = `/topic/experiences/${item.id}`;
      const subscription = subscribe(topic, (message: { newLikeCount: number }) => {
        console.log(`[WebSocket] Received new like count for ${item.id}:`, message.newLikeCount);
        setLocalVotes(message.newLikeCount);
      });
      return () => subscription?.unsubscribe();
    }
  }, [isConnected, item.id, subscribe]);

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLocalVotes(prev => newLiked ? prev + 1 : prev - 1);
    onUpvote?.(item.id, newLiked);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onClick?.(item)}
      className={`bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-emerald-100/50 shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer ${className}`}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <ImageCarousel
          images={images}
          className={imageClassName}
          onImageClick={(index) => {
            if (onImageOpen) {
              onImageOpen(images, index);
            }
          }}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Rating and Title Section should be handled in children for maximum flexibility, 
            but common parts like rating badge can be shared if they look identical. */}
        {children}

        <div className="flex-1" />

        {/* Common Footer: User info and Upvote button */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-100/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
              {item.user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-slate-500">{item.user.name}</span>
          </div>

          <button
            onClick={handleUpvoteClick}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer ${isLiked
                ? 'text-white bg-emerald-500 hover:bg-emerald-600'
                : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
              }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>
              thumb_up
            </span>
            <span className="text-xs font-bold">{localVotes} lượt thích</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BaseContentCard;
