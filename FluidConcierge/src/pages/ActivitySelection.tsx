import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tripApi } from '../services/api';
import type { TripResponse, ActivityCandidateResponse } from '../types/trip';

const ActivitySelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [finalizing, setFinalizing] = useState(false);

  const { data, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['activity-selection', id],
    queryFn: async () => {
      if (!id) throw new Error('No trip ID');
      const [tripData, candidateData] = await Promise.all([
        tripApi.getById(id),
        tripApi.getCandidates(id)
      ]);
      return { trip: tripData, candidates: candidateData };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.candidates) {
      const initialSelected = new Set(
        data.candidates.filter(c => c.selected).map(c => c.id)
      );
      setSelectedIds(initialSelected);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      toast.error('Không thể tải dữ liệu hoạt động. Vui lòng thử lại!');
    }
  }, [isError]);

  const trip = data?.trip ?? null;
  const candidates = data?.candidates ?? [];

  const toggleSelection = (candidateId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) next.delete(candidateId);
      else next.add(candidateId);
      return next;
    });
  };

  const handleFinalize = async () => {
    if (!id || selectedIds.size === 0) return;
    setFinalizing(true);
    try {
      await tripApi.finalize(id, Array.from(selectedIds));
      navigate(`/itinerary/${id}`);
    } catch {
      toast.error('Có lỗi xảy ra khi hoàn thiện lịch trình. Thử lại sau nhé!');
    } finally {
      setFinalizing(false);
    }
  };

  const totalCost = candidates
    .filter(c => selectedIds.has(c.id))
    .reduce((sum, c) => sum + c.cost, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="material-symbols-outlined animate-spin text-primary text-5xl">progress_activity</span>
        <p className="text-emerald-900 font-bold animate-pulse">Đang chuẩn bị kho hoạt động...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Header */}
      <div className="pt-24 pb-20 px-6 relative overflow-hidden bg-emerald-950">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[100%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="inline-block px-4 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full backdrop-blur-md">
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Step 2: Selection</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white">Chọn hoạt động bạn thích</h1>
              <p className="text-emerald-100/60 max-w-xl">
                AI đã gợi ý <span className="text-emerald-400 font-bold">{candidates.length} địa điểm</span> thú vị tại {trip?.destination}.
                Hãy chọn những nơi bạn muốn ghé thăm để AI sắp xếp lịch trình tối ưu nhất.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Ngân sách dự kiến</p>
                <p className="text-emerald-400 font-black text-xl">{trip?.budget.toLocaleString()} VND</p>
              </div>
              <div className="w-[1px] h-10 bg-white/10"></div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Đã chọn</p>
                <p className="text-white font-black text-xl">{selectedIds.size} / {candidates.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={async () => {
                if (!id) return;
                const toastId = toast.loading('Đang tạo lại danh sách gợi ý...');
                try {
                  await tripApi.generate(id, { language: 'Vietnamese' });
                  await refetch();
                  setSelectedIds(new Set());
                  toast.success('Tạo lại danh sách gợi ý thành công!', { id: toastId });
                } catch (e) {
                  console.error(e);
                  toast.error('Không thể tạo lại danh sách. Thử lại sau nhé!', { id: toastId });
                }
              }}
              className="flex items-center gap-2 text-emerald-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Tạo lại danh sách gợi ý
            </button>
          </motion.div>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {candidates.map((can, idx) => {
              const isSelected = selectedIds.has(can.id);
              return (
                <motion.div
                  key={can.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`group relative bg-surface rounded-3xl p-6 shadow-premium transition-all border-2 flex flex-col gap-4 ${isSelected ? 'border-primary shadow-emerald scale-[1.02]' : 'border-transparent hover:border-emerald-100'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined">{isSelected ? 'check_circle' : 'explore'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">Ước tính</p>
                      <p className="text-sm font-black text-text">{can.cost.toLocaleString()} VND</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-text line-clamp-1">{can.name}</h3>
                    <p className="text-sm text-text-muted/70 line-clamp-3 leading-relaxed">
                      {can.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-primary/60 mt-auto">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span className="text-xs font-bold truncate">{can.location}</span>
                  </div>

                  <button
                    onClick={() => toggleSelection(can.id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${isSelected
                        ? 'bg-emerald-950 text-white hover:bg-emerald-900'
                        : 'bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110'
                      }`}
                  >
                    {isSelected ? (
                      <>
                        <span className="material-symbols-outlined text-sm">remove_circle</span>
                        Loại bỏ
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        Chọn địa điểm
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl"
          >
            <div className="bg-emerald-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 pl-6">
                <div>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Tổng chi phí</p>
                  <p className="text-emerald-400 font-black text-2xl">
                    {totalCost.toLocaleString()} <span className="text-xs font-bold text-emerald-400/60">VND</span>
                  </p>
                </div>
                <div className="hidden sm:block h-10 w-[1px] bg-white/10"></div>
                <div className="hidden sm:block">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Địa điểm</p>
                  <p className="text-white font-black text-2xl">{selectedIds.size}</p>
                </div>
              </div>

              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="bg-primary text-on-primary px-10 py-4 rounded-full font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {finalizing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang hoàn thiện...
                  </>
                ) : (
                  <>
                    Hoàn thiện lịch trình
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivitySelection;
