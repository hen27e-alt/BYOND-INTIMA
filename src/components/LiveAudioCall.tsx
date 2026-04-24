import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AudioStreamer, AudioPlayer } from '../lib/audio';
import { BRANDING } from '../constants/branding';
import { Phone, PhoneOff, Mic, MicOff, Loader2, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveAudioCallProps {
  isOpen: boolean;
  onClose: () => void;
  conciergeName?: string;
}

export const LiveAudioCall: React.FC<LiveAudioCallProps> = ({ isOpen, onClose, conciergeName = 'אריאל' }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(() => localStorage.getItem('byond_audio_permission') === 'granted');
  
  const sessionRef = useRef<any>(null);
  const streamerRef = useRef<AudioStreamer | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && hasPermission) {
      startCall();
    } else if (!isOpen) {
      endCall();
    }
    return () => endCall();
  }, [isOpen, hasPermission]);

  const handleStartCall = () => {
    localStorage.setItem('byond_audio_permission', 'granted');
    setHasPermission(true);
    startCall();
  };

  const toggleVideo = async () => {
    if (!isVideoEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoEnabled(true);
      } catch (err) {
        console.error("Camera error:", err);
      }
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsVideoEnabled(false);
    }
  };

  const startCall = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('No Gemini API key found');

      const ai = new GoogleGenAI({ apiKey });
      
      playerRef.current = new AudioPlayer();
      playerRef.current.init();

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are ${conciergeName}, a helpful and empathetic couples counselor and concierge. Speak in Hebrew. Keep your answers concise and conversational.`,
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            streamerRef.current = new AudioStreamer((base64Data) => {
              if (!isMuted) {
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              }
            });
            streamerRef.current.start().catch((err) => {
              console.error('Failed to start audio streamer:', err);
              setError('לא נמצא מיקרופון או שאין הרשאה');
              endCall();
            });

            // Video Frame Loop
            if (isVideoEnabled) {
              const videoInterval = setInterval(() => {
                if (videoRef.current && canvasRef.current && sessionPromise) {
                  const canvas = canvasRef.current;
                  const video = videoRef.current;
                  canvas.width = 320;
                  canvas.height = 240;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                    sessionPromise.then((session) => {
                      session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                    });
                  }
                }
              }, 1000);
              (sessionPromise as any)._videoInterval = videoInterval;
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && playerRef.current) {
              playerRef.current.playBase64(base64Audio);
            }
            if (message.serverContent?.interrupted && playerRef.current) {
              playerRef.current.stop();
            }
          },
          onerror: (err) => {
            console.error('Live API Error:', err);
            setError('שגיאה בחיבור לשיחה');
            endCall();
          },
          onclose: () => {
            setIsConnected(false);
            endCall();
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error('Failed to start call:', err);
      setError('לא ניתן להתחיל שיחה כעת');
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (streamerRef.current) {
      streamerRef.current.stop();
      streamerRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => {
        if (session._videoInterval) clearInterval(session._videoInterval);
        session.close();
      }).catch(console.error);
      sessionRef.current = null;
    }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsConnected(false);
    setIsConnecting(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`fixed z-[200] bg-brand-black text-white shadow-2xl overflow-hidden border border-brand-gold/20 transition-all duration-500 ${
            isFullScreen 
              ? 'inset-0 rounded-none' 
              : 'bottom-24 left-4 lg:left-8 w-[calc(100vw-2rem)] sm:w-[400px] rounded-3xl'
          }`}
        >
          <div className={`relative flex flex-col ${isFullScreen ? 'h-full' : 'min-h-[400px]'}`}>
            {/* Video / Visualizer Area */}
            <div className={`relative bg-neutral-900 flex items-center justify-center overflow-hidden ${isFullScreen ? 'flex-1' : 'h-64'}`}>
              {/* AI Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: isConnected ? [1, 1.2, 1] : 1,
                    opacity: isConnected ? [0.2, 0.4, 0.2] : 0.1,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-64 h-64 bg-brand-gold rounded-full blur-3xl"
                />
                <div className="relative z-10 w-24 h-24 rounded-full border-2 border-brand-gold/50 overflow-hidden bg-brand-black flex items-center justify-center">
                  <img 
                    src={BRANDING.avatarUrl} 
                    alt="AI" 
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              </div>

              {/* User Video (PIP) */}
              <AnimatePresence>
                {isVideoEnabled && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`absolute top-4 right-4 bg-black rounded-xl border border-brand-gold/30 overflow-hidden shadow-2xl z-20 ${
                      isFullScreen ? 'w-64 aspect-video' : 'w-32 aspect-video'
                    }`}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <canvas ref={canvasRef} className="hidden" />

              {/* Status Overlay */}
              <div className="absolute bottom-4 left-0 right-0 text-center z-30">
                <p className="text-brand-gold text-[10px] uppercase tracking-[0.2em] font-bold">
                  {isConnecting ? 'Connecting...' : isConnected ? 'Live Video Call' : 'Ready'}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center bg-brand-black">
              <h3 className="text-xl font-serif mb-1">שיחה עם {conciergeName}</h3>
              <p className="text-xs text-white/40 mb-6 text-center uppercase tracking-widest">
                {!hasPermission 
                  ? 'נדרשת הרשאת מיקרופון' 
                  : isConnecting ? 'מתחבר לשרת...' : isConnected ? 'שיחה מאובטחת' : error || 'ממתין לחיבור'}
              </p>

              {!hasPermission ? (
                <button 
                  onClick={handleStartCall}
                  className="w-full py-4 bg-brand-gold text-brand-black rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <Mic size={20} /> התחלת שיחה
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <button 
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!isVideoEnabled ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-brand-gold text-black'}`}
                    title={isVideoEnabled ? "Turn Video Off" : "Turn Video On"}
                  >
                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all text-white shadow-xl"
                    title="End Call"
                  >
                    <PhoneOff size={28} />
                  </button>

                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                    title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
