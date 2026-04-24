import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Accessibility, X, Type, Contrast, MousePointer2, Link as LinkIcon, Eye, RefreshCw } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

export const AccessibilityMenu = () => {
  const { isAccessibilityMenuOpen: isOpen, setIsAccessibilityMenuOpen: setIsOpen, accessibilitySettings: settings, setAccessibilitySettings: setSettings } = useUI();

  useEffect(() => {
    const root = document.documentElement;
    
    // Font Size
    root.classList.remove('font-size-large', 'font-size-xlarge');
    if (settings.fontSize === 'large') root.classList.add('font-size-large');
    if (settings.fontSize === 'xlarge') root.classList.add('font-size-xlarge');

    // High Contrast
    if (settings.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');

    // Grayscale
    if (settings.grayscale) root.classList.add('grayscale-mode');
    else root.classList.remove('grayscale-mode');

    // Underline Links
    if (settings.underlineLinks) root.classList.add('underline-links');
    else root.classList.remove('underline-links');

    // Readable Font
    if (settings.readableFont) root.classList.add('readable-font');
    else root.classList.remove('readable-font');

    // Large Cursor
    if (settings.largeCursor) root.classList.add('cursor-large');
    else root.classList.remove('cursor-large');

    // Font Family
    root.style.setProperty('--font-family-override', 
      settings.fontFamily === 'dyslexic' ? '"OpenDyslexic", sans-serif' :
      settings.fontFamily === 'mono' ? 'ui-monospace, monospace' :
      settings.fontFamily === 'sans' ? 'ui-sans-serif, system-ui, sans-serif' :
      'inherit'
    );

    // Base Font Size
    root.style.fontSize = `${settings.baseSize}px`;

  }, [settings]);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setFontSize = (size: string) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const setFontFamily = (family: typeof settings.fontFamily) => {
    setSettings(prev => ({ ...prev, fontFamily: family }));
  };

  const setBaseSize = (size: number) => {
    setSettings(prev => ({ ...prev, baseSize: size }));
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 'normal',
      highContrast: false,
      grayscale: false,
      underlineLinks: false,
      readableFont: false,
      largeCursor: false,
      fontFamily: 'serif',
      baseSize: 16,
    });
  };

  return (
    <>
      <motion.button
        drag
        dragMomentum={false}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed left-6 bottom-24 z-[60] w-12 h-12 bg-brand-gold text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-black transition-colors cursor-move"
        aria-label="תפריט נגישות"
      >
        <Accessibility size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="relative w-full max-w-md bg-brand-cream p-8 shadow-2xl border border-brand-gold/20 rounded-3xl"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-8 border-b border-brand-gold/10 pb-4">
                <div className="flex items-center gap-3">
                  <Accessibility className="text-brand-gold" size={24} />
                  <h3 className="text-xl font-serif font-bold">תפריט נגישות</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-brand-black/40 hover:text-brand-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                {/* Font Size Slider */}
                <div className="bg-white p-4 rounded-2xl border border-brand-gold/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Type size={18} className="text-brand-gold" />
                      <span className="text-sm font-bold">גודל גופן בסיסי</span>
                    </div>
                    <span className="text-xs font-mono text-brand-gold">{settings.baseSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="12" 
                    max="24" 
                    step="1"
                    value={settings.baseSize}
                    onChange={(e) => setBaseSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-brand-cream rounded-lg appearance-none cursor-pointer accent-brand-gold"
                  />
                </div>

                {/* Font Family */}
                <div className="bg-white p-4 rounded-2xl border border-brand-gold/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Type size={18} className="text-brand-gold" />
                    <span className="text-sm font-bold">סגנון גופן</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'serif', label: 'סריף (קלאסי)' },
                      { id: 'sans', label: 'סאנס (מודרני)' },
                      { id: 'mono', label: 'מונו (טכני)' },
                      { id: 'dyslexic', label: 'קריא במיוחד' }
                    ].map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setFontFamily(font.id as any)}
                        className={`py-2 px-3 text-[10px] rounded-xl border transition-all ${
                          settings.fontFamily === font.id 
                            ? 'bg-brand-gold text-white border-brand-gold' 
                            : 'bg-brand-cream/30 text-brand-black/60 border-brand-gold/10 hover:border-brand-gold/40'
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => toggleSetting('highContrast')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                      settings.highContrast 
                        ? 'bg-brand-gold text-white border-brand-gold' 
                        : 'bg-white text-brand-black/60 border-brand-gold/10 hover:border-brand-gold/40'
                    }`}
                  >
                    <Contrast size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">ניגודיות גבוהה</span>
                  </button>

                  <button
                    onClick={() => toggleSetting('grayscale')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                      settings.grayscale 
                        ? 'bg-brand-gold text-white border-brand-gold' 
                        : 'bg-white text-brand-black/60 border-brand-gold/10 hover:border-brand-gold/40'
                    }`}
                  >
                    <Eye size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">גווני אפור</span>
                  </button>

                  <button
                    onClick={() => toggleSetting('underlineLinks')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                      settings.underlineLinks 
                        ? 'bg-brand-gold text-white border-brand-gold' 
                        : 'bg-white text-brand-black/60 border-brand-gold/10 hover:border-brand-gold/40'
                    }`}
                  >
                    <LinkIcon size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">הדגשת קישורים</span>
                  </button>

                  <button
                    onClick={() => toggleSetting('readableFont')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                      settings.readableFont 
                        ? 'bg-brand-gold text-white border-brand-gold' 
                        : 'bg-white text-brand-black/60 border-brand-gold/10 hover:border-brand-gold/40'
                    }`}
                  >
                    <Type size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">גופן קריא</span>
                  </button>

                  <button
                    onClick={() => toggleSetting('largeCursor')}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center ${
                      settings.largeCursor 
                        ? 'bg-brand-gold text-white border-brand-gold' 
                        : 'bg-white text-brand-black/60 border-brand-gold/10 hover:border-brand-gold/40'
                    }`}
                  >
                    <MousePointer2 size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">סמן גדול</span>
                  </button>

                  <button
                    onClick={resetSettings}
                    className="p-4 rounded-2xl border border-brand-gold/10 bg-white text-brand-black/60 hover:bg-brand-gold/5 transition-all flex flex-col items-center gap-2 text-center"
                  >
                    <RefreshCw size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">איפוס הגדרות</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-brand-gold/10 text-center">
                <p className="text-[10px] text-brand-black/40 uppercase tracking-widest">
                  אנו פועלים להנגשת האתר לכלל האוכלוסייה
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
