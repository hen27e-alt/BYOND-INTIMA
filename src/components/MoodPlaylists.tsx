import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, Loader2, Sparkles, Disc, Plus, ExternalLink, Heart, Calendar } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAlert } from './AlertModal';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MOODS = [
  { id: 'romantic', label: 'רומנטי ואינטימי', icon: '🍷' },
  { id: 'chill', label: 'צ\'יל בבית', icon: '🛋️' },
  { id: 'roadtrip', label: 'נסיעה באוטו', icon: '🚗' },
  { id: 'workout', label: 'אימון זוגי', icon: '💪' },
  { id: 'nostalgic', label: 'נוסטלגיה ישראלית', icon: '📻' },
  { id: 'cooking', label: 'מבשלים יחד', icon: '🍳' },
];

export const MoodPlaylists = () => {
  const { showAlert } = useAlert();
  const [selectedMood, setSelectedMood] = useState('');
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [dateIdeas, setDateIdeas] = useState<any[]>([]);
  const [isGeneratingDates, setIsGeneratingDates] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setConnectedPlatforms(prev => [...new Set([...prev, event.data.platform])]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connectPlatform = async (platform: 'Spotify' | 'Apple Music') => {
    const endpoint = platform === 'Spotify' ? '/api/auth/spotify/url' : '/api/auth/apple-music/url';
    try {
      const res = await fetch(endpoint);
      const { url } = await res.json();
      window.open(url, 'oauth_popup', 'width=600,height=700');
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
    }
  };

  const generatePlaylist = async (moodId: string) => {
    setSelectedMood(moodId);
    setIsGenerating(true);
    setPlaylist([]);

    const moodLabel = MOODS.find(m => m.id === moodId)?.label || moodId;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `צור פלייליסט של 5 שירים שמתאימים למצב הרוח: ${moodLabel}. 
          השירים צריכים להיות מוכרים ואהובים (אפשר לשלב עברית ואנגלית). 
          החזר מערך JSON של אובייקטים עם title, artist, ו-reason.`,
        config: {
          systemInstruction: "You are a professional DJ and music curator. Create a highly curated, vibe-specific playlist. Return ONLY a valid JSON array of objects.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Song title" },
                artist: { type: Type.STRING, description: "Artist name" },
                reason: { type: Type.STRING, description: "Why this song fits the mood" }
              },
              required: ["title", "artist", "reason"]
            }
          }
        }
      });

      const songs = JSON.parse(response.text?.trim() || "[]");
      setPlaylist(songs);
    } catch (error) {
      console.error("Error generating playlist:", error);
      setPlaylist([
        { title: 'Perfect', artist: 'Ed Sheeran', reason: 'קלאסיקה רומנטית שתמיד עובדת.' },
        { title: 'זכיתי לאהוב', artist: 'עברי לידר', reason: 'שיר ישראלי מרגש שנוגע בלב.' }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestDateIdeas = async () => {
    if (connectedPlatforms.length === 0) return;
    setIsGeneratingDates(true);
    setDateIdeas([]);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `בהתבסס על העובדה שהמשתמש מחובר ל-${connectedPlatforms.join(' ו-')}, 
          הצע 3 רעיונות לדייטים יצירתיים שקשורים למוזיקה או לאווירה מוזיקלית.
          החזר מערך JSON של אובייקטים עם title, description, ו-icon (emoji).`,
        config: {
          systemInstruction: "You are a creative date planner. Suggest dates inspired by music preferences. Return ONLY a valid JSON array.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ["title", "description", "icon"]
            }
          }
        }
      });

      const ideas = JSON.parse(response.text?.trim() || "[]");
      setDateIdeas(ideas);
    } catch (error) {
      console.error("Error generating date ideas:", error);
    } finally {
      setIsGeneratingDates(false);
    }
  };

  const createSharedPlaylist = () => {
    // In a real app, this would call a backend endpoint to create a playlist on Spotify/Apple Music
    showAlert("יוצר פלייליסט משותף בחשבון ה-Spotify שלכם...");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-brand-black flex items-center justify-center gap-3">
          <Music className="text-brand-gold" /> חוויה מוזיקלית זוגית
        </h2>
        <p className="text-brand-black/60 mt-2">חברו את החשבונות שלכם, צרו פלייליסטים משותפים וקבלו המלצות לדייטים מבוססות מוזיקה.</p>
      </div>

      {/* Connection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => connectPlatform('Spotify')}
          className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
            connectedPlatforms.includes('Spotify')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-white border-brand-gold/10 text-brand-black hover:border-brand-gold/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center text-white">
              <Music size={24} />
            </div>
            <div className="text-right">
              <h3 className="font-bold">Spotify</h3>
              <p className="text-xs opacity-60">{connectedPlatforms.includes('Spotify') ? 'מחובר' : 'לחצו לחיבור חשבון'}</p>
            </div>
          </div>
          {connectedPlatforms.includes('Spotify') ? <Heart size={20} fill="currentColor" /> : <Plus size={20} />}
        </button>

        <button
          onClick={() => connectPlatform('Apple Music')}
          className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
            connectedPlatforms.includes('Apple Music')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-white border-brand-gold/10 text-brand-black hover:border-brand-gold/30'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FA243C] rounded-full flex items-center justify-center text-white">
              <Disc size={24} />
            </div>
            <div className="text-right">
              <h3 className="font-bold">Apple Music</h3>
              <p className="text-xs opacity-60">{connectedPlatforms.includes('Apple Music') ? 'מחובר' : 'לחצו לחיבור חשבון'}</p>
            </div>
          </div>
          {connectedPlatforms.includes('Apple Music') ? <Heart size={20} fill="currentColor" /> : <Plus size={20} />}
        </button>
      </div>

      {connectedPlatforms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button
            onClick={suggestDateIdeas}
            disabled={isGeneratingDates}
            className="px-8 py-3 bg-brand-gold text-white rounded-full font-bold shadow-lg hover:bg-brand-black transition-all flex items-center gap-2"
          >
            {isGeneratingDates ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            המלצות לדייטים לפי הטעם שלנו
          </button>
          <button
            onClick={createSharedPlaylist}
            className="px-8 py-3 bg-brand-black text-white rounded-full font-bold shadow-lg hover:bg-brand-gold hover:text-brand-black transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            צור פלייליסט זוגי משותף
          </button>
        </motion.div>
      )}

      {/* Date Ideas Display */}
      <AnimatePresence>
        {dateIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {dateIdeas.map((idea, idx) => (
              <div key={idx} className="bg-white border border-brand-gold/10 p-6 rounded-3xl shadow-sm hover:border-brand-gold/30 transition-all">
                <div className="text-4xl mb-4">{idea.icon}</div>
                <h4 className="text-xl font-serif text-brand-gold mb-2">{idea.title}</h4>
                <p className="text-brand-black/60 text-sm">{idea.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-brand-gold/10 pt-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-serif text-brand-black">פלייליסטים לפי מצב רוח</h3>
          <p className="text-brand-black/40 mt-2">בחרו את האווירה שלכם, וה-AI שלנו ירכיב לכם את הפסקול המושלם לרגע.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => generatePlaylist(mood.id)}
              disabled={isGenerating}
              className={`p-6 rounded-3xl border transition-all flex flex-col items-center justify-center gap-3 ${
                selectedMood === mood.id 
                  ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' 
                  : 'bg-white border-brand-gold/10 text-brand-black hover:bg-brand-cream/50'
              }`}
            >
              <span className="text-4xl">{mood.icon}</span>
              <span className="font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 text-center"
          >
            <Loader2 size={48} className="text-brand-gold animate-spin mx-auto mb-4" />
            <p className="text-brand-gold/60 font-serif italic">מרכיב את הפלייליסט המושלם...</p>
          </motion.div>
        ) : playlist.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white border border-brand-gold/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Disc className="text-brand-gold animate-spin-slow" size={32} />
                <h3 className="text-2xl font-serif text-brand-black">הפסקול שלכם</h3>
              </div>
              
              <div className="space-y-4">
                {playlist.map((song, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-brand-cream/20 rounded-2xl border border-brand-gold/5 hover:border-brand-gold/30 transition-colors group"
                  >
                    <div className="flex-1 text-right">
                      <h4 className="text-lg text-brand-black font-medium">{song.title}</h4>
                      <p className="text-brand-gold text-sm">{song.artist}</p>
                      <p className="text-brand-black/40 text-xs mt-1">{song.reason}</p>
                    </div>
                    <a 
                      href={connectedPlatforms.includes('Spotify') ? `https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold group-hover:text-white transition-all shadow-sm"
                      aria-label={`נגן את השיר ${song.title} מאת ${song.artist}`}
                    >
                      <Play size={20} className="ml-1" />
                    </a>
                  </motion.div>
                ))}
              </div>
              
              {connectedPlatforms.includes('Spotify') && (
                <div className="mt-8 pt-8 border-t border-brand-gold/10">
                  <h4 className="text-lg font-serif text-brand-black mb-4 flex items-center gap-2">
                    <Music size={18} className="text-[#1DB954]" />
                    המלצות Spotify מותאמות אישית
                  </h4>
                  <iframe 
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator" 
                    width="100%" 
                    height="152" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    className="rounded-xl shadow-sm"
                  ></iframe>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
