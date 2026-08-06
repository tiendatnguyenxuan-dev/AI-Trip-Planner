import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { TripResponse } from '../../../types/trip';
import { tripApi, itineraryApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { AuthModal } from '../../../components/auth/AuthModal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCompleted?: boolean;
  createdTripId?: string;
  tripDraftData?: any;
}

interface ConversationalChatPanelProps {
  tripId?: string;
  onTripUpdated?: (updatedTrip: TripResponse, modifiedComponents: string[]) => void;
  onDestinationChanged?: (destName: string) => void;
}

export const ConversationalChatPanel: React.FC<ConversationalChatPanelProps> = ({
  tripId,
  onTripUpdated,
  onDestinationChanged
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ path: string; msg?: Message } | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Chào bạn! Tôi là TienDat. Bạn đang muốn đi du lịch ở đâu tiếp theo?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const saveTripToDatabase = async (msg: Message, targetUserId: string) => {
    if (!msg.tripDraftData) return msg.createdTripId;

    try {
      const draft = msg.tripDraftData.trip_draft || {};
      const itinerary = msg.tripDraftData.itinerary || {};
      const dest = draft.destination?.value || 'Điểm đến mới';
      const duration = draft.duration_days?.value || 3;
      const budget = draft.budget?.value || 5000000;

      const createdTrip = await tripApi.create({
        userId: targetUserId,
        title: `Lịch trình AI: ${dest} (${duration} ngày)`,
        destination: dest,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + duration * 86400000).toISOString().split('T')[0],
        budget
      });

      if (createdTrip?.id) {
        const rawDays: Array<{ day: number; activities: string[] }> = itinerary.days || [];
        if (rawDays.length > 0) {
          const importDays = rawDays.map((d) => ({
            dayNumber: d.day,
            summary: `Ngày ${d.day} tại ${dest}`,
            activities: (d.activities || []).map((actText: string, idx: number) => ({
              name: actText.replace(/^(Morning|Afternoon|Evening|Lunch|Dinner):\s*/i, '').trim(),
              description: actText,
              location: dest,
              startTime: ['08:00', '10:00', '12:00', '14:00', '18:00'][idx % 5],
              endTime: ['10:00', '12:00', '13:30', '17:00', '20:00'][idx % 5],
              cost: 0,
            }))
          }));

          try {
            await itineraryApi.importItinerary(createdTrip.id, importDays);
          } catch (importErr) {
            console.warn('Import itinerary error:', importErr);
          }
        }
        return createdTrip.id;
      }
    } catch (err) {
      console.error('Error saving trip for logged in user:', err);
    }
    return msg.createdTripId;
  };

  const handleActionClick = async (targetPath: string, msg: Message) => {
    if (!isAuthenticated) {
      setPendingNavigation({ path: targetPath, msg });
      setIsAuthModalOpen(true);
    } else {
      let finalTripId = msg.createdTripId;
      if (user?.id) {
        finalTripId = await saveTripToDatabase(msg, user.id);
      }
      navigate(targetPath === 'ITINERARY' ? (finalTripId ? `/itinerary/${finalTripId}` : '/my-trips') : '/my-trips');
    }
  };

  const handleAuthSuccess = async () => {
    if (pendingNavigation) {
      const activeUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = activeUser.id;

      if (!userId) {
        toast.error('Không tìm thấy thông tin tài khoản vừa đăng nhập!');
        return;
      }

      let finalTripId = pendingNavigation.msg?.createdTripId;
      if (pendingNavigation.msg) {
        finalTripId = await saveTripToDatabase(pendingNavigation.msg, userId);
      }

      const target = pendingNavigation.path === 'ITINERARY'
        ? (finalTripId ? `/itinerary/${finalTripId}` : '/my-trips')
        : '/my-trips';

      setPendingNavigation(null);
      navigate(target);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const userMsgText = inputPrompt;
    setInputPrompt('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsgText
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const aiServiceUrl = 'http://localhost:8000/ai/conversational-plan';
      const response = await axios.post(aiServiceUrl, {
        session_id: sessionId,
        message: userMsgText
      });

      const data = response.data;
      if (data.session_id) setSessionId(data.session_id);
      if (data.progress !== undefined) setProgress(Math.round(data.progress * 100));

      if (data.trip_draft?.destination?.value && onDestinationChanged) {
        onDestinationChanged(data.trip_draft.destination.value);
      }

      const isCompleted = data.state === 'COMPLETED' || !!data.itinerary;
      const assistantContent = data.message || 'Đã nhận được thông tin của bạn.';
      let createdTripId: string | undefined = undefined;

      if (isCompleted && isAuthenticated && user?.id) {
        try {
          const draft = data.trip_draft || {};
          const dest = draft.destination?.value || 'Điểm đến mới';
          const duration = draft.duration_days?.value || 3;
          const budget = draft.budget?.value || 5000000;

          const createdTrip = await tripApi.create({
            userId: user.id,
            title: `Lịch trình AI: ${dest} (${duration} ngày)`,
            destination: dest,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + duration * 86400000).toISOString().split('T')[0],
            budget
          });

          if (createdTrip?.id) {
            createdTripId = createdTrip.id;
            const rawDays: Array<{ day: number; activities: string[] }> = data.itinerary?.days || [];
            if (rawDays.length > 0) {
              const importDays = rawDays.map((d) => ({
                dayNumber: d.day,
                summary: `Ngày ${d.day} tại ${dest}`,
                activities: (d.activities || []).map((actText: string, idx: number) => ({
                  name: actText.replace(/^(Morning|Afternoon|Evening|Lunch|Dinner):\s*/i, '').trim(),
                  description: actText,
                  location: dest,
                  startTime: ['08:00', '10:00', '12:00', '14:00', '18:00'][idx % 5],
                  endTime:   ['10:00', '12:00', '13:30', '17:00', '20:00'][idx % 5],
                  cost: 0,
                }))
              }));
              await itineraryApi.importItinerary(createdTrip.id, importDays);
            }
          }
        } catch (saveErr) {
          console.warn('Auto-save trip to database error:', saveErr);
        }
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        isCompleted,
        createdTripId,
        tripDraftData: data
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.itinerary && onTripUpdated) {
        onTripUpdated(data.itinerary as any, []);
      }
    } catch (primaryError) {
      console.warn('Phase 5 Conversational AI call failed, falling back to legacy chat API:', primaryError);
      try {
        const token = localStorage.getItem('token');
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api/v1';
        const response = await axios.post(
          `${apiBaseUrl}/chat`,
          {
            tripId: tripId || null,
            prompt: userMsgText,
            modificationScope: 'GENERAL'
          },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );

        const data = response.data;
        const assistantContent = data.message?.content || data.content || 'Đã cập nhật lịch trình theo yêu cầu của bạn.';

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (data.trip && onTripUpdated) {
          onTripUpdated(data.trip, data.modifiedComponents || []);
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại!'
          }
        ]);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-sm text-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center">
            <Bot className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-display">
              AI Travel Assistant
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">Trò chuyện để lên lịch trình linh hoạt</p>
          </div>
        </div>

        {progress > 0 && (
          <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
            <span>Tiến độ: {progress}%</span>
          </div>
        )}
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-600 border border-sky-200'
                  }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[82%] p-3 rounded-2xl leading-relaxed text-sm ${isUser
                    ? 'bg-sky-600 text-white rounded-tr-none shadow-sm font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm font-medium'
                  }`}
              >
                {msg.content}
                {msg.isCompleted && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleActionClick('ITINERARY', msg)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">map</span>
                      Xem Lịch trình chi tiết ngay ➔
                    </button>
                    <button
                      onClick={() => handleActionClick('MY_TRIPS', msg)}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">folder_open</span>
                      Quản lý tại My Trips
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex items-center gap-2 text-slate-500 text-xs italic">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            AI đang phân tích và cập nhật lịch trình...
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="mt-3 relative flex items-center">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="VD: Thay nhà hàng Ngày 2 bằng quán ăn chay..."
          disabled={isSending}
          className="w-full bg-white border border-slate-300/80 rounded-xl py-2.5 pl-4 pr-12 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-xs font-medium transition shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isSending}
          className="absolute right-1.5 p-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-lg transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        title="Đăng nhập để lưu & xem lịch trình"
        subtitle="Vui lòng đăng nhập hoặc tạo tài khoản miễn phí để lưu toàn bộ lịch trình du lịch cá nhân hóa này vào tài khoản của bạn."
      />
    </div>
  );
};
