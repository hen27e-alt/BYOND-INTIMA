// The site's API, shared by Firebase Functions (production) and server.ts (local dev).
// Secrets are read from process.env: in production they come from Firebase Secret
// Manager, locally from .env. Nothing here trusts prices sent by the browser.
import express from 'express';
import Stripe from 'stripe';
import { GoogleGenAI } from '@google/genai';
import { FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const CATALOGUE = JSON.parse(readFileSync(new URL('../catalogue.json', import.meta.url), 'utf8'));
const FREE_SHIPPING_FROM = 300;
const SHIPPING_FEE = 25;
const TMDB = 'https://api.themoviedb.org/3';

const he = {
  noStripe: 'התשלום באשראי עוד לא הופעל באתר. אפשר לבחור תשלום טלפוני ונחזור אליכם.',
  badCart: 'חלק מהמוצרים בסל כבר לא זמינים. רעננו את הדף ונסו שוב.',
  badForm: 'חסרים פרטים בטופס ההזמנה.',
  signIn: 'צריך להתחבר כדי להשתמש בכלי ה־AI.',
  aiOff: 'כלי ה־AI לא זמין כרגע.',
  tooMany: 'יותר מדי בקשות ברצף. חכו דקה ונסו שוב.',
  server: 'משהו השתבש אצלנו. נסו שוב בעוד רגע.',
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
        await db().collection('orders').doc(orderId).set({ status: 'paid', paidAt: FieldValue.serverTimestamp(), stripeSession: event.data.object.id }, { merge: true });
      }
    }
    res.json({ received: true });
  });

  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true, stripe: !!process.env.STRIPE_SECRET_KEY, ai: !!process.env.GEMINI_API_KEY, movies: !!process.env.TMDB_API_KEY }));

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
          shippingIncluded: !!base?.shippingIncluded,
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
      if (!customer.firstName || !customer.email.includes('@') || !customer.phone || !customer.address) return res.status(400).json({ error: he.badForm });

      const paymentMethod = b.paymentMethod === 'phone' ? 'phone' : 'credit-card';
      const raw = Array.isArray(b.items) ? b.items : Array.isArray(b.cart) ? b.cart : [];
      if (!raw.length || raw.length > 30) return res.status(400).json({ error: he.badCart });

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

      const s = paymentMethod === 'credit-card' ? getStripe() : null;
      if (paymentMethod === 'credit-card' && !s) return res.status(503).json({ error: he.noStripe, code: 'payments_off' });

      const ref = db().collection('orders').doc();
      const save = ref.set({
        userId: (await uidFrom(req)) ?? null,
        customerDetails: customer,
        items,
        subtotal,
        shipping,
        totalAmount: total,
        paymentMethod,
        status: paymentMethod === 'phone' ? 'pending' : 'awaiting_payment',
        createdAt: FieldValue.serverTimestamp(),
      });
      // Locally there are no server credentials for Firestore; the flow still runs end to end.
      await (dev ? save.catch((e) => console.warn('[dev] order not saved:', e.message)) : save);

      let paymentUrl = null;
      if (s) {
        const lineItems = items.map((i) => ({
          price_data: { currency: 'ils', product_data: { name: i.name }, unit_amount: Math.round(i.price * 100) },
          quantity: i.quantity,
        }));
        if (shipping) lineItems.push({ price_data: { currency: 'ils', product_data: { name: 'משלוח' }, unit_amount: shipping * 100 }, quantity: 1 });
        const session = await s.checkout.sessions.create({
          mode: 'payment',
          line_items: lineItems,
          customer_email: customer.email,
          metadata: { orderId: ref.id },
          success_url: `${baseUrl(req)}/order-confirmation?success=true&orderId=${ref.id}`,
          cancel_url: `${baseUrl(req)}/checkout?canceled=true`,
        });
        paymentUrl = session.url;
      }

      res.json({ success: true, orderId: ref.id, paymentUrl, total, subtotal, shipping, items });
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
