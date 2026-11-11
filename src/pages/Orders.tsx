import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, Package } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, where, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { boutiqueProducts } from '../data/boutique';
import { ORDER_STATUSES, statusOf } from '../data/orderStatus';
import { Ticket } from '../components/season/Ticket';
import { cn } from '../lib/utils';

type Line = { id: string; name: string; price: number; quantity: number };

type Order = {
  id: string;
  totalAmount?: number;
  shipping?: number;
  status?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  gift?: { wrap?: boolean; note?: string } | null;
  giftCode?: string | null;
  giftApplied?: number;
  giftCards?: { code: string; amount: number; to?: string }[];
  // New orders store an array; orders from the old checkout stored { [productId]: { quantity } }.
  items?: Line[] | Record<string, { quantity: number }>;
  customerDetails?: { firstName?: string; lastName?: string; address?: string; city?: string };
};

const linesOf = (o: Order): Line[] => {
  if (Array.isArray(o.items)) return o.items;
  return Object.entries(o.items ?? {}).map(([id, d]) => {
    const p = boutiqueProducts.find((x) => x.id === id);
    return { id, name: p?.name ?? id, price: p?.price ?? 0, quantity: d.quantity };
  });
};

const PAID = new Set(['paid', 'processing', 'shipped', 'delivered']);

/** Gift cards bought in this order. The code shows only once the order is paid, because only then it works. */
const GiftCodes = ({ o, he }: { o: Order; he: boolean }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const live = PAID.has(o.status ?? '');
  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked: the code is on screen anyway */
    }
  };
  return (
    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
      {o.giftCards!.map((g) => (
        <li key={g.code} className="border border-gold/60 bg-gold/[0.06] p-4">
          <p className="text-xs font-bold tracking-wider text-gold">
            {he ? `כרטיס מתנה ₪${g.amount}` : `Gift card ₪${g.amount}`}
            {g.to ? (he ? ` · ל${g.to}` : ` · for ${g.to}`) : ''}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <bdi dir="ltr" className="font-mono text-xl font-bold tracking-wider">
              {live ? g.code : 'BYND-····-····'}
            </bdi>
            {live && (
              <button onClick={() => void copy(g.code)} className="min-h-9 text-sm font-bold underline underline-offset-4 hover:text-gold">
                {copied === g.code ? (he ? 'הועתק' : 'Copied') : he ? 'להעתיק' : 'Copy'}
              </button>
            )}
          </div>
          {!live && <p className="mt-1 text-xs text-ink/60">{he ? 'הקוד ייפתח ברגע שהתשלום יושלם.' : 'The code opens once payment is complete.'}</p>}
        </li>
      ))}
    </ul>
  );
};

const STEPS = ORDER_STATUSES.filter((s) => s.id !== 'cancelled' && s.id !== 'paid');

/**
 * The delivery as a path of lights: every step the order has passed glows gold,
 * the one it's on now breathes in ember, and the line fills as far as it has come.
 */
const Track = ({ status, he }: { status?: string; he: boolean }) => {
  const reduce = useReducedMotion();
  const current = statusOf(status);
  const reached = current.id === 'paid' ? 0 : STEPS.findIndex((s) => s.id === current.id);
  const done = current.id === 'delivered';
  const fill = STEPS.length > 1 ? reached / (STEPS.length - 1) : 0;
  return (
    <div className="relative py-2">
      <div className="absolute inset-x-[12.5%] top-[calc(0.5rem+7px)] h-px bg-ink/20">
        <motion.div
          className={cn('h-px', he ? 'bg-gradient-to-l' : 'bg-gradient-to-r', 'from-[#D9361F] via-[#C9A66B] to-[#F4E4BE]')}
          style={{ transformOrigin: he ? 'right' : 'left' }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: fill }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ol className="relative grid grid-cols-4" aria-label={he ? 'מצב ההזמנה' : 'Order progress'}>
        {STEPS.map((s, i) => {
          const isPast = i < reached || (done && i === reached);
          const isNow = i === reached && !done;
          return (
            <li key={s.id} aria-current={i === reached ? 'step' : undefined} className="flex flex-col items-center gap-2 text-center">
              <span className="relative grid h-4 w-4 place-items-center">
                {isNow && !reduce && <span className="absolute inset-[-6px] animate-ping rounded-full bg-[#D9361F]/40" />}
                <span
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border',
                    isPast && 'border-[#E8C98A] bg-[#C9A66B] shadow-[0_0_14px_rgba(232,201,138,.7)]',
                    isNow && 'border-[#D9361F] bg-[#D9361F]',
                    !isPast && !isNow && 'border-ink/40'
                  )}
                />
              </span>
              <span className={cn('text-xs font-bold leading-tight md:text-sm', isPast ? 'text-gold' : isNow ? 'text-ink' : 'text-ink/45')}>
                {he ? s.he : s.en}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const OrderCard = ({ o, he, open, onToggle }: { o: Order; he: boolean; open: boolean; onToggle: () => void }) => {
  const reduce = useReducedMotion();
  const tx = (h: string, e: string) => (he ? h : e);
  const lines = linesOf(o);
  const c = o.customerDetails ?? {};
  const st = statusOf(o.status);
  const cancelled = st.id === 'cancelled';
  const fmt = (t?: Timestamp, withTime = false) =>
    t?.toDate?.().toLocaleString(he ? 'he-IL' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }),
    }) ?? '';
  const updated = o.updatedAt?.toMillis && o.updatedAt.toMillis() !== o.createdAt?.toMillis?.() ? fmt(o.updatedAt, true) : '';

  return (
    <li className="border border-ink/20 bg-ink/[0.03] p-5 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-ink/60">
          <bdi dir="ltr" className="font-bold tabular-nums text-ink/80">
            #{o.id.slice(0, 8).toUpperCase()}
          </bdi>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          {fmt(o.createdAt)}
        </p>
        <p className="font-display text-3xl font-bold leading-none tabular-nums">₪{o.totalAmount ?? 0}</p>
      </div>

      <p className={cn('mt-5 font-display text-4xl font-bold leading-none md:text-5xl', cancelled && 'text-spot', st.id === 'delivered' && 'text-sheen')}>
        {he ? st.customerHe : st.customerEn}
      </p>
      {updated && <p className="mt-2 text-sm text-ink/60">{tx(`עודכן ב־${updated}`, `Updated ${updated}`)}</p>}

      <p className="mt-4 text-base text-ink/80">{lines.map((l) => `${l.name}${l.quantity > 1 ? ` × ${l.quantity}` : ''}`).join(' · ')}</p>

      {!!o.giftCards?.length && !cancelled && <GiftCodes o={o} he={he} />}

      {!cancelled && (
        <div className="mt-6">
          <Track status={o.status} he={he} />
        </div>
      )}

      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`order-${o.id}`}
        className="mt-5 flex min-h-11 items-center gap-1 text-sm font-bold transition-colors hover:text-gold"
      >
        {tx('פרטי ההזמנה', 'Order details')}
        <ChevronDown size={16} aria-hidden className={cn('transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`order-${o.id}`}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 border-t border-ink/20 pt-4 md:grid-cols-2">
              <ul>
                {lines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-4 border-b border-ink/10 py-2">
                    <span>
                      {l.name} <span className="text-ink/60">× {l.quantity}</span>
                    </span>
                    <span className="tabular-nums">₪{l.price * l.quantity}</span>
                  </li>
                ))}
                {o.gift?.wrap && (
                  <li className="flex justify-between gap-4 border-b border-ink/10 py-2 text-ink/70">
                    <span>{tx('עטיפת מתנה', 'Gift wrap')}</span>
                    <span>{tx('כלולה', 'Included')}</span>
                  </li>
                )}
                {!!o.giftApplied && (
                  <li className="flex justify-between gap-4 border-b border-ink/10 py-2 text-gold">
                    <span>
                      {tx('כרטיס מתנה', 'Gift card')} <bdi dir="ltr" className="font-mono text-sm">{o.giftCode}</bdi>
                    </span>
                    <span className="tabular-nums">−₪{o.giftApplied}</span>
                  </li>
                )}
                {typeof o.shipping === 'number' && (
                  <li className="flex justify-between gap-4 py-2 text-ink/70">
                    <span>{tx('משלוח', 'Shipping')}</span>
                    <span className="tabular-nums">{o.shipping === 0 ? tx('חינם', 'Free') : `₪${o.shipping}`}</span>
                  </li>
                )}
              </ul>
              <div>
                <h3 className="text-sm font-bold text-gold">{tx('נשלח אל', 'Shipping to')}</h3>
                <p className="mt-1">{[c.firstName, c.lastName].filter(Boolean).join(' ')}</p>
                <p>{[c.address, c.city].filter(Boolean).join(', ')}</p>
                {o.gift?.note && <p className="mt-3 text-sm italic text-ink/75">„{o.gift.note}”</p>}
                <p className="mt-4 text-sm text-ink/60">
                  {tx('החבילה נשלחת באריזה חומה ופשוטה, בלי שם ובלי תיאור של המוצר.', 'Packed in a plain brown box, with no name and no description of what is inside.')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
};

export const Orders = () => {
  const { user, loading: authLoading } = useFirebase();
  const { language } = useLanguage();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
      (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
      () => {
        setFailed(true);
        setOrders([]);
      }
    );
  }, [user]);

  let body: React.ReactNode;
  if (authLoading || (user && orders === null)) {
    body = (
      <ul className="grid gap-5" aria-busy="true" aria-label={tx('טוען את ההזמנות', 'Loading your orders')}>
        {[0, 1].map((i) => (
          <li key={i} className="h-56 animate-pulse border border-ink/10 bg-ink/[0.04]" />
        ))}
      </ul>
    );
  } else if (!user) {
    body = (
      <div className="py-10">
        <p className="font-display text-4xl font-bold leading-none md:text-5xl">{tx('כדי לראות הזמנות צריך להתחבר.', 'Sign in to see your orders.')}</p>
        <div className="mt-8">
          <Ticket label={tx('להתחבר', 'Sign in')} stub="→" tone="spot" size="md" to="/login" />
        </div>
      </div>
    );
  } else if (failed) {
    body = <p className="py-10 text-lg font-bold text-spot">{tx('לא הצלחנו לטעון את ההזמנות. נסו לרענן את הדף.', 'We could not load your orders. Try refreshing the page.')}</p>;
  } else if (!orders?.length) {
    body = (
      <div className="py-10">
        <Package size={36} aria-hidden className="text-gold" />
        <p className="mt-4 font-display text-5xl font-bold leading-none">{tx('עוד אין הזמנות.', 'No orders yet.')}</p>
        <p className="mt-3 max-w-[52ch] text-lg text-ink/75">
          {tx('כשתזמינו מארז או מוצר מהבוטיק, הוא יופיע כאן, ותוכלו לראות איפה המשלוח עומד.', 'When you order a box or a boutique item it will show up here, with where the delivery stands.')}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Ticket label={tx('למארזים', 'See the boxes')} stub="→" tone="spot" size="md" to="/experience" />
          <Link to="/boutique" className="text-lg font-bold underline underline-offset-4 hover:text-gold">
            {tx('לבוטיק', 'To the boutique')}
          </Link>
        </div>
      </div>
    );
  } else {
    body = (
      <ul className="grid gap-5">
        {orders.map((o) => (
          <OrderCard key={o.id} o={o} he={he} open={open === o.id} onToggle={() => setOpen(open === o.id ? null : o.id)} />
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-screen bg-paper pt-16 text-ink md:pt-20">
      <header className="glow-ember">
        <div className="mx-auto max-w-[1000px] px-4 pb-10 pt-12 md:px-8 lg:pt-20">
          <h1 className="font-display text-[clamp(4rem,12vw,8rem)] font-bold leading-[0.82]">{tx('ההזמנות שלי', 'My orders')}</h1>
          <p className="mt-4 text-lg text-ink/75">
            {tx('כל מה שהזמנתם, ואיפה כל משלוח עומד. העמוד מתעדכן לבד.', 'Everything you ordered, and where each delivery stands. This page updates by itself.')}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-[1000px] px-4 pb-24 pt-8 md:px-8">
        {body}
        <p className="mt-12 border-t border-ink/20 pt-6 text-sm text-ink/70">
          {tx('שאלה על הזמנה? ', 'A question about an order? ')}
          <Link to="/contact" className="font-bold underline underline-offset-4 hover:text-gold">
            {tx('כתבו לנו', 'Write to us')}
          </Link>
          {tx(' עם מספר ההזמנה, או הציצו ב', ' with the order number, or see the ')}
          <Link to="/faq" className="font-bold underline underline-offset-4 hover:text-gold">
            {tx('שאלות ותשובות', 'FAQ')}
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
