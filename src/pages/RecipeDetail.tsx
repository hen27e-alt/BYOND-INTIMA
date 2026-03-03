import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Utensils, Clock, ChevronRight, Heart, ArrowLeft, Award, CheckCircle } from 'lucide-react';

export const RecipeDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = location.state?.recipe;

  // If no recipe is found in state, we could fetch it by ID if we had a backend.
  // For now, we'll just show a message or redirect.
  if (!recipe) {
    return (
      <div className="pt-32 pb-32 bg-brand-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">המתכון לא נמצא</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-brand-gold uppercase tracking-widest text-sm flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> חזרה לאזור האישי
          </button>
        </div>
      </div>
    );
  }

  const handleCooked = () => {
    // In a real app, this would call an API.
    // For the demo, we'll show a success message and then navigate back.
    // We can use a custom event or local storage to communicate back to the dashboard.
    const currentCount = parseInt(localStorage.getItem('cookedCount') || '3');
    localStorage.setItem('cookedCount', (currentCount + 1).toString());
    
    alert('כל הכבוד! צברתם 50 נקודות זהב והתקדמתם לעבר תעודת השף שלכם.');
    navigate('/dashboard');
  };

  return (
    <div className="pt-32 pb-32 bg-brand-cream min-h-screen" role="main">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 text-brand-black/40 hover:text-brand-black transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> חזרה
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white border border-brand-gold/20 overflow-hidden shadow-xl"
        >
          {/* Header Image */}
          <div className="aspect-[21/9] overflow-hidden relative">
            <img 
              src={recipe.img || 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&q=80&w=1200'} 
              alt={recipe.title} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl font-serif mb-2">{recipe.title || recipe.name}</h1>
                <div className="flex gap-6 text-[10px] uppercase tracking-widest text-white/80">
                  <span className="flex items-center gap-2"><Clock size={12} /> {recipe.time}</span>
                  <span className="flex items-center gap-2"><Award size={12} /> {recipe.level || recipe.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="max-w-2xl mx-auto">
              <p className="text-brand-black/60 italic text-lg leading-relaxed mb-12 text-center">
                {recipe.desc || 'חוויה קולינרית זוגית המשלבת טעמים עמוקים וחיבור אישי.'}
              </p>

              <div className="grid md:grid-cols-2 gap-12 mb-12">
                <div>
                  <h5 className="text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-2 border-b border-brand-gold/10 pb-2">
                    <Utensils size={14} className="text-brand-gold" /> מצרכים
                  </h5>
                  <ul className="space-y-4">
                    {(recipe.ingredients || ['מצרכי בסיס', 'אהבה', 'זמן איכות']).map((ing: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-brand-black/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/30" /> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm tracking-[0.2em] uppercase mb-6 flex items-center gap-2 border-b border-brand-gold/10 pb-2">
                    <ChevronRight size={14} className="text-brand-gold" /> שלבי הכנה
                  </h5>
                  <div className="space-y-6">
                    {(recipe.steps || [
                      'מכינים את המרחב המשותף.',
                      'משלבים את המרכיבים ברוגע.',
                      'מגישים באהבה.'
                    ]).map((step: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <span className="text-brand-gold font-serif text-lg leading-none">{i + 1}.</span>
                        <p className="text-sm leading-relaxed text-brand-black/70">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-brand-cream/30 border border-brand-gold/10 rounded-lg mb-12">
                <div className="flex items-center gap-4 mb-4 text-brand-gold">
                  <Heart size={20} />
                  <h5 className="text-sm tracking-[0.2em] uppercase">משימה זוגית משולבת</h5>
                </div>
                <p className="text-brand-black/70 leading-relaxed italic">
                  {recipe.mission || 'תוך כדי הבישול, ספרו אחד לשני על חלום קטן שתרצו להגשים יחד השנה.'}
                </p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={handleCooked}
                  className="w-full md:w-auto px-24 py-5 bg-brand-black text-white uppercase tracking-[0.3em] text-xs hover:bg-brand-gold transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <CheckCircle size={16} /> בישלנו!
                </button>
                <p className="text-[10px] uppercase tracking-widest text-brand-black/30">
                  לחיצה תעניק לכם +50💎 ותתקדם לעבר תעודת השף
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
