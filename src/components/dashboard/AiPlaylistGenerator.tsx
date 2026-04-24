import React, { useState } from 'react';
import { Sparkles, Loader2, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

export const AiPlaylistGenerator = ({ onSave }: { onSave: (playlist: any) => void }) => {
  const [aiPlaylistPrompt, setAiPlaylistPrompt] = useState('');
  const [selectedPlatformForGeneration, setSelectedPlatformForGeneration] = useState('Spotify');
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<any>(null);

  const handleGeneratePlaylist = async () => {
    if (!aiPlaylistPrompt) return;
    setIsGeneratingPlaylist(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a playlist based on this mood/prompt: "${aiPlaylistPrompt}". 
        Platform: ${selectedPlatformForGeneration}.
        Return ONLY a JSON object with this structure:
        {
          "title": "A creative title for the playlist",
          "description": "A short description of the vibe",
          "tracks": ["Song Name - Artist", "Song Name - Artist", ...] (at least 10 songs)
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const data = JSON.parse(response.text);
      setGeneratedPlaylist(data);
    } catch (error) {
      console.error("Error generating playlist:", error);
    } finally {
      setIsGeneratingPlaylist(false);
    }
  };

  return (
    <div className="mb-16 bg-brand-cream/10 border border-brand-gold/20 p-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="text-brand-gold" size={20} />
        <h4 className="font-serif text-xl">יוצר הפלייליסטים האישי (AI)</h4>
      </div>
      <p className="text-xs text-brand-black/50 mb-6">ספרו לנו איך אתם מרגישים, מה האווירה שאתם מחפשים, או כל דבר שעולה לכם לראש - וה-AI שלנו ירכיב לכם פלייליסט מושלם.</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {['רומנטי', 'רגוע', 'אנרגטי', 'נוסטלגי', 'סקסי', 'שיחה עמוקה'].map(mood => (
          <button 
            key={mood}
            onClick={() => setAiPlaylistPrompt(mood)}
            className={`px-3 py-1.5 border text-[10px] uppercase tracking-widest transition-all ${aiPlaylistPrompt === mood ? 'bg-brand-gold border-brand-gold text-black' : 'border-brand-gold/20 text-brand-black/60 hover:border-brand-gold hover:text-brand-gold'}`}
          >
            {mood}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            value={aiPlaylistPrompt}
            onChange={(e) => setAiPlaylistPrompt(e.target.value)}
            placeholder="למשל: ערב גשום ורומנטי, אווירה של דייט ראשון, שירים מרגיעים לשיחה עמוקה..."
            className="flex-1 bg-white border border-brand-gold/10 px-4 py-3 text-sm outline-none focus:border-brand-gold transition-all"
          />
          <select 
            value={selectedPlatformForGeneration}
            onChange={(e) => setSelectedPlatformForGeneration(e.target.value)}
            className="bg-white border border-brand-gold/10 px-3 py-3 text-[10px] uppercase tracking-widest outline-none focus:border-brand-gold"
          >
            <option value="Spotify">Spotify</option>
            <option value="Apple Music">Apple Music</option>
            <option value="YouTube Music">YouTube Music</option>
          </select>
        </div>
        <button 
          onClick={handleGeneratePlaylist}
          disabled={!aiPlaylistPrompt || isGeneratingPlaylist}
          className="bg-brand-black text-white px-8 py-3 text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
        >
          {isGeneratingPlaylist ? <Loader2 size={16} className="animate-spin" /> : 'צור פלייליסט'}
        </button>
      </div>

      {generatedPlaylist && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white border border-brand-gold/20 p-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
              <Music size={20} />
            </div>
            <div>
              <h5 className="font-serif text-lg mb-1">{generatedPlaylist.title}</h5>
              <p className="text-xs text-brand-black/50">{generatedPlaylist.description}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {generatedPlaylist.tracks.map((track: string, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 hover:bg-brand-cream/20 transition-colors border-b border-brand-gold/5 last:border-0">
                <span className="text-brand-gold/50 text-xs w-4">{idx + 1}</span>
                <span className="text-sm font-medium">{track}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-brand-gold/10 flex justify-end gap-4">
            <button 
              onClick={() => {
                onSave({
                  id: Date.now().toString(),
                  title: generatedPlaylist.title,
                  platform: selectedPlatformForGeneration,
                  url: '#',
                  thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
                  tracks: generatedPlaylist.tracks
                });
                setGeneratedPlaylist(null);
                setAiPlaylistPrompt('');
              }}
              className="text-[10px] uppercase tracking-widest text-brand-gold font-bold border-b border-brand-gold pb-1 hover:text-brand-black hover:border-brand-black transition-all"
            >
              שמור לספרייה שלי
            </button>
            <button className="text-[10px] uppercase tracking-widest text-brand-gold hover:text-brand-black transition-colors flex items-center gap-2">
              <span>פתח ב-{selectedPlatformForGeneration}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
