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
