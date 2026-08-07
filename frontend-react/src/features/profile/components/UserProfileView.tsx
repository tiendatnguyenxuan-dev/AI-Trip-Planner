import React from 'react';
import { Compass, Award, Bookmark, Heart } from 'lucide-react';
import type { SharedContentResponse, TripResponse } from '../../../types/trip';

interface UserProfileViewProps {
  userEmail?: string;
  userName?: string;
  publishedTrips?: SharedContentResponse[];
  savedTrips?: TripResponse[];
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userEmail = 'user@gmail.com',
  userName = 'Test User',
  publishedTrips = [],
  savedTrips = []
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-slate-100">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-indigo-500/20">
          {userName.charAt(0)}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-xl font-bold text-white">{userName}</h2>
          <p className="text-xs text-slate-400">{userEmail}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> FluidConcierge Explorer
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-lg font-bold text-indigo-400">{savedTrips.length || 3}</div>
            <div className="text-[10px] text-slate-400">Chuyến đi đã tạo</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-400">{publishedTrips.length || 1}</div>
            <div className="text-[10px] text-slate-400">Đã xuất bản</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-400">4.9</div>
            <div className="text-[10px] text-slate-400">Đánh giá trung bình</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          Hành trình của tôi
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" /> Bản nháp & Lịch trình AI
            </h4>
            <p className="text-xs text-slate-400">Đà Lạt 3 ngày 2 đêm - Đang chỉnh sửa bằng AI</p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Đã xuất bản lên Cộng đồng
            </h4>
            <p className="text-xs text-slate-400">Hành trình Đà Lạt săn mây & cafe góc chill</p>
          </div>
        </div>
      </div>
    </div>
  );
};
