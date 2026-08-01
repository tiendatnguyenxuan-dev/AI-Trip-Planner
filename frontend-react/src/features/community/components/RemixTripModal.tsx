import React, { useState } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { TEST_USER_ID } from '../../../types/trip';
import type { SharedContentResponse } from '../../../types/trip';

interface RemixTripModalProps {
  sharedContent: SharedContentResponse;
  onClose: () => void;
  onRemixed: (newTripId: string) => void;
}

export const RemixTripModal: React.FC<RemixTripModalProps> = ({
  sharedContent,
  onClose,
  onRemixed
}) => {
  const [prompt, setPrompt] = useState(`Tùy chỉnh lịch trình từ ${sharedContent.user?.name || 'cộng đồng'} cho 2 người, phong cách trải nghiệm chill.`);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRemix = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const createRes = await axios.post(
        'http://localhost:8081/api/v1/trips',
        {
          userId: TEST_USER_ID,
          title: `Bản nháp: ${sharedContent.description || 'Chuyến đi cộng đồng'}`,
          destination: 'Đà Lạt',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          budget: sharedContent.cost || 5000000
        },
        { headers: authHeader }
      );

      const newTripId = createRes.data.id;

      await axios.post(
        'http://localhost:8081/api/v1/chat',
        {
          tripId: newTripId,
          prompt: prompt,
          modificationScope: 'GENERAL'
        },
        { headers: authHeader }
      );

      onRemixed(newTripId);
      onClose();
    } catch (err) {
      console.error('Error remixing community trip:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Tái sử dụng & Tùy chỉnh bằng AI</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mb-1">
              Chuyến đi gốc từ {sharedContent.user?.name || 'Thành viên cộng đồng'}
            </span>
            <p className="text-slate-200 font-medium leading-snug">{sharedContent.description || 'Chuyến đi cộng đồng hấp dẫn'}</p>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Yêu cầu cá nhân hóa cho AI (Prompt):
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="VD: Giữ nguyên địa điểm ngày 1, thay đổi ngày 2 cho phù hợp ngân sách 3tr..."
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition"
            >
              Hủy
            </button>
            <button
              onClick={handleRemix}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold rounded-xl transition shadow-lg"
            >
              {isProcessing ? 'AI Đang tạo bản nháp...' : 'Tạo & Chỉnh sửa bằng AI'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
