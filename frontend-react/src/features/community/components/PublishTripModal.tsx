import React, { useState } from 'react';
import { X, Share2, Star, Sparkles } from 'lucide-react';
import axios from 'axios';
import type { TripResponse } from '../../../types/trip';

interface PublishTripModalProps {
  trip: TripResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export const PublishTripModal: React.FC<PublishTripModalProps> = ({ trip, onClose, onSuccess }) => {
  const [description, setDescription] = useState(`Chuyến đi ${trip.destination} ${trip.title || ''} tuyệt vời cùng lịch trình tối ưu!`);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';
      const formData = new FormData();
      formData.append('type', 'TRIP');
      formData.append('refId', trip.id);
      formData.append('content', JSON.stringify({ title: trip.title, destination: trip.destination }));
      formData.append('description', description);
      formData.append('rating', rating.toString());
      formData.append('cost', (trip.budget || 5000000).toString());
      formData.append('duration', (trip.itineraries ? trip.itineraries.length : 3).toString());

      await axios.post(`${apiBaseUrl}/community/share`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to publish trip:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Chia sẻ Lịch trình lên Cộng đồng</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePublish} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Chuyến đi:</label>
            <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-semibold text-indigo-300">
              {trip.title || `Chuyến đi ${trip.destination}`}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Đánh giá trải nghiệm:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Kinh nghiệm & Bí quyết du lịch:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="Chia sẻ mẹo ăn uống, điểm chụp ảnh đẹp hoặc lưu ý cho chuyến đi..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting ? 'Đang xuất bản...' : 'Xuất bản ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
