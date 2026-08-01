import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { exploreApi, communityApi, tripApi, experienceApi } from '../services/api';
import type { SharedContentResponse, ExploreItem, TripResponse } from '../types/trip';
import ShareModal from '../components/ShareModal';
import ExploreCard from '../components/explore/ExploreCard';
import CommunityTripCard from '../components/explore/CommunityTripCard';
import CommunityActivityCard from '../components/explore/CommunityActivityCard';
import { InteractiveMap } from '../features/planner/components/InteractiveMap';
import { ConversationalChatPanel } from '../features/planner/components/ConversationalChatPanel';

import SharedContentDetailModal from '../components/explore/SharedContentDetailModal';
import ExploreDetailModal from '../components/explore/ExploreDetailModal';
import ImageLightbox from '../components/explore/ImageLightbox';

import { HERO_BGS } from '../constants';
import type { ActivityResponse } from '../types/trip';

const DEFAULT_EXPLORE_ACTIVITIES: ActivityResponse[] = [
  { id: '1', itineraryId: '1', name: 'Chợ Đêm Đà Lạt', description: 'Trải nghiệm ẩm thực đêm và mua sắm nông sản', location: 'Chợ Đêm Đà Lạt, Phường 1', startTime: '19:00:00', endTime: '22:00:00', cost: 200000, activityOrder: 1 },
  { id: '2', itineraryId: '1', name: 'Hồ Xuân Hương', description: 'Đi dạo quanh hồ và ngắm bình minh tươi mát', location: 'Hồ Xuân Hương, Phường 1', startTime: '07:00:00', endTime: '09:00:00', cost: 50000, activityOrder: 2 },
  { id: '3', itineraryId: '1', name: 'Thung Lũng Tình Yêu', description: 'Tham quan cảnh quan thiên nhiên và ngàn hoa', location: 'Thung Lũng Tình Yêu, Phường 8', startTime: '09:30:00', endTime: '12:00:00', cost: 250000, activityOrder: 3 },
  { id: '4', itineraryId: '1', name: 'Quán Cà Phê Horizon', description: 'Thưởng thức cà phê với tầm nhìn thung lũng thông', location: 'Quán Cà Phê Horizon, Phường 3', startTime: '14:00:00', endTime: '16:30:00', cost: 120000, activityOrder: 4 },
];

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isTripSelectorOpen, setIsTripSelectorOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTripToShare, setSelectedTripToShare] = useState<TripResponse | null>(null);

  const [selectedMapActivityId, setSelectedMapActivityId] = useState<string | null>(null);
  const [currentHeroBg, setCurrentHeroBg] = useState(0);

  const [selectedDetailItem, setSelectedDetailItem] = useState<SharedContentResponse | null>(null);
  const [selectedExploreItem, setSelectedExploreItem] = useState<ExploreItem | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroBg((prev) => (prev + 1) % HERO_BGS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [trendingTrips, setTrendingTrips] = useState<SharedContentResponse[]>([]);
  const [hotActivities, setHotActivities] = useState<SharedContentResponse[]>([]);
  const [allItems, setAllItems] = useState<ExploreItem[]>([]);

  const { data: exploreData, isLoading: loading, isError } = useQuery({
    queryKey: ['explore-data'],
    queryFn: async () => {
      const [tripsRes, actsRes, allRes] = await Promise.all([
        communityApi.getTrending('TRIP', 6),
        communityApi.getTrending('ACTIVITY', 6),
        exploreApi.getAll({ page: 0, size: 50 })
      ]);
      return { trendingTrips: tripsRes, hotActivities: actsRes, allItems: allRes.content };
    },
  });

  useEffect(() => {
    if (exploreData) {
      setTrendingTrips(exploreData.trendingTrips);
      setHotActivities(exploreData.hotActivities);
      setAllItems(exploreData.allItems);
    }
  }, [exploreData]);

  useEffect(() => {
    console.log('React Query Explore State - isError:', isError, 'loading:', loading, 'exploreData:', exploreData);
    if (isError) {
      toast.error('Không thể tải dữ liệu khám phá. Vui lòng thử lại!');
    }
  }, [isError, loading, exploreData]);

  const { data: userTrips = [] } = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => tripApi.getAll(user!.id),
    enabled: !!user?.id,
  });

  const handlePlan = (item: ExploreItem) => {
    navigate('/plan', {
      state: {
        destination: item.destination,
        durationDays: item.durationDays,
        tags: item.tags,
        budget: item.maxBudget
      }
    });
  };

  const handleExploreCardClick = (item: ExploreItem) => {
    setSelectedExploreItem(item);
  };

  const handleRate = async (id: string, isLike: boolean) => {
    // Save current state for revert
    const previousTrending = [...trendingTrips];
    const previousHot = [...hotActivities];
    const previousAll = [...allItems];
    const previousDetail = selectedDetailItem ? { ...selectedDetailItem } : null;
    const previousExplore = selectedExploreItem ? { ...selectedExploreItem } : null;

    // Update local state optimistically
    const updateList = (list: SharedContentResponse[]) => 
      list.map(item => {
        if (item.id === id) {
          const newCount = isLike ? item.totalVotes + 1 : Math.max(0, item.totalVotes - 1);
          return { ...item, hasUpvoted: isLike, totalVotes: newCount };
        }
        return item;
      });

    setTrendingTrips(prev => updateList(prev));
    setHotActivities(prev => updateList(prev));
    setAllItems(prev => prev.map(item => {
      if (item.id === id) {
        const newCount = isLike ? (item.totalVotes || 0) + 1 : Math.max(0, (item.totalVotes || 0) - 1);
        return { ...item, hasUpvoted: isLike, totalVotes: newCount };
      }
      return item;
    }));
    
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(prev => prev ? { 
        ...prev, 
        hasUpvoted: isLike, 
        totalVotes: isLike ? prev.totalVotes + 1 : Math.max(0, prev.totalVotes - 1) 
      } : null);
    }
    
    if (selectedExploreItem?.id === id) {
      setSelectedExploreItem(prev => prev ? { 
        ...prev, 
        hasUpvoted: isLike, 
        totalVotes: isLike ? (prev.totalVotes || 0) + 1 : Math.max(0, (prev.totalVotes || 0) - 1) 
      } : null);
    }

    try {
      await experienceApi.like(id);
    } catch (error) {
      console.error('Like failed', error);
      // Revert to previous state on failure
      setTrendingTrips(previousTrending);
      setHotActivities(previousHot);
      setAllItems(previousAll);
      setSelectedDetailItem(previousDetail);
      setSelectedExploreItem(previousExplore);
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const filteredItems = allItems;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Title Section */}
      <div className="pt-14 pb-10 px-6 bg-slate-50 border-b border-slate-200/60 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-5 font-display leading-[1.15]"
          >
            Hành trình mới, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Cảm hứng vượt trội.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-base md:text-xl max-w-2xl mx-auto font-sans font-medium leading-relaxed"
          >
            Trải nghiệm lập kế hoạch du lịch thông minh kết hợp trợ lý AI và bản đồ tương tác trực quan.
          </motion.p>
        </div>
      </div>

      {/* Split Screen Section: Map & AI Bot Chat */}
      <div className="py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px] lg:h-[650px]">
            {/* Left Half: Interactive Map */}
            <div className="h-[480px] lg:h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 font-bold text-xl">map</span>
                  <h3 className="text-base font-bold text-slate-900 font-display">Bản đồ Trải nghiệm Tương tác</h3>
                </div>
                <span className="text-xs text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Đà Lạt • 4 Điểm đến HOT
                </span>
              </div>
              <div className="flex-1 w-full relative min-h-0 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <InteractiveMap
                  activities={DEFAULT_EXPLORE_ACTIVITIES}
                  selectedActivityId={selectedMapActivityId}
                  onSelectActivity={(act) => setSelectedMapActivityId(act.id)}
                  destinationName="đà lạt"
                />
              </div>
            </div>

            {/* Right Half: AI Bot Chat */}
            <div className="h-[520px] lg:h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 font-bold text-xl">smart_toy</span>
                  <h3 className="text-base font-bold text-slate-900 font-display">Trợ lý Bot Chat AI</h3>
                </div>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Tư vấn & Lên lịch 24/7
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <ConversationalChatPanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 relative z-20">
        <div className="space-y-16">
          {/* Trending Trips Section */}
          {trendingTrips.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-sky-600" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <h2 className="text-3xl font-black text-slate-900 font-display">Trending Trips</h2>
                  </div>
                  <p className="text-slate-600 font-medium">Những chuyến đi truyền cảm hứng nhất từ cộng đồng</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trendingTrips.map(item => (
                  <div key={item.id}>
                    <CommunityTripCard
                      item={item}
                      onUpvote={(id, isLike) => handleRate(id, isLike)}
                      onClick={() => setSelectedDetailItem(item)}
                      onImageOpen={(images, index) => {
                        setLightboxImages(images);
                        setLightboxStartIndex(index);
                        setIsLightboxOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hot Activities Section */}
          {hotActivities.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    <h2 className="text-3xl font-black text-slate-900 font-display">Hot Activities</h2>
                  </div>
                  <p className="text-slate-600 font-medium">Kinh nghiệm bỏ túi & tips từ người dùng thực tế</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotActivities.map(item => (
                  <div key={item.id}>
                    <CommunityActivityCard
                      item={item}
                      onUpvote={(id, isLike) => handleRate(id, isLike)}
                      onClick={() => setSelectedDetailItem(item)}
                      onImageOpen={(images, index) => {
                        setLightboxImages(images);
                        setLightboxStartIndex(index);
                        setIsLightboxOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Items Grid */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary">grid_view</span>
              <h2 className="text-2xl font-bold text-text">Tất cả hành trình</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode='popLayout'>
                {filteredItems.map(item => (
                  <ExploreCard 
                    key={item.id} 
                    item={item} 
                    onClick={handleExploreCardClick} 
                    onUpvote={(id, isLike) => handleRate(id, isLike)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>



      {/* Trip Selector Modal */}
      {isTripSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsTripSelectorOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative border border-emerald-100 dark:border-emerald-900/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-display text-emerald-950 dark:text-emerald-50">Chọn chuyến đi để chia sẻ</h3>
              <button onClick={() => setIsTripSelectorOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {userTrips.filter(t => t.status === 'CONFIRMED' || t.status === 'GENERATED').length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-emerald-300 mb-2">flight_takeoff</span>
                  <p className="text-emerald-900/60 dark:text-emerald-50/60 font-medium">Bạn chưa có chuyến đi nào đã hoàn thành lên lịch trình.</p>
                  <p className="text-emerald-900/50 dark:text-emerald-50/50 text-sm mt-1">Hãy tạo chuyến đi và đợi AI lên lịch trình xong nhé!</p>
                  <button onClick={() => navigate('/plan')} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-full font-bold text-sm hover:bg-emerald-600 transition-colors">
                    Lên kế hoạch ngay
                  </button>
                </div>
              ) : (
                userTrips.filter(t => t.status === 'CONFIRMED' || t.status === 'GENERATED').map(trip => (
                  <div
                    key={trip.id}
                    onClick={() => {
                      setSelectedTripToShare(trip);
                      setIsTripSelectorOpen(false);
                      setShareModalOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-300 flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">map</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-emerald-950 dark:text-emerald-50 truncate">{trip.title || trip.destination}</h4>
                      <p className="text-xs text-emerald-700/60 dark:text-emerald-300/60">
                        {new Date(trip.startDate).toLocaleDateString('vi-VN')} - {new Date(trip.endDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedTripToShare && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          type="TRIP"
          refId={selectedTripToShare.id}
          title={selectedTripToShare.title || selectedTripToShare.destination}
          subtitle={`${new Date(selectedTripToShare.startDate).toLocaleDateString('vi-VN')} - ${new Date(selectedTripToShare.endDate).toLocaleDateString('vi-VN')}`}
          onSuccess={() => {
            alert('Đã chia sẻ thành công lên cộng đồng!');
            window.location.reload();
          }}
        />
      )}

      <SharedContentDetailModal
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        item={selectedDetailItem}
        onUpvote={(id, isLike) => handleRate(id, isLike)}
      />

      <ExploreDetailModal
        isOpen={!!selectedExploreItem}
        onClose={() => setSelectedExploreItem(null)}
        exploreItem={selectedExploreItem}
        onPlan={handlePlan}
        onUpvote={(id, isLike) => handleRate(id, isLike)}
      />

      <ImageLightbox
        images={lightboxImages}
        startIndex={lightboxStartIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Coming Soon Card/Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowComingSoon(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative border border-emerald-100 dark:border-emerald-900/50 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-emerald-500 animate-bounce">construction</span>
              </div>
              <h3 className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mb-4 font-display">Sắp ra mắt!</h3>
              <p className="text-emerald-900/60 dark:text-emerald-50/60 font-medium mb-8">
                Tính năng chia sẻ trải nghiệm trực tiếp đang được hoàn thiện. 
                Vui lòng quay lại sau nhé!
              </p>
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;

