import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle, Heart, Star, Gift, Clock, X } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'mission' | 'love' | 'reminder' | 'system';
  read: boolean;
  createdAt: any;
}

const ICONS = {
  mission: Star,
  love: Heart,
  reminder: Clock,
  system: Bell
};

const COLORS = {
  mission: 'text-brand-gold bg-brand-gold/10',
  love: 'text-red-500 bg-red-500/10',
  reminder: 'text-blue-500 bg-blue-500/10',
  system: 'text-white/60 bg-white/5'
};

export const NotificationCenter = () => {
  const { user, profile } = useFirebase();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      let list: Notification[] = [];
      let unread = 0;
      snap.forEach(doc => {
        const data = doc.data() as Notification;
        list.push({ id: doc.id, ...data });
        if (!data.read) unread++;
      });
      list.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate() || new Date(0);
        const dateB = (b as any).createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      list = list.slice(0, 20);
      setNotifications(list);
      setUnreadCount(unread);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    for (const id of unreadIds) {
      markAsRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 md:p-4 bg-white border border-brand-gold/10 hover:bg-brand-cream transition-colors flex items-center justify-center rounded-2xl shadow-sm"
      >
        <Bell size={20} className="text-brand-black" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 md:absolute md:top-full md:left-auto md:right-0 md:mt-2 md:w-96 bg-brand-black border border-brand-gold/20 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
              <h3 className="text-white font-serif text-lg">התראות</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] text-brand-gold uppercase tracking-widest hover:underline">
                  סמן הכל כנקרא
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => {
                    const Icon = ICONS[notif.type] || Bell;
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-4 flex gap-4 transition-colors hover:bg-white/5 cursor-pointer ${!notif.read ? 'bg-white/5' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${COLORS[notif.type]}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 text-right">
                          <h4 className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-white/80'}`}>{notif.title}</h4>
                          <p className="text-xs text-white/60 mt-1 leading-relaxed">{notif.body}</p>
                          <span className="text-[10px] text-white/40 mt-2 block">
                            {notif.createdAt?.toDate?.()?.toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-brand-gold shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-white/40 flex flex-col items-center gap-3">
                  <Bell size={32} className="opacity-20" />
                  <p className="text-sm italic">אין התראות חדשות כרגע.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
