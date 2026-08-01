import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import type { TripResponse } from '../../../types/trip';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationalChatPanelProps {
  tripId?: string;
  onTripUpdated?: (updatedTrip: TripResponse, modifiedComponents: string[]) => void;
}

export const ConversationalChatPanel: React.FC<ConversationalChatPanelProps> = ({
  tripId,
  onTripUpdated
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Chào bạn! Tôi là FluidConcierge AI. Bạn có muốn điều chỉnh nhà hàng, địa điểm hoặc ngân sách cho chuyến đi này không?'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

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
      const assistantContent = data.message?.content || 'Đã cập nhật lịch trình theo yêu cầu của bạn.';

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
          content: 'Đã cập nhật một số thông tin lịch trình theo yêu cầu của bạn.'
        }
      ]);
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
            <p className="text-xs text-slate-500 font-medium">Trò chuyện để chỉnh sửa lịch trình linh hoạt</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-600 border border-sky-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[82%] p-3 rounded-2xl leading-relaxed text-sm ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-none shadow-sm font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm font-medium'
                }`}
              >
                {msg.content}
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
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="VD: Thay nhà hàng Ngày 2 bằng quán ăn chay..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm transition"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isSending}
          className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
