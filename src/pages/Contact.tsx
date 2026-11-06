import React, { useRef, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BRANDING } from '../constants/branding';
import { cn } from '../lib/utils';

type Field = 'name' | 'email' | 'subject' | 'message';

const TOPICS: [string, string][] = [
  ['הזמנה קיימת', 'An existing order'],
  ['שאלה על מארז או מוצר', 'A question about a box or item'],
  ['המנוי', 'Membership'],
  ['מתנה או הזמנה מיוחדת', 'A gift or special order'],
  ['משהו אחר', 'Something else'],
];

export const Contact = () => {
  const { user } = useFirebase();
  const { language } = useLanguage();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<Record<Field, string>>({ name: '', email: user?.email ?? '', subject: TOPICS[0][0], message: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const set = (k: Field, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) next.name = tx('איך לפנות אליכם?', 'What should we call you?');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = tx('צריך אימייל תקין כדי שנוכל לענות.', 'We need a valid email to reply.');
    if (form.message.trim().length < 5) next.message = tx('כתבו לנו כמה מילים.', 'Write us a few words.');
    setErrors(next);
    if (Object.keys(next).length) {
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
      return;
    }
    setState('sending');
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: form.name.trim().slice(0, 100),
        email: form.email.trim().slice(0, 200),
        subject: form.subject.slice(0, 100),
        message: form.message.trim().slice(0, 4000),
        userId: user?.uid ?? null,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setState('sent');
      setForm((f) => ({ ...f, message: '' }));
    } catch {
      setState('failed');
    }
  };

  const input = (bad?: string) =>
    cn('w-full border-2 bg-paper px-4 py-3.5 text-lg text-ink placeholder:text-ink/45 focus:outline-none', bad ? 'border-spot' : 'border-ink focus:border-spot');

  const err = (k: Field) =>
    errors[k] && (
      <span id={`${k}-err`} className="mt-1 block text-sm font-bold text-spot">
        {errors[k]}
      </span>
    );

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-12 md:px-8 lg:px-14 lg:pt-20">
        <header className="border-b-[3px] border-ink pb-8">
          <h1 className="font-display text-[clamp(4.5rem,13vw,11rem)] font-bold leading-[0.8]">{tx('צרו קשר', 'Contact')}</h1>
        </header>

        <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <aside>
            <p className="text-xl leading-relaxed text-ink/85">
              {tx('שאלה על הזמנה, על מארז או על המנוי? כתבו לנו ונחזור אליכם תוך יום עסקים.', 'A question about an order, a box or membership? Write to us and we will get back to you within one business day.')}
            </p>
            <dl className="mt-8">
              <div className="border-t-[3px] border-ink py-4">
                <dt className="text-sm font-bold">{tx('אימייל', 'Email')}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${BRANDING.email}`} dir="ltr" className="font-display text-3xl font-bold leading-none hover:text-spot md:text-4xl">
                    {BRANDING.email}
                  </a>
                </dd>
              </div>
              <div className="border-t border-ink py-4">
                <dt className="text-sm font-bold">Instagram</dt>
                <dd className="mt-1">
                  <a href={BRANDING.instagram} target="_blank" rel="noopener noreferrer" dir="ltr" className="font-display text-3xl font-bold leading-none hover:text-spot md:text-4xl">
                    @byondintima
                  </a>
                </dd>
              </div>
              <div className="border-y border-ink py-4">
                <dt className="text-sm font-bold">{tx('זמני מענה', 'Reply times')}</dt>
                <dd className="mt-1 text-lg">{tx('ראשון עד חמישי, 9:00–18:00', 'Sunday to Thursday, 9:00–18:00')}</dd>
              </div>
            </dl>
          </aside>

          <section aria-labelledby="form-title">
            <h2 id="form-title" className="border-t-[3px] border-ink pt-4 font-display text-5xl font-bold leading-none">
              {tx('שלחו לנו הודעה', 'Send us a message')}
            </h2>

            {state === 'sent' ? (
              <div role="status" className="mt-8 border-[3px] border-ink p-6">
                <p className="font-display text-5xl font-bold leading-none">{tx('קיבלנו, תודה.', 'Got it, thank you.')}</p>
                <p className="mt-3 text-lg">{tx(`נחזור אליכם ל־${form.email} תוך יום עסקים.`, `We will reply to ${form.email} within one business day.`)}</p>
                <button onClick={() => setState('idle')} className="mt-5 font-bold underline underline-offset-4 hover:text-spot">
                  {tx('לשלוח הודעה נוספת', 'Send another message')}
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} noValidate className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">{tx('שם', 'Name')}</span>
                  <input name="name" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-err' : undefined} className={input(errors.name)} />
                  {err('name')}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">{tx('אימייל', 'Email')}</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="email"
                    dir="ltr"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-err' : undefined}
                    className={cn(input(errors.email), he && 'text-right')}
                  />
                  {err('email')}
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">{tx('בנושא', 'About')}</span>
                  <select name="subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} className={input()}>
                    {TOPICS.map(([h, en]) => (
                      <option key={h} value={h}>
                        {he ? h : en}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold">{tx('ההודעה', 'Message')}</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    rows={6}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-err' : undefined}
                    className={input(errors.message)}
                  />
                  {err('message')}
                </label>
                {state === 'failed' && (
                  <p role="alert" className="border-s-[5px] border-spot bg-spot/10 px-4 py-3 font-bold md:col-span-2">
                    {tx('ההודעה לא נשלחה. אפשר לנסות שוב, או לכתוב ישירות ל־', 'The message did not send. Try again, or write directly to ')}
                    <a href={`mailto:${BRANDING.email}`} className="underline">
                      {BRANDING.email}
                    </a>
                  </p>
                )}
                <div className="md:col-span-2">
                  <button type="submit" disabled={state === 'sending'} className="bg-ink px-8 py-4 text-xl font-black text-paper hover:bg-spot disabled:opacity-50">
                    {state === 'sending' ? tx('שולח...', 'Sending...') : tx('לשלוח', 'Send')}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
