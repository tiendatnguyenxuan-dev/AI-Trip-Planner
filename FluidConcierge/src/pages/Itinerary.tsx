import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tripApi, itineraryApi, activityApi } from '../services/api';
import type { ActivityResponse } from '../types/trip';
import { useAuth } from '../context/AuthContext';
import EditActivityModal from '../components/EditActivityModal';
import ShareModal from '../components/ShareModal';
import { formatCurrency } from '../utils/formatter';
import DaySection from '../components/itinerary/DaySection';
import LoadingSkeleton from '../components/itinerary/LoadingSkeleton';
import GeneratingOverlay from '../components/itinerary/GeneratingOverlay';

// ── Main component ──────────────────────────────────────────────────────────

export default function Itinerary() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Edit modal state
  const [editingActivity, setEditingActivity] = useState<ActivityResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItineraryId, setCurrentItineraryId] = useState<string | null>(null);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{
    type: 'ACTIVITY' | 'TRIP';
    refId: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const { data, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: async () => {
      if (!tripId) throw new Error('No trip ID');
      const [tripData, itineraryData] = await Promise.all([
        tripApi.getById(tripId),
        itineraryApi.getByTrip(tripId),
      ]);
      return { trip: tripData, itineraries: itineraryData };
    },
    enabled: !!tripId,
    refetchInterval: (query) => {
      const trip = query.state.data?.trip;
      return trip?.status === 'GENERATING' ? 3000 : false;
    }
  });

  const trip = data?.trip ?? null;
  const itineraries = data?.itineraries ?? [];

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!tripId) return;
      return tripApi.regenerate(tripId, { feedback: 'Vui lòng tạo lại lịch trình với gợi ý mới.', language: 'Vietnamese' });
    },
    onMutate: () => {
      return toast.loading('Đang tạo lại lịch trình...');
    },
    onSuccess: (_, __, context) => {
      refetch();
      toast.success('Tạo lại lịch trình thành công!', { id: context });
    },
    onError: (_, __, context) => {
      toast.error('Không thể tạo lại lịch trình.', { id: context });
    }
  });

  const isRegenerating = regenerateMutation.isPending;

  // Redirect to selection if status is SELECTING_ACTIVITIES
  useEffect(() => {
    if (trip?.status === 'SELECTING_ACTIVITIES' && tripId) {
      navigate(`/selection/${tripId}`);
    }
  }, [trip?.status, tripId, navigate]);

  // Warn user if they try to leave while generating
  useEffect(() => {
    const isGeneratingState = trip?.status === 'GENERATING' || isRegenerating;
    if (!isGeneratingState) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trip?.status, isRegenerating]);

  const handleRegenerate = () => {
    regenerateMutation.mutate();
  };

  const handleEditActivity = (activity: ActivityResponse) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleShareActivity = (activity: ActivityResponse) => {
    setShareData({
      type: 'ACTIVITY',
      refId: activity.id,
      title: activity.name,
      subtitle: activity.location
    });
    setShareModalOpen(true);
  };

  const handleShareTrip = () => {
    if (!trip) return;
    setShareData({
      type: 'TRIP',
      refId: trip.id,
      title: trip.title || trip.destination,
      subtitle: `${new Date(trip.startDate).toLocaleDateString('vi-VN')} - ${new Date(trip.endDate).toLocaleDateString('vi-VN')}`
    });
    setShareModalOpen(true);
  };

  const handleAddActivity = (itineraryId: string) => {
    setCurrentItineraryId(itineraryId);
    setEditingActivity(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteActivity = async (activityId: string, itineraryId: string) => {
    if (!confirm('Bạn có chắc muốn xóa hoạt động này?')) return;
    const toastId = toast.loading('Đang xóa hoạt động...');
    try {
      await activityApi.delete(itineraryId, activityId);
      await refetch();
      toast.success('Xóa hoạt động thành công!', { id: toastId });
    } catch {
      toast.error('Không thể xóa hoạt động.', { id: toastId });
    }
  };

  const handleSaveActivity = async () => {
    if (!tripId) return;
    await refetch();
    setIsEditModalOpen(false);
  };

  const handleRegenerateDay = async (itineraryId: string) => {
    if (!confirm('Tạo lại ngày này? Các hoạt động hiện tại sẽ bị thay thế.')) return;
    if (!tripId) return;
    const toastId = toast.loading('Đang tạo lại hoạt động cho ngày này...');
    try {
      await itineraryApi.regenerateDay(tripId, itineraryId, { language: 'Vietnamese' });
      await refetch();
      toast.success('Đã tạo lại ngày thành công!', { id: toastId });
    } catch {
      toast.error('Không thể tạo lại ngày này.', { id: toastId });
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (trip?.status === 'GENERATING') return <GeneratingOverlay />;

  if (isError) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
        <span className="material-symbols-outlined text-6xl text-error">error</span>
        <p className="text-on-surface-variant text-center">{error instanceof Error ? error.message : 'Không thể tải lịch trình.'}</p>
        <div className="flex gap-4">
          <button onClick={() => refetch()} className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-colors cursor-pointer">
            Thử lại
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors cursor-pointer">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const sortedItineraries = [...itineraries].sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f0fdfa] dark:bg-slate-950">
      {/* Hero Header Section */}
      <div className="relative w-full bg-emerald-900 overflow-hidden mb-12">
        {/* Animated Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-emerald-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-teal-400/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

        <header className="relative max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="z-10">
            <nav className="flex items-center gap-2 text-sm text-emerald-200/80 mb-6">
              <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Chuyến đi của tôi</button>
              <span className="material-symbols-outlined text-[10px]">arrow_forward_ios</span>
              <span className="font-semibold text-teal-300">{trip.destination}</span>
            </nav>

            <h1 className="text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-none mb-6">
              {trip.destination}
            </h1>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white">
                <span className="material-symbols-outlined text-teal-400 text-sm">calendar_month</span>
                <span className="text-sm font-semibold">
                  {new Date(trip.startDate).toLocaleDateString('vi-VN')} – {new Date(trip.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${trip.status === 'CONFIRMED'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : trip.status === 'GENERATED'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-white/10 border-white/20 text-white/80'
                }`}>
                {trip.status === 'CONFIRMED' ? 'Đã xác nhận' :
                  trip.status === 'GENERATED' ? 'Đã lên lịch' :
                    trip.status === 'SELECTING_ACTIVITIES' ? 'Đang chọn hoạt động' : 'Đang lập kế hoạch'}
              </div>
            </div>
          </div>

          <div className="flex gap-4 z-10">
            <button
              onClick={handleShareTrip}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 backdrop-blur-md transition-all group"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">share</span>
              Chia sẻ
            </button>
            {trip.userId === user?.id && (
              <button
                id="btn-regenerate"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-emerald-950 font-black rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRegenerating ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">auto_awesome</span>
                )}
                {isRegenerating ? 'Đang tạo...' : 'Tạo lại'}
              </button>
            )}
          </div>
        </header>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Daily Timeline */}
        <div className="lg:col-span-7 space-y-8">
          {sortedItineraries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-emerald-100 dark:border-emerald-900/50 shadow-premium">
              <span className="material-symbols-outlined text-5xl text-emerald-300 mb-4 block">
                {trip.status === 'PLANNING' ? 'edit_calendar' : 'hourglass_empty'}
              </span>
              <p className="text-emerald-900/60 dark:text-emerald-400/60 font-medium text-lg">
                {trip.status === 'PLANNING' 
                  ? 'Chuyến đi này chưa được lên lịch trình chi tiết.'
                  : 'Lịch trình đang được tạo, vui lòng đợi...'}
              </p>
              {trip.status === 'PLANNING' && trip.userId === user?.id && (
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="mt-6 px-8 py-3 bg-emerald-500 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"
                >
                  {isRegenerating ? 'Đang tạo...' : 'Tạo lịch trình ngay'}
                </button>
              )}
            </div>
          ) : (
            sortedItineraries.map((itinerary, idx) => (
              <DaySection
                key={itinerary.id}
                itinerary={itinerary}
                isFirst={idx === 0}
                onAddActivity={handleAddActivity}
                onRegenerateDay={handleRegenerateDay}
                onEditActivity={handleEditActivity}
                onDeleteActivity={handleDeleteActivity}
                onShareActivity={handleShareActivity}
                isOwner={trip.userId === user?.id}
              />
            ))
          )}
        </div>

        {/* Right Column: Stats */}
        <div className="lg:col-span-5 space-y-8">
          {/* Stats Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-premium border border-emerald-100 dark:border-emerald-900/50">
            <h3 className="text-xl font-display font-bold text-emerald-950 dark:text-emerald-50 mb-6">Thông tin chuyến đi</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Quy mô</span>
                <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{itineraries.flatMap(i => i.activities).length} địa điểm</p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest opacity-80">Tổng chi phí dự tính</span>
                <p className="text-3xl font-black mt-1">
                  {formatCurrency(itineraries.reduce((sum, itin) => sum + itin.activities.reduce((s, a) => s + (a.cost || 0), 0), 0))}
                </p>
              </div>
            </div>
          </div>

          {/* AI Suggestion */}
          {trip.userId === user?.id && (
            <div className="bg-emerald-900 rounded-3xl p-8 border border-emerald-800 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <span className="bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Trí tuệ nhân tạo</span>
                <h4 className="text-2xl font-display font-bold text-white mb-3 leading-tight">Bạn muốn tinh chỉnh thêm?</h4>
                <p className="text-emerald-200/70 text-sm mb-8">AI sẵn sàng tạo lại lịch trình hoàn toàn mới dựa trên sở thích của bạn.</p>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="w-full py-4 bg-white text-emerald-900 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-50 transition-all disabled:opacity-70"
                >
                  {isRegenerating ? 'Đang xử lý...' : 'Tạo lại lịch trình ngay'}
                </button>
              </div>
              <span
                className="material-symbols-outlined absolute -right-6 -bottom-6 text-[10rem] text-white/5 rotate-12"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >auto_awesome</span>
            </div>
          )}
        </div>
      </div>

      {/* Edit Activity Modal */}
      <EditActivityModal
        activity={editingActivity}
        itineraryId={currentItineraryId || ''}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveActivity}
      />

      {/* Share Modal */}
      {shareData && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          type={shareData.type}
          refId={shareData.refId}
          title={shareData.title}
          subtitle={shareData.subtitle}
          onSuccess={() => {
            // Optional: Show a toast notification here
            alert('Đã chia sẻ thành công!');
          }}
        />
      )}
    </div>
  );
}
