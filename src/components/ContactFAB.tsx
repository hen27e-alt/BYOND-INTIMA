import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export const ContactFAB = () => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed right-6 bottom-28 lg:bottom-8 z-50 cursor-move"
    >
      <Link
        to="/contact"
        className="w-14 h-14 bg-brand-gold text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-black transition-all duration-300 group"
        aria-label="צור קשר"
      >
        <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />
      </Link>
    </motion.div>
  );
};
