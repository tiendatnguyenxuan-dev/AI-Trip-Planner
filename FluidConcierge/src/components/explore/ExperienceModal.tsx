import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWebSocket } from '../../hooks/useWebSocket.tsx';
import { experienceApi } from '../../services/api';

interface ExperienceModalProps {
  experienceId: string;
  initialLikeCount: number;
  isNewPost?: boolean; // Prop to trigger success toast
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({ 
  experienceId, 
  initialLikeCount,
  isNewPost = false 
}) => {
  const { isConnected, subscribe } = useWebSocket();
  // Bug 1: Default to 0 if initialLikeCount is null/undefined
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Bug 3: Trigger success toast when a post is created
    if (isNewPost) {
      toast.success("Đăng bài thành công");
    }
  }, [isNewPost]);

  useEffect(() => {
    if (isConnected) {
      // Bug 2: Ensure exact topic subscription and add logs
      console.log(`[WebSocket] Subscribing to /topic/experiences/${experienceId}`);
      const subscription = subscribe(`/topic/experiences/${experienceId}`, (payload: { newLikeCount: number }) => {
        console.log('[WebSocket] Received message:', payload);
        if (payload.newLikeCount !== undefined) {
          setLikeCount(payload.newLikeCount);
        }
      });

      return () => {
        console.log(`[WebSocket] Unsubscribing from /topic/experiences/${experienceId}`);
        subscription?.unsubscribe();
      };
    }
  }, [isConnected, experienceId, subscribe]);

  const handleLike = async () => {
    // Feature: Optimistic toggle UI
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);

    try {
      await experienceApi.like(experienceId);
    } catch (error) {
      // Revert optimistic update on failure
      setIsLiked(wasLiked);
      setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
      toast.error("Không thể thực hiện thao tác");
      console.error('Failed to like experience:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-full max-w-md border border-slate-100">
      <h2 className="text-xl font-bold mb-4">Community Experience</h2>
      <p className="text-gray-600 mb-6">This is a wonderful place to visit! Highly recommended.</p>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleLike}
          className={`p-2 rounded-full transition-all duration-300 transform active:scale-90 ${
            isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-6 h-6 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />
        </button>
        <span className="font-semibold text-gray-800">{likeCount} lượt thích</span>
      </div>
    </div>
  );
};
