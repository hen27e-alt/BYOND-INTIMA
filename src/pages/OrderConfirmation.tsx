import React, { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';

type Item = { id: string; name: string; price: number; quantity: number; personalization?: { name?: string; dedication?: string } | null };
type OrderData = { orderId?: string; customerName?: string; total?: number; address?: string; phone?: string; items?: Item[] };

/** The stub the customer keeps: a printed receipt in the season world. */
export const OrderConfirmation = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const { user } = useFirebase();
  const { language } = useLanguage();
  const reduce = useReducedMotion();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const paidOnline = params.get('success') === 'true';
  const data: OrderData = location.state?.orderData ?? {};
  const orderId = data.orderId ?? params.get('orderId') ?? undefined;
  const items = data.items ?? [];
  const firstName = data.customerName?.trim().split(' ')[0];

  // Returning from Stripe: the cart was kept in case payment failed, so clear it now.
  useEffect(() => {
    if (paidOnline) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidOnline]);

  const steps = [
    [tx('אישור במייל', 'Email confirmation'), tx('שלחנו אישור עם פרטי ההזמנה.', 'We sent a confirmation with the order details.')],
    [tx('אריזה', 'Packing'), tx('אורזים הכול ביד, בקופסה דיסקרטית בלי סימון חיצוני.', 'Everything is packed by hand, in a discreet unmarked box.')],
    [tx('משלוח', 'Delivery'), tx('בדרך כלל עד 5 ימי עסקים. נעדכן כשהחבילה יוצאת.', 'Usually within 5 business days. We will let you know when it ships.')],
  ];

  return (
    <div className="min-h-screen bg-paper px-4 pb-24 pt-28 text-ink md:px-8 md:pt-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="border-[3px] border-ink"
        >
          <header className="bg-ink px-6 py-10 text-paper md:px-10 md:py-14">
            <p className="text-sm font-bold text-[var(--color-accent-light)]">{tx('ההזמנה התקבלה', 'Order received')}</p>
            <h1 className="mt-2 font-display text-[clamp(3.5rem,11vw,7rem)] font-bold leading-[0.85]">
              {firstName ? tx(`תודה, ${firstName}.`, `Thank you, ${firstName}.`) : tx('תודה.', 'Thank you.')}
            </h1>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-paper/80">
              {paidOnline
                ? tx('התשלום עבר וההזמנה בדרך להכנה.', 'Payment went through and your order is being prepared.')
                : tx('ההזמנה אצלנו. אם בחרתם בתשלום טלפוני, נתקשר תוך יום עסקים.', "We have your order. If you chose to pay by phone, we'll call within one business day.")}
            </p>
          </header>

          {/* Perforation between the stub and the receipt */}
          <div aria-hidden="true" className="border-t-[3px] border-dashed border-ink" />

          <div className="px-6 py-8 md:px-10">
            {orderId && (
              <p className="flex items-baseline justify-between gap-4 border-b-[3px] border-ink pb-3">
                <span className="text-sm font-bold">{tx('מספר הזמנה', 'Order number')}</span>
                <bdi dir="ltr" className="font-display text-4xl font-bold leading-none tabular-nums text-spot">
                  #{orderId.slice(0, 8).toUpperCase()}
                </bdi>
              </p>
            )}

            {items.length > 0 && (
              <ul className="mt-2">
                {items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4 border-b border-rule py-3 text-lg">
                    <span>
                      {it.name} <span className="text-ink/60">× {it.quantity}</span>
                      {it.personalization?.name && <span className="block text-sm text-spot">{tx(`חריטה: ${it.personalization.name}`, `Engraving: ${it.personalization.name}`)}</span>}
                    </span>
                    <span className="tabular-nums">₪{it.price * it.quantity}</span>
                  </li>
                ))}
              </ul>
            )}

            {typeof data.total === 'number' && (
              <p className="flex items-baseline justify-between border-b-[3px] border-ink py-4">
                <span className="text-lg font-bold">{tx('סה״כ', 'Total')}</span>
                <span className="font-display text-5xl font-bold leading-none tabular-nums">₪{data.total}</span>
              </p>
            )}

            {(data.address || data.phone) && (
              <dl className="grid gap-4 border-b border-rule py-5 sm:grid-cols-2">
                {data.address && (
                  <div>
                    <dt className="text-sm font-bold">{tx('נשלח אל', 'Shipping to')}</dt>
                    <dd className="mt-1 text-lg">{data.address}</dd>
                  </div>
                )}
                {data.phone && (
                  <div>
                    <dt className="text-sm font-bold">{tx('טלפון', 'Phone')}</dt>
                    <dd className="mt-1 text-lg" dir="ltr">
                      <bdi>{data.phone}</bdi>
                    </dd>
                  </div>
                )}
              </dl>
            )}

            <h2 className="mt-8 font-display text-4xl font-bold leading-none">{tx('מה עכשיו', 'What happens now')}</h2>
            <ol className="mt-3">
              {steps.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[48px_1fr] gap-3 border-b border-rule py-4">
                  <span className="font-display text-4xl font-bold leading-none text-spot tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <span className="block text-lg font-bold">{t}</span>
                    <span className="text-base text-ink/75">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          {user && (
            <Link to="/orders" className="bg-ink px-6 py-3.5 text-lg font-bold text-paper hover:bg-spot">
              {tx('ההזמנות שלי', 'My orders')}
            </Link>
          )}
          <Link to="/boutique" className="text-lg font-bold underline underline-offset-4 hover:text-spot">
            {tx('בחזרה לבוטיק', 'Back to the boutique')}
          </Link>
          <Link to="/" className="text-lg font-bold underline underline-offset-4 hover:text-spot">
            {tx('לדף הבית', 'Home')}
          </Link>
        </div>
      </div>
    </div>
  );
};
