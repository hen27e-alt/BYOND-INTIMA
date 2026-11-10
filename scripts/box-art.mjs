// Generates the three box images (public/boxes/*.svg): a black box with the logo hot-foil
// stamped on the lid front, lit in a studio. The foil and the light tell the tier apart,
// from rosé (the lightest box) through ember copper to gold (the deepest).
// Run: node scripts/box-art.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const TIERS = [
  {
    file: 'dusk', n: '01', name: 'DUSK',
    foil: ['#A8655A', '#F2C4B4', '#C98C7E', '#FBE0D4', '#A8655A'],
    light: 'rgba(232,140,130,0.26)', ribbon: ['#5A2A2E', '#C98A85', '#6E3237'], gilt: false,
  },
  {
    file: 'midnight', n: '02', name: 'MIDNIGHT',
    foil: ['#8C2E1C', '#F08A6A', '#B8482F', '#FFC3A8', '#8C2E1C'],
    light: 'rgba(217,54,31,0.32)', ribbon: ['#3A0910', '#A3222E', '#4A0D14'], gilt: false,
  },
  {
    file: 'dawn', n: '03', name: 'UNTIL DAWN',
    foil: ['#9C7742', '#EBD3A1', '#B8925A', '#F4E4BE', '#A8844E'],
    light: 'rgba(201,166,107,0.30)', ribbon: ['#6B4E24', '#E6C98E', '#7D5C2C'], gilt: true,
  },
];

const SERIF = "Didot, 'Bodoni 72', 'Bodoni MT', 'Playfair Display', Georgia, 'Times New Roman', serif";

const svg = (t) => {
  const stops = (c) => c.map((col, i) => `<stop offset="${(i / (c.length - 1)).toFixed(2)}" stop-color="${col}"/>`).join('');
  const giltStroke = t.gilt ? 'url(#foil)' : 'rgba(255,255,255,0.08)';
  const giltW = t.gilt ? 1.6 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
<defs>
  <radialGradient id="spot" cx="50%" cy="34%" r="62%"><stop offset="0" stop-color="${t.light}"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E0B0B"/><stop offset="1" stop-color="#050404"/></linearGradient>
  <linearGradient id="foil" x1="0" y1="0" x2="1" y2="0.35">${stops(t.foil)}</linearGradient>
  <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">${stops(t.ribbon)}</linearGradient>
  <linearGradient id="front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A1617"/><stop offset="0.55" stop-color="#0E0C0C"/><stop offset="1" stop-color="#080707"/></linearGradient>
  <linearGradient id="lidFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#221D1E"/><stop offset="1" stop-color="#0F0D0D"/></linearGradient>
  <linearGradient id="top" x1="0" y1="1" x2="0.4" y2="0"><stop offset="0" stop-color="#2A2425"/><stop offset="1" stop-color="#141112"/></linearGradient>
  <linearGradient id="side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0A0808"/><stop offset="1" stop-color="#040303"/></linearGradient>
  <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,0.10)"/><stop offset="0.35" stop-color="rgba(255,255,255,0)"/></linearGradient>
  <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
</defs>
<rect width="800" height="1000" fill="#0B0909"/>
<rect width="800" height="1000" fill="url(#spot)"/>
<rect y="760" width="800" height="240" fill="url(#floor)"/>
<g transform="translate(-30 10)">
<ellipse cx="440" cy="828" rx="330" ry="34" fill="#000" opacity="0.85" filter="url(#blur)"/>

<!-- base -->
<polygon points="630,490 690,400 690,730 630,820" fill="url(#side)" stroke="${giltStroke}" stroke-width="${giltW}"/>
<rect x="170" y="490" width="460" height="330" fill="url(#front)" stroke="${giltStroke}" stroke-width="${giltW}"/>
<rect x="170" y="490" width="460" height="330" fill="url(#sheen)"/>

<!-- lid -->
<polygon points="160,420 640,420 700,330 220,330" fill="url(#top)" stroke="${giltStroke}" stroke-width="${giltW}"/>
<polygon points="640,420 700,330 700,400 640,490" fill="url(#side)" stroke="${giltStroke}" stroke-width="${giltW}"/>
<rect x="160" y="420" width="480" height="70" fill="url(#lidFront)" stroke="${giltStroke}" stroke-width="${giltW}"/>
<line x1="160" y1="420.5" x2="640" y2="420.5" stroke="url(#foil)" stroke-width="1.4" opacity="0.75"/>
<line x1="160" y1="490" x2="640" y2="490" stroke="#000" stroke-width="3" opacity="0.7"/>

<!-- ribbon over the lid and down the front -->
<polygon points="548,420 588,420 648,330 608,330" fill="url(#ribbon)" opacity="0.95"/>
<rect x="548" y="420" width="40" height="400" fill="url(#ribbon)" opacity="0.95"/>
<rect x="548" y="420" width="40" height="400" fill="url(#sheen)" opacity="0.8"/>
<line x1="548" y1="490" x2="588" y2="490" stroke="#000" stroke-width="3" opacity="0.5"/>

<!-- wax-like foil seal on the ribbon -->
<circle cx="568" cy="455" r="27" fill="#0E0B0B" stroke="url(#foil)" stroke-width="2"/>
<circle cx="568" cy="455" r="21" fill="none" stroke="url(#foil)" stroke-width="0.8" opacity="0.7"/>
<text x="568" y="463" text-anchor="middle" font-family="${SERIF}" font-size="22" fill="url(#foil)" letter-spacing="1">BI</text>

<!-- hot-foil stamp on the front -->
<rect x="198" y="518" width="324" height="274" fill="none" stroke="url(#foil)" stroke-width="1.4" opacity="0.8"/>
<rect x="206" y="526" width="308" height="258" fill="none" stroke="url(#foil)" stroke-width="0.6" opacity="0.5"/>
<text x="360" y="572" text-anchor="middle" font-family="${SERIF}" font-size="15" letter-spacing="6" fill="url(#foil)">N° ${t.n}</text>
<text x="360" y="658" text-anchor="middle" font-family="${SERIF}" font-size="66" letter-spacing="9" fill="url(#foil)">BYOND</text>
<text x="360" y="708" text-anchor="middle" font-family="${SERIF}" font-size="26" letter-spacing="17" fill="url(#foil)">INTIMA</text>
<line x1="300" y1="734" x2="420" y2="734" stroke="url(#foil)" stroke-width="0.8" opacity="0.8"/>
<text x="360" y="764" text-anchor="middle" font-family="${SERIF}" font-size="13" letter-spacing="7" fill="url(#foil)">${t.name}</text>

<!-- rim light on the top edge -->
<polygon points="160,420 640,420 700,330 220,330" fill="url(#spot)" opacity="0.6"/>
</g>
</svg>
`;
};

// The cards-only pack: a black tuck box standing upright, two cards fanned out behind it.
const cards = (t) => {
  const stops = (c) => c.map((col, i) => `<stop offset="${(i / (c.length - 1)).toFixed(2)}" stop-color="${col}"/>`).join('');
  const card = (rot, dx) => `<g transform="translate(${400 + dx} 560) rotate(${rot})">
    <rect x="-130" y="-200" width="260" height="380" rx="14" fill="#100D0D" stroke="url(#foil)" stroke-width="1.6"/>
    <rect x="-112" y="-182" width="224" height="344" rx="8" fill="none" stroke="url(#foil)" stroke-width="0.7" opacity="0.6"/>
    <text x="0" y="-130" text-anchor="middle" font-family="${SERIF}" font-size="13" letter-spacing="5" fill="url(#foil)">N° ${t.n}</text>
    <circle cx="0" cy="0" r="34" fill="none" stroke="url(#foil)" stroke-width="1"/>
    <text x="0" y="9" text-anchor="middle" font-family="${SERIF}" font-size="26" fill="url(#foil)">BI</text>
  </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
<defs>
  <radialGradient id="spot" cx="50%" cy="36%" r="62%"><stop offset="0" stop-color="${t.light}"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E0B0B"/><stop offset="1" stop-color="#050404"/></linearGradient>
  <linearGradient id="foil" x1="0" y1="0" x2="1" y2="0.35">${stops(t.foil)}</linearGradient>
  <linearGradient id="front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1C1819"/><stop offset="0.6" stop-color="#0E0C0C"/><stop offset="1" stop-color="#080707"/></linearGradient>
  <linearGradient id="side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0A0808"/><stop offset="1" stop-color="#040303"/></linearGradient>
  <linearGradient id="top" x1="0" y1="1" x2="0.4" y2="0"><stop offset="0" stop-color="#2A2425"/><stop offset="1" stop-color="#141112"/></linearGradient>
  <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
</defs>
<rect width="800" height="1000" fill="#0B0909"/>
<rect width="800" height="1000" fill="url(#spot)"/>
<rect y="780" width="800" height="220" fill="url(#floor)"/>
<ellipse cx="410" cy="842" rx="260" ry="28" fill="#000" opacity="0.85" filter="url(#blur)"/>
${card(-14, -70)}
${card(9, 60)}
<!-- tuck box -->
<polygon points="520,400 556,360 556,800 520,840" fill="url(#side)"/>
<polygon points="280,400 520,400 556,360 316,360" fill="url(#top)"/>
<rect x="280" y="400" width="240" height="440" fill="url(#front)"/>
<line x1="280" y1="400.5" x2="520" y2="400.5" stroke="url(#foil)" stroke-width="1.2" opacity="0.8"/>
<path d="M300 400 Q400 448 500 400" fill="none" stroke="url(#foil)" stroke-width="1" opacity="0.7"/>
<rect x="298" y="470" width="204" height="350" fill="none" stroke="url(#foil)" stroke-width="1.2" opacity="0.8"/>
<text x="400" y="520" text-anchor="middle" font-family="${SERIF}" font-size="12" letter-spacing="5" fill="url(#foil)">N° ${t.n}</text>
<text x="400" y="640" text-anchor="middle" font-family="${SERIF}" font-size="40" letter-spacing="6" fill="url(#foil)">BYOND</text>
<text x="400" y="676" text-anchor="middle" font-family="${SERIF}" font-size="16" letter-spacing="11" fill="url(#foil)">INTIMA</text>
<line x1="360" y1="700" x2="440" y2="700" stroke="url(#foil)" stroke-width="0.8" opacity="0.8"/>
<text x="400" y="726" text-anchor="middle" font-family="${SERIF}" font-size="11" letter-spacing="5" fill="url(#foil)">${t.name}</text>
<text x="400" y="790" text-anchor="middle" font-family="${SERIF}" font-size="10" letter-spacing="6" fill="url(#foil)" opacity="0.8">MISSION CARDS</text>
</svg>
`;
};

mkdirSync(new URL('../public/boxes/', import.meta.url), { recursive: true });
for (const t of TIERS) {
  writeFileSync(new URL(`../public/boxes/${t.file}.svg`, import.meta.url), svg(t));
  writeFileSync(new URL(`../public/boxes/cards-${t.file}.svg`, import.meta.url), cards(t));
}
console.log('wrote', TIERS.map((t) => `${t.file}, cards-${t.file}`).join(', '));
