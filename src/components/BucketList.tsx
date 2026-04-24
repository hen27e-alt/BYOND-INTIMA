import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListTodo, Plus, CheckCircle2, Circle, Trash2, Loader2, Sparkles, Heart, Camera } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface BucketItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  imageUrl?: string;
}

export const BucketList = () => {
  const { profile } = useFirebase();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState({ title: '', description: '' });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.coupleId) return;

    const q = query(collection(db, 'bucket_list'), where('coupleId', '==', profile.coupleId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list: BucketItem[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as BucketItem));
      setItems(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.coupleId || !newItem.title) return;

    try {
      await addDoc(collection(db, 'bucket_list'), {
        coupleId: profile.coupleId,
        title: newItem.title,
        description: newItem.description,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewItem({ title: '', description: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'bucket_list', id), {
        status: currentStatus === 'pending' ? 'completed' : 'pending',
        completedAt: currentStatus === 'pending' ? serverTimestamp() : null
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStart = (item: BucketItem) => {
    setEditingId(item.id);
    setEditContent({ title: item.title, description: item.description || '' });
  };

  const handleEditSave = async (id: string) => {
    if (!editContent.title.trim()) return;
    try {
      await updateDoc(doc(db, 'bucket_list', id), {
        title: editContent.title,
        description: editContent.description
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDoc(doc(db, 'bucket_list', deleteConfirmId));
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-gold" /></div>;

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <ListTodo className="text-brand-gold" /> רשימת המשאלות שלנו
          </h2>
          <p className="text-white/40 italic">כל החלומות שאנחנו הולכים להגשים יחד.</p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-3 bg-brand-gold text-black rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-brand-gold/20"
        >
          <Plus size={20} /> הוספת יעד חדש
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
          >
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="מה החלום?"
                  value={newItem.title}
                  onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  className="bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                  required
                />
                <input
                  type="text"
                  placeholder="תיאור קצר (אופציונלי)"
                  value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-gold/50 text-right"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-white/40 hover:text-white">ביטול</button>
                <button type="submit" className="px-8 py-2 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all">הוספה</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            className={`group flex items-center gap-6 p-6 rounded-2xl border transition-all ${
              item.status === 'completed' 
                ? 'bg-brand-gold/5 border-brand-gold/20 opacity-60' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <button
              onClick={() => toggleStatus(item.id, item.status)}
              className={`shrink-0 transition-colors ${item.status === 'completed' ? 'text-brand-gold' : 'text-white/20 hover:text-brand-gold'}`}
            >
              {item.status === 'completed' ? <CheckCircle2 size={32} /> : <Circle size={32} />}
            </button>

            <div className="flex-1 text-right">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editContent.title}
                    onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                    className="w-full bg-black/40 border border-brand-gold/50 rounded-lg p-2 text-white focus:outline-none text-right"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editContent.description}
                    onChange={(e) => setEditContent({ ...editContent, description: e.target.value })}
                    className="w-full bg-black/40 border border-brand-gold/50 rounded-lg p-2 text-white/60 text-sm focus:outline-none text-right"
                    placeholder="תיאור (אופציונלי)"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={handleEditCancel} className="text-xs text-white/40 hover:text-white px-2 py-1">ביטול</button>
                    <button onClick={() => handleEditSave(item.id)} className="text-xs bg-brand-gold text-black px-3 py-1 rounded-full font-bold">שמור</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => handleEditStart(item)} className="cursor-pointer group/edit">
                  <h3 className={`text-xl font-serif text-white transition-colors group-hover/edit:text-brand-gold ${item.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                    {item.title}
                  </h3>
                  {item.description && <p className="text-white/40 text-sm italic mt-1">{item.description}</p>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingId !== item.id && (
                <button onClick={() => handleDelete(item.id)} className="text-white/20 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {items.length === 0 && !isAdding && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <Sparkles size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/40 italic">הרשימה עדיין ריקה. מה החלום הראשון שלכם?</p>
          </div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
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
              <h3 className="text-2xl font-serif mb-4 text-brand-black">מחיקת יעד</h3>
              <p className="text-brand-black/60 mb-8">האם אתם בטוחים שברצונכם למחוק יעד זה? פעולה זו אינה הפיכה.</p>
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
    </div>
  );
};
