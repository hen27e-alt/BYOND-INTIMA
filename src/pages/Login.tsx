import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, Sparkles, Mail, User, LogIn, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { EditableText } from '../components/EditableText';
import { cn } from '../lib/utils';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const { signIn, signInApple, signInEmail, signInAnonymous, signUpEmail } = useFirebase();
  const navigate = useNavigate();

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return 'הסיסמה חייבת להכיל לפחות 8 תווים';
    if (!/[A-Z]/.test(pass)) return 'הסיסמה חייבת להכיל לפחות אות גדולה אחת';
    if (!/[0-9]/.test(pass)) return 'הסיסמה חייבת להכיל לפחות מספר אחד';
    if (!/[!@#$%^&*]/.test(pass)) return 'הסיסמה חייבת להכיל לפחות תו מיוחד אחד (!@#$%^&*)';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    if (isRegistering) {
      const pError = validatePassword(password);
      if (pError) {
        setPasswordError(pError);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        await signUpEmail(email, password, name);
      } else {
        await signInEmail(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה בתהליך ההתחברות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signIn();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('הדפדפן חסם את חלון ההתחברות. אנא אפשרו חלונות קופצים (Popups) ונסו שוב.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('דומיין זה אינו מורשה להתחברות. אנא פנו למנהל האתר.');
      } else {
        setError(err.message || 'אירעה שגיאה בהתחברות עם Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInApple();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error("Apple Sign In Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('הדפדפן חסם את חלון ההתחברות. אנא אפשרו חלונות קופצים (Popups) ונסו שוב.');
      } else {
        setError(err.message || 'אירעה שגיאה בהתחברות עם Apple');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInAnonymous();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error("Anonymous Sign In Error:", err);
      setError(err.message || 'אירעה שגיאה בהתחברות אנונימית');
    } finally {
      setIsLoading(false);
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
          <EditableText 
            contentId="login_title"
            defaultText="BYOND INTIMA"
            as="h1"
            className="text-4xl md:text-5xl font-serif font-light tracking-[0.2em] text-white mb-4"
          />
          <div className="w-12 h-px bg-brand-gold mx-auto mb-8" />
          <p className="text-white/40 font-serif italic tracking-wide">
            {isRegistering ? 'הצטרפו למסע הזוגי שלכם' : 'הכניסה למרחב הפרטי שלכם'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
                <input 
                  type="text" 
                  placeholder="שם מלא"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-none py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
              <input 
                type="email" 
                placeholder="אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-none py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/40" size={18} />
              <input 
                type="password" 
                placeholder="סיסמה"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isRegistering) setPasswordError(validatePassword(e.target.value));
                }}
                required
                className={cn(
                  "w-full bg-white/5 border rounded-none py-4 pl-12 pr-4 text-white focus:outline-none transition-all",
                  passwordError ? "border-red-500" : "border-white/10 focus:border-brand-gold"
                )}
              />
              {isRegistering && passwordError && (
                <p className="text-red-400 text-[10px] mt-1 ml-1">{passwordError}</p>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center font-medium">{error}</p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-gold text-brand-black py-4 text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {isLoading ? 'מעבד...' : (isRegistering ? 'הרשמה' : 'כניסה')}
              {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-brand-black px-4 text-white/30">או</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="w-full border border-white/10 text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <img src="https://www.apple.com/favicon.ico" alt="" className="w-4 h-4 brightness-0 invert" />
              התחברות עם Apple
            </button>

            <button 
              onClick={handleAnonymousSignIn}
              disabled={isLoading}
              className="w-full border border-brand-gold/20 text-brand-gold py-4 text-xs uppercase tracking-[0.2em] hover:bg-brand-gold/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <User size={16} />
              התחברות כמשתמש אנונימי (ללא שמירת נתונים)
            </button>

            <button 
              onClick={() => {
                setError('התחברות עם Instagram תהיה זמינה בקרוב');
              }}
              disabled={isLoading}
              className="w-full border border-white/10 text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Instagram size={16} className="text-pink-500" />
              התחברות עם Instagram
            </button>
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-brand-gold/60 hover:text-brand-gold transition-colors tracking-widest uppercase"
            >
              {isRegistering ? 'כבר יש לכם חשבון? התחברו' : 'אין לכם חשבון? הירשמו עכשיו'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles size={10} /> חוויה זוגית מודרכת <Sparkles size={10} />
          </p>
        </div>
      </motion.div>
    </div>
  );
};
