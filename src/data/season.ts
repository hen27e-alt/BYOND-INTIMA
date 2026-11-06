// The subscription ("the experience") and the current season programme.
// Values set to null are not decided yet by the owner and are shown as
// unfilled on the site. Fill them here and every page updates.

export const SUBSCRIPTION = {
  /** Monthly price in ₪, or null until decided. */
  price: null as number | null,
  /** Member discount on single boxes and boutique items, in %, or null. */
  memberDiscountPercent: null as number | null,
  /** Start date of the next season (ISO), or null. */
  nextSeasonStarts: null as string | null,
};

export const CURRENT_SEASON = {
  number: 1,
  /** Evenings in this season's programme. boxId links an evening to one of the three boxes. */
  evenings: [
    { n: 1, he: 'ערב דמדומים', en: 'A Dusk evening', themeHe: 'סקרנות ומשחק', themeEn: 'Curiosity & play', boxId: 'exp_spark' },
    { n: 2, he: 'מטבח לשניים', en: 'Kitchen for two', themeHe: 'בישול זוגי', themeEn: 'Cooking together', boxId: null },
    { n: 3, he: 'הקרנה פרטית', en: 'Private screening', themeHe: 'קולנוע בבית', themeEn: 'Cinema at home', boxId: null },
    { n: 4, he: 'ערב חצות', en: 'A Midnight evening', themeHe: 'מגע ורוך', themeEn: 'Touch & tenderness', boxId: 'exp_velvet' },
    { n: 5, he: 'משימות חשאיות', en: 'Secret missions', themeHe: 'הפתעות', themeEn: 'Surprises', boxId: null },
    { n: 6, he: 'עד אור הבוקר', en: 'Until dawn', themeHe: 'תשוקה וגילוי', themeEn: 'Passion & discovery', boxId: 'exp_ecstasy' },
  ],
};

/** Ids of the three experience boxes, in order of intensity. */
export const BOX_IDS = ['exp_spark', 'exp_velvet', 'exp_ecstasy'] as const;

export const BOX_DURATION_EN: Record<string, string> = {
  exp_spark: '1–2 hours',
  exp_velvet: '2–4 hours',
  exp_ecstasy: 'A whole night',
};

/** Hours on the night axis, counted from 18:00. Each box occupies a band that matches its real duration. */
export const NIGHT_BANDS: Record<string, { from: number; to: number }> = {
  exp_spark: { from: 2, to: 4 },
  exp_velvet: { from: 3, to: 7 },
  exp_ecstasy: { from: 2, to: 12 },
};

/** "20:00" for a band offset. */
export const bandHour = (offset: number) => `${String((18 + offset) % 24).padStart(2, '0')}:00`;

/** Box length in words, so Hebrew never has to render a reversed "1-2". */
export const BOX_DURATION_HE: Record<string, string> = {
  exp_spark: 'שעה עד שעתיים',
  exp_velvet: 'שעתיים עד ארבע',
  exp_ecstasy: 'לילה שלם',
};

export const boxDuration = (id: string, he: boolean) => (he ? BOX_DURATION_HE[id] : BOX_DURATION_EN[id]);

/**
 * Each box has its own foil, from the lightest to the deepest: rosé, ember copper, gold.
 * `glow` lights the box from behind; `foil` is a text gradient for its labels.
 */
export const BOX_TONE: Record<string, { glow: string; foil: string }> = {
  exp_spark: { glow: 'rgba(232,140,130,0.45)', foil: 'linear-gradient(100deg,#A8655A,#F2C4B4 40%,#C98C7E 60%,#FBE0D4 85%)' },
  exp_velvet: { glow: 'rgba(217,54,31,0.55)', foil: 'linear-gradient(100deg,#B8482F,#F08A6A 40%,#C8553A 60%,#FFC3A8 85%)' },
  exp_ecstasy: { glow: 'rgba(201,166,107,0.5)', foil: 'linear-gradient(100deg,#9C7742,#EBD3A1 38%,#B8925A 58%,#F4E4BE 82%)' },
};

/** Box images drawn for the site (public/boxes) are already lit; they skip photo treatments. */
export const isBoxArt = (src?: string) => !!src && src.startsWith('/boxes/');
