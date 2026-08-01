import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShareExperience } from '../hooks/useShareExperience';

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
  const {
    rating,
    setRating,
    description,
    setDescription,
    tip,
    setTip,
    specificLocation,
    setSpecificLocation,
    loading,
    previews,
    handleImageChange,
    removeImage,
    submitShare
  } = useShareExperience({ type, refId, onSuccess, onClose });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitShare();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSuccess();
      onClose();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-none">Chia sẻ trải nghiệm</h2>
                {subtitle && <p className="text-emerald-600/70 text-sm mt-1">{subtitle}</p>}
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 relative">
                {isSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-20 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-4xl text-emerald-600 animate-bounce">check_circle</span>
                    </div>
                    <h3 className="text-2xl font-black text-emerald-950 mb-2">Đã gửi yêu cầu!</h3>
                    <p className="text-emerald-800 font-medium leading-relaxed">
                      Cảm ơn bạn đã chia sẻ trải nghiệm! <br/>
                      Bài viết của bạn đang được **kiểm duyệt** để đảm bảo an toàn cộng đồng. 
                      Vui lòng chờ nhé!
                    </p>
                  </motion.div>
                )}


                {type === 'EXPLORE_ITEM' && (
                  <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-emerald-600">location_on</span>
                      <span className="text-emerald-900 font-bold">Địa điểm: {title}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Đánh giá của bạn</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          rating >= star ? 'bg-yellow-400 text-white' : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `'FILL' ${rating >= star ? 1 : 0}` }}>star</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Cảm nhận</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bạn thấy chuyến đi này thế nào? Có gì thú vị không?"
                    className="w-full bg-slate-50 border-none rounded-3xl p-5 min-h-[120px] focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Mẹo nhỏ (Tip)</label>
                    <input
                      type="text"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      placeholder="VD: Nên đi buổi sáng..."
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 font-medium"
                    />
                  </div>
                  {type === 'EXPLORE_ITEM' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Vị trí cụ thể</label>
                      <input
                        type="text"
                        value={specificLocation}
                        onChange={(e) => setSpecificLocation(e.target.value)}
                        placeholder="VD: Tầng 2, cổng sau..."
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1 uppercase tracking-wider">Hình ảnh (Tùy chọn)</label>
                  <div className="flex flex-wrap gap-3">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden group">
                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 bg-red-500/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all text-slate-400 hover:text-emerald-600">
                      <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                      <span className="text-[10px] font-bold mt-1 uppercase">Thêm ảnh</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 rounded-3xl font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest text-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white py-4 rounded-3xl font-black shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">send</span>
                        Chia sẻ ngay
                      </>
                    )}
                  </button>
                </div>
              </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
