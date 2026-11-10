import { E } from '../components/EditableText';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSeasonSettings } from '../lib/catalogue';
import { cn } from '../lib/utils';

const pad = (n: number) => String(n).padStart(2, '0');

/** Firebase error codes in words a person can act on. */
const authMessage = (code: string | undefined, he: boolean) => {
  const m: Record<string, [string, string]> = {
    'auth/invalid-credential': ['האימייל או הסיסמה לא נכונים.', 'Wrong email or password.'],
    'auth/wrong-password': ['האימייל או הסיסמה לא נכונים.', 'Wrong email or password.'],
    'auth/user-not-found': ['אין חשבון עם האימייל הזה. אפשר להירשם.', 'No account with this email. You can sign up.'],
    'auth/email-already-in-use': ['כבר יש חשבון עם האימייל הזה. נסו להתחבר.', 'There is already an account with this email. Try signing in.'],
    'auth/invalid-email': ['כתובת האימייל לא תקינה.', 'That email address is not valid.'],
    'auth/too-many-requests': ['יותר מדי ניסיונות. חכו כמה דקות ונסו שוב.', 'Too many attempts. Wait a few minutes and try again.'],
    'auth/popup-blocked': ['הדפדפן חסם את חלון ההתחברות. אפשרו חלונות קופצים ונסו שוב.', 'The browser blocked the sign-in window. Allow pop-ups and try again.'],
    'auth/popup-closed-by-user': ['חלון ההתחברות נסגר לפני שהסתיים.', 'The sign-in window was closed before finishing.'],
    'auth/unauthorized-domain': ['הכתובת הזו עוד לא מורשית להתחברות. צריך להוסיף אותה ב־Firebase.', 'This address is not yet allowed to sign in. It needs to be added in Firebase.'],
    'auth/network-request-failed': ['אין חיבור לאינטרנט. בדקו את החיבור ונסו שוב.', 'No connection. Check your internet and try again.'],
  };
  const hit = code ? m[code] : undefined;
  return hit ? hit[he ? 0 : 1] : he ? 'ההתחברות לא הצליחה. נסו שוב.' : 'Sign-in did not work. Please try again.';
};

const passwordProblem = (p: string, he: boolean) => {
  if (p.length < 8) return he ? 'לפחות 8 תווים.' : 'At least 8 characters.';
  if (!/[0-9]/.test(p)) return he ? 'צריך לפחות ספרה אחת.' : 'Needs at least one number.';
  return null;
};

export const Login = () => {
  const { signIn, signInEmail, signUpEmail } = useFirebase();
  const { language } = useLanguage();
  const { seasonNumber } = useSeasonSettings();
  const navigate = useNavigate();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const done = () => navigate('/dashboard', { replace: true });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'up') {
      const p = passwordProblem(password, he);
      setPwError(p);
      if (p) return;
    }
    setBusy(true);
    try {
      if (mode === 'up') await signUpEmail(email, password, name);
      else await signInEmail(email, password);
      done();
    } catch (err) {
      setError(authMessage((err as { code?: string })?.code, he));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn();
      done();
    } catch (err) {
      setError(authMessage((err as { code?: string })?.code, he));
    } finally {
      setBusy(false);
    }
  };

  const input = 'w-full border-2 border-ink bg-paper px-4 py-3.5 text-lg text-ink placeholder:text-ink/45 focus:border-spot focus:outline-none';

  return (
    <div className="grid min-h-screen bg-paper pt-16 text-ink md:pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* The room: what waits on the other side of the door */}
      <aside className="flex flex-col justify-end bg-room px-4 py-12 text-paper md:px-8 lg:px-14 lg:py-20">
        <p className="font-display text-[clamp(7rem,20vw,15rem)] font-bold leading-[0.75] text-spot">{pad(seasonNumber)}</p>
        <h2 className="mt-4 font-display text-5xl font-bold leading-[0.9] md:text-6xl"><E id="login_title">{tx('המקום שלכם', 'Your place')}</E></h2>
        <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-paper/75">
          <E id="login_lede" multiline>{tx(
            'הערבים של העונה, היומן הזוגי, ההזמנות והמשחקים. הכול שמור כאן, רק לשניכם.',
            "The season's evenings, your shared journal, your orders and games. All kept here, just for the two of you."
          )}</E>
        </p>
      </aside>

      <main className="flex items-center px-4 py-12 md:px-8 lg:px-14">
        <div className="w-full max-w-md">
          <div role="tablist" aria-label={tx('כניסה או הרשמה', 'Sign in or sign up')} className="flex border-b-[3px] border-ink">
            {(['in', 'up'] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setPwError(null);
                }}
                className={cn('px-5 py-3 font-display text-4xl font-bold leading-none', mode === m ? 'bg-ink text-paper' : 'hover:text-spot')}
              >
                {m === 'in' ? tx('כניסה', 'Sign in') : tx('הרשמה', 'Sign up')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-8 flex w-full items-center justify-center gap-3 border-[3px] border-ink px-4 py-3.5 text-lg font-bold hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-16.6z" />
              <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
            </svg>
            {tx('המשך עם Google', 'Continue with Google')}
          </button>

          <p className="my-6 flex items-center gap-4 text-sm font-bold text-ink/60" aria-hidden="true">
            <span className="h-px flex-1 bg-ink/30" />
            {tx('או עם אימייל', 'or with email')}
            <span className="h-px flex-1 bg-ink/30" />
          </p>

          <form onSubmit={submit} noValidate className="space-y-4">
            {mode === 'up' && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">{tx('שם', 'Name')}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className={input} />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">{tx('אימייל', 'Email')}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" required className={cn(input, he && 'text-right')} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold">{tx('סיסמה', 'Password')}</span>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (pwError) setPwError(passwordProblem(e.target.value, he));
                }}
                autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
                dir="ltr"
                required
                aria-invalid={!!pwError}
                aria-describedby={pwError ? 'pw-error' : mode === 'up' ? 'pw-hint' : undefined}
                className={cn(input, he && 'text-right', pwError && 'border-spot')}
              />
              {pwError ? (
                <span id="pw-error" className="mt-1 block text-sm font-bold text-spot">
                  {pwError}
                </span>
              ) : (
                mode === 'up' && (
                  <span id="pw-hint" className="mt-1 block text-sm text-ink/60">
                    {tx('לפחות 8 תווים וספרה אחת.', 'At least 8 characters and one number.')}
                  </span>
                )
              )}
            </label>

            {error && (
              <p role="alert" className="border-s-[5px] border-spot bg-spot/10 px-4 py-3 font-bold">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="w-full bg-ink px-4 py-4 text-xl font-black text-paper hover:bg-spot disabled:opacity-50">
              {busy ? tx('רגע...', 'One moment...') : mode === 'in' ? tx('להיכנס', 'Sign in') : tx('לפתוח חשבון', 'Create account')}
            </button>
          </form>

          <p className="mt-8 text-sm text-ink/70">
            {tx('בהרשמה אתם מסכימים ל', 'By signing up you agree to the ')}
            <Link to="/legal" className="font-bold underline underline-offset-4 hover:text-spot">
              {tx('תקנון ותנאי השימוש', 'terms of use')}
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};
