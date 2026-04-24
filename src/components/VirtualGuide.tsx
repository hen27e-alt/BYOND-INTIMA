import React from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface VirtualGuideProps {
  videoUrl?: string; // URL of the Veo3 generated video
  title?: string;
  description?: string;
}

export const VirtualGuide: React.FC<VirtualGuideProps> = ({ 
  videoUrl = "https://drive.google.com/file/d/1WQW1jK39VWP4hjae-fU6LxWtkmz4OdD-/view?usp=sharing",
  title = "המדריכה הווירטואלית שלכם",
  description = "טיפים, רעיונות והכוונה לזוגיות טובה יותר, מונחה על ידי ה-AI שלנו."
}) => {
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const getDriveId = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const driveId = videoUrl ? getDriveId(videoUrl) : null;

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl max-w-4xl mx-auto"
    >
      <div className="relative aspect-video bg-black group">
        {driveId ? (
          <iframe
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        )}
        
        {/* Video Controls Overlay (Only for native video) */}
        {!driveId && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleMute}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              <button 
                onClick={handleFullscreen}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 md:p-12 text-center">
        <h3 className="text-3xl font-serif text-white mb-4">{title}</h3>
        <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button className="px-8 py-3 bg-brand-gold text-black rounded-full font-bold hover:bg-white transition-colors">
            צפו בטיפ השבועי
          </button>
          <button className="px-8 py-3 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors">
            שאלות ותשובות
          </button>
        </div>
      </div>
    </motion.div>
  );
};
