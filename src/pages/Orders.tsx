import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { collection, onSnapshot, orderBy, query, where, type Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { boutiqueProducts } from '../data/boutique';
import { ORDER_STATUSES, statusOf } from '../data/orderStatus';
import { cn } from '../lib/utils';

type Line = { id: string; name: string; price: number; quantity: number };

type Order = {
  id: string;
  totalAmount?: number;
  shipping?: number;
  status?: string;
  createdAt?: Timestamp;
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

/** Progress along the order's journey, drawn as a ruled track with the reached steps in spot. */
const Track = ({ status, he }: { status?: string; he: boolean }) => {
  const steps = ORDER_STATUSES.filter((s) => s.id !== 'cancelled' && s.id !== 'paid');
  const current = statusOf(status);
  if (current.id === 'cancelled') return <p className="font-bold text-spot">{he ? 'ההזמנה בוטלה.' : 'This order was cancelled.'}</p>;
  const reached = current.id === 'paid' ? 0 : steps.findIndex((s) => s.id === current.id);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={he ? 'מצב ההזמנה' : 'Order progress'}>
      {steps.map((s, i) => (
        <li key={s.id} aria-current={i === reached ? 'step' : undefined}>
          <span className={cn('block h-2', i <= reached ? 'bg-spot' : 'bg-ink/15')} />
          <span className={cn('mt-1.5 block text-xs font-bold md:text-sm', i <= reached ? 'text-ink' : 'text-ink/50')}>{he ? s.he : s.en}</span>
        </li>
      ))}
    </ol>
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

  const date = (o: Order) =>
    o.createdAt?.toDate?.().toLocaleDateString(he ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) ?? '';

  let body: React.ReactNode;
  if (authLoading || (user && orders === null)) {
    body = <p className="py-20 text-center text-lg">{tx('טוען את ההזמנות...', 'Loading your orders...')}</p>;
  } else if (!user) {
    body = (
      <div className="py-16">
        <p className="text-xl">{tx('כדי לראות הזמנות צריך להתחבר.', 'Sign in to see your orders.')}</p>
        <Link to="/login" className="mt-6 inline-block bg-ink px-6 py-3.5 text-lg font-bold text-paper hover:bg-spot">
          {tx('להתחבר', 'Sign in')}
        </Link>
      </div>
    );
  } else if (failed) {
    body = <p className="py-16 text-lg font-bold text-spot">{tx('לא הצלחנו לטעון את ההזמנות. נסו לרענן את הדף.', "We couldn't load your orders. Try refreshing the page.")}</p>;
  } else if (!orders?.length) {
    body = (
      <div className="py-16">
        <p className="font-display text-5xl font-bold leading-none">{tx('עוד אין הזמנות.', 'No orders yet.')}</p>
        <p className="mt-3 text-lg text-ink/75">{tx('כשתזמינו מארז או מוצר מהבוטיק, הוא יופיע כאן עם מצב המשלוח.', 'When you order a box or a boutique item it will show up here with its delivery status.')}</p>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          <Link to="/experience" className="bg-ink px-6 py-3.5 text-lg font-bold text-paper hover:bg-spot">
            {tx('למארזים', 'See the boxes')}
          </Link>
          <Link to="/boutique" className="self-center text-lg font-bold underline underline-offset-4 hover:text-spot">
            {tx('לבוטיק', 'To the boutique')}
          </Link>
        </div>
      </div>
    );
  } else {
    body = (
      <ul>
        {orders.map((o) => {
          const lines = linesOf(o);
          const isOpen = open === o.id;
          const c = o.customerDetails ?? {};
          return (
            <li key={o.id} className="border-b-[3px] border-ink py-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="font-display text-4xl font-bold leading-none">
                  <bdi dir="ltr" className="tabular-nums">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </bdi>
                </h2>
                <p className="text-base text-ink/70">{date(o)}</p>
                <p className="ms-auto font-display text-4xl font-bold leading-none tabular-nums">₪{o.totalAmount ?? 0}</p>
              </div>
              <p className="mt-2 text-base">
                {lines.map((l) => `${l.name}${l.quantity > 1 ? ` × ${l.quantity}` : ''}`).join(' · ')}
              </p>
              <div className="mt-5">
                <Track status={o.status} he={he} />
              </div>
              <button
                onClick={() => setOpen(isOpen ? null : o.id)}
                aria-expanded={isOpen}
                className="mt-4 flex items-center gap-1 text-sm font-bold hover:text-spot"
              >
                {tx('פרטי ההזמנה', 'Order details')}
                <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="mt-3 grid gap-6 border-t border-ink pt-4 md:grid-cols-2">
                  <ul>
                    {lines.map((l) => (
                      <li key={l.id} className="flex justify-between gap-4 border-b border-rule py-2">
                        <span>
                          {l.name} <span className="text-ink/60">× {l.quantity}</span>
                        </span>
                        <span className="tabular-nums">₪{l.price * l.quantity}</span>
                      </li>
                    ))}
                    {typeof o.shipping === 'number' && (
                      <li className="flex justify-between gap-4 py-2 text-ink/70">
                        <span>{tx('משלוח', 'Shipping')}</span>
                        <span className="tabular-nums">{o.shipping === 0 ? tx('חינם', 'Free') : `₪${o.shipping}`}</span>
                      </li>
                    )}
                  </ul>
                  <div>
                    <h3 className="text-sm font-bold">{tx('נשלח אל', 'Shipping to')}</h3>
                    <p className="mt-1">{[c.firstName, c.lastName].filter(Boolean).join(' ')}</p>
                    <p>{[c.address, c.city].filter(Boolean).join(', ')}</p>
                    <p className="mt-3 text-sm text-ink/70">{he ? statusOf(o.status).customerHe : statusOf(o.status).customerEn}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="min-h-screen bg-paper pt-16 text-ink md:pt-20">
      <div className="mx-auto max-w-[1000px] px-4 pb-24 pt-10 md:px-8 lg:pt-16">
        <header className="border-b-[3px] border-ink pb-6">
          <h1 className="font-display text-[clamp(4rem,12vw,8rem)] font-bold leading-[0.82]">{tx('ההזמנות שלי', 'My orders')}</h1>
          <p className="mt-3 text-lg text-ink/75">{tx('כל מה שהזמנתם, ואיפה כל משלוח עומד.', 'Everything you ordered, and where each delivery stands.')}</p>
        </header>
        {body}
      </div>
    </div>
  );
};
