import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Image as ImageIcon, X, Sparkles, Heart, Camera, Loader2 } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

interface VisionItem {
  id: string;
  type: 'image' | 'text';
  content: string;
  title: string;
  category: string;
  createdAt: string;
}

export const VisionBoard = () => {
  const { user } = useFirebase();
  const [items, setItems] = useState<VisionItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', content: '', type: 'text' as const, category: 'travel' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const visionRef = doc(db, 'vision_boards', 'shared_vision'); // Shared by couple
    return onSnapshot(visionRef, (doc) => {
      if (doc.exists()) {
        setItems(doc.data().items || []);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'vision_boards/shared_vision'));
  }, [user]);

  const addItem = async () => {
    if (!user || !newItem.title) return;
    const visionRef = doc(db, 'vision_boards', 'shared_vision');
    const item: VisionItem = {
      id: Date.now().toString(),
      ...newItem,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(visionRef, {
        items: [...items, item],
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowAdd(false);
      setNewItem({ title: '', content: '', type: 'text', category: 'travel' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'vision_boards/shared_vision');
    }
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    const visionRef = doc(db, 'vision_boards', 'shared_vision');
    try {
      await setDoc(visionRef, {
        items: items.filter(i => i.id !== id),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'vision_boards/shared_vision');
    }
  };

  const generateAIInspiration = async () => {
    setIsGenerating(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Suggest a romantic and inspiring goal for a couple to add to their vision board. Provide a title and a short description in Hebrew. Format as JSON: { "title": "...", "description": "..." }',
        config: { responseMimeType: 'application/json' }
      });
      const response = await model;
      const data = JSON.parse(response.text);
      setNewItem({ ...newItem, title: data.title, content: data.description, type: 'text' });
      setShowAdd(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-white flex items-center gap-3">
            <Sparkles className="text-brand-gold" /> לוח החזון שלנו
          </h2>
          <p className="text-white/40 italic">החלומות והיעדים המשותפים שלנו לעתיד.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateAIInspiration}
            disabled={isGenerating}
            className="p-4 bg-brand-gold/20 text-brand-gold rounded-2xl hover:bg-brand-gold/30 transition-all flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">השראה מה-AI</span>
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="p-4 bg-brand-gold text-black rounded-2xl hover:bg-white transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-dark rounded-[32px] overflow-hidden group relative aspect-square flex flex-col"
            >
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={16} />
              </button>
              
              <div className="flex-1 p-8 flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  {item.category === 'travel' ? <Camera size={24} /> : <Heart size={24} />}
                </div>
                <h3 className="text-xl font-serif text-white">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed italic">"{item.content}"</p>
              </div>
              
              <div className="p-4 bg-white/5 border-t border-white/10 text-[10px] font-bold text-white/20 uppercase tracking-widest text-center">
                נוסף ב-{new Date(item.createdAt).toLocaleDateString('he-IL')}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-brand-cream rounded-[40px] overflow-hidden shadow-2xl p-8"
            >
              <h3 className="text-2xl font-serif mb-6 text-brand-black">הוספת חזון חדש</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">כותרת</label>
                  <input 
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    className="w-full p-4 bg-white rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black"
                    placeholder="למשל: טיול ליפן"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">תיאור / חלום</label>
                  <textarea 
                    value={newItem.content}
                    onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                    className="w-full p-4 bg-white rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black h-32"
                    placeholder="תארו את החלום שלכם..."
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-4 bg-brand-black/5 text-brand-black rounded-2xl font-bold uppercase tracking-widest text-xs"
                  >
                    ביטול
                  </button>
                  <button 
                    onClick={addItem}
                    className="flex-1 py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs"
                  >
                    הוספה ללוח
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
