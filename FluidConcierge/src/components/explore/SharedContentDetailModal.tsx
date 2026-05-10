import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../../services/api';
import type { SharedContentResponse, CommentResponse } from '../../types/trip';
import ImageCarousel from './ImageCarousel';
import ImageLightbox from './ImageLightbox';
import { useWebSocket } from '../../hooks/useWebSocket';

interface SharedContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SharedContentResponse | null;
  onUpvote?: (id: string, isLike: boolean) => void;
}

const SharedContentDetailModal: React.FC<SharedContentDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpvote
}) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [localVotes, setLocalVotes] = useState(item?.totalVotes || 0);
  const { isConnected, subscribe } = useWebSocket();

  useEffect(() => {
    if (item) {
      setLocalVotes(item.totalVotes);
    }
  }, [item?.totalVotes]);

  useEffect(() => {
    if (isConnected && item?.id) {
      const topic = `/topic/experiences/${item.id}`;
      const subscription = subscribe(topic, (message: { newLikeCount: number }) => {
        setLocalVotes(message.newLikeCount);
      });
      return () => subscription?.unsubscribe();
    }
  }, [isConnected, item?.id, subscribe]);

  useEffect(() => {
    if (isOpen && item) {
      loadComments();
    }
  }, [isOpen, item]);

  const loadComments = async () => {
    if (!item) return;
    try {
      const data = await communityApi.getComments(item.id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !newComment.trim()) return;
    setLoading(true);
    try {
      const added = await communityApi.addComment(item.id, newComment.trim());
      setComments([...comments, added]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-hidden z-50 p-6 flex flex-col"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-emerald-100 flex flex-col h-full">
              {/* Header */}
              <div className="bg-emerald-50 px-6 py-4 flex justify-between items-center border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800 font-bold">
                    {item.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-950">{item.user.name}</h3>
                    <p className="text-xs text-emerald-700/70">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-emerald-100/50 hover:bg-emerald-200 flex items-center justify-center text-emerald-800 transition-colors">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Content body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <ImageCarousel 
                  images={images} 
                  className="w-full h-80 rounded-2xl shadow-inner border border-emerald-50"
                  onImageClick={(index) => {
                    setLightboxImages(images);
                    setLightboxStartIndex(index);
                    setIsLightboxOpen(true);
                  }}
                />
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700">
                  <p>"{item.description || JSON.parse(item.content).description}"</p>
                </div>

                {/* View Details Button */}
                {item.type === 'TRIP' && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/itinerary/${item.refId}`);
                    }}
                    className="w-full py-3 bg-emerald-100/50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                    Xem chi tiết Lịch trình
                  </button>
                )}

                {/* Stats */}
                <div className="flex gap-4 border-y border-emerald-100 py-3">
                  <button 
                    onClick={() => onUpvote?.(item.id, !item.hasUpvoted)}
                    className={`flex items-center gap-1 font-bold px-3 py-1.5 rounded-xl transition-colors ${item.hasUpvoted ? 'text-white bg-emerald-500 hover:bg-emerald-600' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: item.hasUpvoted ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span>
                    {localVotes} <span className={item.hasUpvoted ? "text-emerald-50 font-normal text-sm" : "text-emerald-600/70 font-normal text-sm"}>lượt thích</span>
                  </button>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>comment</span>
                    {comments.length} <span className="text-slate-400 font-normal text-sm">bình luận</span>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                        {c.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="bg-emerald-50/50 rounded-2xl rounded-tl-none p-3 flex-1 border border-emerald-100/30">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-emerald-900">{c.user.name}</span>
                          <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-slate-900">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  )}
                </div>
              </div>

              {/* Add comment form */}
              <div className="p-4 bg-emerald-50/30 border-t border-emerald-100">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 px-4 py-2 rounded-xl border border-emerald-200 text-slate-900 dark:text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newComment.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    Gửi
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Lightbox rendered at root level to avoid transform/overflow clipping */}
          <ImageLightbox 
            images={lightboxImages.length > 0 ? lightboxImages : images}
            startIndex={lightboxStartIndex}
            isOpen={isLightboxOpen}
            onClose={() => setIsLightboxOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default SharedContentDetailModal;
