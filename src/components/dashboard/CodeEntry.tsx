import React from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

interface CodeEntryProps {
  enteredCode: string;
  setEnteredCode: (code: string) => void;
  handleVerifyCode: (e: React.FormEvent) => void;
  codeError: boolean;
}

export const CodeEntry = ({ enteredCode, setEnteredCode, handleVerifyCode, codeError }: CodeEntryProps) => (
  <div className="min-h-[60vh] flex items-center justify-center px-6">
    <div className="max-w-xl w-full text-center">
      <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
        <Lock className="text-brand-gold" size={32} />
      </div>
      <h1 className="text-3xl font-serif mb-4 text-brand-black">הזינו קוד הפעלה</h1>
      <p className="text-brand-black/60 mb-8 leading-relaxed text-sm">
        כדי להיכנס למצב "החוויה", אנא הזינו את הקוד שקיבלתם עם המארז.
        <br />
        שאר האפשרויות בטרקלין פתוחות עבורכם תמיד.
      </p>
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <input 
          type="text" 
          value={enteredCode}
          onChange={(e) => setEnteredCode(e.target.value)}
          placeholder="הזינו קוד (לדוגמה: LOVE2026)"
          className={`w-full bg-white border-b-2 py-4 text-center text-xl outline-none transition-colors rounded-xl ${codeError ? 'border-red-500' : 'border-brand-gold/30 focus:border-brand-gold'}`}
        />
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-4 bg-brand-black text-white text-sm tracking-widest uppercase hover:bg-brand-gold transition-all rounded-xl font-bold"
        >
          אימות קוד
        </motion.button>
        {codeError && <p className="text-red-500 text-sm">קוד שגוי, אנא נסו שוב</p>}
      </form>
    </div>
  </div>
);
