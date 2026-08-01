import React, { useEffect, useState } from 'react';
import { Sparkles, Heart, MessageSquare, Compass, DollarSign, Clock } from 'lucide-react';
import axios from 'axios';
import type { SharedContentResponse } from '../../../types/trip';
import { RemixTripModal } from './RemixTripModal';

interface CommunityFeedProps {
  onSelectRemixTrip?: (tripId: string) => void;
}

const CATEGORIES = ['Tất cả', 'Trending', 'Cuối tuần', 'Tiết kiệm', 'Gia đình', 'Phượt', 'Sang trọng'];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onSelectRemixTrip }) => {
  const [posts, setPosts] = useState<SharedContentResponse[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(true);
  const [activeRemixPost, setActiveRemixPost] = useState<SharedContentResponse | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';

  const fetchTrendingPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/community/trending?type=TRIP&limit=10`);
      setPosts(response.data || []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
      setPosts([
        {
          id: 'demo-1',
          user: { id: 'u1', name: 'Nguyễn Văn Minh', email: 'minh@example.com', role: 'USER' },
          type: 'TRIP',
          refId: 'ref-1',
          content: '{}',
          rating: 4.9,
          totalRatingSum: 49,
          totalVotes: 10,
          description: 'Hành trình Đà Lạt 3 ngày 2 đêm săn mây và thưởng thức ẩm thực đường phố tuyệt vời!',
          cost: 3500000,
          duration: 3,
          status: 'PUBLISHED',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${apiBaseUrl}/community/${postId}/rate`,
        { stars: 5 },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      fetchTrendingPosts();
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Compass className="w-4 h-4 animate-spin-slow" />
            FluidConcierge Community Platform
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Cộng Đồng Chia Sẻ Hành Trình</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Khám phá lịch trình du lịch thực tế từ cộng đồng. Chọn một chuyến đi yêu thích và nhấp{' '}
            <strong className="text-amber-400">"Tái sử dụng bằng AI"</strong> để tự động cá nhân hóa cho riêng bạn!
          </p>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts Feed Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải trải nghiệm cộng đồng...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-600 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                      {post.user?.name ? post.user.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{post.user?.name || 'Thành viên'}</h4>
                      <span className="text-[10px] text-slate-400">Đã xuất bản chuyến đi</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    ★ {post.rating ? post.rating.toFixed(1) : '5.0'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium mb-4 line-clamp-3">
                  {post.description || 'Chuyến đi tuyệt vời cùng lịch trình khám phá địa phương.'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {post.duration || 3} Ngày
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {post.cost ? `${post.cost.toLocaleString('vi-VN')} đ` : 'Tiêu chuẩn'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <button
                  onClick={() => setActiveRemixPost(post)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Tái sử dụng bằng AI
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 hover:text-rose-400 transition"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <span>{post.totalVotes || 12} Thích</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-sky-400 transition">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <span>Bình luận</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeRemixPost && (
        <RemixTripModal
          sharedContent={activeRemixPost}
          onClose={() => setActiveRemixPost(null)}
          onRemixed={(newTripId) => {
            if (onSelectRemixTrip) onSelectRemixTrip(newTripId);
          }}
        />
      )}
    </div>
  );
};
