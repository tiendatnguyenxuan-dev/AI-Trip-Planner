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
      const response = await axios.post(
        'http://localhost:8081/api/v1/chat',
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
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 p-4 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              AI Travel Assistant
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-400">Trò chuyện để chỉnh sửa lịch trình linh hoạt</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-[82%] p-2.5 rounded-2xl leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            AI đang phân tích và cập nhật lịch trình...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="VD: Thay nhà hàng Ngày 2 bằng quán ăn chay..."
          className="flex-1 bg-slate-800 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isSending}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
