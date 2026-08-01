import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tripApi, itineraryApi } from '../services/api';
import type { ActivityResponse } from '../types/trip';
import LoadingSkeleton from '../components/itinerary/LoadingSkeleton';
import GeneratingOverlay from '../components/itinerary/GeneratingOverlay';

// Phase 6 Feature imports
import { InteractiveMap } from '../features/planner/components/InteractiveMap';
import { SyncTimelineView } from '../features/planner/components/SyncTimelineView';
import { ConversationalChatPanel } from '../features/planner/components/ConversationalChatPanel';
import { PlacePreviewCard } from '../features/planner/components/PlacePreviewCard';
import { PublishTripModal } from '../features/community/components/PublishTripModal';
import { Compass, Share2 } from 'lucide-react';

export default function Itinerary() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Active Phase 6 State
  const [activeDay, setActiveDay] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<ActivityResponse | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

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

  if (loading) return <LoadingSkeleton />;
  if (trip?.status === 'GENERATING') return <GeneratingOverlay />;

  if (isError || !trip) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6 text-white">
        <span className="material-symbols-outlined text-6xl text-rose-500">error</span>
        <p className="text-slate-300 text-center">{error instanceof Error ? error.message : 'Không thể tải lịch trình.'}</p>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold">
          Về trang chủ
        </button>
      </div>
    );
  }

  const sortedItineraries = [...itineraries].sort((a, b) => a.dayNumber - b.dayNumber);
  const currentItinerary = sortedItineraries.find((i) => i.dayNumber === activeDay) || sortedItineraries[0];
  const activeActivities = currentItinerary?.activities || [];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
            <Compass className="w-4 h-4" />
            Phase 6 Interactive Experience • {trip.destination}
          </div>
          <h1 className="text-2xl font-black text-white">{trip.title || `Hành trình ${trip.destination}`}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ lên Cộng đồng
          </button>
        </div>
      </header>

      {/* Main Interactive Map & Synchronized Layout */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Interactive Leaflet Map (6 cols) */}
        <div className="lg:col-span-6 h-[500px] lg:h-full relative">
          <InteractiveMap
            activities={activeActivities}
            selectedActivityId={selectedActivity?.id || null}
            onSelectActivity={(act) => setSelectedActivity(act)}
            destinationName={trip.destination}
          />

          {/* Rich Place Preview Card Overlay */}
          <PlacePreviewCard
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        </div>

        {/* Middle Column: Synchronized Timeline View (3 cols) */}
        <div className="lg:col-span-3 h-[500px] lg:h-full">
          <SyncTimelineView
            itineraries={sortedItineraries}
            activeDay={activeDay}
            onSelectDay={(dayNum) => {
              setActiveDay(dayNum);
              setSelectedActivity(null);
            }}
            selectedActivityId={selectedActivity?.id || null}
            onSelectActivity={(act) => setSelectedActivity(act)}
          />
        </div>

        {/* Right Column: Conversational AI Planning Panel (3 cols) */}
        <div className="lg:col-span-3 h-[500px] lg:h-full">
          <ConversationalChatPanel
            tripId={trip.id}
            onTripUpdated={() => {
              refetch();
              toast.success('Đã cập nhật bản đồ và lịch trình!');
            }}
          />
        </div>
      </main>

      {/* Publish Trip Modal */}
      {isPublishModalOpen && (
        <PublishTripModal
          trip={trip}
          onClose={() => setIsPublishModalOpen(false)}
          onSuccess={() => toast.success('Đã xuất bản lịch trình lên Cộng đồng!')}
        />
      )}
    </div>
  );
}
