import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { communityApi } from '../services/api';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ACTIVITY' | 'TRIP' | 'EXPLORE_ITEM';
  refId: string;
  title: string;
  subtitle?: string;
  onSuccess: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  type,
  refId,
  title,
  subtitle,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [tip, setTip] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let contentObj;
      if (type === 'ACTIVITY') {
        contentObj = { description, tip };
      } else if (type === 'EXPLORE_ITEM') {
        contentObj = { description, tip, specificLocation }; // Add specific location
      } else {
        contentObj = { description, tip: '' };
      }
        
      await communityApi.shareContent({
        type,
        refId,
        rating,
        description: description,
        content: JSON.stringify(contentObj)
      }, image || undefined);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to share:', error);
      const errorMessage = error.response?.data?.message || 'Chia sẻ thất bại, vui lòng thử lại!';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4 sm:p-6"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col border border-emerald-100 max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 px-8 py-6 border-b border-emerald-100/50 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-emerald-500 text-3xl">
                    {type === 'ACTIVITY' ? 'local_activity' : type === 'EXPLORE_ITEM' ? 'explore' : 'flight_takeoff'}
                  </span>
                  <h2 className="text-2xl font-black text-emerald-950 font-display">
                    {type === 'ACTIVITY' ? 'Chia sẻ Trải nghiệm' : type === 'EXPLORE_ITEM' ? 'Đánh giá Địa điểm' : 'Chia sẻ Chuyến đi'}
                  </h2>
                </div>
                <p className="text-emerald-800 font-medium">{title}</p>
                {subtitle && <p className="text-emerald-600/70 text-sm mt-1">{subtitle}</p>}
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-3">Đánh giá của bạn</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                      >
                        <span 
                          className={`material-symbols-outlined text-4xl ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                          style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {type === 'EXPLORE_ITEM' && (
                  <div>
                    <label className="block text-sm font-bold text-emerald-900 mb-2">Bạn đã trải nghiệm ở đâu? (Tùy chọn)</label>
                    <input
                      type="text"
                      value={specificLocation}
                      onChange={(e) => setSpecificLocation(e.target.value)}
                      placeholder="VD: Quán bún chả Hương Liên, Phố đi bộ..."
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-emerald-950 placeholder:text-emerald-900/30 bg-emerald-50/30"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    {type === 'ACTIVITY' ? 'Cảm nhận nhanh' : type === 'EXPLORE_ITEM' ? 'Đánh giá chi tiết' : 'Mô tả chuyến đi'}
                  </label>
                  <textarea
                    required
                    rows={type === 'TRIP' ? 4 : 2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={type === 'TRIP' ? "Chuyến đi 3 ngày 2 đêm cực chill..." : "Tuyệt vời, món ăn rất ngon..."}
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-emerald-950 placeholder:text-emerald-900/30 resize-none bg-emerald-50/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">Ảnh (Tùy chọn)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 border-2 border-dashed border-emerald-200 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all">
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      {imagePreview ? (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium">Đổi ảnh khác</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-emerald-600/70">
                          <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                          <span className="text-sm font-medium">Nhấn để tải ảnh lên</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {(type === 'ACTIVITY' || type === 'EXPLORE_ITEM') && (
                  <div>
                    <label className="block text-sm font-bold text-emerald-900 mb-2">Tips / Kinh nghiệm bỏ túi (Tùy chọn)</label>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      placeholder="Nên đi vào lúc 5h chiều để ngắm hoàng hôn..."
                      className="w-full px-4 py-3 rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-emerald-950 placeholder:text-emerald-900/30 bg-emerald-50/30"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-emerald-50">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Chia sẻ ngay
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
