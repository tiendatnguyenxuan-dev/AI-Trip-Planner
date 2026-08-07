import type { ActivityResponse } from '../../types/trip';
import { CATEGORY_STYLES } from '../../constants';
import { formatTime, formatCurrency } from '../../utils/formatter';

interface ActivityCardProps {
  activity: ActivityResponse;
  onEdit: (activity: ActivityResponse) => void;
  onDelete: (activityId: string) => void;
  onShare: (activity: ActivityResponse) => void;
  isOwner: boolean;
}

export default function ActivityCard({ activity, onEdit, onDelete, onShare, isOwner }: ActivityCardProps) {
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
