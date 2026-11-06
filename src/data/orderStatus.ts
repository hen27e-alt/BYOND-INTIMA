/** Order statuses, in the order an order moves through them. Shared by the admin panel and "My orders". */
export const ORDER_STATUSES = [
  { id: 'pending', he: 'חדשה', en: 'Received', customerHe: 'התקבלה, ממתינה לטיפול', customerEn: 'Received, waiting to be handled' },
  { id: 'paid', he: 'שולמה', en: 'Paid', customerHe: 'שולמה, נכנסת להכנה', customerEn: 'Paid, going into preparation' },
  { id: 'processing', he: 'בהכנה', en: 'Preparing', customerHe: 'אורזים אותה עכשיו', customerEn: 'Being packed now' },
  { id: 'shipped', he: 'נשלחה', en: 'Shipped', customerHe: 'בדרך אליכם', customerEn: 'On its way to you' },
  { id: 'delivered', he: 'נמסרה', en: 'Delivered', customerHe: 'הגיעה', customerEn: 'Delivered' },
  { id: 'cancelled', he: 'בוטלה', en: 'Cancelled', customerHe: 'בוטלה', customerEn: 'Cancelled' },
] as const;

export const statusOf = (id?: string) => ORDER_STATUSES.find((s) => s.id === (id ?? 'pending')) ?? ORDER_STATUSES[0];
