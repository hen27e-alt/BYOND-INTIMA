import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ContentFeedbackProps {
  pageId: string;
  sectionId: string;
  sectionTitle?: string;
  title?: string;
}

export const ContentFeedback: React.FC<ContentFeedbackProps> = ({ 
  pageId, 
  sectionId, 
  sectionTitle,
  title
}) => {
  const { user } = useFirebase();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (rating: 'up' | 'down') => {
    if (!user || isSubmitting || submitted) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'content_feedback'), {
        userId: user.uid,
        pageId,
        sectionId,
        sectionTitle: title || sectionTitle || sectionId,
        rating,
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'content_feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 px-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mt-4 w-fit">
      <span className="text-sm text-white/60 font-medium">האם חלק זה היה מועיל?</span>
      
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div 
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => handleFeedback('up')}
              disabled={isSubmitting}
              className="p-2 rounded-full hover:bg-emerald-500/20 text-emerald-500 transition-colors disabled:opacity-50"
              title="כן, מועיל"
            >
              <ThumbsUp size={18} />
            </button>
            <button
              onClick={() => handleFeedback('down')}
              disabled={isSubmitting}
              className="p-2 rounded-full hover:bg-rose-500/20 text-rose-500 transition-colors disabled:opacity-50"
              title="לא כל כך"
            >
              <ThumbsDown size={18} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 text-emerald-500"
          >
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">תודה על המשוב!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
