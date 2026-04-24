import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Music, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CustomPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playlist: any) => void;
}

export const CustomPlaylistModal: React.FC<CustomPlaylistModalProps> = ({ isOpen, onClose, onSave }) => {
  const [customPlaylist, setCustomPlaylist] = useState({
    title: '',
    mood: '',
    genre: '',
    era: '',
    platform: 'Spotify'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!customPlaylist.title || !customPlaylist.mood) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a playlist based on this info: 
        Title: ${customPlaylist.title}
        Mood: ${customPlaylist.mood}
        Genre: ${customPlaylist.genre}
        Era: ${customPlaylist.era}
        Platform: ${customPlaylist.platform}.
        Return ONLY a JSON object with this structure:
        {
          "title": "${customPlaylist.title}",
          "description": "A short description of the vibe",
          "tracks": ["Song Name - Artist", "Song Name - Artist", ...] (at least 10 songs)
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const data = JSON.parse(response.text);
      onSave({ ...data, platform: customPlaylist.platform });
      onClose();
    } catch (error) {
      console.error("Error generating custom playlist:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-brand-cream w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="bg-brand-black p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Music className="text-brand-gold" size={24} />
                <h3 className="font-serif text-2xl">יצירת פלייליסט מותאם</h3>
              </div>
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-black/60 mb-2">שם הפלייליסט</label>
                <input 
                  type="text" 
                  value={customPlaylist.title}
                  onChange={(e) => setCustomPlaylist({...customPlaylist, title: e.target.value})}
                  className="w-full bg-white border border-brand-gold/20 p-3 outline-none focus:border-brand-gold transition-colors"
                  placeholder="למשל: נסיעה ארוכה לצפון"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-black/60 mb-2">אווירה / מצב רוח</label>
                <input 
                  type="text" 
                  value={customPlaylist.mood}
                  onChange={(e) => setCustomPlaylist({...customPlaylist, mood: e.target.value})}
                  className="w-full bg-white border border-brand-gold/20 p-3 outline-none focus:border-brand-gold transition-colors"
                  placeholder="למשל: רגוע, אנרגטי, רומנטי..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-black/60 mb-2">ז'אנר (אופציונלי)</label>
                  <input 
                    type="text" 
                    value={customPlaylist.genre}
                    onChange={(e) => setCustomPlaylist({...customPlaylist, genre: e.target.value})}
                    className="w-full bg-white border border-brand-gold/20 p-3 outline-none focus:border-brand-gold transition-colors"
                    placeholder="למשל: ג'אז, פופ..."
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-black/60 mb-2">תקופה (אופציונלי)</label>
                  <input 
                    type="text" 
                    value={customPlaylist.era}
                    onChange={(e) => setCustomPlaylist({...customPlaylist, era: e.target.value})}
                    className="w-full bg-white border border-brand-gold/20 p-3 outline-none focus:border-brand-gold transition-colors"
                    placeholder="למשל: שנות ה-80..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-brand-black/60 mb-2">פלטפורמה</label>
                <select 
                  value={customPlaylist.platform}
                  onChange={(e) => setCustomPlaylist({...customPlaylist, platform: e.target.value})}
                  className="w-full bg-white border border-brand-gold/20 p-3 outline-none focus:border-brand-gold transition-colors"
                >
                  <option value="Spotify">Spotify</option>
                  <option value="Apple Music">Apple Music</option>
                  <option value="YouTube Music">YouTube Music</option>
                </select>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={!customPlaylist.title || !customPlaylist.mood || isGenerating}
                className="w-full bg-brand-gold text-white py-4 uppercase tracking-widest text-sm font-bold hover:bg-brand-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : 'צור פלייליסט'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
