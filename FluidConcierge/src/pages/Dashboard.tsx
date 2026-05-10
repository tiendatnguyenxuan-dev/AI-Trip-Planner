import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../services/api';
import type { TripResponse } from '../types/trip';
import { useAuth } from '../context/AuthContext';

const STATUS_LABELS: Record<string, string> = {
  PLANNING:   'Đang lên kế hoạch',
  GENERATED:  'Đã tạo',
  CONFIRMED:  'Đã xác nhận',
};

const STATUS_CLASS: Record<string, string> = {
  PLANNING:   'bg-primary/10 text-primary',
  GENERATED:  'bg-cta/10 text-cta',
  CONFIRMED:  'bg-primary text-white',
};

const DESTINATION_IMAGES: Record<string, string> = {
  'hội an': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hoi_An_Covered_Bridge.jpg/640px-Hoi_An_Covered_Bridge.jpg',
  'đà lạt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Da_Lat_panorama.jpg/640px-Da_Lat_panorama.jpg',
  'phú quốc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Phu_Quoc_island.jpg/640px-Phu_Quoc_island.jpg',
  'hạ long': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ha_Long_Bay_Junk_Boat.jpg/640px-Ha_Long_Bay_Junk_Boat.jpg',
  'đà nẵng': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Da_Nang_City.jpg/640px-Da_Nang_City.jpg',
};

function getImageForDestination(destination: string): string {
  const lower = destination.toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return `https://lh3.googleusercontent.com/aida-public/AB6AXuBkF-Z9gpc6o79QSRGm32SxyoZBR7JyAbmNWxoTWjCJ1fTz5KVKLRb14R2QA63E3vn1ZYWQdSDmLrYkuewfIVcLNaeMgZ3QaQsEjwT_8sincE_c-7hdsP-qRFb_5CagNcDg8ttX72r-91tertmOLxucSUsyjSaA3nkY-s4jAbdct5jpZLIqLTfdHbxICREIKgzFoevx_2EUIAPHsOe7NapW2-2j6j0si1MNiuB28eDZdWM6LRemZfI-U4fDVrhnSWu24LN8Jy6w6hc`;
}



function calcDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  // Reset hours to midnight to compare only dates
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// ── Skeleton loader ─────────────────────────────────────────────────────────

function TripCardSkeleton() {
  return (
    <div className="bg-surface rounded-3xl overflow-hidden animate-pulse shadow-md">
      <div className="h-64 bg-primary/5"></div>
      <div className="p-6 space-y-3">
        <div className="h-5 bg-primary/5 rounded w-3/4"></div>
        <div className="h-4 bg-primary/5 rounded w-full"></div>
        <div className="h-4 bg-primary/5 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

import ShareModal from '../components/ShareModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedTripToShare, setSelectedTripToShare] = useState<TripResponse | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    tripApi.getAll(user.id)
      .then(setTrips)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleShareClick = (e: React.MouseEvent, trip: TripResponse) => {
    e.stopPropagation();
    setSelectedTripToShare(trip);
    setShareModalOpen(true);
  };

  return (
    <div className="pt-8 px-8 pb-12 max-w-7xl mx-auto font-sans">
      {/* Hero Section */}
      <section className="relative mb-16 rounded-3xl overflow-hidden min-h-[320px] flex items-center p-12 bg-emerald-950 shadow-xl">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hoi_An_Covered_Bridge.jpg/1280px-Hoi_An_Covered_Bridge.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/70 to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-5xl font-bold text-white mb-4 leading-tight font-display">
            Bạn muốn đi đâu <span className="text-secondary">tiếp theo?</span>
          </h2>
          <p className="text-lg text-emerald-100/80 mb-8 font-sans">
            Sức mạnh AI sẽ giúp bạn lên kế hoạch chuyến đi hoàn hảo. Từ điểm ẩn đến trải nghiệm cao cấp, để chúng tôi lo từng chi tiết.
          </p>
          <button
            id="btn-create-trip"
            onClick={() => navigate('/plan')}
            className="group flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-bold shadow-2xl shadow-primary/30 hover:bg-cta transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Tạo chuyến đi mới
          </button>
        </div>
      </section>

      {/* View Toggles */}
      <div className="flex justify-between items-center mb-12">
        <h3 className="text-2xl font-bold text-text font-display">Chuyến đi của bạn</h3>
        <div className="bg-primary/5 p-1 rounded-full flex gap-1 border border-primary/10">
          <button className="p-2 bg-white dark:bg-slate-700 text-primary rounded-full shadow-sm cursor-pointer">
            <span className="material-symbols-outlined text-sm">grid_view</span>
          </button>
          <button className="p-2 text-text-muted hover:text-text transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
          </button>
          <button className="p-2 text-text-muted hover:text-text transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">map</span>
          </button>
        </div>
      </div>

      {/* Trip Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <TripCardSkeleton key={i} />)
        ) : (
          <>
            {trips.map(trip => (
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
          onClick={() => navigate('/plan')}
          className="group border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center p-8 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer h-full min-h-[400px]"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
            <span className="material-symbols-outlined text-3xl">add_circle</span>
          </div>
          <h4 className="text-xl font-bold text-text mb-2 font-display">Lên kế hoạch mới</h4>
          <p className="text-sm text-text-muted text-center max-w-[200px] font-sans">Chia sẻ ước mơ của bạn và AI sẽ lên lộ trình hoàn hảo.</p>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/plan')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-cta text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
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
