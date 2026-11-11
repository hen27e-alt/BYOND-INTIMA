// Order confirmation email, in the site's night look. Sent through Resend's HTTP API
// when RESEND_API_KEY is set (a Firebase secret); without it nothing is sent and the
// order flow is unchanged. The From address must be on a domain verified in Resend.

const FROM = process.env.ORDER_EMAIL_FROM || 'Byond Intima <orders@byondintima.com>';
const SITE = 'https://byondintima-d1d4e.web.app';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ils = (n) => `₪${Number(n || 0).toLocaleString('he-IL')}`;

/** Email-safe HTML: tables, inline styles, web-safe fallbacks for the fonts. */
export const orderEmailHtml = (order) => {
  const c = order.customerDetails ?? {};
  const rows = (order.items ?? [])
    .map(
      (i) => `<tr>
        <td style="padding:14px 0;border-bottom:1px solid #3a302b;color:#EFE6D8;font-size:16px">${esc(i.name)}${i.quantity > 1 ? ` <span style="color:#a89a88">× ${i.quantity}</span>` : ''}</td>
        <td style="padding:14px 0;border-bottom:1px solid #3a302b;color:#EFE6D8;font-size:16px;text-align:left;white-space:nowrap">${ils(i.price * i.quantity)}</td>
      </tr>`
    )
    .join('');
  const gift = order.gift?.wrap
    ? `<tr><td colspan="2" style="padding:18px 0 0;color:#C9A66B;font-size:14px">עטוף כמתנה${order.gift.note ? `, ובכרטיס: „${esc(order.gift.note)}”` : ''}</td></tr>`
    : '';
  const phone = order.paymentMethod === 'phone';
  const paid = ['paid', 'processing', 'shipped', 'delivered'].includes(order.status);
  const used = order.giftApplied > 0
    ? `<tr><td style="padding:12px 0 0;color:#a89a88;font-size:14px">כרטיס מתנה ${esc(order.giftCode ?? '')}</td><td style="padding:12px 0 0;color:#C9A66B;font-size:14px;text-align:left">−${ils(order.giftApplied)}</td></tr>`
    : '';
  const cards = (order.giftCards ?? []).length
    ? `<tr><td style="padding:28px 0 0">${(order.giftCards ?? [])
        .map(
          (g) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border:1px solid #C9A66B;background:#1a1412"><tr><td style="padding:20px 22px">
            <div style="color:#C9A66B;font-size:13px;letter-spacing:2px">כרטיס מתנה ${ils(g.amount)}${g.to ? ` · ל${esc(g.to)}` : ''}</div>
            <div dir="ltr" style="margin-top:8px;font-family:'Courier New',monospace;font-size:26px;letter-spacing:3px;color:#EFE6D8">${paid ? esc(g.code) : '••••-••••-••••'}</div>
            <div style="margin-top:8px;color:#a89a88;font-size:13px">${paid ? 'מממשים בקופה באתר, תקף חמש שנים.' : 'הקוד ייפתח לשימוש ברגע שהתשלום יושלם.'}</div>
          </td></tr></table>`
        )
        .join('')}</td></tr>`
    : '';

  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><title>ההזמנה התקבלה</title></head>
<body style="margin:0;background:#110E0D">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#110E0D"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:Heebo,Arial,sans-serif;direction:rtl;text-align:right">
  <tr><td style="padding-bottom:28px;text-align:center;font-family:'Frank Ruhl Libre',Georgia,serif;letter-spacing:6px;color:#C9A66B;font-size:20px" dir="ltr">BYOND INTIMA</td></tr>
  <tr><td style="height:1px;background:linear-gradient(90deg,transparent,#C9A66B,#D9361F,transparent);background-color:#5a4632"></td></tr>
  <tr><td style="padding:36px 0 8px;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:40px;line-height:1.05;color:#EFE6D8;font-weight:700">תודה, ${esc(c.firstName)}.<br><span style="color:#C9A66B">ההזמנה התקבלה.</span></td></tr>
  <tr><td style="padding:8px 0 28px;color:#c9bcaa;font-size:16px;line-height:1.6">${
    phone ? 'נחזור אליכם בטלפון בקרוב כדי להשלים את התשלום.' : order.paymentMethod === 'gift-card' ? 'שולם במלואו בכרטיס מתנה. אנחנו כבר מכינים את החבילה.' : 'התשלום עבר. אנחנו כבר מכינים את החבילה.'
  } מספר ההזמנה: <span dir="ltr" style="color:#EFE6D8">${esc(order.id)}</span></td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${rows}
    <tr><td style="padding:12px 0 0;color:#a89a88;font-size:14px">משלוח</td><td style="padding:12px 0 0;color:#a89a88;font-size:14px;text-align:left">${order.shipping ? ils(order.shipping) : 'חינם'}</td></tr>
    <tr><td style="padding:16px 0 0;color:#EFE6D8;font-size:16px;font-weight:700">לתשלום</td><td style="padding:16px 0 0;color:#C9A66B;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:32px;text-align:left">${ils(order.totalAmount)}</td></tr>
    ${used}
    ${gift}
  </table></td></tr>
  ${cards}
  <tr><td style="padding:32px 0 0;color:#c9bcaa;font-size:15px;line-height:1.6">נשלח אל: ${esc(c.address)}, ${esc(c.city)}<br><span style="color:#a89a88">החבילה מגיעה באריזה דיסקרטית. השם שלנו ותוכן החבילה לא מופיעים עליה.</span></td></tr>
  <tr><td style="padding:36px 0"><a href="${SITE}/orders" style="display:inline-block;background:#D9361F;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;font-size:16px">לצפייה בהזמנה</a></td></tr>
  <tr><td style="border-top:1px solid #3a302b;padding-top:20px;color:#7d7064;font-size:12px">Byond Intima · שאלה על ההזמנה? פשוט עונים למייל הזה.</td></tr>
</table></td></tr></table></body></html>`;
};

/** Sends the confirmation. Never throws: an email problem must not fail an order. */
export const sendOrderEmail = async (order) => {
  const key = process.env.RESEND_API_KEY;
  const to = order?.customerDetails?.email;
  if (!key || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject: `ההזמנה שלכם התקבלה · Byond Intima`, html: orderEmailHtml(order) }),
    });
    if (!r.ok) console.warn('order email not sent', r.status, await r.text().catch(() => ''));
    return r.ok;
  } catch (e) {
    console.warn('order email failed', e.message);
    return false;
  }
};
