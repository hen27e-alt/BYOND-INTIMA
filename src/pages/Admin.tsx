import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import { db, storage } from '../firebase';
import { useFirebase } from '../contexts/FirebaseContext';
import { boutiqueProducts } from '../data/boutique';
import { BOX_IDS } from '../data/season';
import {
  CATEGORY_LABELS,
  DEFAULT_SEASON,
  type Evening,
  type Product,
  SEASON_DOC,
  type SeasonSettings,
  useCatalogue,
  useSeasonSettings,
} from '../lib/catalogue';
import { cn } from '../lib/utils';
import { ORDER_STATUSES } from '../data/orderStatus';

const ADMIN_EMAIL = 'hen27e@gmail.com';
const pad = (n: number) => String(n).padStart(2, '0');
const isBox = (id: string) => (BOX_IDS as readonly string[]).includes(id);
const inCode = (id: string) => boutiqueProducts.some((p) => p.id === id);

type Tab = 'products' | 'orders' | 'messages' | 'season';
const TABS: Tab[] = ['products', 'orders', 'messages', 'season'];

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

const inputCls =
  'w-full border-2 border-ink bg-paper px-3 py-2.5 text-base text-ink placeholder:text-ink/45 focus:border-spot focus:outline-none disabled:opacity-50';

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-ink/60">{hint}</span>}
  </label>
);

const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-center gap-3 border-b border-rule py-2.5 text-base">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[var(--color-accent)]" />
    {label}
  </label>
);

const Button = ({
  tone = 'ink',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'ink' | 'spot' | 'line' }) => (
  <button
    type="button"
    {...props}
    className={cn(
      'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      tone === 'ink' && 'bg-ink text-paper hover:bg-spot',
      tone === 'spot' && 'bg-spot text-paper hover:bg-ink',
      tone === 'line' && 'border-2 border-ink hover:bg-ink hover:text-paper',
      className
    )}
  />
);

/** A status line that the panel writes into after every save, so the owner always knows what happened. */
const useNotice = () => {
  const [notice, setNotice] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const show = (tone: 'ok' | 'err', text: string) => {
    setNotice({ tone, text });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 5000);
  };
  return { notice, ok: (t: string) => show('ok', t), err: (t: string) => show('err', t) };
};

const saveError = (e: unknown) =>
  String((e as { code?: string })?.code ?? '').includes('permission')
    ? 'אין הרשאה לשמור. צריך להיות מחוברת עם חשבון המנהלת.'
    : 'השמירה נכשלה. בדקי את החיבור לאינטרנט ונסי שוב.';

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

type Draft = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  isPremium: boolean;
  personalizable: boolean;
  shippingIncluded: boolean;
  hidden: boolean;
  soldOut: boolean;
  features: string;
  material: string;
  dimensions: string;
  care: string;
  isNew: boolean;
};

const toDraft = (p?: Product): Draft => ({
  id: p?.id ?? `custom_${Date.now().toString(36)}`,
  name: p?.name ?? '',
  description: p?.description ?? '',
  price: p ? String(p.price ?? '') : '',
  category: p?.category ?? 'lifestyle',
  image: p?.image ?? '',
  isPremium: !!p?.isPremium,
  personalizable: !!p?.personalizable,
  shippingIncluded: !!p?.shippingIncluded,
  hidden: !!p?.hidden,
  soldOut: !!p?.soldOut,
  features: (p?.features ?? []).join('\n'),
  material: p?.material ?? '',
  dimensions: p?.dimensions ?? '',
  care: p?.care ?? '',
  isNew: !p,
});

const ProductEditor = ({
  draft,
  onClose,
  onSaved,
  canWrite,
  notify,
}: {
  draft: Draft;
  onClose: () => void;
  onSaved: (msg: string) => void;
  canWrite: boolean;
  notify: ReturnType<typeof useNotice>;
}) => {
  const [d, setD] = useState<Draft>(draft);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const box = isBox(d.id);
  const fromCode = inCode(d.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const upload = (file: File) => {
    if (!file.type.startsWith('image/')) return notify.err('אפשר להעלות רק קובץ תמונה.');
    if (file.size > 5 * 1024 * 1024) return notify.err('התמונה גדולה מ־5MB. נסי תמונה קטנה יותר.');
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = ref(storage, `products/${d.id}_${Date.now()}`);
        await uploadString(r, reader.result as string, 'data_url');
        set('image', await getDownloadURL(r));
      } catch (e) {
        notify.err(saveError(e).replace('לשמור', 'להעלות'));
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    const next: typeof errors = {};
    if (!d.name.trim()) next.name = 'צריך שם למוצר.';
    const price = Number(d.price);
    if (!d.price.trim() || !Number.isFinite(price) || price < 0) next.price = 'מחיר במספרים, למשל 290.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await setDoc(
        doc(db, 'products', d.id),
        {
          name: d.name.trim(),
          description: d.description.trim(),
          price,
          category: d.category,
          image: d.image.trim(),
          isPremium: d.isPremium,
          personalizable: d.personalizable,
          shippingIncluded: d.shippingIncluded,
          hidden: d.hidden,
          soldOut: d.soldOut,
          features: d.features.split('\n').map((s) => s.trim()).filter(Boolean),
          material: d.material.trim(),
          dimensions: d.dimensions.trim(),
          care: d.care.trim(),
          adminEdited: true,
          ...(fromCode ? {} : { custom: true }),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      onSaved(d.isNew ? `${d.name} נוסף לחנות.` : `${d.name} נשמר.`);
    } catch (e) {
      notify.err(saveError(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'products', d.id));
      onSaved(fromCode ? `${d.name} חזר לגרסה המקורית.` : `${d.name} נמחק מהחנות.`);
    } catch (e) {
      notify.err(saveError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="editor-title">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div ref={dialogRef} className="relative flex h-full w-full max-w-xl flex-col border-s-[3px] border-ink bg-paper">
        <header className="flex items-center justify-between border-b-[3px] border-ink px-5 py-4">
          <h2 id="editor-title" className="font-display text-4xl font-bold leading-none">
            {d.isNew ? 'מוצר חדש' : box ? 'עריכת מארז' : 'עריכת מוצר'}
          </h2>
          <button onClick={onClose} className="p-1 hover:text-spot" aria-label="סגירה">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          <Field label="שם">
            <input value={d.name} onChange={(e) => set('name', e.target.value)} className={inputCls} aria-invalid={!!errors.name} />
            {errors.name && <span className="mt-1 block text-sm font-bold text-spot">{errors.name}</span>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="מחיר (₪)">
              <input
                value={d.price}
                onChange={(e) => set('price', e.target.value.replace(/[^\d.]/g, ''))}
                inputMode="decimal"
                dir="ltr"
                className={cn(inputCls, 'text-right tabular-nums')}
                aria-invalid={!!errors.price}
              />
              {errors.price && <span className="mt-1 block text-sm font-bold text-spot">{errors.price}</span>}
            </Field>
            <Field label="קטגוריה">
              <select value={d.category} onChange={(e) => set('category', e.target.value)} className={inputCls} disabled={box}>
                {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="תיאור">
            <textarea value={d.description} onChange={(e) => set('description', e.target.value)} rows={4} className={inputCls} />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-bold">תמונה</span>
            <div className="flex gap-4">
              <div className="h-28 w-24 shrink-0 overflow-hidden border-2 border-ink bg-surface">
                {d.image ? <img src={d.image} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label className={cn('inline-flex w-fit cursor-pointer items-center gap-2 border-2 border-ink px-4 py-2 font-bold hover:bg-ink hover:text-paper', uploading && 'opacity-50')}>
                  {uploading ? 'מעלה...' : 'להעלות תמונה'}
                  <input type="file" accept="image/*" className="sr-only" disabled={uploading || !canWrite} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
                <input value={d.image} onChange={(e) => set('image', e.target.value)} placeholder="או להדביק קישור לתמונה" dir="ltr" className={cn(inputCls, 'text-right text-sm')} />
              </div>
            </div>
          </div>

          <Field label={box ? 'מה בקופסה' : 'מה כלול'} hint="שורה לכל פריט">
            <textarea value={d.features} onChange={(e) => set('features', e.target.value)} rows={4} className={inputCls} />
          </Field>

          <fieldset>
            <legend className="mb-1 text-sm font-bold">מצב באתר</legend>
            <Check label="מוסתר מהאתר" checked={d.hidden} onChange={(v) => set('hidden', v)} />
            <Check label="אזל מהמלאי (מוצג, אבל אי אפשר לקנות)" checked={d.soldOut} onChange={(v) => set('soldOut', v)} />
            <Check label="למנויים בלבד" checked={d.isPremium} onChange={(v) => set('isPremium', v)} />
            <Check label="אפשר חריטה והקדשה" checked={d.personalizable} onChange={(v) => set('personalizable', v)} />
            <Check label="המשלוח כלול במחיר (לא מוסיף דמי משלוח)" checked={d.shippingIncluded} onChange={(v) => set('shippingIncluded', v)} />
          </fieldset>

          <details className="border-t-[3px] border-ink pt-3">
            <summary className="cursor-pointer text-sm font-bold">מפרט (לא חובה)</summary>
            <div className="mt-4 space-y-4">
              <Field label="חומר">
                <input value={d.material} onChange={(e) => set('material', e.target.value)} dir="auto" className={inputCls} />
              </Field>
              <Field label="מידות">
                <input value={d.dimensions} onChange={(e) => set('dimensions', e.target.value)} dir="auto" className={inputCls} />
              </Field>
              <Field label="טיפול">
                <input value={d.care} onChange={(e) => set('care', e.target.value)} dir="auto" className={inputCls} />
              </Field>
            </div>
          </details>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t-[3px] border-ink px-5 py-4">
          <div>
            {!d.isNew &&
              !box &&
              (confirmRemove ? (
                <span className="flex items-center gap-2">
                  <Button tone="spot" onClick={remove} disabled={busy || !canWrite}>
                    {fromCode ? 'כן, לשחזר' : 'כן, למחוק'}
                  </Button>
                  <button onClick={() => setConfirmRemove(false)} className="text-sm font-bold underline underline-offset-4">
                    ביטול
                  </button>
                </span>
              ) : (
                <button onClick={() => setConfirmRemove(true)} className="text-sm font-bold text-spot underline underline-offset-4" disabled={!canWrite}>
                  {fromCode ? 'לשחזר לגרסה המקורית' : 'למחוק את המוצר'}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <Button tone="line" onClick={onClose}>
              ביטול
            </Button>
            <Button onClick={save} disabled={busy || uploading || !canWrite}>
              {busy ? 'שומר...' : 'לשמור'}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

const ProductsTab = ({ canWrite, notify }: { canWrite: boolean; notify: ReturnType<typeof useNotice> }) => {
  const { products, ready } = useCatalogue();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = q.trim();
    return products
      .filter((p) => (cat === 'all' ? true : cat === 'hidden' ? p.hidden : p.category === cat))
      .filter((p) => !term || p.name.includes(term) || p.id.includes(term))
      .sort((a, b) => Number(isBox(b.id)) - Number(isBox(a.id)));
  }, [products, q, cat]);

  const quick = async (p: Product, patch: Partial<Product>, msg: string) => {
    setBusyId(p.id);
    try {
      await setDoc(doc(db, 'products', p.id), { ...patch, updatedAt: serverTimestamp() }, { merge: true });
      notify.ok(msg);
    } catch (e) {
      notify.err(saveError(e));
    } finally {
      setBusyId(null);
    }
  };

  const shownCount = products.filter((p) => !p.hidden).length;

  return (
    <section aria-labelledby="products-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
        <div>
          <h2 id="products-title" className="font-display text-6xl font-bold leading-none">
            המוצרים
          </h2>
          <p className="mt-1 text-base text-ink/70">
            {products.length} מוצרים, {shownCount} מוצגים באתר. {!ready && 'טוען...'}
          </p>
        </div>
        <Button tone="spot" onClick={() => setEditing(toDraft())} disabled={!canWrite}>
          <Plus size={18} /> מוצר חדש
        </Button>
      </div>

      <div className="flex flex-col gap-3 border-b border-ink py-4 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">חיפוש מוצר</span>
          <Search size={18} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם" className={cn(inputCls, 'ps-10')} />
        </label>
        <label className="sm:w-64">
          <span className="sr-only">סינון לפי קטגוריה</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls}>
            <option value="all">כל הקטגוריות</option>
            {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
            <option value="hidden">מוסתרים</option>
          </select>
        </label>
      </div>

      <ul>
        {list.map((p) => (
          <li key={p.id} className={cn('grid grid-cols-[64px_1fr] gap-4 border-b border-rule py-4 sm:grid-cols-[72px_1fr_auto] sm:items-center', p.hidden && 'opacity-60')}>
            <div className="h-20 w-16 overflow-hidden border-2 border-ink bg-surface sm:h-24 sm:w-[72px]">
              {p.image && <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold leading-snug">{p.name}</h3>
                {isBox(p.id) && <span className="bg-spot px-1.5 py-0.5 text-xs font-bold text-paper">מארז</span>}
                {p.hidden && <span className="border border-ink px-1.5 py-0.5 text-xs font-bold">מוסתר</span>}
                {p.soldOut && <span className="bg-ink px-1.5 py-0.5 text-xs font-bold text-paper">אזל</span>}
                {p.isPremium && <span className="border border-ink px-1.5 py-0.5 text-xs font-bold">למנויים</span>}
                {p.custom && <span className="border border-spot px-1.5 py-0.5 text-xs font-bold text-spot">נוסף בפאנל</span>}
              </div>
              <p className="mt-0.5 text-sm text-ink/70">
                {CATEGORY_LABELS[p.category] ?? p.category} · <span className="font-bold tabular-nums text-ink">₪{p.price}</span>
              </p>
            </div>
            <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:justify-end">
              <Button
                tone="line"
                className="px-3 py-1.5 text-sm"
                disabled={!canWrite || busyId === p.id}
                onClick={() => quick(p, { hidden: !p.hidden }, p.hidden ? `${p.name} מוצג שוב באתר.` : `${p.name} הוסתר מהאתר.`)}
              >
                {p.hidden ? 'להציג' : 'להסתיר'}
              </Button>
              <Button
                tone="line"
                className="px-3 py-1.5 text-sm"
                disabled={!canWrite || busyId === p.id}
                onClick={() => quick(p, { soldOut: !p.soldOut }, p.soldOut ? `${p.name} חזר למלאי.` : `${p.name} סומן כאזל.`)}
              >
                {p.soldOut ? 'חזר למלאי' : 'אזל'}
              </Button>
              <Button className="px-3 py-1.5 text-sm" onClick={() => setEditing(toDraft(p))}>
                עריכה
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="py-16 text-center text-lg">אין מוצרים שמתאימים לחיפוש.</p>}

      {editing && (
        <ProductEditor
          draft={editing}
          canWrite={canWrite}
          notify={notify}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            notify.ok(msg);
          }}
        />
      )}
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

const STATUSES = ORDER_STATUSES.map((s) => ({ id: s.id, label: s.he }));

type Order = {
  id: string;
  userId?: string;
  status?: string;
  totalAmount?: number;
  subtotal?: number;
  shipping?: number;
  paymentMethod?: string;
  createdAt?: { toDate?: () => Date };
  customerDetails?: Record<string, string>;
  items?: { id: string; name: string; price: number; quantity: number; personalization?: { name?: string; dedication?: string } | null }[];
};

const fmtDate = (o: Order) => {
  const d = o.createdAt?.toDate?.();
  return d ? d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '–';
};

const OrdersTab = ({ canWrite, notify }: { canWrite: boolean; notify: ReturnType<typeof useNotice> }) => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('open');
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoadError(null);
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order));
    } catch (e) {
      setOrders([]);
      setLoadError(String((e as { code?: string })?.code ?? '').includes('permission') ? 'אין הרשאה לקרוא הזמנות. צריך להיות מחוברת עם חשבון המנהלת.' : 'לא הצלחנו לטעון את ההזמנות.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (o: Order, status: string) => {
    const prev = o.status;
    setOrders((all) => all?.map((x) => (x.id === o.id ? { ...x, status } : x)) ?? null);
    try {
      await updateDoc(doc(db, 'orders', o.id), { status, updatedAt: serverTimestamp() });
      notify.ok(`הזמנה ${o.id.slice(0, 6).toUpperCase()} סומנה: ${STATUSES.find((s) => s.id === status)?.label}.`);
    } catch (e) {
      setOrders((all) => all?.map((x) => (x.id === o.id ? { ...x, status: prev } : x)) ?? null);
      notify.err(saveError(e));
    }
  };

  const all = orders ?? [];
  const count = (id: string) => all.filter((o) => (o.status ?? 'pending') === id).length;
  const list = all.filter((o) => {
    const s = o.status ?? 'pending';
    return filter === 'all' ? true : filter === 'open' ? s === 'pending' || s === 'paid' || s === 'processing' : s === filter;
  });
  const revenue = all.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <section aria-labelledby="orders-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
        <h2 id="orders-title" className="font-display text-6xl font-bold leading-none">
          ההזמנות
        </h2>
        <Button tone="line" onClick={() => void load()}>
          רענון
        </Button>
      </div>

      <dl className="grid grid-cols-2 border-b border-ink sm:grid-cols-4">
        {[
          ['לטיפול', count('pending') + count('paid') + count('processing')],
          ['נשלחו', count('shipped')],
          ['סך הכול הזמנות', all.length],
          ['מחזור (ללא בוטלו)', `₪${revenue.toLocaleString('he-IL')}`],
        ].map(([k, v], i) => (
          <div key={k as string} className={cn('py-4 pe-4', i % 2 === 0 && 'border-e border-rule sm:border-e', i === 1 && 'sm:border-e', i === 2 && 'border-t border-rule sm:border-t-0')}>
            <dt className="text-sm font-bold text-ink/70">{k}</dt>
            <dd className="font-display text-5xl font-bold leading-none tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div role="group" aria-label="סינון לפי מצב" className="flex flex-wrap gap-x-1 gap-y-2 border-b border-ink py-3">
        {[{ id: 'open', label: 'לטיפול' }, ...STATUSES, { id: 'all', label: 'הכול' }].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            aria-pressed={filter === s.id}
            className={cn('px-3 py-1.5 text-sm font-bold', filter === s.id ? 'bg-ink text-paper' : 'hover:text-spot')}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loadError && <p className="border-b border-rule py-6 font-bold text-spot">{loadError}</p>}
      {orders === null && <p className="py-10 text-center">טוען הזמנות...</p>}
      {orders !== null && !loadError && list.length === 0 && <p className="py-16 text-center text-lg">אין הזמנות במצב הזה.</p>}

      <ul>
        {list.map((o) => {
          const c = o.customerDetails ?? {};
          const isOpen = open === o.id;
          return (
            <li key={o.id} className="border-b border-rule">
              <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-4 md:grid-cols-[120px_1fr_120px_160px_40px]">
                <p className="font-bold tabular-nums" dir="ltr">
                  #{o.id.slice(0, 6).toUpperCase()}
                </p>
                <p className="order-3 col-span-2 md:order-none md:col-span-1">
                  <span className="font-bold">{[c.firstName, c.lastName].filter(Boolean).join(' ') || 'ללא שם'}</span>
                  <span className="ms-2 text-sm text-ink/60">{fmtDate(o)}</span>
                </p>
                <p className="font-display text-3xl font-bold leading-none tabular-nums">₪{o.totalAmount ?? 0}</p>
                <label className="order-4 md:order-none">
                  <span className="sr-only">מצב ההזמנה</span>
                  <select
                    value={o.status ?? 'pending'}
                    onChange={(e) => void setStatus(o, e.target.value)}
                    disabled={!canWrite}
                    className={cn(inputCls, 'py-1.5 text-sm font-bold', (o.status ?? 'pending') === 'pending' && 'border-spot text-spot')}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  aria-expanded={isOpen}
                  aria-label="פרטי ההזמנה"
                  className="order-5 justify-self-end p-2 hover:text-spot md:order-none"
                >
                  <ChevronDown size={20} className={cn('transition-transform', isOpen && 'rotate-180')} />
                </button>
              </div>
              {isOpen && (
                <div className="grid gap-6 border-t border-rule bg-surface px-4 py-5 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-bold">מה הוזמן</h3>
                    <ul>
                      {(o.items ?? []).map((it) => (
                        <li key={it.id} className="border-b border-rule py-2">
                          <span className="flex justify-between gap-3">
                            <span>
                              {it.name} <span className="text-ink/60">× {it.quantity}</span>
                            </span>
                            <span className="tabular-nums">₪{it.price * it.quantity}</span>
                          </span>
                          {it.personalization && (
                            <span className="mt-1 block text-sm text-spot">
                              חריטה: {it.personalization.name} {it.personalization.dedication && `· "${it.personalization.dedication}"`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-ink/70">
                      משלוח ₪{o.shipping ?? 0} · תשלום: {o.paymentMethod === 'phone' ? 'טלפוני' : 'כרטיס אשראי'}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-bold">לאן שולחים</h3>
                    <p>{[c.address, c.city].filter(Boolean).join(', ') || '–'}</p>
                    <p className="mt-2">
                      <a href={`tel:${c.phone}`} dir="ltr" className="underline underline-offset-4">
                        {c.phone}
                      </a>
                    </p>
                    <p>
                      <a href={`mailto:${c.email}`} dir="ltr" className="underline underline-offset-4">
                        {c.email}
                      </a>
                    </p>
                    {c.notes && <p className="mt-2 text-sm">הערות: {c.notes}</p>}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="pt-4 text-sm text-ink/60">מוצגות הזמנות של לקוחות מחוברים. הזמנות של אורחים מגיעות דרך Stripe ולא נשמרות כאן.</p>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Messages from the contact form                                      */
/* ------------------------------------------------------------------ */

type Message = { id: string; name?: string; email?: string; subject?: string; message?: string; status?: string; createdAt?: { toDate?: () => Date } };

const MessagesTab = ({ canWrite, notify }: { canWrite: boolean; notify: ReturnType<typeof useNotice> }) => {
  const [items, setItems] = useState<Message[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')))
      .then((snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message)))
      .catch((e) => {
        setItems([]);
        setLoadError(String(e?.code ?? '').includes('permission') ? 'אין הרשאה לקרוא פניות. צריך להיות מחוברת עם חשבון המנהלת.' : 'לא הצלחנו לטעון את הפניות.');
      });
  }, []);

  const toggle = async (m: Message) => {
    const status = m.status === 'done' ? 'new' : 'done';
    setItems((all) => all?.map((x) => (x.id === m.id ? { ...x, status } : x)) ?? null);
    try {
      await updateDoc(doc(db, 'contact_messages', m.id), { status });
      notify.ok(status === 'done' ? 'הפנייה סומנה כטופלה.' : 'הפנייה חזרה לרשימה.');
    } catch (e) {
      setItems((all) => all?.map((x) => (x.id === m.id ? { ...x, status: m.status } : x)) ?? null);
      notify.err(saveError(e));
    }
  };

  const list = (items ?? []).filter((m) => (showDone ? true : m.status !== 'done'));
  const open = (items ?? []).filter((m) => m.status !== 'done').length;

  return (
    <section aria-labelledby="messages-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
        <div>
          <h2 id="messages-title" className="font-display text-6xl font-bold leading-none">
            פניות
          </h2>
          <p className="mt-1 text-base text-ink/70">{items ? `${open} פניות פתוחות` : 'טוען...'}</p>
        </div>
        <label className="flex items-center gap-2 text-base font-bold">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="h-5 w-5 accent-[var(--color-accent)]" />
          להציג גם פניות שטופלו
        </label>
      </div>
      {loadError && <p className="border-b border-rule py-6 font-bold text-spot">{loadError}</p>}
      {items && !loadError && list.length === 0 && <p className="py-16 text-center text-lg">אין פניות פתוחות.</p>}
      <ul>
        {list.map((m) => (
          <li key={m.id} className={cn('border-b border-rule py-5', m.status === 'done' && 'opacity-60')}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <p className="text-lg font-bold">
                {m.name} <span className="ms-2 text-sm font-medium text-spot">{m.subject}</span>
              </p>
              <p className="text-sm text-ink/60">{m.createdAt?.toDate?.().toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
            <p className="mt-2 max-w-[70ch] whitespace-pre-line text-base leading-relaxed">{m.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent('Byond Intima: ' + (m.subject ?? ''))}`} className="bg-ink px-3 py-1.5 text-sm font-bold text-paper hover:bg-spot">
                לענות במייל
              </a>
              <Button tone="line" className="px-3 py-1.5 text-sm" disabled={!canWrite} onClick={() => void toggle(m)}>
                {m.status === 'done' ? 'להחזיר לפתוחות' : 'טופל'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Season & membership                                                 */
/* ------------------------------------------------------------------ */

const SeasonTab = ({ canWrite, notify }: { canWrite: boolean; notify: ReturnType<typeof useNotice> }) => {
  const live = useSeasonSettings();
  const [s, setS] = useState<SeasonSettings>(live);
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (dirty) return;
    setS(live);
    setPrice(live.price === null ? '' : String(live.price));
    setDiscount(live.memberDiscountPercent === null ? '' : String(live.memberDiscountPercent));
  }, [live, dirty]);

  const touch = () => setDirty(true);
  const setEvening = (i: number, patch: Partial<Evening>) => {
    touch();
    setS((prev) => ({ ...prev, evenings: prev.evenings.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  };

  const priceN = price.trim() === '' ? null : Number(price);
  const discountN = discount.trim() === '' ? null : Number(discount);
  const discountBad = discountN !== null && (!Number.isFinite(discountN) || discountN < 0 || discountN > 90);
  const priceBad = priceN !== null && (!Number.isFinite(priceN) || priceN < 0);

  const save = async () => {
    if (discountBad || priceBad) return;
    setBusy(true);
    try {
      await setDoc(
        doc(db, ...SEASON_DOC),
        {
          price: priceN,
          memberDiscountPercent: discountN,
          nextSeasonStarts: s.nextSeasonStarts || null,
          seasonNumber: s.seasonNumber,
          evenings: s.evenings.map((e, i) => ({ ...e, n: i + 1 })),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setDirty(false);
      notify.ok('הגדרות העונה נשמרו. האתר מתעדכן מיד.');
    } catch (e) {
      notify.err(saveError(e));
    } finally {
      setBusy(false);
    }
  };

  const boxes = boutiqueProducts.filter((p) => isBox(p.id));
  const sample = 580;

  return (
    <section aria-labelledby="season-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
        <h2 id="season-title" className="font-display text-6xl font-bold leading-none">
          העונה והמנוי
        </h2>
        <Button onClick={save} disabled={!canWrite || busy || !dirty || discountBad || priceBad}>
          {busy ? 'שומר...' : dirty ? 'לשמור שינויים' : 'הכול שמור'}
        </Button>
      </div>

      <div className="grid gap-x-10 gap-y-6 border-b border-ink py-6 md:grid-cols-2 lg:grid-cols-4">
        <Field label="מחיר המנוי לחודש (₪)" hint="ריק = 'יפורסם בקרוב'">
          <input value={price} onChange={(e) => (touch(), setPrice(e.target.value.replace(/[^\d.]/g, '')))} inputMode="decimal" dir="ltr" className={cn(inputCls, 'text-right tabular-nums')} />
          {priceBad && <span className="mt-1 block text-sm font-bold text-spot">מחיר במספרים בלבד.</span>}
        </Field>
        <Field label="הנחה למנויים (%)" hint={discountN && !discountBad ? `מארז ב־₪${sample} יעלה למנויים ₪${Math.round(sample * (1 - discountN / 100))}` : 'על כל מארז ומוצר בבוטיק'}>
          <input value={discount} onChange={(e) => (touch(), setDiscount(e.target.value.replace(/[^\d.]/g, '')))} inputMode="numeric" dir="ltr" className={cn(inputCls, 'text-right tabular-nums')} />
          {discountBad && <span className="mt-1 block text-sm font-bold text-spot">בין 0 ל־90.</span>}
        </Field>
        <Field label="העונה הבאה מתחילה" hint="מופיע בספירה לאחור בדף הבית">
          <input type="date" value={s.nextSeasonStarts ?? ''} onChange={(e) => (touch(), setS({ ...s, nextSeasonStarts: e.target.value || null }))} className={inputCls} />
        </Field>
        <Field label="מספר העונה הנוכחית">
          <input
            value={String(s.seasonNumber)}
            onChange={(e) => (touch(), setS({ ...s, seasonNumber: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) }))}
            inputMode="numeric"
            dir="ltr"
            className={cn(inputCls, 'text-right tabular-nums')}
          />
        </Field>
      </div>

      <h3 className="mt-8 flex items-baseline justify-between border-b-[3px] border-ink pb-2 font-display text-4xl font-bold leading-none">
        לוח הערבים
        <span className="font-sans text-sm font-bold">עונה {pad(s.seasonNumber)}</span>
      </h3>
      <ol>
        {s.evenings.map((ev, i) => (
          <li key={i} className="grid gap-3 border-b border-rule py-4 md:grid-cols-[56px_1fr_1fr_200px_auto] md:items-end">
            <span className="font-display text-5xl font-bold leading-none text-spot tabular-nums">{pad(i + 1)}</span>
            <Field label="שם הערב">
              <input value={ev.he} onChange={(e) => setEvening(i, { he: e.target.value })} className={inputCls} />
            </Field>
            <Field label="הנושא">
              <input value={ev.themeHe} onChange={(e) => setEvening(i, { themeHe: e.target.value })} className={inputCls} />
            </Field>
            <Field label="מארז מקושר">
              <select value={ev.boxId ?? ''} onChange={(e) => setEvening(i, { boxId: e.target.value || null })} className={inputCls}>
                <option value="">ערב במנוי, בלי מארז</option>
                {boxes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <button
              onClick={() => (touch(), setS({ ...s, evenings: s.evenings.filter((_, j) => j !== i) }))}
              disabled={s.evenings.length <= 1}
              className="justify-self-start pb-2.5 text-sm font-bold text-spot underline underline-offset-4 disabled:opacity-40"
            >
              להסיר
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3 pt-4">
        <Button
          tone="line"
          disabled={s.evenings.length >= 12}
          onClick={() => (touch(), setS({ ...s, evenings: [...s.evenings, { n: s.evenings.length + 1, he: '', en: '', themeHe: '', themeEn: '', boxId: null }] }))}
        >
          <Plus size={18} /> להוסיף ערב
        </Button>
        <Button tone="line" onClick={() => (touch(), setS({ ...s, evenings: DEFAULT_SEASON.evenings }))}>
          לחזור ללוח המקורי
        </Button>
      </div>
      <p className="pt-4 text-sm text-ink/60">השמות באנגלית נשארים כמו שהם בגרסה האנגלית של האתר.</p>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const Admin = () => {
  const { user, profile, loading } = useFirebase();
  const [tab, setTab] = useState<Tab>(() => {
    const h = window.location.hash.slice(1);
    return (TABS as string[]).includes(h) ? (h as Tab) : 'products';
  });
  const notify = useNotice();

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.email === ADMIN_EMAIL || profile?.role === 'admin';
  // Local development only: lets the owner look at the panel without signing in. Saving still needs the admin account.
  const preview = import.meta.env.DEV && new URLSearchParams(window.location.search).has('preview');
  const canWrite = isAdmin;

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1);
      if ((TABS as string[]).includes(h)) setTab(h as Tab);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${tab}`);
  }, [tab]);

  if (loading) return <div className="min-h-screen bg-paper pt-32 text-center text-lg">טוען...</div>;

  if (!isAdmin && !preview) {
    return (
      <div className="min-h-screen bg-paper px-4 pt-32 text-ink">
        <div className="mx-auto max-w-lg border-t-[3px] border-ink pt-6">
          <h1 className="font-display text-6xl font-bold leading-none">פאנל ניהול</h1>
          <p className="mt-4 text-lg">{user ? 'החשבון הזה אינו חשבון מנהלת.' : 'צריך להתחבר עם חשבון המנהלת כדי לנהל את החנות.'}</p>
          <Link to="/login" className="mt-6 inline-block bg-ink px-5 py-3 font-bold text-paper hover:bg-spot">
            {user ? 'להתחבר עם חשבון אחר' : 'להתחבר'}
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'products', label: 'מוצרים ומארזים' },
    { id: 'orders', label: 'הזמנות' },
    { id: 'messages', label: 'פניות' },
    { id: 'season', label: 'העונה והמנוי' },
  ];

  return (
    <div className="min-h-screen bg-paper pt-16 text-ink md:pt-20">
      {!isAdmin && preview && (
        <p className="bg-spot px-4 py-2 text-center text-sm font-bold text-paper">תצוגה מקדימה בלבד (מחשב מקומי). כדי לשמור שינויים צריך להתחבר עם חשבון המנהלת.</p>
      )}
      <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 md:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-spot">Byond Intima</p>
            <h1 className="font-display text-[clamp(3.5rem,9vw,6.5rem)] font-bold leading-[0.85]">פאנל ניהול</h1>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            <Link to="/boutique" className="underline underline-offset-4 hover:text-spot">
              לבוטיק באתר
            </Link>
            <Link to="/experience" className="underline underline-offset-4 hover:text-spot">
              לדף המארזים
            </Link>
            <Link to="/admin/tools" className="underline underline-offset-4 hover:text-spot">
              כלים נוספים (משתמשים, משימות, תוכן)
            </Link>
          </div>
        </header>
        <p className="mt-5 border-s-2 border-gold ps-3 text-base text-ink/80">
          <strong>עריכת טקסטים באתר:</strong> בכל דף באתר לוחצים על העיפרון בתפריט העליון, ואז על כל כותרת או פסקה שמסומנת בקו מקווקו. מוצרים, מחירים ותמונות נערכים כאן, והעונה והמנוי בלשונית שלהם.
        </p>

        <nav aria-label="אזורי הניהול" className="mt-6 overflow-x-auto border-y-[3px] border-ink">
          <ul className="flex min-w-max">
            {tabs.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  aria-current={tab === t.id ? 'page' : undefined}
                  className={cn('px-5 py-3 text-lg font-bold transition-colors', tab === t.id ? 'bg-ink text-paper' : 'hover:text-spot')}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-8">
          {tab === 'products' && <ProductsTab canWrite={canWrite} notify={notify} />}
          {tab === 'orders' && <OrdersTab canWrite={canWrite} notify={notify} />}
          {tab === 'messages' && <MessagesTab canWrite={canWrite} notify={notify} />}
          {tab === 'season' && <SeasonTab canWrite={canWrite} notify={notify} />}
        </div>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[130] flex justify-center px-4 lg:bottom-6">
        {notify.notice && (
          <p className={cn('pointer-events-auto border-[3px] border-ink px-5 py-3 font-bold shadow-[6px_6px_0_var(--color-ink)]', notify.notice.tone === 'ok' ? 'bg-paper' : 'bg-spot text-paper')}>
            {notify.notice.text}
          </p>
        )}
      </div>
    </div>
  );
};
