import React, { useState } from 'react';
import { useFirebase } from '../../contexts/FirebaseContext';

/** Link two accounts: share your code, or enter your partner's. */
export const PartnerLink: React.FC = () => {
  const { user, profile, connectPartner } = useFirebase();
  const [partnerId, setPartnerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user || !profile) return null;

  if (profile.coupleId) {
    return (
      <p className="text-lg">
        <span className="font-bold">אתם מחוברים.</span> {profile.partnerName ? <>החשבון מקושר ל־{profile.partnerName}.</> : 'החשבונות מקושרים.'}
      </p>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('לא הצלחנו להעתיק. סמנו את הקוד והעתיקו ידנית.');
    }
  };

  const connect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await connectPartner(partnerId.trim());
    } catch (err: any) {
      setError(err?.message || 'החיבור לא הצליח. בדקו את הקוד ונסו שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="max-w-[52ch] text-base">כדי ששניכם תראו את אותו יומן, אותן משימות ואותה תוכנייה, מקשרים את החשבונות. אחד שולח את הקוד, השני מזין אותו.</p>
      <div>
        <p className="mb-1 text-sm font-bold">הקוד שלכם</p>
        <div className="flex flex-wrap items-center gap-3">
          <code dir="ltr" className="select-all break-all border-2 border-ink bg-surface px-3 py-2 font-mono text-sm">
            {user.uid}
          </code>
          <button onClick={copy} className="text-sm font-bold underline underline-offset-4 hover:text-spot">
            {copied ? 'הועתק' : 'להעתיק'}
          </button>
        </div>
      </div>
      <form onSubmit={connect}>
        <label className="block">
          <span className="mb-1 block text-sm font-bold">הקוד של בן או בת הזוג</span>
          <span className="flex flex-wrap gap-3">
            <input
              dir="ltr"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="min-w-[220px] flex-1 border-b-[3px] border-ink bg-transparent py-2 font-mono text-base outline-none focus:border-spot"
            />
            <button disabled={loading || !partnerId.trim()} className="bg-ink px-5 py-2.5 font-bold text-paper hover:bg-spot disabled:opacity-40">
              {loading ? 'מחברים…' : 'לחבר'}
            </button>
          </span>
        </label>
        {error && (
          <p role="alert" className="mt-2 text-sm font-bold text-spot">
            {error}
          </p>
        )}
      </form>
    </div>
  );
};
