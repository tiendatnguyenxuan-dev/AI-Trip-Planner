import React from 'react';
import type { ActivityResponse, ItineraryResponse } from '../../../types/trip';
import { MapPin, Sparkles, Navigation } from 'lucide-react';

interface SyncTimelineViewProps {
  itineraries: ItineraryResponse[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: ActivityResponse) => void;
}

export const SyncTimelineView: React.FC<SyncTimelineViewProps> = ({
  itineraries,
  selectedActivityId,
  onSelectActivity
}) => {
  // Flatten all activities across itineraries so user can order/view planned places directly
  const allActivities = itineraries.flatMap((itin) => itin.activities || []);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-emerald-400" />
          Danh sách địa điểm đã lên kế hoạch ({allActivities.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {allActivities.length > 0 ? (
          allActivities.map((act, index) => {
            const isSelected = act.id === selectedActivityId;
            return (
              <div
                key={act.id || index}
                onClick={() => onSelectActivity(act)}
                className={`relative flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all transform ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md scale-[1.01]'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-500 text-white ring-2 ring-indigo-300' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-white truncate">{act.name}</h5>
                    {act.startTime && (
                      <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md font-mono shrink-0">
                        {act.startTime}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{act.description}</p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {act.location || 'Địa điểm'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">Chưa có địa điểm nào trong kế hoạch.</div>
        )}
      </div>
    </div>
  );
};
