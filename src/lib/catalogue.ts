// One source of truth for what the site sells and for the season settings.
// The code catalogue (src/data/boutique.ts) is the base; whatever the owner
// saves in the admin panel (Firestore `products`, `site_content/season_settings`)
// overrides it. Every page that shows a price reads from here.
import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { boutiqueProducts } from '../data/boutique';
import { BOX_IDS, CURRENT_SEASON, SUBSCRIPTION } from '../data/season';

export type Product = (typeof boutiqueProducts)[number] &
  Record<string, any> & {
    /** Hidden from the site (kept in the admin panel). */
    hidden?: boolean;
    /** Shown, but cannot be added to the cart. */
    soldOut?: boolean;
    /** Set by the admin panel: this record was saved by the owner and wins over the code catalogue. */
    adminEdited?: boolean;
    /** Product exists only in Firestore (added in the admin panel). */
    custom?: boolean;
  };

export const CATEGORY_LABELS: Record<string, string> = {
  experience: 'מארזים',
  atmosphere: 'אווירה',
  lifestyle: 'אירוח ולייף סטייל',
  bedroom: 'חדר שינה',
  personalization: 'בהתאמה אישית',
  smart: 'מוצרים חכמים',
};

export const isUnsplash = (src?: string) => !!src && src.includes('images.unsplash.com');

/**
 * Firestore wins where the owner saved it. Old seeded records (before the
 * admin panel existed) still carry removed stock photos and the boxes' old
 * names, so for those the code catalogue keeps the image, name and contents.
 */
export const mergeCatalogue = (remote: Product[]): Product[] => {
  const byId = new Map<string, Product>(boutiqueProducts.map((p) => [p.id, p as Product]));
  for (const r of remote) {
    const local = byId.get(r.id);
    const merged = { ...(local ?? { custom: true }), ...r } as Product;
    if (local?.image && (!r.image || isUnsplash(r.image))) merged.image = local.image;
    if (local && !r.adminEdited && (BOX_IDS as readonly string[]).includes(r.id)) {
      merged.name = local.name;
      merged.features = local.features;
    }
    byId.set(r.id, merged);
  }
  return [...byId.values()];
};

/** Live catalogue, including hidden items (filter with `visible`). */
export const useCatalogue = () => {
  const [products, setProducts] = useState<Product[]>(() => mergeCatalogue([]));
  const [ready, setReady] = useState(false);
  useEffect(
    () =>
      onSnapshot(
        collection(db, 'products'),
        (snap) => {
          setProducts(mergeCatalogue(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)));
          setReady(true);
        },
        () => setReady(true)
      ),
    []
  );
  return { products, ready };
};

export const visible = (p: Product) => !p.hidden;

export type Evening = { n: number; he: string; en: string; themeHe: string; themeEn: string; boxId: string | null };

export type SeasonSettings = {
  price: number | null;
  memberDiscountPercent: number | null;
  nextSeasonStarts: string | null;
  seasonNumber: number;
  evenings: Evening[];
};

export const DEFAULT_SEASON: SeasonSettings = {
  price: SUBSCRIPTION.price,
  memberDiscountPercent: SUBSCRIPTION.memberDiscountPercent,
  nextSeasonStarts: SUBSCRIPTION.nextSeasonStarts,
  seasonNumber: CURRENT_SEASON.number,
  evenings: CURRENT_SEASON.evenings as Evening[],
};

export const SEASON_DOC = ['site_content', 'season_settings'] as const;

/** Subscription price, member discount, next season date and the programme, as saved in the admin panel. */
export const useSeasonSettings = (): SeasonSettings => {
  const [settings, setSettings] = useState<SeasonSettings>(DEFAULT_SEASON);
  useEffect(
    () =>
      onSnapshot(
        doc(db, ...SEASON_DOC),
        (snap) => {
          const d = snap.data();
          if (!d) return;
          setSettings({
            ...DEFAULT_SEASON,
            ...d,
            evenings: Array.isArray(d.evenings) && d.evenings.length ? d.evenings : DEFAULT_SEASON.evenings,
          } as SeasonSettings);
        },
        () => undefined
      ),
    []
  );
  return settings;
};

export const memberPriceFor = (price: number, discount: number | null) =>
  discount !== null && discount > 0 ? Math.round(price * (1 - discount / 100)) : null;
