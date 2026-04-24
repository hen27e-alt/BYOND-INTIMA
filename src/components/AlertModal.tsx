import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertContextType {
  showAlert: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  const showAlert = (msg: string, t: string = 'הודעה') => {
    setMessage(msg);
    setTitle(t);
    setIsOpen(true);
  };

  const closeAlert = () => {
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAlert}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl md:rounded-3xl p-8 max-w-sm w-full shadow-2xl fixed bottom-0 md:relative md:bottom-auto"
            >
              <div className="w-12 h-1.5 bg-brand-black/10 rounded-full mx-auto mb-6 md:hidden" />
              <h3 className="text-2xl font-serif mb-4 text-brand-black">{title}</h3>
              <p className="text-brand-black/60 mb-8">{message}</p>
              <button
                onClick={closeAlert}
                className="w-full py-4 bg-brand-black text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-brand-gold transition-colors active:scale-95 transform"
              >
                אישור
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
