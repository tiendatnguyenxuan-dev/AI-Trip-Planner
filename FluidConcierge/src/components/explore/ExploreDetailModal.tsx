import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exploreApi, communityApi } from '../../services/api';
import type { ExploreItem, SharedContentResponse } from '../../types/trip';
import CommunityActivityCard from './CommunityActivityCard';
import ShareModal from '../ShareModal';
import ImageLightbox from './ImageLightbox';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exploreItem: ExploreItem | null;
  onPlan: (item: ExploreItem) => void;
}

const ExploreDetailModal: React.FC<Props> = ({ isOpen, onClose, exploreItem, onPlan }) => {
  const [reviews, setReviews] = useState<SharedContentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && exploreItem) {
      setLoading(true);
      communityApi.getExploreItemReviews(exploreItem.id)
        .then(res => setReviews(res))
        .catch(err => console.error("Failed to load reviews", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, exploreItem]);

  if (!isOpen || !exploreItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          className="relative w-full max-w-[1000px] h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Close button - Absolute on top right for all views */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 backdrop-blur text-white rounded-full transition-colors md:bg-white/80 md:text-gray-900 md:hover:bg-emerald-500 md:hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Left Column: Image */}
          <div className="relative w-full md:w-[45%] h-[250px] md:h-full shrink-0">
            <img 
              src={exploreItem.thumbnailUrl || '/assets/explore/default.png'} 
              alt={exploreItem.title} 
              className="w-full h-full object-cover" 
            />
            {/* Overlay gradient for mobile only */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
          </div>

          {/* Right Column: Content & Interaction */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {/* Header section */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 leading-tight">
                  {exploreItem.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <p className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">location_on</span>
                    {exploreItem.destination}
                  </p>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-yellow-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-bold text-yellow-700">{exploreItem.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-yellow-600/60 ml-1">({exploreItem.reviewCount || 0})</span>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Description */}
              <div>
                <h3 className="text-sm uppercase tracking-wider font-bold text-gray-400 mb-3">Giới thiệu</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {exploreItem.description || 'Chưa có mô tả chi tiết cho địa điểm này. Hãy là người đầu tiên khám phá và chia sẻ trải nghiệm của bạn!'}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {exploreItem.tags?.map(t => (
                    <span key={t} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <button 
                  onClick={() => onPlan(exploreItem)}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <span className="material-symbols-outlined">map</span>
                  Lên kế hoạch ngay
                </button>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-6 py-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">edit_square</span>
                  Viết trải nghiệm
                </button>
              </div>

              <hr className="border-gray-100" />

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  Trải nghiệm cộng đồng
                  <span className="text-sm font-medium text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                    {exploreItem.reviewCount || 0}
                  </span>
                </h3>

                {loading ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <span className="material-symbols-outlined animate-spin text-emerald-500 text-4xl">progress_activity</span>
                    <p className="text-gray-400 font-medium">Đang tải đánh giá...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 pb-4">
                    {reviews.map(review => (
                      <CommunityActivityCard 
                        key={review.id} 
                        item={review} 
                        onImageOpen={(images, index) => {
                          setLightboxImages(images);
                          setLightboxStartIndex(index);
                          setIsLightboxOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">forum</span>
                    <p className="text-gray-500 font-bold">Chưa có bài đánh giá nào</p>
                    <p className="text-gray-400 text-sm mt-1">Hãy là người đầu tiên chia sẻ kỷ niệm tại đây!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          type="EXPLORE_ITEM"
          refId={exploreItem.id}
          title={`Đánh giá trải nghiệm tại ${exploreItem.title}`}
          onSuccess={() => {
            setIsShareModalOpen(false);
            // Refresh reviews
            communityApi.getExploreItemReviews(exploreItem.id).then(setReviews);
          }}
        />

        <ImageLightbox 
          images={lightboxImages}
          startIndex={lightboxStartIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        />
      </div>
    </AnimatePresence>
  );
};

export default ExploreDetailModal;
