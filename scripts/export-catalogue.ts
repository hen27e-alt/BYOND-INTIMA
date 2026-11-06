// Writes functions/catalogue.json: the base price list the server trusts.
// The admin panel's edits in Firestore (`products`) override it at checkout.
// Runs automatically before every functions deploy (see firebase.json).
import { writeFileSync } from 'node:fs';
import { boutiqueProducts } from '../src/data/boutique';
import { cardDecks } from '../src/data/decks';

const items: Record<string, { name: string; price: number; kind: 'boutique' | 'deck' }> = {};
for (const p of boutiqueProducts) items[p.id] = { name: p.name, price: p.price, kind: 'boutique' };
for (const d of cardDecks) items[d.id] = { name: `BYOND ${d.name}`, price: d.price ?? 119, kind: 'deck' };

writeFileSync(new URL('../functions/catalogue.json', import.meta.url), JSON.stringify(items, null, 2) + '\n');
console.log(`catalogue.json: ${Object.keys(items).length} items`);
