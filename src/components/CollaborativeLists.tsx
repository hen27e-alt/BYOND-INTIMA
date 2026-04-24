import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { List, Plus, CheckCircle2, Circle, Trash2, Loader2, Sparkles, MessageSquare, Calendar, Filter, ArrowUpDown, Bell } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useAlert } from './AlertModal';

interface SharedList {
  id: string;
  title: string;
  items: ListItem[];
  createdAt: any;
}

interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
  reminderSent?: boolean;
}

export const CollaborativeLists = () => {
  const { profile } = useFirebase();
  const { showAlert } = useAlert();
  const [lists, setLists] = useState<SharedList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemText, setNewItemText] = useState<{ [listId: string]: string }>({});
  const [newItemDueDate, setNewItemDueDate] = useState<{ [listId: string]: string }>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<{listId: string, itemId: string} | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate'>('createdAt');

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(
      collection(db, 'shared_lists'),
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data: SharedList[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as SharedList));
      data.sort((a, b) => {
        const dateA = (a as any).createdAt?.toDate() || new Date(0);
        const dateB = (b as any).createdAt?.toDate() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setLists(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  // Check for due dates and create notifications
  useEffect(() => {
    if (!profile?.coupleId || lists.length === 0) return;

    const checkDueDates = async () => {
      const now = new Date();
      
      for (const list of lists) {
        let listUpdated = false;
        const updatedItems = [...list.items];

        for (let i = 0; i < updatedItems.length; i++) {
          const item = updatedItems[i];
          if (item.dueDate && !item.completed && !item.reminderSent) {
            const dueDate = new Date(item.dueDate);
            const timeDiff = dueDate.getTime() - now.getTime();
            
            // If due in less than 24 hours
            if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
              try {
                // Create notification for current user
                await addDoc(collection(db, 'notifications'), {
                  userId: profile.uid || '', // Fallback to empty string if not found
                  title: 'תזכורת למשימה',
                  body: `המשימה "${item.text}" ברשימה "${list.title}" צריכה להתבצע בקרוב!`,
                  type: 'reminder',
                  read: false,
                  createdAt: serverTimestamp()
                });
                
                // Create notification for partner if exists
                if (profile.partnerId) {
                  await addDoc(collection(db, 'notifications'), {
                    userId: profile.partnerId,
                    title: 'תזכורת למשימה',
                    body: `המשימה "${item.text}" ברשימה "${list.title}" צריכה להתבצע בקרוב!`,
                    type: 'reminder',
                    read: false,
                    createdAt: serverTimestamp()
                  });
                }
                
                updatedItems[i] = { ...item, reminderSent: true };
                listUpdated = true;
              } catch (err) {
                console.error('Error creating reminder notification:', err);
              }
            }
          }
        }

        if (listUpdated) {
          try {
            await updateDoc(doc(db, 'shared_lists', list.id), {
              items: updatedItems
            });
          } catch (err) {
            console.error('Error updating list with reminder status:', err);
          }
        }
      }
    };

    const interval = setInterval(checkDueDates, 60 * 60 * 1000); // Check every hour
    checkDueDates(); // Check immediately on load

    return () => clearInterval(interval);
  }, [lists, profile?.coupleId]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.coupleId || !newListTitle.trim()) return;

    try {
      await addDoc(collection(db, 'shared_lists'), {
        coupleId: profile.coupleId,
        title: newListTitle,
        items: [],
        createdAt: serverTimestamp()
      });
      setIsAddingList(false);
      setNewListTitle('');
    } catch (err) {
      console.error(err);
      showAlert('לא ניתן היה ליצור את הרשימה. נסו שוב.', 'שגיאה');
    }
  };

  const handleDeleteList = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'shared_lists', deleteConfirmId));
    } catch (error) {
      console.error(error);
      showAlert('לא ניתן היה למחוק את הרשימה. נסו שוב.', 'שגיאה');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleAddItem = async (listId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = newItemText[listId];
    if (!text?.trim()) return;

    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const newItem: ListItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      dueDate: newItemDueDate[listId] || undefined,
      reminderSent: false
    };

    try {
      await updateDoc(doc(db, 'shared_lists', listId), {
        items: [...list.items, newItem]
      });
      setNewItemText({ ...newItemText, [listId]: '' });
      setNewItemDueDate({ ...newItemDueDate, [listId]: '' });
    } catch (err) {
      console.error(err);
      showAlert('לא ניתן היה להוסיף את הפריט. נסו שוב.', 'שגיאה');
    }
  };

  const toggleItem = async (listId: string, itemId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const updatedItems = list.items.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    try {
      await updateDoc(doc(db, 'shared_lists', listId), {
        items: updatedItems
      });
    } catch (err) {
      console.error(err);
      showAlert('לא ניתן היה לעדכן את הפריט. נסו שוב.', 'שגיאה');
    }
  };

  const handleDeleteItemClick = (listId: string, itemId: string) => {
    setDeleteItemConfirm({ listId, itemId });
  };

  const confirmDeleteItem = async () => {
    if (!deleteItemConfirm) return;
    const { listId, itemId } = deleteItemConfirm;
    
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const updatedItems = list.items.filter(item => item.id !== itemId);

    try {
      await updateDoc(doc(db, 'shared_lists', listId), {
        items: updatedItems
      });
    } catch (err) {
      console.error(err);
      showAlert('לא ניתן היה למחוק את הפריט. נסו שוב.', 'שגיאה');
    } finally {
      setDeleteItemConfirm(null);
    }
  };

  const getFilteredAndSortedItems = (items: ListItem[]) => {
    let result = [...items];
    
    // Filter
    if (filter === 'active') {
      result = result.filter(item => !item.completed);
    } else if (filter === 'completed') {
      result = result.filter(item => item.completed);
    }
    
    // Sort
    if (sortBy === 'dueDate') {
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }
    
    return result;
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <List className="text-brand-gold" /> רשימות משותפות
          </h2>
          <p className="text-white/40 italic">קניות, משימות, או סדרות לראות יחד.</p>
        </div>
        
        <button
          onClick={() => setIsAddingList(true)}
          className="px-8 py-3 bg-brand-gold text-black rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
        >
          <Plus size={20} /> רשימה חדשה
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-brand-gold" />
          <span className="text-white/60 text-sm">סינון:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-brand-gold/50"
          >
            <option value="all">הכל</option>
            <option value="active">פעילים</option>
            <option value="completed">הושלמו</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} className="text-brand-gold" />
          <span className="text-white/60 text-sm">מיון:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-brand-gold/50"
          >
            <option value="createdAt">תאריך יצירה</option>
            <option value="dueDate">תאריך יעד</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {isAddingList && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-12"
          >
            <form onSubmit={handleCreateList} className="flex gap-4">
              <input
                type="text"
                value={newListTitle}
                onChange={e => setNewListTitle(e.target.value)}
                placeholder="שם הרשימה (למשל: קניות לסופר)"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                autoFocus
                required
              />
              <button type="submit" className="px-8 py-4 bg-brand-gold text-black rounded-xl font-bold hover:bg-white transition-all">יצירה</button>
              <button type="button" onClick={() => setIsAddingList(false)} className="px-6 py-4 text-white/40 hover:text-white">ביטול</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8">
        {lists.map((list) => (
          <motion.div
            key={list.id}
            layout
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-xl font-serif text-white">{list.title}</h3>
              <button onClick={() => handleDeleteList(list.id)} className="text-white/20 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <AnimatePresence initial={false}>
                {getFilteredAndSortedItems(list.items).map((item) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between group overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(list.id, item.id)}
                      className="flex items-center gap-3 text-right flex-1"
                    >
                      <motion.span 
                        initial={false}
                        animate={{ 
                          scale: item.completed ? [1, 1.2, 1] : 1,
                          color: item.completed ? '#C9A96E' : 'rgba(255, 255, 255, 0.2)'
                        }}
                        className="shrink-0 transition-colors"
                      >
                        {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} className="hover:text-brand-gold transition-colors" />}
                      </motion.span>
                      <div className="flex flex-col">
                        <motion.span 
                          animate={{ 
                            opacity: item.completed ? 0.4 : 0.8,
                            x: item.completed ? 5 : 0
                          }}
                          className={`text-sm transition-all ${item.completed ? 'line-through' : ''}`}
                        >
                          {item.text}
                        </motion.span>
                        {item.dueDate && (
                          <span className={`text-[10px] flex items-center gap-1 mt-1 ${
                            item.completed ? 'text-white/20' : 
                            new Date(item.dueDate) < new Date() ? 'text-red-400' : 'text-brand-gold/60'
                          }`}>
                            <Calendar size={10} />
                            {new Date(item.dueDate).toLocaleDateString('he-IL')} {new Date(item.dueDate).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                    </button>
                    <button onClick={() => handleDeleteItemClick(list.id, item.id)} className="text-white/40 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100 p-2">
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {list.items.length === 0 && (
                <p className="text-center text-white/20 text-sm italic py-4">הרשימה ריקה</p>
              )}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/5">
              <form onSubmit={(e) => handleAddItem(list.id, e)} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItemText[list.id] || ''}
                    onChange={e => setNewItemText({ ...newItemText, [list.id]: e.target.value })}
                    placeholder="הוספת פריט..."
                    className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none text-right"
                  />
                  <button type="submit" className="text-brand-gold hover:text-white transition-colors p-2">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-2 px-2 border-t border-white/5 pt-2">
                  <Calendar size={14} className="text-white/40" />
                  <input
                    type="datetime-local"
                    value={newItemDueDate[list.id] || ''}
                    onChange={e => setNewItemDueDate({ ...newItemDueDate, [list.id]: e.target.value })}
                    className="bg-transparent border-none text-white/60 text-xs focus:outline-none"
                  />
                </div>
              </form>
            </div>
          </motion.div>
        ))}

        {lists.length === 0 && !isAddingList && (
          <div className="md:col-span-2 text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <List size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/40 italic">אין עדיין רשימות משותפות. צרו את הרשימה הראשונה שלכם!</p>
          </div>
        )}
      </div>
      
      {/* Delete List Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת רשימה</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק רשימה זו? פעולה זו אינה הפיכה.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 bg-brand-cream text-brand-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-gold/10 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                >
                  מחיקה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Item Confirmation Modal */}
      <AnimatePresence>
        {deleteItemConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת משימה</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק משימה זו? פעולה זו אינה הפיכה.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteItemConfirm(null)}
                  className="flex-1 py-3 bg-brand-cream text-brand-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-gold/10 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors"
                >
                  מחיקה
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
