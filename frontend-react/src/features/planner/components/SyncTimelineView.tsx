import React from 'react';
import type { ActivityResponse, ItineraryResponse } from '../../../types/trip';
import { MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react';

interface SyncTimelineViewProps {
  itineraries: ItineraryResponse[];
  activeDay: number;
  onSelectDay: (dayNumber: number) => void;
  selectedActivityId: string | null;
  onSelectActivity: (activity: ActivityResponse) => void;
}

export const SyncTimelineView: React.FC<SyncTimelineViewProps> = ({
  itineraries,
  activeDay,
  onSelectDay,
  selectedActivityId,
  onSelectActivity
}) => {
  const currentItin = itineraries.find((i) => i.dayNumber === activeDay) || itineraries[0];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 shadow-xl">
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-800 scrollbar-none">
        {itineraries.map((itin) => {
          const isActive = itin.dayNumber === activeDay;
          return (
            <button
              key={itin.id || itin.dayNumber}
              onClick={() => onSelectDay(itin.dayNumber)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Ngày {itin.dayNumber}
            </button>
          );
        })}
      </div>

      {currentItin && (
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/40 mb-4">
          <h4 className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Tóm tắt Ngày {currentItin.dayNumber}
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-snug">
            {currentItin.summary || 'Lịch trình tham quan & trải nghiệm được cá nhân hóa.'}
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {currentItin && currentItin.activities && currentItin.activities.length > 0 ? (
          currentItin.activities.map((act, index) => {
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
          <div className="text-center py-8 text-xs text-slate-400">Chưa có hoạt động nào cho ngày này.</div>
        )}
      </div>
    </div>
  );
};
