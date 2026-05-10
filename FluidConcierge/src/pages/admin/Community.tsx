import React, { useState, useEffect } from 'react';
import { communityApi, adminApi } from '../../services/api';
import type { SharedContentResponse } from '../../types/trip';
import { motion, AnimatePresence } from 'framer-motion';

export default function Community() {
  const [pendingItems, setPendingItems] = useState<SharedContentResponse[]>([]);
  const [trendingTrips, setTrendingTrips] = useState<SharedContentResponse[]>([]);
  const [trendingActivities, setTrendingActivities] = useState<SharedContentResponse[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedCount, setArchivedCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetchPending(),
      fetchTrending(),
      fetchContributors()
    ]);
  }, []);

  const fetchContributors = async () => {
    try {
      const data = await adminApi.getTopContributors(3);
      setTopContributors(data);
    } catch (error) {
      console.error('Failed to fetch contributors:', error);
    }
  };

  const fetchTrending = async () => {
    try {
      const [trips, activities] = await Promise.all([
        communityApi.getTrending('TRIP', 1),
        communityApi.getTrending('ACTIVITY', 1)
      ]);
      setTrendingTrips(trips);
      setTrendingActivities(activities);
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    }
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPendingContent();
      setPendingItems(data);
    } catch (error) {
      console.error('Failed to fetch pending content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approveContent(id);
      setPendingItems(prev => prev.filter(item => item.id !== id));
      setArchivedCount(prev => prev + 1);
    } catch (error) {
      alert('Phê duyệt thất bại');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối bài viết này?')) return;
    try {
      await adminApi.rejectContent(id);
      setPendingItems(prev => prev.filter(item => item.id !== id));
      setArchivedCount(prev => prev + 1);
    } catch (error) {
      alert('Từ chối thất bại');
    }
  };

  const parseContent = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto text-slate-200">
      {/* Header */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community Moderation</h1>
          <div className="flex items-center gap-3">
            <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
              {pendingItems.length} Pending Items
            </span>
            <span className="text-slate-400 font-medium">Queue management & content safety</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full bg-[#1C2333] border border-slate-700/50 flex items-center justify-center relative hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-slate-300 text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1C2333]"></span>
          </button>
          <button className="w-10 h-10 rounded-full bg-[#1C2333] border border-slate-700/50 flex items-center justify-center hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-slate-300 text-xl">history</span>
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="flex items-center justify-between mb-8 bg-[#151923] p-2 rounded-2xl border border-slate-800/60">
        <div className="flex items-center gap-4 pl-4">
          <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm mr-2">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters:
          </div>
          <button className="bg-[#1C2333] hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            All Content Types
          </button>
          <button className="bg-[#1C2333] hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            Any Severity
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
        </div>
        
        <div className="flex items-center gap-1 bg-[#0F1115] p-1 rounded-xl">
          <button className="bg-sky-500 text-white px-6 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-sky-500/20">
            Active
          </button>
          <button className="text-slate-400 hover:text-slate-200 px-6 py-1.5 rounded-lg text-sm font-bold transition-colors">
            Archived
          </button>
        </div>

        <div className="flex items-center gap-2 pr-4 text-sm font-bold">
          <span className="text-slate-500 uppercase tracking-wider text-xs">Sort by:</span>
          <button className="text-sky-400 flex items-center gap-1">
            Newest First
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Feed (Left) */}
        <div className="xl:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#151923] rounded-3xl border border-slate-800/60">
              <span className="material-symbols-outlined text-5xl text-slate-700 animate-spin mb-4">progress_activity</span>
              <p className="text-slate-500 font-bold">Đang tải dữ liệu kiểm duyệt...</p>
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#151923] rounded-3xl border border-slate-800/60">
              <span className="material-symbols-outlined text-6xl text-slate-800 mb-4">check_circle</span>
              <p className="text-slate-400 font-bold text-lg">Tất cả bài viết đã được kiểm duyệt!</p>
              <p className="text-slate-600">Hiện không có yêu cầu nào mới.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {pendingItems.map((item) => {
                const details = parseContent(item.content);
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-[#151923] rounded-[32px] p-6 border border-slate-800/60 hover:border-slate-700 transition-all shadow-lg shadow-black/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.user.name ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.user.name}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                          alt={item.user.name} 
                          className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700" 
                        />
                        <div>
                          <h3 className="font-bold text-white text-lg">{item.user.name || 'Anonymous'}</h3>
                          <p className="text-sm text-slate-400 font-medium">{item.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-slate-800/50 text-slate-300 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-1">
                          {item.type.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-slate-500 font-bold uppercase">
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-white mb-2">{item.description || 'No Title'}</h4>
                      
                      {item.imageUrls && item.imageUrls.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {item.imageUrls.slice(0, 3).map((url, i) => (
                            <img key={i} src={`http://localhost:8090${url}`} className="w-1/4 h-24 object-cover rounded-xl" alt="Content" />
                          ))}
                          {item.imageUrls.length > 3 && (
                            <div className="w-1/4 h-24 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 font-bold text-lg">
                              +{item.imageUrls.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-slate-400 text-sm leading-relaxed">
                        {details.tip && <span className="block italic text-emerald-400/80 mb-1">Tip: {details.tip}</span>}
                        {details.specificLocation && <span className="block text-sky-400/80 mb-1 italic">Location: {details.specificLocation}</span>}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">
                            {item.type === 'TRIP' ? 'flight_takeoff' : 'local_activity'}
                          </span> 
                          ID: {item.refId.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="w-16 h-10 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                        <button 
                          onClick={() => handleApprove(item.id)}
                          className="px-6 py-2 rounded-xl bg-[#00B4D8] hover:bg-sky-400 text-white text-sm font-bold shadow-lg shadow-sky-500/20 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Trending Section */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Trending Community Content</h2>
              <button className="text-sky-400 text-sm font-bold hover:text-sky-300 transition-colors">
                View All Engagement
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {trendingTrips[0] ? (
                <div className="bg-[#151923] rounded-2xl p-4 border border-slate-800/60">
                  <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    Most Voted Trip
                  </div>
                  <h4 className="font-bold text-white mb-2 line-clamp-1">{trendingTrips[0].description || 'Untitled Trip'}</h4>
                  <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">thumb_up</span> {trendingTrips[0].totalVotes}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#151923] rounded-2xl p-4 border border-slate-800/60 animate-pulse">
                   <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
                   <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side Panels (Right) */}
        <div className="xl:col-span-1 space-y-6">
          {/* Top Contributors */}
          <div className="bg-[#151923] rounded-3xl p-6 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-sky-400">workspace_premium</span>
              <h3 className="font-bold text-white text-lg">Top Contributors</h3>
            </div>
            
            <div className="space-y-4">
              {topContributors.length > 0 ? topContributors.map((c, i) => (
                <div key={c.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`} alt={c.name} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{c.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {(c.totalImpact / 1000).toFixed(1)}k impact &bull; {c.contributionCount} Posts
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500 font-bold text-sm">#{i + 1}</span>
                </div>
              )) : (
                <div className="text-center py-4 text-slate-500 text-sm italic">
                  No contributors found yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
