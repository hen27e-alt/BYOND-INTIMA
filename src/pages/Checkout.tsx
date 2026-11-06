import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useCart } from '../contexts/CartContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from '../components/AlertModal';
import { Ticket } from '../components/season/Ticket';
import { cardDecks } from '../data/decks';
import { type Product, useCatalogue } from '../lib/catalogue';
import { db } from '../firebase';
import { cn } from '../lib/utils';

const FREE_SHIPPING_FROM = 300;
const SHIPPING_FEE = 25;

type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'address' | 'notes';

const getProduct = (catalogue: Product[], id: string): { name: string; price: number; image?: string } | null => {
  const boutique = catalogue.find((p) => p.id === id && !p.hidden);
  if (boutique) return boutique;
  const deck = cardDecks.find((d) => d.id === id);
  if (deck) return { name: `BYOND ${deck.name}`, price: deck.price ?? 119 };
  return null;
};

/** A numbered section of the order form, ruled like the programme. */
const Part = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <section className="border-t-[3px] border-ink pt-4">
    <h2 className="mb-6 flex items-baseline gap-3 font-display text-5xl font-bold leading-none">
      <span className="text-spot tabular-nums">{n}</span>
      {title}
    </h2>
    {children}
  </section>
);

export const Checkout = () => {
  const { cart, updateQuantity, removeFromCart, cartCount, clearCart } = useCart();
  const { user, profile } = useFirebase();
  const { language } = useLanguage();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const { products: catalogue } = useCatalogue();
  const he = language === 'he';
  const tx = (h: string, e: string) => (he ? h : e);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'phone'>('credit-card');
  const [form, setForm] = useState<Record<Field, string>>(() => ({
    firstName: profile?.displayName?.split(' ')[0] ?? '',
    lastName: profile?.displayName?.split(' ').slice(1).join(' ') ?? '',
    email: user?.email ?? '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  }));
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [dedications, setDedications] = useState<Record<string, { name: string; dedication: string }>>(() =>
    Object.fromEntries(
      Object.entries(cart).map(([id, d]) => [id, { name: d.personalization?.name ?? '', dedication: d.personalization?.dedication ?? '' }])
    )
  );

  const lines = Object.entries(cart)
    .map(([id, data]) => ({ id, quantity: data.quantity, product: getProduct(catalogue, id) }))
    .filter((l): l is { id: string; quantity: number; product: NonNullable<ReturnType<typeof getProduct>> } => Boolean(l.product));

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const setField = (name: Field, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const req = tx('שדה חובה', 'Required');
    const e: Partial<Record<Field, string>> = {};
    (['firstName', 'lastName', 'email', 'phone', 'city', 'address'] as Field[]).forEach((k) => {
      if (!form[k].trim()) e[k] = req;
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = tx('כתובת אימייל לא תקינה', 'Invalid email address');
    if (form.phone && !/^05\d-?\d{7}$/.test(form.phone.trim())) e.phone = tx('מספר נייד לא תקין, למשל 050-1234567', 'Invalid mobile number, e.g. 050-1234567');
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`co-${first}`)?.focus();
    return !first;
  };

  const submit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);

    const items = lines.map((l) => ({
      id: l.id,
      name: l.product.name,
      price: l.product.price,
      quantity: l.quantity,
      personalization: dedications[l.id]?.name || dedications[l.id]?.dedication ? dedications[l.id] : null,
    }));

    try {
      let orderId: string | undefined;
      if (user) {
        try {
          const ref = await addDoc(collection(db, 'orders'), {
            userId: user.uid,
            customerDetails: { ...form },
            items,
            subtotal,
            shipping,
            totalAmount: total,
            paymentMethod,
            status: 'pending',
            createdAt: serverTimestamp(),
          });
          orderId = ref.id;
        } catch (err) {
          console.error('Could not save order to Firestore', err);
        }
      }

      const response = await fetch('/api/checkout/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData: form, cart: items, total, paymentMethod, orderId }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) throw new Error(data.error || `HTTP ${response.status}`);

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderData: {
            orderId: data.orderId,
            customerName: `${form.firstName} ${form.lastName}`,
            total,
            address: `${form.address}, ${form.city}`,
            phone: form.phone,
            items,
          },
        },
      });
    } catch (err) {
      console.error('Checkout error:', err);
      showAlert(
        tx('לא הצלחנו להשלים את ההזמנה. הסל נשמר, אפשר לנסות שוב בעוד רגע.', "We couldn't complete the order. Your cart is saved; please try again in a moment."),
        tx('ההזמנה לא נשלחה', 'Order not sent')
      );
    } finally {
      setLoading(false);
    }
  };

  const input = (name: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`co-${name}`} className="mb-1 block text-sm font-bold">
        {label}
      </label>
      <input
        id={`co-${name}`}
        name={name}
        value={form[name]}
        onChange={(e) => setField(name, e.target.value)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `co-${name}-err` : undefined}
        className={cn(
          'w-full border-0 border-b-2 bg-transparent px-0 py-2 text-lg outline-none transition-colors placeholder:text-ink/35 focus:border-spot',
          errors[name] ? 'border-spot' : 'border-ink',
          he && props.dir === 'ltr' && 'text-right'
        )}
        {...props}
      />
      {errors[name] && (
        <p id={`co-${name}-err`} className="mt-1 text-sm font-bold text-spot">
          {errors[name]}
        </p>
      )}
    </div>
  );

  if (cartCount === 0) {
    return (
      <div className="bg-paper pt-16 text-ink md:pt-20">
        <div className="mx-auto flex min-h-[70svh] max-w-[1440px] flex-col items-start justify-center gap-6 px-4 py-20 md:px-8 lg:px-14">
          <h1 className="font-display text-[clamp(4rem,12vw,9rem)] font-bold leading-[0.82]">{tx('הסל ריק', 'Your cart is empty')}</h1>
          <p className="max-w-[44ch] text-lg text-ink/80">
            {tx('עוד לא בחרתם כלום לערב. אפשר להתחיל ממארז, או לעבור על הבוטיק.', "You haven't picked anything for the evening yet. Start with a box, or look through the boutique.")}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Ticket label={tx('למארזים', 'The boxes')} stub="03" stubCaption={tx('ערבים', 'evenings')} to="/experience" />
            <Link to="/boutique" className="text-base font-bold underline underline-offset-4 hover:text-spot">
              {tx('לבוטיק', 'To the boutique')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper pt-16 text-ink md:pt-20">
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-10 md:px-8 lg:px-14 lg:pt-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(4rem,11vw,8.5rem)] font-bold leading-[0.82]">{tx('הזמנה', 'Order')}</h1>
          <Link to="/boutique" className="text-base font-bold underline underline-offset-4 hover:text-spot">
            {tx('חזרה לבוטיק', 'Back to the boutique')}
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
          <form ref={formRef} onSubmit={submit} noValidate className="space-y-14">
            <Part n="01" title={tx('מי מזמין', 'Who is ordering')}>
              <div className="grid gap-6 md:grid-cols-2">
                {input('firstName', tx('שם פרטי', 'First name'), { autoComplete: 'given-name' })}
                {input('lastName', tx('שם משפחה', 'Last name'), { autoComplete: 'family-name' })}
                {input('email', tx('אימייל', 'Email'), { type: 'email', autoComplete: 'email', dir: 'ltr', placeholder: 'name@example.com' })}
                {input('phone', tx('טלפון נייד', 'Mobile'), { type: 'tel', autoComplete: 'tel', dir: 'ltr', placeholder: '050-1234567' })}
              </div>
            </Part>

            <Part n="02" title={tx('לאן שולחים', 'Where to send it')}>
              <div className="grid gap-6 md:grid-cols-2">
                {input('city', tx('עיר', 'City'), { autoComplete: 'address-level2' })}
                {input('address', tx('רחוב ומספר', 'Street and number'), { autoComplete: 'street-address' })}
                <div className="md:col-span-2">{input('notes', tx('הערות לשליח (לא חובה)', 'Notes for the courier (optional)'), { placeholder: tx('קומה, כניסה, קוד לבניין', 'Floor, entrance, door code') })}</div>
              </div>
              <p className="mt-4 text-sm text-ink/70">
                {tx(`משלוח ₪${SHIPPING_FEE}, חינם בהזמנה מ־₪${FREE_SHIPPING_FROM}.`, `Shipping ₪${SHIPPING_FEE}, free on orders from ₪${FREE_SHIPPING_FROM}.`)}
              </p>
            </Part>

            <Part n="03" title={tx('הקדשה', 'Dedication')}>
              <p className="mb-4 text-base text-ink/75">{tx('לא חובה. שם והקדשה שיודפסו על הפריט.', 'Optional. A name and a line printed on the item.')}</p>
              <ul>
                {lines.map((l) => (
                  <li key={l.id} className="grid gap-4 border-b border-rule py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] md:items-end">
                    <p className="font-bold">{l.product.name}</p>
                    <label className="block">
                      <span className="mb-1 block text-sm font-bold">{tx('שם', 'Name')}</span>
                      <input
                        value={dedications[l.id]?.name ?? ''}
                        onChange={(e) => setDedications((d) => ({ ...d, [l.id]: { ...d[l.id], name: e.target.value } }))}
                        className="w-full border-0 border-b-2 border-ink bg-transparent px-0 py-1.5 outline-none focus:border-spot"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-sm font-bold">{tx('הקדשה', 'Dedication')}</span>
                      <input
                        value={dedications[l.id]?.dedication ?? ''}
                        onChange={(e) => setDedications((d) => ({ ...d, [l.id]: { ...d[l.id], dedication: e.target.value } }))}
                        className="w-full border-0 border-b-2 border-ink bg-transparent px-0 py-1.5 outline-none focus:border-spot"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </Part>

            <Part n="04" title={tx('תשלום', 'Payment')}>
              <fieldset>
                <legend className="sr-only">{tx('אמצעי תשלום', 'Payment method')}</legend>
                <div className="grid border-[3px] border-ink md:grid-cols-2">
                  {(
                    [
                      ['credit-card', tx('כרטיס אשראי', 'Credit card'), tx('תועברו לעמוד התשלום המאובטח של Stripe. אנחנו לא רואים ולא שומרים את פרטי הכרטיס.', "You'll go to Stripe's secure payment page. We never see or store your card details.")],
                      ['phone', tx('הזמנה טלפונית', 'Order by phone'), tx('נחזור אליכם בטלפון כדי להשלים את התשלום.', "We'll call you to complete the payment.")],
                    ] as const
                  ).map(([id, label, note], i) => (
                    <label
                      key={id}
                      className={cn(
                        'flex cursor-pointer gap-3 p-5 transition-colors',
                        i === 1 && 'border-t-[3px] border-ink md:border-s-[3px] md:border-t-0',
                        paymentMethod === id ? 'bg-ink text-paper' : 'hover:bg-ink/5'
                      )}
                    >
                      <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="mt-1.5 accent-[var(--color-accent)]" />
                      <span>
                        <span className="block text-lg font-bold">{label}</span>
                        <span className={cn('mt-1 block text-sm', paymentMethod === id ? 'text-paper/80' : 'text-ink/70')}>{note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </Part>
            <button type="submit" className="sr-only">
              {tx('שליחת ההזמנה', 'Place order')}
            </button>
          </form>

          <aside aria-label={tx('סיכום ההזמנה', 'Order summary')} className="lg:sticky lg:top-28 lg:self-start">
            <div className="border-[3px] border-ink bg-[var(--color-surface)]">
              <h2 className="border-b-[3px] border-ink px-5 py-3 font-display text-4xl font-bold leading-none">{tx('הקבלה', 'Receipt')}</h2>
              <ul className="px-5">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 border-b border-rule py-4">
                    {l.product.image && <img src={l.product.image} alt="" className="h-16 w-12 shrink-0 object-cover grayscale" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold leading-snug">{l.product.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(l.id, -1)} className="border-2 border-ink p-0.5 hover:bg-ink hover:text-paper" aria-label={tx('להפחית', 'Decrease')}>
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center tabular-nums" aria-live="polite">{l.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(l.id, 1)} className="border-2 border-ink p-0.5 hover:bg-ink hover:text-paper" aria-label={tx('להוסיף', 'Increase')}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold tabular-nums">₪{l.product.price * l.quantity}</span>
                      <button type="button" onClick={() => removeFromCart(l.id)} className="text-ink/60 hover:text-spot" aria-label={tx(`להסיר את ${l.product.name}`, `Remove ${l.product.name}`)}>
                        <X size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2 px-5 py-4 text-base">
                <div className="flex justify-between">
                  <dt>{tx('סכום ביניים', 'Subtotal')}</dt>
                  <dd className="tabular-nums">₪{subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{tx('משלוח', 'Shipping')}</dt>
                  <dd className="tabular-nums">{shipping === 0 ? tx('חינם', 'Free') : `₪${shipping}`}</dd>
                </div>
                <div className="flex items-end justify-between border-t-[3px] border-ink pt-3">
                  <dt className="font-bold">{tx('לתשלום', 'Total')}</dt>
                  <dd className="font-display text-6xl font-bold leading-none tabular-nums">₪{total}</dd>
                </div>
              </dl>
              <div className="px-5 pb-5">
                <Ticket
                  label={loading ? tx('שולחים…', 'Sending…') : paymentMethod === 'phone' ? tx('לשלוח הזמנה', 'Send order') : tx('לתשלום מאובטח', 'Pay securely')}
                  stub={String(cartCount)}
                  stubCaption={tx('פריטים', 'items')}
                  tone="spot"
                  size="md"
                  className="w-full"
                  disabled={loading}
                  onClick={() => formRef.current?.requestSubmit()}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
