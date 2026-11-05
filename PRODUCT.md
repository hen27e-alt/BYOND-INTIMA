# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Couples in Israel, Hebrew-speaking first (the site also offers en, ru, ar, es, fr, de, it), who want to bring presence, play and intimacy back into a routine relationship. They arrive either to buy an experience box for themselves, to buy one as a gift, or, after buying, to use the member area that the box unlocks.

## Product Purpose

Byond Intima ("Beyond Intimacy. Beyond Connection.") is a studio for guided couple experiences. **The subscription is "the experience"**: subscribers receive the experience in seasons (עונות), and as members get a percentage discount on individual boxes or on whatever else they choose in the store. The three experience boxes can also be bought on their own. The site is not only a store — it is the couple's own private place, where they live the experience between deliveries. Success: a couple understands what the subscription gives them, joins (or buys a single box), and keeps coming back to their couple space.

## Positioning

Not a product shop but "spaces": each box is a structured evening (cooking, cinema, missions, deep connection) that combines a physical box with a digital companion — a member area, games and an AI guide (Byond Concierge) — unlocked by a code in the box.

## Operating Context

- **Subscription — "the experience" (core):** delivered in seasons; members get a discount percentage on individual boxes and store items of their choice. Exact season length, contents, price and discount rate are not yet specified — do not invent them.
- **Experience boxes:** מארז הניצוץ / Spark (Playful, ₪290), מארז הקטיפה / Velvet (Romantic, ₪580), מארז האקסטזה / Ecstasy (Adventurous, ₪850). Each has contents, focus and an intensity level; there is a comparison table. **New names approved by the owner (a times-of-night system that matches each box's duration):** Spark → **דמדומים** (Dusk, 1–2 hours), Velvet → **חצות** (Midnight, 2–4 hours), Ecstasy → **עד אור הבוקר** (Until Dawn, a whole night). Use the new names everywhere; the old names are retired.
- **Boutique (secondary, its own section of the same site):** complementary products sold separately — categories: experience boxes, lifestyle, bedroom, atmosphere, personalization (engraving/dedication), smart products. Some items are members-only (premium subscribers). Shares cart and checkout with the boxes.
- **Gifts:** boxes and boutique items bought for a partner.
- **Orders:** cart → checkout (Stripe) → order confirmation → order history.
- **The couple's space (member area):** the couple's private home on the site — dashboard, profile, missions, journal, games, AI consultant, fitness, recipes, movie library; entered with Firebase login and partner linking.
- **Content:** long-form relationship guides (intimacy, marriage, wedding planning, healthy relationships, emotional intelligence, couples therapy, date ideas).

## Capabilities and Constraints

- Stack: React 19 + Vite + Tailwind v4, React Router, Firebase (auth, Firestore, hosting `byondintima-d1d4e`), Stripe, Gemini. Keep it.
- Hebrew is the default language; the site is RTL for he/ar and LTR for the rest. All UI copy goes through `LanguageContext`.
- Spotify integration was removed by the owner's decision and must not return.
- Server endpoints (checkout, movies, AI) are not yet deployed for production; fixing that is planned after the redesign.
- Domain: byondintima (not yet connected; site currently served from the Firebase web.app address).

## Brand Commitments

- Name: **Byond Intima**; tagline "Beyond Intimacy. Beyond Connection."; concierge name "Byond Concierge".
- Voice: warm, intimate, adult and respectful — "playful maturity, emotional depth, physical connection" — never crude.
- Values stated on the site: כבוד (Respect), צמיחה (Growth), חיבור (Connection).
- Instagram: @byondintima. Email: byondintima@gmail.com.

## Evidence on Hand

- Real: product names, descriptions, prices and contents in `src/data/boutique.ts` and the Experience page; the brand story on About.
- **Not real — must not be shown as fact:** product star ratings and review counts (placeholder data, confirmed by owner). No customer testimonials exist.
- Unconfirmed placeholders: phone `03-1234567`, WhatsApp `050-1234567`, address "שדרות רוטשילד 1, תל אביב" — do not present until the owner confirms.
- Imagery: Unsplash stock only, no real product photography yet (some stock images do not match the product, e.g. a plastic water bottle for the thermal bottle).

## Product Principles

1. The subscription is the experience; the boxes and boutique are ways into it and rewards inside it.
2. The site is the couple's own place, not a catalogue — it should feel like theirs after they join.
3. Sell an evening, not an object — show what the couple will do and feel.
4. Intimate but tasteful: suggestive, never explicit; safe for a gift buyer to browse.
5. Honest proof only — no invented reviews, numbers or contact details.
6. Hebrew-first and mobile-first; every surface must work in RTL on a phone.

## Accessibility & Inclusion

The site has an accessibility menu; Israeli accessibility regulations (IS 5568, WCAG 2.0 AA based) apply to a commercial site in Israel.
