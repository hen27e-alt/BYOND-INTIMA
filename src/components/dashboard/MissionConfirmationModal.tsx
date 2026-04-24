import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';

interface MissionConfirmationModalProps {
  confirmMission: any;
  setConfirmMission: (mission: any) => void;
  missionImage: File | null;
  setMissionImage: (file: File | null) => void;
  handleCompleteMission: () => Promise<void>;
  isUploading: boolean;
}

export const MissionConfirmationModal = ({ 
  confirmMission, 
  setConfirmMission, 
  missionImage, 
  setMissionImage, 
  handleCompleteMission, 
  isUploading 
}: MissionConfirmationModalProps) => (
  <AnimatePresence>
    {confirmMission && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white max-w-md w-full p-6 md:p-10 text-center relative"
        >
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="text-brand-gold" size={32} />
          </div>
          <h3 className="text-2xl font-serif mb-4">האם סיימתם את המשימה?</h3>
          <p className="text-brand-black/60 mb-6 leading-relaxed">
            בטוחים שסיימתם את המשימה <span className="text-brand-black font-medium">"{confirmMission.title}"</span>? 
            לאחר האישור תקבלו {confirmMission.points} נקודות למדליה הבאה שלכם.
          </p>

          <div className="mb-8">
            <label className="block text-[10px] uppercase tracking-widest text-brand-black/40 mb-3 text-right">הוסיפו תמונה מהמשימה (אופציונלי)</label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setMissionImage(e.target.files?.[0] || null)}
                className="hidden" 
                id="mission-image-upload"
              />
              <label 
                htmlFor="mission-image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brand-gold/20 bg-brand-cream/10 hover:bg-brand-gold/5 hover:border-brand-gold/40 transition-all cursor-pointer overflow-hidden"
              >
                {missionImage ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={URL.createObjectURL(missionImage)} 
                      alt="Selected" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <RefreshCw className="text-white" size={20} />
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="text-brand-gold/40 mb-2" size={24} />
                    <span className="text-[10px] uppercase tracking-widest text-brand-black/40">לחצו להעלאת תמונה</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleCompleteMission}
              disabled={isUploading}
              className="flex-1 bg-brand-black text-white py-4 text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  מעלה...
                </>
              ) : (
                'כן, סיימנו!'
              )}
            </button>
            <button 
              onClick={() => {
                setConfirmMission(null);
                setMissionImage(null);
              }}
              disabled={isUploading}
              className="flex-1 border border-brand-gold/20 py-4 text-[10px] uppercase tracking-widest hover:bg-brand-cream transition-all disabled:opacity-50"
            >
              עדיין לא
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
