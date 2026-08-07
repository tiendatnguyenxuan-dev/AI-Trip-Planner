import { useState, useEffect } from 'react';
import { activityApi } from '../services/api';
import type { ActivityResponse, ActivityRequest, ActivityUpdateRequest } from '../types/trip';

interface EditActivityModalProps {
  activity: ActivityResponse | null;
  itineraryId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ActivityResponse) => void;
}

export default function EditActivityModal({ activity, itineraryId, isOpen, onClose, onSave }: EditActivityModalProps) {
  const isEditMode = activity !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [cost, setCost] = useState(0);
  const [activityOrder, setActivityOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setDescription(activity.description || '');
      setLocation(activity.location || '');
      setStartTime(activity.startTime ? activity.startTime.substring(0, 5) : '09:00');
      setEndTime(activity.endTime ? activity.endTime.substring(0, 5) : '10:00');
      setCost(activity.cost);
      setActivityOrder(activity.activityOrder);
    } else {
      setName('');
      setDescription('');
      setLocation('');
      setStartTime('09:00');
      setEndTime('10:00');
      setCost(0);
      setActivityOrder(1);
    }
    setError(null);
  }, [activity, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Tên hoạt động không được để trống');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let result: ActivityResponse;

      if (isEditMode) {
        const updateData: ActivityUpdateRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startTime: startTime + ':00',
          endTime: endTime + ':00',
          cost,
          activityOrder,
        };
        result = await activityApi.update(itineraryId, activity.id, updateData);
      } else {
        const createData: ActivityRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startTime: startTime + ':00',
          endTime: endTime + ':00',
          cost,
          activityOrder,
        };
        result = await activityApi.create(itineraryId, createData);
      }

      onSave(result);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể lưu hoạt động. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/10 px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-on-surface">
            {isEditMode ? 'Chỉnh sửa hoạt động' : 'Thêm hoạt động mới'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container-high rounded-full transition-all"
          >
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-error-container/20 border border-error/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
              <span className="material-symbols-outlined text-error">error</span>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface pl-1">
              Tên hoạt động <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="vd. Tham quan Chợ Đà Lạt"
              className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface pl-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết về hoạt động..."
              className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60 outline-none min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface pl-1">Địa điểm</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="vd. 123 Đường Nguyễn Văn A, Đà Lạt"
              className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface pl-1">
                Giờ bắt đầu <span className="text-error">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface pl-1">
                Giờ kết thúc <span className="text-error">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface pl-1">Chi phí (VNĐ)</label>
              <input
                type="number"
                value={cost === 0 ? '' : cost}
                onChange={(e) => setCost(Number(e.target.value))}
                min="0"
                placeholder="0"
                className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface pl-1">Thứ tự</label>
              <input
                type="number"
                value={activityOrder}
                onChange={(e) => setActivityOrder(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-3 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 bg-surface-container-high text-on-surface font-semibold rounded-full hover:bg-surface-container-highest transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check</span>
                  {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}