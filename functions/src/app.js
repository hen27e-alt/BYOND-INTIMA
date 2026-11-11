// The site's API, shared by Firebase Functions (production) and server.ts (local dev).
// Secrets are read from process.env: in production they come from Firebase Secret
// Manager, locally from .env. Nothing here trusts prices sent by the browser.
import express from 'express';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import { sendOrderEmail } from './email.js';

const CATALOGUE = JSON.parse(readFileSync(new URL('../catalogue.json', import.meta.url), 'utf8'));
const FREE_SHIPPING_FROM = 300;
const SHIPPING_FEE = 25;
const TMDB = 'https://api.themoviedb.org/3';

/* ---------- Gift cards ----------
   Buying one creates a code right away, but it only works once its order is paid
   (Stripe, or the owner moving a phone order to "paid" or later). Valid five years. */
const GIFT_PREFIX = 'gift_card_';
const GIFT_LIVE = new Set(['paid', 'processing', 'shipped', 'delivered']);
const GIFT_YEARS = 5;
const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** Stored without dashes; shown as BYND-XXXX-XXXX. */
const giftId = (v) => (typeof v === 'string' ? v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20) : '');
const showCode = (id) => `${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8, 12)}`;
const newGiftId = () => 'BYND' + Array.from({ length: 8 }, () => CODE_ABC[randomInt(CODE_ABC.length)]).join('');

const he = {
  noStripe: 'התשלום באשראי עוד לא הופעל באתר. אפשר לבחור תשלום טלפוני ונחזור אליכם.',
  badCart: 'חלק מהמוצרים בסל כבר לא זמינים. רעננו את הדף ונסו שוב.',
  badForm: 'חסרים פרטים בטופס ההזמנה.',
  signIn: 'צריך להתחבר כדי להשתמש בכלי ה־AI.',
  aiOff: 'כלי ה־AI לא זמין כרגע.',
  tooMany: 'יותר מדי בקשות ברצף. חכו דקה ונסו שוב.',
  server: 'משהו השתבש אצלנו. נסו שוב בעוד רגע.',
  giftBad: 'הקוד לא תקף, או שכבר נוצל עד הסוף. בדקו שהוקלד נכון.',
  giftOnGift: 'אי אפשר לשלם על כרטיס מתנה בכרטיס מתנה.',
};

const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** In-memory limiter: good enough to stop a runaway loop from one account. */
const limiter = (perMinute) => {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
    recent.push(now);
    hits.set(key, recent);
    return recent.length <= perMinute;
  };
};

/**
 * @param {{ db: () => import('firebase-admin/firestore').Firestore, auth: () => import('firebase-admin/auth').Auth, baseUrl: (req: express.Request) => string }} deps
 */
export const createApp = ({ db, auth, baseUrl, dev = false }) => {
  const app = express();
  const aiAllowed = limiter(30);
  let stripe = null;
  const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY);
    return stripe;
  };

  const uidFrom = async (req) => {
    const h = req.get('authorization') ?? '';
    if (!h.startsWith('Bearer ')) return null;
    try {
      return (await auth().verifyIdToken(h.slice(7))).uid;
    } catch {
      return null;
    }
  };

  /** The card as it stands now, or null when it doesn't exist, isn't paid for, is used up or expired. */
  const liveGiftCard = async (code, t) => {
    const id = giftId(code);
    if (id.length !== 12) return null;
    const ref = db().collection('giftCards').doc(id);
    const snap = t ? await t.get(ref) : await ref.get();
    if (!snap.exists) return null;
    const g = snap.data();
    const order = await db().collection('orders').doc(g.orderId).get();
    if (!order.exists || !GIFT_LIVE.has(order.get('status'))) return null;
    const born = g.createdAt?.toDate?.() ?? new Date();
    if (Date.now() > new Date(born).setFullYear(born.getFullYear() + GIFT_YEARS)) return null;
    if (!(g.balance > 0)) return null;
    return { ref, id, balance: g.balance };
  };

  /** Takes up to `amount` off a card inside a transaction. Returns what was actually taken. */
  const chargeGiftCard = (code, amount, orderId) =>
    db().runTransaction(async (t) => {
      const card = await liveGiftCard(code, t);
      if (!card) return 0;
      const take = Math.min(card.balance, amount);
      t.update(card.ref, { balance: card.balance - take, uses: FieldValue.arrayUnion({ orderId, amount: take, at: new Date() }) });
      return take;
    });

  const giftCheckAllowed = limiter(12);

  /* ---------- Stripe webhook: needs the raw body, so it comes before express.json ---------- */
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const s = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!s || !secret) return res.status(503).send('not configured');
    let event;
    try {
      event = s.webhooks.constructEvent(req.rawBody ?? req.body, req.get('stripe-signature'), secret);
    } catch (e) {
      return res.status(400).send(`signature: ${e.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      const orderId = event.data.object.metadata?.orderId;
      if (orderId) {
        const ref = db().collection('orders').doc(orderId);
        await ref.set({ status: 'paid', paidAt: FieldValue.serverTimestamp(), stripeSession: event.data.object.id }, { merge: true });
        let snap = await ref.get().catch(() => null);
        if (snap?.exists && snap.get('giftCode') && snap.get('giftApplied') > 0 && !snap.get('giftCharged')) {
          const taken = await chargeGiftCard(snap.get('giftCode'), snap.get('giftApplied'), orderId).catch(() => 0);
          await ref.set({ giftCharged: true, giftTaken: taken }, { merge: true });
          if (taken < snap.get('giftApplied')) console.warn(`gift card short on order ${orderId}: wanted ${snap.get('giftApplied')}, took ${taken}`);
          snap = await ref.get().catch(() => snap);
        }
        if (snap?.exists && !snap.get('emailSent')) {
          if (await sendOrderEmail({ id: orderId, ...snap.data() })) await ref.set({ emailSent: true }, { merge: true });
        }
      }
    }
    res.json({ received: true });
  });

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, stripe: !!process.env.STRIPE_SECRET_KEY, ai: !!process.env.GEMINI_API_KEY, movies: !!process.env.TMDB_API_KEY }));

  /* ---------- Gift card balance, for the checkout field ---------- */
  app.post('/api/gift-card/check', async (req, res) => {
    if (!giftCheckAllowed(req.ip ?? 'x')) return res.status(429).json({ error: he.tooMany });
    try {
      const card = await liveGiftCard(req.body?.code);
      if (!card) return res.status(404).json({ error: he.giftBad });
      res.json({ code: showCode(card.id), balance: card.balance });
    } catch (e) {
      console.error('gift check failed', e.message);
      res.status(dev ? 404 : 500).json({ error: dev ? he.giftBad : he.server });
    }
  });

  /* ---------- Checkout ---------- */
  const priceList = async () => {
    const list = Object.fromEntries(Object.entries(CATALOGUE).map(([id, p]) => [id, { ...p }]));
    try {
      const snap = await db().collection('products').get();
      for (const d of snap.docs) {
        const r = d.data();
        const base = list[d.id];
        // Old seeded records only override what the owner actually saved in the admin panel.
        if (!base && !r.custom) continue;
        list[d.id] = {
          name: (r.adminEdited || !base) && typeof r.name === 'string' ? r.name : base?.name,
          price: (r.adminEdited || !base) && Number.isFinite(r.price) ? r.price : base?.price,
          hidden: !!r.hidden,
          soldOut: !!r.soldOut,
          shippingIncluded: r.adminEdited && typeof r.shippingIncluded === 'boolean' ? r.shippingIncluded : !!base?.shippingIncluded,
        };
      }
    } catch (e) {
      console.warn('products override unavailable, using catalogue.json', e.message);
    }
    return list;
  };

  const checkout = async (req, res) => {
    try {
      const b = req.body ?? {};
      // Accept the old payload shape ({ formData, cart }) as well as the new one.
      const c = b.customer ?? b.formData ?? {};
      const customer = {
        firstName: str(c.firstName, 60),
        lastName: str(c.lastName, 60),
        email: str(c.email, 120),
        phone: str(c.phone, 20),
        city: str(c.city, 60),
        address: str(c.address, 160),
        notes: str(c.notes, 500),
      };
      const paymentMethod = b.paymentMethod === 'phone' ? 'phone' : 'credit-card';
      const raw = Array.isArray(b.items) ? b.items : Array.isArray(b.cart) ? b.cart : [];
      if (!raw.length || raw.length > 30) return res.status(400).json({ error: he.badCart });
      // Gift cards are digital: an order of only gift cards needs no address.
      const digitalOnly = raw.every((it) => str(it?.id, 80).startsWith(GIFT_PREFIX));
      if (!customer.firstName || !customer.email.includes('@') || !customer.phone || (!digitalOnly && !customer.address)) return res.status(400).json({ error: he.badForm });

      // Gift wrapping is free; the note is printed on a card inside the box.
      const gift = b.gift && b.gift.wrap && !digitalOnly ? { wrap: true, note: str(b.gift.note, 240) } : null;

      const prices = await priceList();
      const items = [];
      for (const it of raw) {
        const p = prices[str(it.id, 80)];
        const quantity = Math.min(10, Math.max(1, Math.floor(Number(it.quantity) || 1)));
        if (!p || p.hidden || p.soldOut || !Number.isFinite(p.price)) return res.status(409).json({ error: he.badCart });
        const pers = it.personalization && (it.personalization.name || it.personalization.dedication)
          ? { name: str(it.personalization.name, 24), dedication: str(it.personalization.dedication, 80) }
          : null;
        items.push({ id: str(it.id, 80), name: p.name, price: p.price, quantity, personalization: pers, shippingIncluded: !!p.shippingIncluded });
      }
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      // Card packs include shipping; the fee applies only when something else needs it.
      const needsShipping = items.some((i) => !i.shippingIncluded);
      const shipping = !needsShipping || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
      const total = subtotal + shipping;

      // A gift card being redeemed against this order.
      const giftCode = giftId(b.giftCode);
      let giftApplied = 0;
      if (giftCode) {
        if (items.some((i) => i.id.startsWith(GIFT_PREFIX))) return res.status(400).json({ error: he.giftOnGift });
        const card = await liveGiftCard(giftCode).catch(() => null);
        if (!card) return res.status(400).json({ error: he.giftBad });
        giftApplied = Math.min(card.balance, total);
      }
      const due = total - giftApplied;
      const method = due === 0 ? 'gift-card' : paymentMethod;

      const s = method === 'credit-card' ? getStripe() : null;
      if (method === 'credit-card' && !s) return res.status(503).json({ error: he.noStripe, code: 'payments_off' });

      const ref = db().collection('orders').doc();
      const uid = (await uidFrom(req)) ?? null;

      // Gift cards bought in this order: one code per card, live once the order is paid.
      const giftCards = [];
      for (const i of items.filter((x) => x.id.startsWith(GIFT_PREFIX))) {
        for (let n = 0; n < i.quantity; n++) giftCards.push({ id: newGiftId(), amount: i.price, to: i.personalization?.name ?? '', note: i.personalization?.dedication ?? '' });
      }

      const order = {
        userId: uid,
        customerDetails: customer,
        gift,
        items,
        subtotal,
        shipping,
        giftCode: giftCode ? showCode(giftCode) : null,
        giftApplied,
        giftCards: giftCards.map((g) => ({ code: showCode(g.id), amount: g.amount, to: g.to })),
        totalAmount: due,
        paymentMethod: method,
        status: method === 'gift-card' ? 'paid' : method === 'phone' ? 'pending' : 'awaiting_payment',
        createdAt: FieldValue.serverTimestamp(),
      };

      // Phone orders and orders paid in full by a gift card take the balance now; card orders once Stripe confirms.
      const chargeNow = giftApplied > 0 && method !== 'credit-card';
      const save = db().runTransaction(async (t) => {
        if (chargeNow) {
          const card = await liveGiftCard(giftCode, t);
          if (!card || card.balance < giftApplied) throw Object.assign(new Error('gift card changed'), { gift: true });
          t.update(card.ref, { balance: card.balance - giftApplied, uses: FieldValue.arrayUnion({ orderId: ref.id, amount: giftApplied, at: new Date() }) });
        }
        for (const g of giftCards) {
          t.set(db().collection('giftCards').doc(g.id), { amount: g.amount, balance: g.amount, orderId: ref.id, to: g.to, note: g.note, createdAt: FieldValue.serverTimestamp() });
        }
        t.set(ref, { ...order, ...(chargeNow ? { giftCharged: true, giftTaken: giftApplied } : {}) });
      });
      // Locally there are no server credentials for Firestore; the flow still runs end to end.
      try {
        await save;
      } catch (e) {
        if (e.gift) return res.status(409).json({ error: he.giftBad });
        if (!dev) throw e;
        console.warn('[dev] order not saved:', e.message);
      }

      // Phone and gift-card orders are confirmed now; card orders once Stripe reports the payment.
      if (method !== 'credit-card') {
        await sendOrderEmail({ id: ref.id, ...order });
      }

      let paymentUrl = null;
      if (s) {
        const lineItems = items.map((i) => ({
          price_data: { currency: 'ils', product_data: { name: i.name }, unit_amount: Math.round(i.price * 100) },
          quantity: i.quantity,
        }));
        if (shipping) lineItems.push({ price_data: { currency: 'ils', product_data: { name: 'משלוח' }, unit_amount: shipping * 100 }, quantity: 1 });
        const discounts = giftApplied
          ? [{ coupon: (await s.coupons.create({ amount_off: giftApplied * 100, currency: 'ils', duration: 'once', max_redemptions: 1, name: 'כרטיס מתנה' })).id }]
          : undefined;
        const session = await s.checkout.sessions.create({
          mode: 'payment',
          line_items: lineItems,
          discounts,
          customer_email: customer.email,
          metadata: { orderId: ref.id },
          success_url: `${baseUrl(req)}/order-confirmation?success=true&orderId=${ref.id}`,
          cancel_url: `${baseUrl(req)}/checkout?canceled=true`,
        });
        paymentUrl = session.url;
      }

      res.json({ success: true, orderId: ref.id, paymentUrl, total: due, subtotal, shipping, giftApplied, items, giftCards: order.status === 'paid' ? order.giftCards : [] });
    } catch (e) {
      console.error('checkout failed', e);
      res.status(500).json({ error: he.server });
    }
  };
  app.post('/api/checkout', checkout);
  app.post('/api/checkout/decks', checkout);

  /* ---------- Gemini proxy ---------- */
  let ai = null;
  app.post('/api/ai/generate', async (req, res) => {
    if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: he.aiOff });
    const uid = await uidFrom(req);
    if (!uid) return res.status(401).json({ error: he.signIn });
    if (!aiAllowed(uid)) return res.status(429).json({ error: he.tooMany });
    const { model, contents, config } = req.body ?? {};
    if (typeof model !== 'string' || !/^gemini-[\w.-]+$/.test(model) || contents == null) return res.status(400).json({ error: he.aiOff });
    try {
      ai ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const r = await ai.models.generateContent({ model, contents, config });
      res.json({ text: r.text ?? '', candidates: r.candidates ?? [] });
    } catch (e) {
      console.error('ai failed', e.message);
      res.status(502).json({ error: he.aiOff });
    }
  });

  /* ---------- Movies (TMDB) ---------- */
  const tmdb = async (res, path, params = {}) => {
    if (!process.env.TMDB_API_KEY) return res.status(503).json({ error: 'ספריית הסרטים לא זמינה כרגע.' });
    const q = new URLSearchParams({ api_key: process.env.TMDB_API_KEY, language: 'he-IL', ...params });
    try {
      const r = await fetch(`${TMDB}${path}?${q}`);
      res.status(r.ok ? 200 : 502).json(await r.json());
    } catch {
      res.status(502).json({ error: 'ספריית הסרטים לא זמינה כרגע.' });
    }
  };
  app.get('/api/movies/search', (req, res) => tmdb(res, '/search/movie', { query: str(req.query.query, 100) }));
  app.get('/api/movies/popular', (_req, res) => tmdb(res, '/movie/popular'));
  app.get('/api/movies/top_rated', (_req, res) => tmdb(res, '/movie/top_rated'));
  app.get('/api/movies/genre/:id', (req, res) => tmdb(res, '/discover/movie', { with_genres: String(Number(req.params.id) || 0), sort_by: 'popularity.desc' }));
  app.get('/api/movies/details/:id', async (req, res) => {
    if (!process.env.TMDB_API_KEY) return res.status(503).json({ error: 'ספריית הסרטים לא זמינה כרגע.' });
    const id = Number(req.params.id) || 0;
    const k = process.env.TMDB_API_KEY;
    try {
      const [m, v] = await Promise.all([
        fetch(`${TMDB}/movie/${id}?api_key=${k}&language=he-IL`).then((r) => r.json()),
        fetch(`${TMDB}/movie/${id}/videos?api_key=${k}&language=en-US`).then((r) => r.json()),
      ]);
      res.json({ ...m, videos: v.results });
    } catch {
      res.status(502).json({ error: 'ספריית הסרטים לא זמינה כרגע.' });
    }
  });

  app.use('/api', (_req, res) => res.status(404).json({ error: 'not found' }));
  return app;
};
