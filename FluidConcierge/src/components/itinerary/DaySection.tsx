import { useState } from 'react';
import type { ItineraryResponse, ActivityResponse } from '../../types/trip';
import { formatCurrency, formatDate } from '../../utils/formatter';
import ActivityCard from './ActivityCard';

interface DaySectionProps {
  itinerary: ItineraryResponse;
  isFirst: boolean;
  onAddActivity: (itineraryId: string) => void;
  onRegenerateDay: (itineraryId: string) => void;
  onEditActivity: (activity: ActivityResponse) => void;
  onDeleteActivity: (activityId: string, itineraryId: string) => void;
  onShareActivity: (activity: ActivityResponse) => void;
  isOwner: boolean;
}

export default function DaySection({
  itinerary,
  isFirst,
  onAddActivity,
  onRegenerateDay,
  onEditActivity,
  onDeleteActivity,
  onShareActivity,
  isOwner,
}: DaySectionProps) {
  const [expanded, setExpanded] = useState(isFirst);
  const dayTotal = itinerary.activities.reduce((s, a) => s + (a.cost || 0), 0);

  return (
    <section
      className={`rounded-xl p-8 shadow-sm ${
        expanded ? 'bg-surface-container-lowest' : 'bg-surface-container-low border border-outline-variant/10'
      }`}
    >
      <button
        className="w-full flex items-center justify-between mb-0 text-left cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
              expanded ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
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
                    onDelete={activityId => onDeleteActivity(activityId, itinerary.id)}
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
                className="flex-1 py-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-semibold hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined">add</span>
                Thêm hoạt động
              </button>
              <button
                onClick={() => onRegenerateDay(itinerary.id)}
                className="px-6 py-3 bg-secondary text-white rounded-xl font-semibold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
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
