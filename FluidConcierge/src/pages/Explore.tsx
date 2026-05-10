import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { exploreApi, communityApi, tripApi } from '../services/api';
import type { SharedContentResponse, ExploreItem, TripResponse } from '../types/trip';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import ExploreCard from '../components/explore/ExploreCard';
import FilterBar from '../components/explore/FilterBar';
import CommunityTripCard from '../components/explore/CommunityTripCard';
import CommunityActivityCard from '../components/explore/CommunityActivityCard';

import SharedContentDetailModal from '../components/explore/SharedContentDetailModal';
import ExploreDetailModal from '../components/explore/ExploreDetailModal';
import ImageLightbox from '../components/explore/ImageLightbox';

// Import hero images from src/assets
import dalatImg from '../assets/dalat.jpg';
import danangImg from '../assets/danang.jpg';
import halongImg from '../assets/halong.jpg';
import sapaImg from '../assets/sapa.jpg';

const ALL_TAGS = ['Chill', 'Nature', 'Thư giãn', 'Adventure', 'Phiêu lưu', 'Luxury', 'Beach', 'Family', 'Modern', 'Văn hóa', 'History', 'Food', 'Ẩm thực'];

const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [trendingTrips, setTrendingTrips] = useState<SharedContentResponse[]>([]);
  const [hotActivities, setHotActivities] = useState<SharedContentResponse[]>([]);
  const [allItems, setAllItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [userTrips, setUserTrips] = useState<TripResponse[]>([]);
  const [isTripSelectorOpen, setIsTripSelectorOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTripToShare, setSelectedTripToShare] = useState<TripResponse | null>(null);

  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentHeroBg, setCurrentHeroBg] = useState(0);


  const [selectedDetailItem, setSelectedDetailItem] = useState<SharedContentResponse | null>(null);
  const [selectedExploreItem, setSelectedExploreItem] = useState<ExploreItem | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  const HERO_BGS = [
    '/assets/explore/hanoi_culture.png',
    danangImg,
    '/assets/explore/phuquoc_luxury.png',
    dalatImg,
    halongImg,
    sapaImg,
    '/assets/explore/danang_modern.png',
    '/assets/explore/dalat_adventure.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroBg((prev) => (prev + 1) % HERO_BGS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripsRes, actsRes, allRes] = await Promise.all([
          communityApi.getTrending('TRIP', 6),
          communityApi.getTrending('ACTIVITY', 6),
          exploreApi.getAll({ page: 0, size: 50 })
        ]);
        setTrendingTrips(tripsRes);
        setHotActivities(actsRes);
        setAllItems(allRes.content);
      } catch (error) {
        console.error('Failed to fetch explore data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      tripApi.getAll(user.id).then(setUserTrips).catch(console.error);
    }
  }, [user?.id]);

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
    try {
      const stars = isLike ? 5 : 0;
      const updated = await communityApi.rate(id, stars);
      // Optimistically update
      setTrendingTrips(prev => prev.map(t => t.id === id ? { ...t, rating: updated.rating, totalVotes: updated.totalVotes, hasUpvoted: isLike } : t));
      setHotActivities(prev => prev.map(a => a.id === id ? { ...a, rating: updated.rating, totalVotes: updated.totalVotes, hasUpvoted: isLike } : a));
      setSelectedDetailItem(prev => prev?.id === id ? { ...prev, rating: updated.rating, totalVotes: updated.totalVotes, hasUpvoted: isLike } : prev);
    } catch (error) {
      console.error('Rate failed', error);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.destination.toLowerCase().includes(search.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(t => item.tags.includes(t));
    const matchesDuration = !duration || item.durationDays === duration;
    return matchesSearch && matchesTags && matchesDuration;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <div className="pt-32 pb-48 px-6 relative overflow-hidden bg-emerald-950">
        {/* Animated Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[100%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[80%] bg-teal-400/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroBg}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
            style={{ backgroundImage: `url(${HERO_BGS[currentHeroBg]})` }}
          />
        </AnimatePresence>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-background" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 backdrop-blur-md"
          >
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em]">AI-Powered Travel Planner</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 font-display leading-[1.1]"
          >
            Hành trình mới, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Cảm hứng mới.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-emerald-100/70 text-lg md:text-2xl max-w-2xl mx-auto font-sans font-medium mb-12"
          >
            Tìm nguồn cảm hứng từ những trải nghiệm độc đáo, được cá nhân hóa bởi trí tuệ nhân tạo.
          </motion.p>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 group-hover:text-emerald-400 transition-colors text-2xl">search</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && search.trim()) {
                    navigate('/plan', { state: { destination: search.trim() } });
                  }
                }}
                placeholder="Khám phá điểm đến (vd: Đà Lạt, Phú Quốc...)"
                className="w-full pl-16 pr-8 py-7 rounded-[2rem] bg-white text-xl shadow-2xl focus:ring-0 transition-all outline-none text-emerald-950 font-sans font-bold placeholder:text-emerald-900/30"
              />
              <button
                onClick={() => search.trim() && navigate('/plan', { state: { destination: search.trim() } })}
                className="absolute right-3 top-3 bottom-3 px-8 bg-emerald-900 text-emerald-50 rounded-2xl font-black text-sm hover:bg-emerald-800 transition-colors active:scale-95"
              >
                Bắt đầu
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4 relative z-20">
            <button
              onClick={() => {
                setIsTripSelectorOpen(true);
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-bold transition-all flex items-center gap-2 border border-white/20"
            >
              <span className="material-symbols-outlined">flight_takeoff</span>
              Chia sẻ Chuyến đi
            </button>
            <button
              onClick={() => {
                setShowComingSoon(true);
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-bold transition-all flex items-center gap-2 border border-white/20"
            >
              <span className="material-symbols-outlined">local_activity</span>
              Chia sẻ Trải nghiệm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <FilterBar
          tags={ALL_TAGS}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onClear={() => setSelectedTags([])}
          duration={duration}
          onDurationChange={setDuration}
        />

        <div className="mt-16 space-y-16">
          {/* Trending Trips Section */}
          {trendingTrips.length > 0 && (
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <h2 className="text-3xl font-black text-emerald-950 font-display">Trending Trips</h2>
                  </div>
                  <p className="text-emerald-700/70 font-medium">Những chuyến đi truyền cảm hứng nhất từ cộng đồng</p>
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
                    <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                    <h2 className="text-3xl font-black text-emerald-950 font-display">Hot Activities</h2>
                  </div>
                  <p className="text-emerald-700/70 font-medium">Kinh nghiệm bỏ túi & tips từ người dùng thực tế</p>
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
                  <ExploreCard key={item.id} item={item} onClick={handleExploreCardClick} />
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

