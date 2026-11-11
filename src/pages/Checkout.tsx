import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, X, Package, Gift, Ticket as TicketIcon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from '../components/AlertModal';
import { Ticket } from '../components/season/Ticket';
import { cardDecks } from '../data/decks';
import { type Product, useCatalogue, shippingFor, FREE_SHIPPING_FROM, SHIPPING_FEE, CARD_PAYMENTS } from '../lib/catalogue';
import { cn } from '../lib/utils';
import { isBoxArt } from '../data/season';


type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'city' | 'address' | 'notes';

const getProduct = (catalogue: Product[], id: string): { name: string; price: number; image?: string; shippingIncluded?: boolean } | null => {
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
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'phone'>(CARD_PAYMENTS ? 'credit-card' : 'phone');
  const [form, setForm] = useState<Record<Field, string>>(() => ({
    firstName: profile?.displayName?.split(' ')[0] ?? '',
    lastName: profile?.displayName?.split(' ').slice(1).join(' ') ?? '',
    email: user?.email ?? '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  }));
  const [gift, setGift] = useState({ wrap: false, note: '' });
  // A gift card being redeemed: what was typed, and the card once the server confirmed it.
  const [giftInput, setGiftInput] = useState('');
  const [giftCard, setGiftCard] = useState<{ code: string; balance: number } | null>(null);
  const [giftError, setGiftError] = useState('');
  const [giftChecking, setGiftChecking] = useState(false);
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
  const shipping = shippingFor(lines.map((l) => ({ price: l.product.price, quantity: l.quantity, shippingIncluded: l.product.shippingIncluded })));
  const total = subtotal + shipping;
  const hasGiftCards = lines.some((l) => l.id.startsWith('gift_card_'));
  // Only gift cards in the cart: nothing ships, so no address.
  const digitalOnly = lines.length > 0 && lines.every((l) => l.id.startsWith('gift_card_'));
  const giftApplied = giftCard && !hasGiftCards ? Math.min(giftCard.balance, total) : 0;
  const due = total - giftApplied;

  const checkGiftCard = async () => {
    const code = giftInput.trim();
    if (!code || giftChecking) return;
    setGiftChecking(true);
    setGiftError('');
    try {
      const r = await fetch('/api/gift-card/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setGiftCard(null);
        setGiftError(data.error ?? tx('לא הצלחנו לבדוק את הקוד. נסו שוב.', 'We could not check the code. Try again.'));
        return;
      }
      setGiftCard({ code: data.code, balance: data.balance });
    } catch {
      setGiftError(tx('לא הצלחנו לבדוק את הקוד. נסו שוב.', 'We could not check the code. Try again.'));
    } finally {
      setGiftChecking(false);
    }
  };

  const setField = (name: Field, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const req = tx('שדה חובה', 'Required');
    const e: Partial<Record<Field, string>> = {};
    (['firstName', 'lastName', 'email', 'phone', ...(digitalOnly ? [] : ['city', 'address'])] as Field[]).forEach((k) => {
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
      const token = user ? await user.getIdToken().catch(() => null) : null;
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ customer: form, items: items.map(({ id, quantity, personalization }) => ({ id, quantity, personalization })), paymentMethod, gift: gift.wrap && !digitalOnly ? gift : null, giftCode: giftApplied ? giftCard?.code : null }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        // The server explains in words (payments off, an item sold out); show that, keep the cart.
        if (data.error) {
          showAlert(data.error, tx('ההזמנה לא נשלחה', 'Order not sent'));
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

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
            total: data.total ?? due,
            address: digitalOnly ? '' : `${form.address}, ${form.city}`,
            phone: form.phone,
            items: data.items ?? items,
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
              {digitalOnly ? (
                <p className="text-lg text-ink/80">
                  {tx('כרטיס מתנה הוא דיגיטלי, בלי משלוח. אחרי התשלום נשלח לכם את הקוד, והוא יופיע גם ב"ההזמנות שלי".', 'A gift card is digital, nothing ships. Once paid we send you the code, and it also appears in "My orders".')}
                </p>
              ) : (
              <>
              <div className="grid gap-6 md:grid-cols-2">
                {input('city', tx('עיר', 'City'), { autoComplete: 'address-level2' })}
                {input('address', tx('רחוב ומספר', 'Street and number'), { autoComplete: 'street-address' })}
                <div className="md:col-span-2">{input('notes', tx('הערות לשליח (לא חובה)', 'Notes for the courier (optional)'), { placeholder: tx('קומה, כניסה, קוד לבניין', 'Floor, entrance, door code') })}</div>
              </div>
              <p className="mt-4 text-sm text-ink/70">
                {tx(`משלוח ₪${SHIPPING_FEE}, חינם בהזמנה מ־₪${FREE_SHIPPING_FROM}. בחפיסות הקלפים המשלוח כלול.`, `Shipping ₪${SHIPPING_FEE}, free on orders from ₪${FREE_SHIPPING_FROM}. Card packs ship free.`)}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-ink/70">
                <Package size={14} className="shrink-0 text-gold" aria-hidden />
                {tx('החבילה נשלחת באריזה חומה ודיסקרטית. השם שלנו ותוכן החבילה לא מופיעים עליה.', 'The parcel ships in plain, discreet packaging. Neither our name nor the contents appear on it.')}
              </p>
              </>
              )}
            </Part>

            <Part n="03" title={tx('מתנה והקדשה', 'Gift and dedication')}>
              <div className={cn('mb-8 border p-5 transition-colors', digitalOnly && 'hidden', gift.wrap ? 'border-gold/70 glow-oxblood' : 'border-ink/30')}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={gift.wrap}
                    onChange={(e) => setGift((g) => ({ ...g, wrap: e.target.checked }))}
                    className="mt-1.5 h-4 w-4 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-lg font-bold">
                      <Gift size={18} className="text-gold" aria-hidden />
                      {tx('לעטוף כמתנה', 'Wrap it as a gift')}
                      <span className="text-sm font-normal text-gold">{tx('ללא עלות', 'free')}</span>
                    </span>
                    <span className="mt-1 block text-sm text-ink/70">{tx('נייר שחור, סרט בגוון שמפניה, וכרטיס ברכה בכתב יד. בלי קבלה בתוך החבילה.', 'Black paper, a champagne ribbon and a handwritten card. No receipt inside the parcel.')}</span>
                  </span>
                </label>
                {gift.wrap && (
                  <label className="mt-5 block">
                    <span className="mb-1 block text-sm font-bold">{tx('מה לכתוב בכרטיס (לא חובה)', 'What to write on the card (optional)')}</span>
                    <textarea
                      value={gift.note}
                      maxLength={240}
                      rows={3}
                      onChange={(e) => setGift((g) => ({ ...g, note: e.target.value }))}
                      placeholder={tx('למשל: לערב שלנו. שלך, ד׳', 'e.g. For our evening. Yours, D.')}
                      className="w-full resize-none border-0 border-b-2 border-ink bg-transparent px-0 py-1.5 text-lg outline-none placeholder:text-ink/35 focus:border-spot"
                    />
                    <span className="mt-1 block text-end text-xs text-ink/50 tabular-nums">{gift.note.length}/240</span>
                  </label>
                )}
              </div>
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
              {!hasGiftCards && (
                <div className="mb-8">
                  <label htmlFor="co-giftcode" className="mb-1 flex items-center gap-2 text-sm font-bold">
                    <TicketIcon size={16} className="text-gold" aria-hidden />
                    {tx('יש לכם כרטיס מתנה?', 'Have a gift card?')}
                  </label>
                  {giftCard ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 border border-gold/60 bg-gold/[0.06] px-4 py-3">
                      <p>
                        <bdi dir="ltr" className="font-mono font-bold tracking-wider">
                          {giftCard.code}
                        </bdi>
                        <span className="ms-3 text-sm text-ink/75">
                          {tx(`יתרה ₪${giftCard.balance}, ירדו ₪${giftApplied} מההזמנה`, `Balance ₪${giftCard.balance}, ₪${giftApplied} off this order`)}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setGiftCard(null);
                          setGiftInput('');
                        }}
                        className="text-sm font-bold underline underline-offset-4 hover:text-spot"
                      >
                        {tx('להסיר', 'Remove')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        id="co-giftcode"
                        value={giftInput}
                        onChange={(e) => {
                          setGiftInput(e.target.value);
                          setGiftError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void checkGiftCard();
                          }
                        }}
                        dir="ltr"
                        placeholder="BYND-XXXX-XXXX"
                        autoComplete="off"
                        aria-invalid={Boolean(giftError)}
                        aria-describedby={giftError ? 'co-giftcode-err' : undefined}
                        className={cn(
                          'min-w-0 flex-1 border-0 border-b-2 bg-transparent px-0 py-2 font-mono text-lg uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/35 focus:border-spot',
                          giftError ? 'border-spot' : 'border-ink',
                          he && 'text-right'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => void checkGiftCard()}
                        disabled={!giftInput.trim() || giftChecking}
                        className="border-2 border-ink px-5 text-base font-bold transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
                      >
                        {giftChecking ? tx('בודקים…', 'Checking…') : tx('לממש', 'Apply')}
                      </button>
                    </div>
                  )}
                  {giftError && (
                    <p id="co-giftcode-err" className="mt-1 text-sm font-bold text-spot">
                      {giftError}
                    </p>
                  )}
                </div>
              )}
              {due === 0 ? (
                <p className="text-lg font-bold text-gold">{tx('כרטיס המתנה מכסה את כל ההזמנה. אין מה לשלם.', 'The gift card covers the whole order. Nothing to pay.')}</p>
              ) : !CARD_PAYMENTS ? (
                <div className="border-[3px] border-ink p-5">
                  <p className="text-lg font-bold">{tx('הזמנה טלפונית', 'Order by phone')}</p>
                  <p className="mt-1 text-sm text-ink/75">
                    {tx('שולחים את ההזמנה, ואנחנו חוזרים אליכם בטלפון כדי להשלים את התשלום. תשלום באשראי ישירות באתר יתווסף בקרוב.', "Send the order and we'll call you to complete the payment. Card payment on the site is coming soon.")}
                  </p>
                </div>
              ) : (
              <fieldset>
                <legend className="sr-only">{tx('אמצעי תשלום', 'Payment method')}</legend>
                <div className="grid border-[3px] border-ink md:grid-cols-2">
                  {(
                    [
                      ['credit-card', tx('כרטיס אשראי', 'Credit card'), tx('תועברו לעמוד תשלום מאובטח. אנחנו לא רואים ולא שומרים את פרטי הכרטיס.', "You'll go to a secure payment page. We never see or store your card details.")],
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
              )}
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
                    {l.product.image && <img src={l.product.image} alt="" className={cn("h-16 w-12 shrink-0 object-cover", !isBoxArt(l.product.image) && "grayscale")} />}
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
                {gift.wrap && (
                  <div className="flex justify-between">
                    <dt>{tx('אריזת מתנה', 'Gift wrap')}</dt>
                    <dd>{tx('חינם', 'Free')}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>{tx('משלוח', 'Shipping')}</dt>
                  <dd className="tabular-nums">{digitalOnly ? tx('דיגיטלי', 'Digital') : shipping === 0 ? tx('חינם', 'Free') : `₪${shipping}`}</dd>
                </div>
                {giftApplied > 0 && (
                  <div className="flex justify-between text-gold">
                    <dt>{tx('כרטיס מתנה', 'Gift card')}</dt>
                    <dd className="tabular-nums">−₪{giftApplied}</dd>
                  </div>
                )}
                <div className="flex items-end justify-between border-t-[3px] border-ink pt-3">
                  <dt className="font-bold">{tx('לתשלום', 'Total')}</dt>
                  <dd className="font-display text-6xl font-bold leading-none tabular-nums">₪{due}</dd>
                </div>
              </dl>
              <div className="px-5 pb-5">
                <Ticket
                  label={loading ? tx('שולחים…', 'Sending…') : due === 0 || paymentMethod === 'phone' ? tx('לשלוח הזמנה', 'Send order') : tx('לתשלום מאובטח', 'Pay securely')}
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
