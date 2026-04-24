import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface VideoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoTourModal: React.FC<VideoTourModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-brand-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-brand-cream w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-brand-gold/20 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-brand-gold/10 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold">
                  <Play size={20} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-brand-black">סיור מודרך באתר</h2>
                  <p className="text-sm text-brand-black/60 italic">גלו את כל האפשרויות והכלים שיש לנו להציע</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-brand-black/5 flex items-center justify-center text-brand-black/40 hover:text-brand-black hover:bg-brand-black/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black w-full flex-1">
              {/* Placeholder for actual video - using a high quality stock video or YouTube embed */}
              <iframe
                className="w-full h-full absolute inset-0"
                src="https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1&loop=1&controls=1" // Placeholder URL
                title="Video Tour"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Optional Overlay for aesthetics if video is just a placeholder */}
              <div className="absolute inset-0 pointer-events-none border-[8px] border-brand-cream/10 rounded-lg m-4"></div>
            </div>

            {/* Footer / Features List */}
            <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0 mt-1">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-black text-sm mb-1">חוויות מותאמות אישית</h4>
                  <p className="text-xs text-brand-black/60 leading-relaxed">גלו את החוויות והמשחקים שלנו, המותאמים במיוחד לזוגיות שלכם.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0 mt-1">
                  <Info size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-black text-sm mb-1">אזור אישי חכם</h4>
                  <p className="text-xs text-brand-black/60 leading-relaxed">עקבו אחר ההתקדמות שלכם, שמרו זכרונות ונהלו את החשבון שלכם בקלות.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold shrink-0 mt-1">
                  <Play size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-brand-black text-sm mb-1">ייעוץ AI מתקדם</h4>
                  <p className="text-xs text-brand-black/60 leading-relaxed">השתמשו ביועץ ה-AI שלנו לפתרון קונפליקטים, רעיונות לדייטים ועוד.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
