import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Copy, Check, Users, Heart } from 'lucide-react';
import { useFirebase } from '../../contexts/FirebaseContext';

export const PartnerLink: React.FC = () => {
  const { user, profile, connectPartner } = useFirebase();
  const [partnerId, setPartnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user || !profile) return null;

  // If already connected, show partner info
  if (profile.coupleId) {
    return (
      <div className="bg-white border border-brand-gold/10 p-6 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h4 className="font-serif text-lg">אתם מחוברים!</h4>
          <p className="text-sm text-brand-black/60">בן/בת הזוג: {profile.partnerName || 'מחובר/ת'}</p>
        </div>
      </div>
    );
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await connectPartner(partnerId.trim());
    } catch (err: any) {
      setError(err.message || 'שגיאה בחיבור בן/בת הזוג');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-brand-gold/10 p-6 rounded-2xl space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
          <Users size={20} />
        </div>
        <h3 className="font-serif text-xl">חיבור בן/בת זוג</h3>
      </div>

      <p className="text-sm text-brand-black/70 leading-relaxed">
        כדי לשתף את החוויה, עליכם לקשר את החשבונות שלכם. 
        שלחו את הקוד שלכם לבן/בת הזוג, או הזינו את הקוד שלהם כאן.
      </p>

      <div className="space-y-4">
        {/* Your ID Section */}
        <div className="bg-brand-cream/50 p-4 rounded-xl border border-brand-gold/10">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black/40 mb-2">הקוד האישי שלכם</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border border-brand-gold/20 text-xs font-mono break-all">
              {user.uid}
            </code>
            <button 
              onClick={handleCopyId}
              className="p-2 hover:bg-brand-gold/10 rounded-lg transition-colors text-brand-gold"
              title="העתק קוד"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Connect Section */}
        <form onSubmit={handleConnect} className="space-y-3">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-brand-black/40">הזנת קוד בן/בת הזוג</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder="הזינו את הקוד כאן..."
              className="flex-1 bg-brand-cream/30 border border-brand-gold/20 px-4 py-2 rounded-xl focus:outline-none focus:border-brand-gold text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !partnerId.trim()}
              className="px-6 py-2 bg-brand-black text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors disabled:opacity-50"
            >
              {loading ? 'מתחבר...' : 'חיבור'}
            </motion.button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </form>
      </div>
    </div>
  );
};
