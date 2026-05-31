import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  userId: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  read: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC<Props> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    console.log("Fetching notifications for user:", userId);
  }, [userId]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
    toast.info("Το ιστορικό καθαρίστηκε");
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-20 border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Ειδοποιήσεις ({userId})</h3>
              <div className="flex gap-2">
                <button onClick={clearAll} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16} /></button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg"><X size={16} /></button>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 text-center text-gray-500 text-sm">
              {notifications.length === 0 ? "Δεν υπάρχουν νέες ειδοποιήσεις" : "Λίστα ειδοποιήσεων..."}
            </div>
          </div>
        </>
      )}
    </div>
  );
};