import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, Map, Camera, Plus, Trash2, Lock, Unlock, Send, Sparkles, Users, Calendar, Loader2, Clock } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { BRANDING } from '../constants/branding';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface VisionItem {
  id: string;
  title: string;
  imageUrl: string;
  category: 'travel' | 'home' | 'family' | 'career' | 'other';
  createdAt: any;
}

interface BucketItem {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  description?: string;
}

export const Together = () => {
  const { user, profile } = useFirebase();
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [activeTab, setActiveTab] = useState<'vision' | 'bucket' | 'capsule'>('vision');
  const [isAddingVision, setIsAddingVision] = useState(false);
  const [newVision, setNewVision] = useState({ title: '', category: 'other' as any, imageUrl: '' });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAddingCapsule, setIsAddingCapsule] = useState(false);
  const [newCapsule, setNewCapsule] = useState({ content: '', unlockDate: '', toUserId: '' });
  const [capsules, setCapsules] = useState<any[]>([]);

  // Real-time listeners for collaborative data
  useEffect(() => {
    if (!user || !profile?.coupleId) return;

    const visionQuery = query(
      collection(db, 'vision_board'),
      where('coupleId', '==', profile.coupleId),
      orderBy('createdAt', 'desc')
    );

    const bucketQuery = query(
      collection(db, 'bucket_list'),
      where('coupleId', '==', profile.coupleId),
      orderBy('createdAt', 'desc')
    );

    const capsuleQuery = query(
      collection(db, 'time_capsules'),
      where('coupleId', '==', profile.coupleId),
      orderBy('createdAt', 'desc')
    );

    const unsubVision = onSnapshot(visionQuery, (snapshot) => {
      setVisionItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisionItem)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'vision_board'));

    const unsubBucket = onSnapshot(bucketQuery, (snapshot) => {
      setBucketItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BucketItem)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bucket_list'));

    const unsubCapsule = onSnapshot(capsuleQuery, (snapshot) => {
      setCapsules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'time_capsules'));

    return () => {
      unsubVision();
      unsubBucket();
      unsubCapsule();
    };
  }, [user, profile?.coupleId]);

  const addVisionItem = async () => {
    if (!profile?.coupleId || !newVision.title) return;
    try {
      await addDoc(collection(db, 'vision_board'), {
        ...newVision,
        coupleId: profile.coupleId,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      });
      setNewVision({ title: '', category: 'other', imageUrl: '' });
      setIsAddingVision(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'vision_board');
    }
  };

  const deleteVisionItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vision_board', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'vision_board');
    }
  };

  const toggleBucketItem = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'bucket_list', id), {
        status: currentStatus === 'pending' ? 'completed' : 'pending',
        completedAt: currentStatus === 'pending' ? serverTimestamp() : null
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'bucket_list');
    }
  };

  const deleteBucketItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bucket_list', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'bucket_list');
    }
  };

  const addBucketItem = async (title: string) => {
    if (!profile?.coupleId || !title) return;
    try {
      await addDoc(collection(db, 'bucket_list'), {
        title,
        status: 'pending',
        coupleId: profile.coupleId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bucket_list');
    }
  };

  const addCapsule = async () => {
    if (!user || !profile?.coupleId || !newCapsule.content || !newCapsule.unlockDate) return;
    try {
      await addDoc(collection(db, 'time_capsules'), {
        ...newCapsule,
        unlockDate: new Date(newCapsule.unlockDate),
        coupleId: profile.coupleId,
        fromUserId: user.uid,
        createdAt: serverTimestamp(),
        isUnlocked: false
      });
      setNewCapsule({ content: '', unlockDate: '', toUserId: '' });
      setIsAddingCapsule(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'time_capsules');
    }
  };

  const deleteCapsule = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'time_capsules', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'time_capsules');
    }
  };

  const generateVisionImage = async () => {
    if (!newVision.title) return;
    setIsGeneratingImage(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A beautiful, romantic, high-quality vision board style image representing the couple's dream: ${newVision.title}. Category: ${newVision.category}. Style: cinematic, warm, inspiring.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64EncodeString}`;
          setNewVision(prev => ({ ...prev, imageUrl }));
          break;
        }
      }
    } catch (error) {
      console.error('Error generating vision image:', error);
      // Fallback to picsum if AI fails
      setNewVision(prev => ({ ...prev, imageUrl: `https://picsum.photos/seed/${newVision.title}/800/600` }));
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream p-6">
        <div className="text-center max-w-md">
          <Lock className="mx-auto mb-6 text-brand-gold" size={48} />
          <h2 className="text-3xl font-serif mb-4">מרחב זוגי פרטי</h2>
          <p className="text-brand-black/60 mb-8">התחברו כדי לנהל את לוח החזון והחלומות המשותפים שלכם.</p>
          <button className="px-8 py-3 bg-brand-black text-brand-gold rounded-full font-bold uppercase tracking-widest">כניסה למערכת</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-brand-gold/10 rounded-full text-brand-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Users size={12} />
            <span>Beyond Together</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">המרחב המשותף שלכם</h1>
          <p className="text-brand-black/60 max-w-2xl mx-auto">
            מקום אחד לחלום, לתכנן ולתעד את המסע שלכם יחד. כל שינוי כאן מופיע אצל בן/בת הזוג בזמן אמת.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {[
            { id: 'vision', label: 'לוח חזון', icon: Sparkles },
            { id: 'bucket', label: 'רשימת משאלות', icon: Map },
            { id: 'capsule', label: 'קפסולת זמן', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-full transition-all text-sm font-medium",
                activeTab === tab.id 
                  ? "bg-brand-black text-brand-gold shadow-xl scale-105" 
                  : "bg-white text-brand-black/40 hover:text-brand-black"
              )}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'vision' && (
            <motion.div
              key="vision"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Add New Vision Card */}
              <button 
                onClick={() => setIsAddingVision(true)}
                className="aspect-square rounded-3xl border-2 border-dashed border-brand-gold/30 flex flex-col items-center justify-center gap-4 hover:bg-brand-gold/5 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
                  <Plus size={32} />
                </div>
                <span className="font-serif text-xl">הוסיפו חלום חדש</span>
              </button>

              {/* Vision Items */}
              {visionItems.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  className="group relative aspect-square rounded-3xl overflow-hidden shadow-lg"
                >
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <p className="text-brand-gold text-[10px] uppercase tracking-widest mb-1">{item.category}</p>
                    <h3 className="text-white text-xl font-serif">{item.title}</h3>
                    <button 
                      onClick={() => deleteVisionItem(item.id)}
                      className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'bucket' && (
            <motion.div
              key="bucket"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-brand-gold/10">
                <h3 className="text-2xl font-serif mb-6 flex items-center gap-3">
                  <Map className="text-brand-gold" />
                  המסע המשותף שלנו
                </h3>
                <div className="space-y-4">
                  {bucketItems.length === 0 && (
                    <p className="text-center text-brand-black/40 py-8">הרשימה עדיין ריקה. מה תרצו לעשות יחד?</p>
                  )}
                  {bucketItems.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all border",
                        item.status === 'completed' ? "bg-brand-gold/5 border-brand-gold/20" : "bg-brand-cream/30 border-transparent hover:border-brand-gold/20"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleBucketItem(item.id, item.status)}
                          className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            item.status === 'completed' ? "bg-brand-gold border-brand-gold text-white" : "border-brand-gold/30"
                          )}
                        >
                          {item.status === 'completed' && <Star size={12} fill="currentColor" />}
                        </button>
                        <span className={cn("font-medium", item.status === 'completed' && "line-through text-brand-black/40")}>
                          {item.title}
                        </span>
                      </div>
                      <button onClick={() => deleteDoc(doc(db, 'bucket_list', item.id))} className="text-brand-black/20 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="הוסיפו יעד חדש לרשימה..."
                    className="flex-1 bg-brand-cream/50 border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-gold outline-none"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        await addBucketItem((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button className="w-12 h-12 bg-brand-black text-brand-gold rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'capsule' && (
            <motion.div
              key="capsule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-brand-black text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-gold rounded-full blur-[100px]" />
                </div>
                
                <div className="relative z-10 text-center">
                  <Calendar className="mx-auto mb-6 text-brand-gold" size={48} />
                  <h3 className="text-3xl font-serif mb-4">קפסולת זמן זוגית</h3>
                  <p className="text-white/60 mb-8 max-w-xl mx-auto">
                    כתבו מכתב לעצמכם או אחד לשני. אנחנו ננעל אותו בתיבה דיגיטלית ונשלח לכם התראה כשיגיע הזמן לפתוח אותו.
                  </p>
                  <button 
                    onClick={() => setIsAddingCapsule(true)}
                    className="px-8 py-4 bg-brand-gold text-brand-black rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all"
                  >
                    צרו קפסולה חדשה
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {capsules.map((capsule) => {
                  const isUnlocked = capsule.isUnlocked || new Date(capsule.unlockDate) <= new Date();
                  return (
                    <div key={capsule.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-gold/10 flex items-start gap-4 group relative">
                      <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center shrink-0">
                        {isUnlocked ? <Unlock className="text-brand-gold" size={24} /> : <Lock className="text-brand-gold" size={24} />}
                      </div>
                      <div className="text-right flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                            {isUnlocked ? 'פתוח' : 'נעול'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(capsule.unlockDate).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                        <p className={cn(
                          "text-lg font-serif",
                          !isUnlocked && "blur-sm select-none"
                        )}>
                          {isUnlocked ? capsule.content : 'זהו מסר מהעבר שמחכה לזמן הנכון...'}
                        </p>
                      </div>
                      <button 
                        onClick={() => deleteCapsule(capsule.id)}
                        className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand-black/20 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Vision Modal */}
        <AnimatePresence>
          {isAddingVision && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingVision(false)}
                className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-brand-cream rounded-[2.5rem] p-8 shadow-2xl border border-brand-gold/20"
              >
                <h3 className="text-2xl font-serif mb-6">מה החלום הבא שלכם?</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black/40 mb-2">כותרת החלום</label>
                    <input 
                      type="text" 
                      value={newVision.title}
                      onChange={(e) => setNewVision(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold outline-none"
                      placeholder="למשל: טיול ליפן, לקנות בית עם גינה..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black/40 mb-2">קטגוריה</label>
                    <div className="flex flex-wrap gap-2">
                      {['travel', 'home', 'family', 'career', 'other'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewVision(prev => ({ ...prev, category: cat as any }))}
                          className={cn(
                            "px-4 py-2 rounded-full text-xs transition-all",
                            newVision.category === cat ? "bg-brand-black text-brand-gold" : "bg-white text-brand-black/40"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-brand-gold/5 rounded-3xl border border-brand-gold/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Sparkles size={16} className="text-brand-gold" />
                        יצירת תמונה ב-AI
                      </span>
                      <button 
                        onClick={generateVisionImage}
                        disabled={!newVision.title || isGeneratingImage}
                        className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:underline disabled:opacity-50"
                      >
                        {isGeneratingImage ? 'יוצר...' : 'צור תמונה'}
                      </button>
                    </div>
                    {newVision.imageUrl ? (
                      <img src={newVision.imageUrl} className="w-full aspect-video object-cover rounded-2xl shadow-inner" alt="Preview" />
                    ) : (
                      <div className="w-full aspect-video bg-white/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-brand-gold/10">
                        <Camera className="text-brand-gold/20" size={32} />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsAddingVision(false)}
                      className="flex-1 py-4 bg-brand-black/5 text-brand-black rounded-full font-bold uppercase tracking-widest"
                    >
                      ביטול
                    </button>
                    <button 
                      onClick={addVisionItem}
                      disabled={!newVision.title || !newVision.imageUrl}
                      className="flex-1 py-4 bg-brand-black text-brand-gold rounded-full font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      הוספה ללוח
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Capsule Modal */}
        <AnimatePresence>
          {isAddingCapsule && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingCapsule(false)}
                className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-brand-cream rounded-[2.5rem] p-8 shadow-2xl border border-brand-gold/20"
              >
                <h3 className="text-2xl font-serif mb-6">מכתב לעתיד</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black/40 mb-2">המסר שלכם</label>
                    <textarea 
                      value={newCapsule.content}
                      onChange={(e) => setNewCapsule(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold outline-none min-h-[150px] resize-none"
                      placeholder="מה תרצו להגיד לעצמכם בעוד שנה? שנתיים?..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black/40 mb-2">תאריך פתיחה</label>
                    <input 
                      type="date" 
                      value={newCapsule.unlockDate}
                      onChange={(e) => setNewCapsule(prev => ({ ...prev, unlockDate: e.target.value }))}
                      className="w-full bg-white border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-gold outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsAddingCapsule(false)}
                      className="flex-1 py-4 bg-brand-black/5 text-brand-black rounded-full font-bold uppercase tracking-widest"
                    >
                      ביטול
                    </button>
                    <button 
                      onClick={addCapsule}
                      disabled={!newCapsule.content || !newCapsule.unlockDate}
                      className="flex-1 py-4 bg-brand-black text-brand-gold rounded-full font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      נעילת הקפסולה
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
