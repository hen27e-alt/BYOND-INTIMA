import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Heart, Plus, X, Loader2, Calendar, MessageCircle, Sparkles, Trash2, Upload, ChevronRight, Star } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Memory {
  id: string;
  coupleId: string;
  imageUrl: string;
  insight: string;
  date: any;
  createdBy: string;
  type: 'first_date' | 'anniversary' | 'general';
}

export const MemoryWall = () => {
  const { user, profile } = useFirebase();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  const [newMemory, setNewMemory] = useState({
    imageUrl: '',
    insight: '',
    type: 'general' as Memory['type']
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile?.coupleId) {
      setIsLoading(false);
      return;
    }

    const memoriesRef = collection(db, 'memories');
    const q = query(
      memoriesRef, 
      where('coupleId', '==', profile.coupleId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const memoryList: Memory[] = [];
      snapshot.forEach((doc) => {
        memoryList.push({ id: doc.id, ...doc.data() } as Memory);
      });
      // Sort by date (handle both Firestore Timestamp and JS Date)
      memoryList.sort((a, b) => {
        const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
        const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
        return dateB - dateA;
      });
      setMemories(memoryList);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'memories');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.coupleId || !user) return;
    
    setIsSubmitting(true);
    try {
      let finalImageUrl = newMemory.imageUrl;

      if (imageFile) {
        const fileRef = ref(storage, `memories/${profile.coupleId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(fileRef, imageFile);
        finalImageUrl = await getDownloadURL(fileRef);
      } else if (!finalImageUrl) {
        // Fallback placeholder if no image
        finalImageUrl = `https://picsum.photos/seed/${Math.random()}/800/600`;
      }

      await addDoc(collection(db, 'memories'), {
        coupleId: profile.coupleId,
        imageUrl: finalImageUrl,
        insight: newMemory.insight,
        type: newMemory.type,
        date: serverTimestamp(),
        createdBy: user.uid
      });
      
      setIsAdding(false);
      setNewMemory({ imageUrl: '', insight: '', type: 'general' });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'memories');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'memories', id));
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memories/${id}`);
    }
  };

  const filteredMemories = filterType === 'all' 
    ? memories 
    : memories.filter(m => m.type === filterType);

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-right">
          <h2 className="text-4xl font-serif text-brand-black">קיר הזכרונות</h2>
          <p className="text-brand-black/60">המקום שבו הרגעים הכי יפים שלכם נשמרים לנצח.</p>
        </div>
        
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-4 bg-brand-gold text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={20} />
          הוסף רגע חדש
        </button>
      </div>

      <div className="flex justify-center gap-4 border-b border-brand-gold/20 pb-4 overflow-x-auto">
        {['all', 'first_date', 'anniversary', 'general'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filterType === type ? 'bg-brand-gold text-white shadow-md' : 'text-brand-black/60 hover:bg-brand-gold/10'
            }`}
          >
            {type === 'all' ? 'הכל' : type === 'first_date' ? 'דייט ראשון' : type === 'anniversary' ? 'יום נישואין' : 'כללי'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="animate-spin text-brand-gold" size={48} />
          <p className="text-brand-black/40 font-serif italic">טוען את הרגעים שלכם...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-brand-gold/20">
          <ImageIcon size={64} className="mx-auto text-brand-gold/20 mb-6" />
          <h3 className="text-2xl font-serif text-brand-black mb-2">עדיין אין כאן זכרונות</h3>
          <p className="text-brand-black/40 mb-8">זה הזמן להתחיל לתעד את המסע המשותף שלכם.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-brand-gold font-bold hover:underline flex items-center gap-2 mx-auto"
          >
            <Plus size={18} /> הוסף את הזכרון הראשון
          </button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {filteredMemories.map((memory) => (
            <motion.div
              layout
              key={memory.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="break-inside-avoid bg-white rounded-3xl overflow-hidden shadow-xl border border-brand-gold/10 group relative"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={memory.imageUrl} 
                  alt={memory.insight} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <button
                  onClick={() => setDeleteConfirmId(memory.id)}
                  className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                    <Calendar size={12} />
                    {memory.date?.seconds 
                      ? new Date(memory.date.seconds * 1000).toLocaleDateString('he-IL') 
                      : new Date(memory.date).toLocaleDateString('he-IL')}
                  </div>
                  <span className="px-2 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {memory.type === 'first_date' ? 'דייט ראשון' : memory.type === 'anniversary' ? 'יום נישואין' : 'כללי'}
                  </span>
                </div>
                
                <p className="text-brand-black/80 font-serif leading-relaxed italic">
                  "{memory.insight}"
                </p>

                <div className="pt-4 border-t border-brand-gold/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-brand-gold/20 rounded-full flex items-center justify-center">
                      <Heart size={12} className="text-brand-gold" />
                    </div>
                    <span className="text-[10px] text-brand-black/40 font-bold uppercase tracking-widest">רגע משותף</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
              onClick={() => setIsAdding(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-serif text-brand-black">הוספת זכרון חדש</h3>
                  <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-brand-gold/10 rounded-full transition-colors">
                    <X size={24} className="text-brand-black/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    {/* Image Upload */}
                    <div 
                      className="relative h-64 rounded-3xl border-2 border-dashed border-brand-gold/30 bg-brand-cream/20 overflow-hidden group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-black/40 space-y-4">
                          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
                            <Camera size={32} />
                          </div>
                          <p className="font-bold uppercase tracking-widest text-xs">לחצו להעלאת תמונה</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-black/40">מה הרגע הזה מסמל עבורכם?</label>
                      <textarea
                        required
                        value={newMemory.insight}
                        onChange={(e) => setNewMemory({ ...newMemory, insight: e.target.value })}
                        placeholder="כתבו כאן את התובנה או הזכרון שלכם..."
                        className="w-full p-6 bg-brand-cream/30 rounded-2xl border border-brand-gold/10 focus:border-brand-gold outline-none min-h-[120px] text-brand-black font-serif italic"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {['general', 'first_date', 'anniversary'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewMemory({ ...newMemory, type: type as any })}
                          className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all ${
                            newMemory.type === type 
                              ? 'bg-brand-gold border-brand-gold text-white shadow-lg' 
                              : 'border-brand-gold/10 text-brand-black/40 hover:border-brand-gold/30'
                          }`}
                        >
                          {type === 'general' ? 'כללי' : type === 'first_date' ? 'דייט ראשון' : 'יום נישואין'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || (!imageFile && !newMemory.imageUrl && !newMemory.insight)}
                    className="w-full py-5 bg-brand-gold text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        שומר רגע...
                      </>
                    ) : (
                      <>
                        <Sparkles />
                        שמור בזיכרון
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-black/90 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-[40px] p-12 max-w-md w-full text-center space-y-8"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                <Trash2 size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-serif text-brand-black">למחוק את הזיכרון?</h3>
                <p className="text-brand-black/60">פעולה זו היא סופית ולא ניתן יהיה לשחזר את הרגע הזה.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-all shadow-lg"
                >
                  מחק לצמיתות
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-4 border border-brand-gold/20 text-brand-black/60 rounded-full font-bold hover:bg-brand-gold/10 transition-all"
                >
                  ביטול
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
