import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Loader2, Volume2, Square, Activity, HeartHandshake, AlertCircle, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { useFirebase } from '../contexts/FirebaseContext';
import { useAlert } from './AlertModal';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const LiveCounselor = () => {
  const { profile } = useFirebase();
  const { showAlert } = useAlert();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mode, setMode] = useState<'audio' | 'text'>('text');
  const [error, setError] = useState<string | null>(null);
  
  // Text Mode State
  const [partner1Input, setPartner1Input] = useState('');
  const [partner2Input, setPartner2Input] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediationResult, setMediationResult] = useState<any>(null);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Audio processing setup
  const initAudio = async () => {
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
    
    processor.onaudioprocess = (e) => {
      if (!isConnected || !sessionRef.current) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Convert to base64
      const buffer = new ArrayBuffer(pcm16.length * 2);
      const view = new DataView(buffer);
      pcm16.forEach((val, i) => view.setInt16(i * 2, val, true));
      
      const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer) as unknown as number[]));
      
      sessionRef.current.sendRealtimeInput({
        media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
      });
    };
  };

  const playAudioChunk = (base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    const binaryStr = atob(base64Audio);
    const buffer = new ArrayBuffer(binaryStr.length);
    const view = new DataView(buffer);
    for (let i = 0; i < binaryStr.length; i++) {
      view.setUint8(i, binaryStr.charCodeAt(i));
    }
    
    // Convert PCM16 to Float32
    const pcm16 = new Int16Array(buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7FFF);
    }
    
    audioQueueRef.current.push(float32);
    if (!isPlayingRef.current) {
      processAudioQueue();
    }
  };

  const processAudioQueue = () => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }
    
    isPlayingRef.current = true;
    setIsSpeaking(true);
    
    const chunk = audioQueueRef.current.shift()!;
    const audioBuffer = audioContextRef.current.createBuffer(1, chunk.length, 24000);
    audioBuffer.getChannelData(0).set(chunk);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    if (nextPlayTimeRef.current < currentTime) {
      nextPlayTimeRef.current = currentTime;
    }
    
    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += audioBuffer.duration;
    
    source.onended = () => {
      processAudioQueue();
    };
  };

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await initAudio();
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
          },
          systemInstruction: `אתה מגשר זוגי AI מקצועי, אמפתי, אובייקטיבי ומכיל. 
          אתה עוזר לזוגות לנווט קונפליקטים, לנתח סיטואציות משני הצדדים, ולספק פתרונות בונים.
          שמות בני הזוג: ${profile?.name || 'צד א\''} ובן/בת הזוג.
          דבר בעברית בלבד. שאל שאלות מנחות, הקשב היטב, ואל תשפוט. 
          המטרה שלך היא להוריד מתח, לעזור להם להבין אחד את השנייה טוב יותר, ולהציע צעדים פרקטיים לפתרון.`
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              audioQueueRef.current = [];
              nextPlayTimeRef.current = audioContextRef.current?.currentTime || 0;
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              playAudioChunk(base64Audio);
            }
          },
          onclose: () => {
            stopSession();
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            stopSession();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start session:", error);
      setError('לא נמצא מיקרופון או שאין הרשאה');
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
    audioQueueRef.current = [];
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const handleTextMediation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner1Input.trim() || !partner2Input.trim()) return;

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
      You are an expert AI Relationship Mediator. Analyze a conflict between a couple based on their two perspectives.
      
      Perspective 1 (${profile?.name || 'Partner A'}): "${partner1Input}"
      Perspective 2 (Partner B): "${partner2Input}"

      Provide a constructive, empathetic, and objective mediation analysis in Hebrew.
      Format the response as a JSON object (do not use markdown blocks, just raw JSON) with the following structure:
      {
        "coreIssue": "A brief summary of the underlying core issue (not just the surface argument).",
        "validation": {
          "partner1": "Validation of Partner 1's feelings.",
          "partner2": "Validation of Partner 2's feelings."
        },
        "misunderstandings": ["List of 1-2 potential misunderstandings or miscommunications."],
        "actionableAdvice": ["List of 2-3 practical, constructive steps they can take right now to resolve this and reconnect."]
      }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const result = JSON.parse(response.text || '{}');
      setMediationResult(result);
    } catch (error) {
      console.error("Mediation failed:", error);
      showAlert("אירעה שגיאה בניתוח. אנא נסו שוב.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-white flex items-center justify-center gap-3">
          <HeartHandshake className="text-brand-gold" size={32} /> מגשר זוגי AI
        </h2>
        <p className="text-white/40 mt-2">מרחב בטוח לפתרון קונפליקטים, הבנת הצד השני ומציאת עמק השווה.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setMode('text')}
          className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
            mode === 'text' ? 'bg-brand-gold text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <MessageSquare size={18} /> גישור טקסטואלי
        </button>
        <button
          onClick={() => setMode('audio')}
          className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
            mode === 'audio' ? 'bg-brand-gold text-black' : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <Volume2 size={18} /> שיחה קולית חיה
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'audio' ? (
          <motion.div
            key="audio-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-center gap-3 text-sm max-w-md mx-auto">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}
            <div className="bg-white/5 border border-white/10 rounded-full w-64 h-64 mx-auto flex items-center justify-center relative">
              {isConnected && (
                <>
                  <motion.div
                    animate={{ scale: isSpeaking ? [1, 1.2, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-brand-gold/20 rounded-full blur-xl"
                  />
                  <motion.div
                    animate={{ scale: isSpeaking ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                    className="absolute inset-4 bg-brand-gold/20 rounded-full blur-md"
                  />
                </>
              )}
              
              <div className="relative z-10 text-brand-gold">
                {isConnecting ? (
                  <Loader2 size={48} className="animate-spin" />
                ) : isConnected ? (
                  isSpeaking ? <Activity size={64} className="animate-pulse" /> : <Mic size={64} />
                ) : (
                  <MicOff size={64} className="text-white/20" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-white/60 font-medium">
                {isConnecting ? 'מתחבר למגשר...' : 
                 isConnected ? (isSpeaking ? 'המגשר מדבר...' : 'המגשר מקשיב לכם...') : 
                 'לחצו על הכפתור כדי להתחיל שיחת גישור'}
              </p>
              
              {!isConnected ? (
                <button
                  onClick={startSession}
                  disabled={isConnecting}
                  className="px-8 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                >
                  <Volume2 size={20} /> התחל שיחה
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="px-8 py-4 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Square size={20} /> סיים שיחה
                </button>
              )}
            </div>
            
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-right text-sm text-white/60 max-w-2xl mx-auto">
              <h4 className="text-brand-gold font-medium mb-2">איך זה עובד?</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>לחצו על "התחל שיחה" ואשרו גישה למיקרופון.</li>
                <li>דברו בטבעיות, המגשר יקשיב לשניכם, ישאל שאלות ויעזור לכם להבין אחד את השנייה.</li>
                <li>השיחה פרטית לחלוטין ולא נשמרת.</li>
                <li>מומלץ לשים את הטלפון על רמקול ביניכם.</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="text-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {!mediationResult ? (
              <form onSubmit={handleTextMediation} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xl font-serif text-brand-gold flex items-center gap-2">
                      <ShieldAlert size={20} /> הצד של {profile?.name || 'צד א\''}
                    </h3>
                    <p className="text-sm text-white/60">תארו את הסיטואציה מנקודת המבט שלכם. מה קרה? איך אתם מרגישים?</p>
                    <textarea
                      value={partner1Input}
                      onChange={e => setPartner1Input(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-gold/50 min-h-[200px] text-right"
                      placeholder="אני מרגיש/ה ש..."
                      required
                    />
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-xl font-serif text-brand-gold flex items-center gap-2">
                      <ShieldAlert size={20} /> הצד השני
                    </h3>
                    <p className="text-sm text-white/60">תארו את הסיטואציה מנקודת המבט שלכם. מה קרה? איך אתם מרגישים?</p>
                    <textarea
                      value={partner2Input}
                      onChange={e => setPartner2Input(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-brand-gold/50 min-h-[200px] text-right"
                      placeholder="אני מרגיש/ה ש..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isAnalyzing || !partner1Input.trim() || !partner2Input.trim()}
                    className="px-10 py-4 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-3 disabled:opacity-50 text-lg"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={24} /> : <HeartHandshake size={24} />}
                    נתח את הקונפליקט והצע פתרון
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-brand-gold/30 rounded-3xl p-8 space-y-8"
              >
                <div className="text-center border-b border-white/10 pb-6">
                  <h3 className="text-2xl font-serif text-brand-gold mb-2">תובנות הגישור</h3>
                  <p className="text-white/60">ניתוח אובייקטיבי של הסיטואציה והצעות להמשך.</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <AlertCircle className="text-brand-gold" size={20} /> שורש העניין
                    </h4>
                    <p className="text-white/80 leading-relaxed">{mediationResult.coreIssue}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-brand-gold/5 p-6 rounded-2xl border border-brand-gold/10">
                      <h4 className="font-bold text-brand-gold mb-2">הרגשות של {profile?.name || 'צד א\''}</h4>
                      <p className="text-white/80 text-sm leading-relaxed">{mediationResult.validation.partner1}</p>
                    </div>
                    <div className="bg-brand-gold/5 p-6 rounded-2xl border border-brand-gold/10">
                      <h4 className="font-bold text-brand-gold mb-2">הרגשות של הצד השני</h4>
                      <p className="text-white/80 text-sm leading-relaxed">{mediationResult.validation.partner2}</p>
                    </div>
                  </div>

                  {mediationResult.misunderstandings?.length > 0 && (
                    <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="text-brand-gold" size={20} /> אי הבנות אפשריות
                      </h4>
                      <ul className="space-y-2">
                        {mediationResult.misunderstandings.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-white/80">
                            <span className="text-brand-gold mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-brand-gold/10 p-6 rounded-2xl border border-brand-gold/30">
                    <h4 className="text-lg font-bold text-brand-gold mb-4 flex items-center gap-2">
                      <CheckCircle2 size={20} /> צעדים לפתרון
                    </h4>
                    <ul className="space-y-3">
                      {mediationResult.actionableAdvice?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-white">
                          <div className="w-6 h-6 rounded-full bg-brand-gold text-black flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      setMediationResult(null);
                      setPartner1Input('');
                      setPartner2Input('');
                    }}
                    className="px-8 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all"
                  >
                    התחל גישור חדש
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
