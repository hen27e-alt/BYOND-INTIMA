import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo login - in real app would use auth
    if (password === 'beyond' || password === '1234') {
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=2000" 
          alt="Atmosphere" 
          className="w-full h-full object-cover grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-[0.2em] text-white mb-4">
            BYOND <span className="italic text-brand-gold">INTIMA</span>
          </h1>
          <div className="w-12 h-px bg-brand-gold mx-auto mb-8" />
          <p className="text-white/40 font-serif italic tracking-wide">הכניסה למרחב הפרטי שלכם</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
            <input 
              type="password" 
              placeholder="קוד גישה (נסו 'beyond')"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-brand-gold/20'} rounded-none py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold transition-all text-center tracking-[0.5em]`}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-gold text-brand-black py-4 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all flex items-center justify-center gap-3 group"
          >
            כניסה למערכת
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles size={10} /> חוויה זוגית מודרכת <Sparkles size={10} />
          </p>
        </div>
      </motion.div>
    </div>
  );
};
