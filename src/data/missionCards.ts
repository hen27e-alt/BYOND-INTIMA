// The mission cards. Each suit is an hour of the night and matches one of the
// three boxes, so a card's suit tells you how far into the evening it belongs.
// Texts are drawn from the missions already written for the site's games.

export type SuitId = 'dusk' | 'midnight' | 'dawn';

export const SUITS: Record<SuitId, { he: string; en: string; hour: string; boxId: string; note: string }> = {
  dusk: { he: 'דמדומים', en: 'Dusk', hour: '20:00', boxId: 'exp_spark', note: 'קליל, משחקי, לפתוח את הערב' },
  midnight: { he: 'חצות', en: 'Midnight', hour: '00:00', boxId: 'exp_velvet', note: 'מגע, רוך והאטה' },
  dawn: { he: 'עד אור הבוקר', en: 'Until dawn', hour: '04:00', boxId: 'exp_ecstasy', note: 'עומק, אמת ותשוקה' },
};

export type MissionCard = { n: number; suit: SuitId; title: string; text: string; minutes: number };

const raw: Omit<MissionCard, 'n'>[] = [
  // Dusk
  { suit: 'dusk', title: '30 שניות', text: 'מבט בעיניים במשך 30 שניות. מי שמחייך ראשון מכין את השתייה.', minutes: 1 },
  { suit: 'dusk', title: 'שף ושפית', text: 'אחד מכתיב, השני מבצע: מנה קטנה, בלי לערער ובלי לשאול.', minutes: 15 },
  { suit: 'dusk', title: 'לחיים', text: 'מזגו, ושתו רק אחרי שכל אחד אומר סיבה אמיתית להרים כוס.', minutes: 3 },
  { suit: 'dusk', title: 'ריקוד בסלון', text: 'שיר שלם, ריקוד, ואין בריחה באמצע. כל אחד מלמד את השני תנועה אחת.', minutes: 5 },
  { suit: 'dusk', title: 'מי אני', text: 'כל אחד בוחר דמות. השני מנחש בשאלות של כן ולא. המפסיד מספר סוד קטן.', minutes: 10 },
  { suit: 'dusk', title: 'חדר הדמיון', text: 'תכננו בקול חופשה שאין לכם תקציב אליה: לאן, מה אוכלים, מה לובשים.', minutes: 10 },
  { suit: 'dusk', title: 'ארוחה בנרות', text: 'הטלפונים עוברים לחדר אחר. כל ביס, מחמאה אחת על מי שמולכם.', minutes: 30 },
  { suit: 'dusk', title: 'השיר שלנו', text: 'כל אחד בוחר שיר שמזכיר לו את השני ומסביר למה, לפני שהוא מתנגן.', minutes: 10 },
  // Midnight
  { suit: 'midnight', title: 'מגע ראשון', text: 'מגע על היד, האצבעות בלבד, 30 שניות. בלי מילים.', minutes: 1 },
  { suit: 'midnight', title: 'כתפיים', text: 'עיסוי כתפיים שלוש דקות. לאט, בלי לדבר, ואז מתחלפים.', minutes: 6 },
  { suit: 'midnight', title: 'לחישת לילה', text: 'לחשו לאוזן מה אתם הכי אוהבים בשני. רק משפט אחד, ובלי לצחוק.', minutes: 2 },
  { suit: 'midnight', title: 'חיבוק ארוך', text: 'חיבוק עמידה, ראש על כתף, עיניים עצומות. לא מפרקים לפני 90 שניות.', minutes: 2 },
  { suit: 'midnight', title: 'ריקוד איטי', text: 'שיר איטי אחד, ראש על כתף, בלי מילים ובלי לבחור שיר נוסף.', minutes: 4 },
  { suit: 'midnight', title: 'כרית ושמיכה', text: 'חמש דקות בלי טלפון. שוכבים ביחד ומספרים על החלום הכי מוזר שחלמתם.', minutes: 5 },
  { suit: 'midnight', title: 'ברכה', text: 'יד על המצח של השני, כמו ברכה. אמרו בשקט משאלה אחת בשבילו.', minutes: 1 },
  { suit: 'midnight', title: 'כפות ידיים', text: 'עיסוי ידיים, שתי דקות לכל יד. מי שמקבל לא אומר כלום.', minutes: 4 },
  // Until dawn
  { suit: 'dawn', title: 'סוד בחושך', text: 'כבו את האורות. ספרו מה הייתם עושים אם לא הייתם פוחדים.', minutes: 5 },
  { suit: 'dawn', title: 'אמת', text: 'מה הדבר שהכי קשה לכם לומר לי? עכשיו, בלי להסביר אותו.', minutes: 5 },
  { suit: 'dawn', title: 'העזה', text: 'הציעו דבר אחד שמעולם לא העזתם להציע. השני יכול לומר כן, לא, או אולי.', minutes: 5 },
  { suit: 'dawn', title: 'פתק', text: 'כל אחד כותב רצון אחד על פתק. מחליפים, קוראים בשקט, ומחליטים ביחד.', minutes: 5 },
  { suit: 'dawn', title: 'חמש שנים', text: 'ספרו מה הייתם עושים אחרת אם הייתם יכולים לחזור חמש שנים אחורה.', minutes: 10 },
  { suit: 'dawn', title: 'מה צריך', text: 'כל אחד אומר מה הוא צריך כרגע. השני רק מקשיב, ולא מתקן.', minutes: 5 },
  { suit: 'dawn', title: 'פנטזיה', text: 'ספרו פנטזיה אחת שיש לכם על הערב הזה. מותר לענות בלחישה.', minutes: 5 },
  { suit: 'dawn', title: 'עד הבוקר', text: 'נשארים ערים עד שאחד נרדם. מי שנשאר ער אחרון מכין קפה בבוקר.', minutes: 60 },
];

export const MISSION_CARDS: MissionCard[] = raw.map((c, i) => ({ ...c, n: i + 1 }));
