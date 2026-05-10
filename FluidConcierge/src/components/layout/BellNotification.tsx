import { useEffect, useState, useRef } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { NotificationPayload } from '../../types/websocket';

export const BellNotification = () => {
  const { isConnected, subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected) {
      console.log('[WebSocket] Subscribing to /user/queue/notifications');
      const subscription = subscribe(`/user/queue/notifications`, (payload: NotificationPayload) => {
        console.log('[WebSocket] Private Notification Received:', payload);
        
        // Add to list (at the top)
        setNotifications((prev) => [payload, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Trigger visible toast
        toast.success(payload.message, {
          icon: '❤️',
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#10B981',
            color: '#fff',
            fontWeight: 'bold'
          },
        });

        // Trigger Bell Animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [isConnected, subscribe]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Mark as read when opening
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Trigger */}
      <div 
        className="relative inline-flex items-center justify-center p-2 cursor-pointer group"
        onClick={togglePanel}
      >
        <motion.div
          animate={isAnimating ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Bell className={`w-6 h-6 transition-colors ${isOpen ? 'text-emerald-500' : 'text-gray-700 group-hover:text-emerald-600'}`} />
        </motion.div>
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-black text-white bg-red-500 rounded-full border-2 border-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Notification Panel Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
              <h3 className="font-black text-emerald-950 text-sm tracking-tight">Thông báo</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={clearNotifications}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Xóa hết
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-emerald-200" />
                  </div>
                  <p className="text-emerald-950/40 text-xs font-bold">Chưa có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <div 
                    key={idx}
                    className="p-4 border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors cursor-default"
                  >
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                        <span className="material-symbols-outlined text-sm">favorite</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] text-emerald-950 font-medium leading-snug">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-emerald-950/40 font-bold mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-emerald-50/20 text-center border-t border-emerald-100">
                <button className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Xem tất cả</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
