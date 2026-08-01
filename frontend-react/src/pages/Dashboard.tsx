import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tripApi } from '../services/api';
import type { TripResponse } from '../types/trip';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import { STATUS_LABELS, STATUS_CLASS } from '../constants';
import { calcDays } from '../utils/date';
import { getImageForDestination } from '../utils/helper';

import TripCardSkeleton from '../components/dashboard/TripCardSkeleton';

// ── Main component ──────────────────────────────────────────────────────────

import { TEST_USER_ID } from '../types/trip';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTripToShare, setSelectedTripToShare] = useState<TripResponse | null>(null);

  const currentUserId = user?.id || TEST_USER_ID;

  const { data: trips = [], isLoading: loading, isError, error } = useQuery({
    queryKey: ['trips', currentUserId],
    queryFn: () => tripApi.getAll(currentUserId),
    enabled: true,
  });

  // Display all trips created by current or guest user
  const plannedTrips = trips;

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message || 'Không thể tải dữ liệu chuyến đi. Vui lòng thử lại!');
    }
  }, [isError, error]);

  const handleShareClick = (e: React.MouseEvent, trip: TripResponse) => {
    e.stopPropagation();
    setSelectedTripToShare(trip);
    setShareModalOpen(true);
  };

  return (
    <div className="pt-8 px-4 md:px-8 pb-12 max-w-7xl mx-auto font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-display">Chuyến đi của tôi</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý và xem lại tất cả các lịch trình du lịch đã tạo</p>
        </div>
      </div>

      {/* Trip Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <TripCardSkeleton key={i} />)
        ) : (
          <>
            {plannedTrips.map(trip => (
              <div
                key={trip.id}
                onClick={() => navigate(`/itinerary/${trip.id}`)}
                className="group bg-surface rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer border border-primary/5 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageForDestination(trip.destination)}
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={e => { (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="%23e0e0e0"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="%23757575" text-anchor="middle" dominant-baseline="middle">${trip.destination}</text></svg>`)}`; }}
                  />
                  <div className={`absolute top-4 right-4 ${STATUS_CLASS[trip.status] ?? STATUS_CLASS.PLANNING} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                    {STATUS_LABELS[trip.status] ?? trip.status}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-text font-display line-clamp-1 group-hover:text-primary transition-colors pr-2">{trip.title}</h4>
                    {(trip.status === 'CONFIRMED' || trip.status === 'GENERATED') && (
                      <button
                        onClick={(e) => handleShareClick(e, trip)}
                        className="p-1.5 bg-emerald-100/50 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-full transition-all flex-shrink-0"
                        title="Chia sẻ chuyến đi này"
                      >
                        <span className="material-symbols-outlined text-sm">share</span>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mb-6 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {trip.destination}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-primary/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">Ngân sách</span>
                      <span className="text-sm font-bold text-text">
                        {trip.totalCost > 0
                          ? new Intl.NumberFormat('vi-VN').format(trip.totalCost)
                          : new Intl.NumberFormat('vi-VN').format(trip.budget)
                        } <span className="text-[10px]">VND</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">Thời gian</span>
                      <div className="flex items-center gap-1 text-sm font-bold text-text">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {Math.round(calcDays(trip.startDate, trip.endDate))} ngày
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Add New Trip Skeleton */}
        <div
          onClick={() => navigate('/')}
          className="group border-2 border-dashed border-sky-200 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-sky-50/50 hover:border-sky-400 transition-all cursor-pointer h-full min-h-[350px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-3xl">add</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1 font-display">Tạo chuyến đi mới</h4>
          <p className="text-xs text-slate-500 text-center max-w-[200px] font-sans">Khám phá địa điểm & trò chuyện với trợ lý Bot Chat AI.</p>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
        title="Tạo chuyến đi mới"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </button>

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
            alert('Chia sẻ thành công!');
          }}
        />
      )}
    </div>
  );
}
