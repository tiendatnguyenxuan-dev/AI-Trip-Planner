import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi, itineraryApi, activityApi } from '../services/api';
import type { TripResponse, ItineraryResponse, ActivityResponse } from '../types/trip';
import { useAuth } from '../context/AuthContext';
import EditActivityModal from '../components/EditActivityModal';
import ShareModal from '../components/ShareModal';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  default: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', label: 'Hoạt động' },
  food: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed', label: 'Ẩm thực' },
  sightseeing: { bg: 'bg-primary-fixed', text: 'text-on-primary-fixed', label: 'Tham quan' },
  nature: { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed', label: 'Thiên nhiên' },
};

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  return timeStr.substring(0, 5); // "HH:mm:ss" → "HH:mm"
}

function formatCurrency(amount: number): string {
  if (amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ActivityCard({ activity, onEdit, onDelete, onShare, isOwner }: {
  activity: ActivityResponse;
  onEdit: (activity: ActivityResponse) => void;
  onDelete: (activityId: string) => void;
  onShare: (activity: ActivityResponse) => void;
  isOwner: boolean;
}) {
  const style = CATEGORY_STYLES.default;
  return (
    <div className="relative group">
      <div className="absolute -left-[1.375rem] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-white dark:ring-slate-900"></div>
      <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-lg bg-surface-container-low/30 hover:bg-surface-container-low transition-all">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                {formatTime(activity.startTime)}
                {activity.endTime ? ` – ${formatTime(activity.endTime)}` : ''}
              </span>
              <div className={`${style.bg} px-3 py-1 rounded-full`}>
                <span className={`text-[10px] font-bold ${style.text} uppercase tracking-wider`}>{style.label}</span>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-on-surface mt-1">{activity.name}</h4>
            {activity.description && (
              <p className="text-sm text-on-surface-variant line-clamp-2 mt-1">{activity.description}</p>
            )}
            {activity.location && (
              <p className="text-xs text-outline mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {activity.location}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm font-bold text-on-surface">{formatCurrency(activity.cost)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons below card (show on hover) */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={() => onShare(activity)}
          className="p-2 bg-emerald-500 text-white rounded-lg hover:scale-105 cursor-pointer transition-all shadow-md"
          title="Chia sẻ"
        >
          <span className="material-symbols-outlined text-sm">share</span>
        </button>
        {isOwner && (
          <>
            <button
              onClick={() => onEdit(activity)}
              className="p-2 bg-primary text-white rounded-lg hover:scale-105 cursor-pointer transition-all shadow-md"
              title="Chỉnh sửa"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-2 bg-error text-white rounded-lg hover:scale-105 cursor-pointer transition-all shadow-md"
              title="Xóa"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function DaySection({ itinerary, isFirst, onAddActivity, onRegenerateDay, onEditActivity, onDeleteActivity, onShareActivity, isOwner }: {
  itinerary: ItineraryResponse;
  isFirst: boolean;
  onAddActivity: (itineraryId: string) => void;
  onRegenerateDay: (itineraryId: string) => void;
  onEditActivity: (activity: ActivityResponse) => void;
  onDeleteActivity: (activityId: string, itineraryId: string) => void;
  onShareActivity: (activity: ActivityResponse) => void;
  isOwner: boolean;
}) {
  const [expanded, setExpanded] = useState(isFirst);
  const dayTotal = itinerary.activities.reduce((s, a) => s + (a.cost || 0), 0);

  return (
    <section className={`rounded-xl p-8 shadow-sm ${expanded ? 'bg-surface-container-lowest' : 'bg-surface-container-low border border-outline-variant/10'}`}>
      <button
        className="w-full flex items-center justify-between mb-0 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${expanded ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
            {String(itinerary.dayNumber).padStart(2, '0')}
          </div>
          <div>
            <h3 className={`text-xl font-headline font-semibold ${expanded ? 'text-on-surface' : 'text-on-surface/60'}`}>
              {itinerary.summary || `Ngày ${itinerary.dayNumber}`}
            </h3>
            <p className={`text-sm ${expanded ? 'text-on-surface-variant' : 'text-on-surface-variant/60'}`}>
              {formatDate(itinerary.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!expanded && dayTotal > 0 && (
            <span className="text-sm font-semibold text-on-surface-variant">{formatCurrency(dayTotal)}</span>
          )}
          <span className="material-symbols-outlined text-on-surface-variant">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>

      {expanded && (
        <>
          <div className="relative pl-6 space-y-10 mt-8 before:content-[''] before:absolute before:left-[1.375rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
            {itinerary.activities.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">Chưa có hoạt động nào được lên kế hoạch.</p>
            ) : (
              [...itinerary.activities]
                .sort((a, b) => (a.activityOrder ?? 0) - (b.activityOrder ?? 0))
                .map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={onEditActivity}
                    onDelete={(activityId) => onDeleteActivity(activityId, itinerary.id)}
                    onShare={onShareActivity}
                    isOwner={isOwner}
                  />
                ))
            )}
          </div>

          {isOwner && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onAddActivity(itinerary.id)}
                className="flex-1 py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Thêm hoạt động
              </button>
              <button
                onClick={() => onRegenerateDay(itinerary.id)}
                className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                Tạo lại ngày này
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ── Loading skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="p-8 min-h-[calc(100vh-64px)] animate-pulse">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-10 bg-surface-container-high rounded-xl w-64"></div>
        <div className="h-6 bg-surface-container-high rounded-xl w-96"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface-container-low rounded-xl"></div>
            ))}
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-48 bg-surface-container-low rounded-xl"></div>
            <div className="h-64 bg-surface-container-low rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generating state overlay ────────────────────────────────────────────────

function GeneratingOverlay() {
  return (
    <div className="p-8 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-primary-container border-t-primary animate-spin"></div>
        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-on-surface">AI đang lên kế hoạch...</h2>
        <p className="text-on-surface-variant">Đang phân tích điểm đến và tạo lịch trình tối ưu</p>
      </div>
      <div className="flex gap-2">
        {['Nghiên cứu địa điểm', 'Tối ưu lộ trình', 'Tính toán ngân sách'].map((step, i) => (
          <span key={i} className="text-xs bg-surface-container px-3 py-1 rounded-full text-on-surface-variant animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function Itinerary() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!tripId) return;
    let interval: ReturnType<typeof setInterval>;

    const fetchData = async () => {
      try {
        const [tripData, itineraryData] = await Promise.all([
          tripApi.getById(tripId),
          itineraryApi.getByTrip(tripId),
        ]);
        setTrip(tripData);
        setItineraries(itineraryData);

        // Redirect to selection if status is SELECTING_ACTIVITIES
        if (tripData.status === 'SELECTING_ACTIVITIES') {
          navigate(`/selection/${tripId}`);
          return;
        }

        // Poll while still GENERATING
        if (tripData.status === 'GENERATING') {
          interval = setInterval(async () => {
            const refreshed = await tripApi.getById(tripId);
            setTrip(refreshed);
            if (refreshed.status === 'SELECTING_ACTIVITIES') {
              clearInterval(interval);
              navigate(`/selection/${tripId}`);
            } else if (refreshed.status !== 'GENERATING') {
              clearInterval(interval);
              const freshItineraries = await itineraryApi.getByTrip(tripId);
              setItineraries(freshItineraries);
            }
          }, 3000);
        }
      } catch {
        setError('Không thể tải dữ liệu lịch trình. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => clearInterval(interval);
  }, [tripId]);

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

  const handleRegenerate = async () => {
    if (!tripId) return;
    setIsRegenerating(true);
    try {
      await tripApi.regenerate(tripId, { feedback: 'Vui lòng tạo lại lịch trình với gợi ý mới.', language: 'Vietnamese' });
      const freshItineraries = await itineraryApi.getByTrip(tripId);
      setItineraries(freshItineraries);
    } catch {
      setError('Không thể tạo lại lịch trình.');
    } finally {
      setIsRegenerating(false);
    }
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
    try {
      await activityApi.delete(itineraryId, activityId);
      const freshItineraries = await itineraryApi.getByTrip(tripId!);
      setItineraries(freshItineraries);
    } catch {
      setError('Không thể xóa hoạt động.');
    }
  };

  const handleSaveActivity = async () => {
    if (!tripId) return;
    const freshItineraries = await itineraryApi.getByTrip(tripId);
    setItineraries(freshItineraries);
    setIsEditModalOpen(false);
  };

  const handleRegenerateDay = async (itineraryId: string) => {
    if (!confirm('Tạo lại ngày này? Các hoạt động hiện tại sẽ bị thay thế.')) return;
    if (!tripId) return;
    try {
      await itineraryApi.regenerateDay(tripId, itineraryId, { language: 'Vietnamese' });
      const freshItineraries = await itineraryApi.getByTrip(tripId);
      setItineraries(freshItineraries);
    } catch {
      setError('Không thể tạo lại ngày này.');
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (trip?.status === 'GENERATING') return <GeneratingOverlay />;

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
        <span className="material-symbols-outlined text-6xl text-error">error</span>
        <p className="text-on-surface-variant text-center">{error}</p>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-colors">
            Thử lại
          </button>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors">
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
