import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Loader2, ChefHat, X, Utensils, Sparkles, Clock, ChefHat as ChefHatIcon } from 'lucide-react';

const categories = [
  { id: 'food', name: 'משימות אוכל', icon: '🍳' },
  { id: 'true', name: 'BYOND TRUE', icon: '🔵' },
  { id: 'nasty', name: 'BYOND NASTY', icon: '🔴' },
  { id: 'quick', name: 'BYOND QUICK', icon: '🟡' },
  { id: 'quickie', name: 'BYOND QUICKIE', icon: '🟣' },
  { id: 'night', name: 'BYOND NIGHT', icon: '🌙' },
  { id: 'morning', name: 'BYOND MORNING', icon: '☀️' },
  { id: 'outside', name: 'BYOND OUTSIDE', icon: '🌳' },
];

const cards = [
  {
    id: '01',
    category: 'food',
    title: 'השף הדיקטטור',
    subtitle: 'רק אחד מחליט',
    desc: 'אחד מכם הוא השף הראשי — מחליט הכל, בלי שאלות. השני מבצע בשתיקה.',
    badge: '⏱ 5 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <ellipse cx="110" cy="88" rx="28" ry="8" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <rect x="82" y="68" width="56" height="22" rx="2" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <ellipse cx="110" cy="62" rx="22" ry="20" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <ellipse cx="96" cy="58" rx="8" ry="10" fill="none" stroke="#D4A880" strokeWidth="0.9"/>
        <ellipse cx="124" cy="58" rx="8" ry="10" fill="none" stroke="#D4A880" strokeWidth="0.9"/>
        <path d="M90 50 L110 42 L130 50" stroke="#C9A96E" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <line x1="148" y1="40" x2="148" y2="95" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"/>
        <ellipse cx="148" cy="37" rx="5" ry="7" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <circle cx="60" cy="40" r="2" fill="#E8D5B0"/>
        <circle cx="68" cy="55" r="1.5" fill="#E8D5B0"/>
        <circle cx="55" cy="62" r="1" fill="#E8D5B0"/>
        <circle cx="165" cy="55" r="2" fill="#E8D5B0"/>
        <circle cx="158" cy="68" r="1.5" fill="#E8D5B0"/>
      </svg>
    )
  },
  {
    id: '02',
    category: 'food',
    title: 'ללא מילים',
    subtitle: 'שפת גוף בלבד',
    desc: 'בישול בשקט מוחלט — תקשורת רק בעיניים, מחוות ומגע.',
    badge: '⏱ 7 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="85" cy="72" r="28" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <circle cx="135" cy="72" r="28" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <ellipse cx="78" cy="68" rx="3" ry="4" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <ellipse cx="92" cy="68" rx="3" ry="4" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <ellipse cx="128" cy="68" rx="3" ry="4" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <ellipse cx="142" cy="68" rx="3" ry="4" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <path d="M79 80 Q85 84 91 80" stroke="#C9A96E" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <line x1="82" y1="79" x2="88" y2="81" stroke="#D4A880" strokeWidth="0.8"/>
        <path d="M129 80 Q135 84 141 80" stroke="#C9A96E" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <line x1="132" y1="79" x2="138" y2="81" stroke="#D4A880" strokeWidth="0.8"/>
        <path d="M110 55 L110 90" stroke="#E8D5B0" strokeWidth="0.8" strokeDasharray="3,3"/>
        <circle cx="110" cy="72" r="4" fill="#FDF6EE" stroke="#E8D5B0" strokeWidth="0.8"/>
        <circle cx="50" cy="35" r="2" fill="#E8D5B0"/>
        <circle cx="170" cy="35" r="2" fill="#E8D5B0"/>
        <path d="M46 45 Q50 40 54 45" stroke="#E8D5B0" strokeWidth="0.8" fill="none"/>
        <path d="M166 45 Q170 40 174 45" stroke="#E8D5B0" strokeWidth="0.8" fill="none"/>
      </svg>
    )
  },
  {
    id: '03',
    category: 'food',
    title: 'רק בלחישות',
    subtitle: 'קול שקט בלבד',
    desc: 'כל שיחה והנחיה — רק בלחישה. המטבח הופך לחלל אינטימי.',
    badge: 'מי שמרים קול — עושה כלים',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="88" cy="75" r="24" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <circle cx="132" cy="75" r="24" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <path d="M110 58 Q116 55 114 62 Q120 60 118 67" stroke="#C9A96E" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M108 62 Q112 60 111 65 Q115 63 114 68" stroke="#D4A880" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <path d="M82 78 Q88 83 94 78" stroke="#C9A96E" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <path d="M85 78 Q88 80 91 78" stroke="#D4A880" strokeWidth="0.8" fill="none"/>
        <circle cx="100" cy="65" r="1.5" fill="#D4A880" opacity="0.6"/>
        <circle cx="104" cy="62" r="1" fill="#D4A880" opacity="0.5"/>
        <circle cx="107" cy="60" r="0.8" fill="#D4A880" opacity="0.4"/>
        <path d="M40 40 Q50 30 60 40 Q50 50 40 40Z" fill="none" stroke="#E8D5B0" strokeWidth="0.8"/>
        <path d="M160 40 Q170 30 180 40 Q170 50 160 40Z" fill="none" stroke="#E8D5B0" strokeWidth="0.8"/>
      </svg>
    )
  },
  {
    id: '04',
    category: 'food',
    title: 'עיוור במטבח',
    subtitle: 'אחד מודרך',
    desc: 'אחד עם עיניים עצומות — השני מדריך אותו בעדינות מילה מילה.',
    badge: 'החליפו תפקידים אחרי 5 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="100" cy="72" r="26" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <rect x="74" y="62" width="52" height="12" rx="6" fill="none" stroke="#C9A96E" strokeWidth="1.3"/>
        <line x1="74" y1="68" x2="62" y2="60" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round"/>
        <line x1="126" y1="68" x2="138" y2="60" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="148" cy="72" r="20" fill="none" stroke="#D4A880" strokeWidth="1"/>
        <path d="M128 72 L112 72" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="109" cy="72" r="3" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <path d="M142 76 Q148 80 154 76" stroke="#D4A880" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M80 45 L81 49 L85 49 L82 52 L83 56 L80 53 L77 56 L78 52 L75 49 L79 49Z" fill="none" stroke="#E8D5B0" strokeWidth="0.7"/>
        <circle cx="170" cy="40" r="2" fill="#E8D5B0"/>
        <circle cx="175" cy="50" r="1.5" fill="#E8D5B0"/>
      </svg>
    )
  },
  {
    id: '05',
    category: 'food',
    title: 'יד אחת לכל אחד',
    subtitle: 'ביחד — ממש ביחד',
    desc: 'כל אחד משתמש ביד אחת. את השנייה — מחזיקים אחד של השני.',
    badge: 'אסור לשחרר את היד',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M60 95 L60 65 Q60 58 67 58 Q74 58 74 65 L74 72 Q74 65 81 65 Q88 65 88 72 L88 75 Q88 68 95 68 Q102 68 102 75 L102 88 Q102 78 109 78 Q116 78 116 85 L116 100 Q116 115 100 118 L70 118 Q55 118 55 100 Z" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <path d="M160 95 L160 65 Q160 58 153 58 Q146 58 146 65 L146 72 Q146 65 139 65 Q132 65 132 72 L132 75 Q132 68 125 68 Q118 68 118 75 L118 88" fill="none" stroke="#D4A880" strokeWidth="1.2" strokeDasharray="none"/>
        <ellipse cx="110" cy="87" rx="8" ry="6" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <path d="M105 50 C105 46 110 43 110 47 C110 43 115 46 115 50 C115 54 110 58 110 58 C110 58 105 54 105 50Z" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <circle cx="45" cy="45" r="2" fill="#E8D5B0"/>
        <circle cx="175" cy="45" r="2" fill="#E8D5B0"/>
        <path d="M42 55 Q45 50 48 55" stroke="#E8D5B0" strokeWidth="0.8" fill="none"/>
        <path d="M172 55 Q175 50 178 55" stroke="#E8D5B0" strokeWidth="0.8" fill="none"/>
      </svg>
    )
  },
  {
    id: '06',
    category: 'food',
    title: 'גב אל גב',
    subtitle: 'בלי להסתובב',
    desc: 'עומדים גב לגב ומבשלים — כל תיאום נעשה רק בקול.',
    badge: 'מי שמסתובב — מוסיף תבלין לפי השני',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="75" cy="50" r="14" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <path d="M68 64 Q75 68 82 64 L85 100 L65 100 Z" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <circle cx="145" cy="50" r="14" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <path d="M138 64 Q145 68 152 64 L155 100 L135 100 Z" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <line x1="85" y1="72" x2="135" y2="72" stroke="#E8D5B0" strokeWidth="0.8" strokeDasharray="4,3"/>
        <path d="M100 60 L80 60" stroke="#D4A880" strokeWidth="1" strokeLinecap="round"/>
        <path d="M120 60 L140 60" stroke="#D4A880" strokeWidth="1" strokeLinecap="round"/>
        <polyline points="136,56 140,60 136,64" fill="none" stroke="#D4A880" strokeWidth="1" strokeLinecap="round"/>
        <polyline points="84,56 80,60 84,64" fill="none" stroke="#D4A880" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="110" cy="35" r="3" fill="#E8D5B0"/>
        <circle cx="110" cy="95" r="2" fill="#E8D5B0"/>
      </svg>
    )
  },
  {
    id: '07',
    category: 'food',
    title: 'החלפת תפקידים',
    subtitle: 'פתאומית — ללא הכנה',
    desc: 'באמצע הבישול — עוצרים ומחליפים תפקידים מיד. ממשיכים מאיפה שהשני עצר.',
    badge: '⏱ כל 3 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M75 67 A35 35 0 1 1 110 102" stroke="#C9A96E" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <polyline points="106,98 110,102 106,106" fill="none" stroke="#C9A96E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M145 67 A35 35 0 1 0 110 32" stroke="#D4A880" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <polyline points="114,36 110,32 114,28" fill="none" stroke="#D4A880" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="75" cy="65" rx="10" ry="4" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <ellipse cx="75" cy="60" rx="8" ry="7" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <line x1="145" y1="50" x2="145" y2="80" stroke="#D4A880" strokeWidth="1.2" strokeLinecap="round"/>
        <ellipse cx="145" cy="48" rx="4" ry="5" fill="none" stroke="#D4A880" strokeWidth="1"/>
        <circle cx="40" cy="67" r="2" fill="#E8D5B0"/>
        <circle cx="180" cy="67" r="2" fill="#E8D5B0"/>
      </svg>
    )
  },
  {
    id: '08',
    category: 'food',
    title: 'אתה שוטף',
    subtitle: 'אני מפקח',
    desc: 'אחד שוטף כלים — השני מבקר כל כלי בסולם 1–10.',
    badge: 'ציון מתחת ל-6 — לשטוף שוב',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <rect x="60" y="80" width="60" height="35" rx="4" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <rect x="55" y="76" width="70" height="8" rx="2" fill="none" stroke="#C9A96E" strokeWidth="1"/>
        <path d="M90 76 L90 60 Q90 54 96 54 L108 54" stroke="#C9A96E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M108 50 L108 60" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M96 62 Q96 68 100 68 Q104 68 104 62 Q104 57 100 54 Q96 57 96 62Z" fill="none" stroke="#D4A880" strokeWidth="0.9"/>
        <circle cx="160" cy="55" r="16" fill="none" stroke="#D4A880" strokeWidth="1"/>
        <path d="M155 60 Q160 65 165 60" stroke="#D4A880" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <rect x="150" y="75" width="20" height="28" rx="2" fill="none" stroke="#D4A880" strokeWidth="1"/>
        <rect x="155" y="72" width="10" height="5" rx="1" fill="none" stroke="#D4A880" strokeWidth="0.9"/>
        <line x1="153" y1="83" x2="167" y2="83" stroke="#D4A880" strokeWidth="0.7"/>
        <line x1="153" y1="88" x2="167" y2="88" stroke="#D4A880" strokeWidth="0.7"/>
        <line x1="153" y1="93" x2="162" y2="93" stroke="#D4A880" strokeWidth="0.7"/>
        <path d="M108 30 L110 25 L112 30 L117 30 L113 33 L115 38 L110 35 L105 38 L107 33 L103 30Z" fill="none" stroke="#C9A96E" strokeWidth="0.8"/>
      </svg>
    )
  },
  {
    id: '09',
    category: 'food',
    title: 'משימה בטיימר',
    subtitle: 'מהר — אבל יחד',
    desc: '5 דקות להכין מנה אחת שלמה. לא חשוב מה יוצא — חשוב שתגמרו יחד בזמן.',
    badge: '⏱ 5 דקות בדיוק',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M85 25 L135 25 L110 67 L135 109 L85 109 L110 67 Z" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <line x1="85" y1="25" x2="135" y2="25" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="85" y1="109" x2="135" y2="109" stroke="#C9A96E" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M90 30 L130 30 L115 55 L105 55 Z" fill="#E8D5B0" opacity="0.4"/>
        <path d="M100 97 L120 97 L117 107 L103 107 Z" fill="#C9A96E" opacity="0.3"/>
        <line x1="110" y1="60" x2="110" y2="75" stroke="#C9A96E" strokeWidth="0.8" strokeDasharray="2,2"/>
        <path d="M58 45 L68 50" stroke="#E8D5B0" strokeWidth="1" strokeLinecap="round"/>
        <path d="M55 67 L68 67" stroke="#E8D5B0" strokeWidth="1" strokeLinecap="round"/>
        <path d="M58 89 L68 84" stroke="#E8D5B0" strokeWidth="1" strokeLinecap="round"/>
        <path d="M162 45 L152 50" stroke="#E8D5B0" strokeWidth="1" strokeLinecap="round"/>
        <path d="M165 67 L152 67" stroke="#E8D5B0" strokeWidth="1" strokeLinecap="round"/>
        <path d="M162 89 L152 84" stroke="#E8D5B0" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: '10',
    category: 'food',
    title: 'מי שצוחק ראשון',
    subtitle: 'עושה כלים',
    desc: 'מבשלים ברצינות מוחלטת — מי ששובר קודם ומצחקק, עושה את כל הכלים לבד.',
    badge: 'פנים ישרות בכל מחיר',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="78" cy="67" r="28" fill="none" stroke="#C9A96E" strokeWidth="1.2"/>
        <line x1="70" y1="60" x2="76" y2="60" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="80" y1="60" x2="86" y2="60" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="70" y1="77" x2="86" y2="77" stroke="#C9A96E" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="142" cy="67" r="28" fill="none" stroke="#D4A880" strokeWidth="1.2"/>
        <path d="M133 59 Q136 55 139 59" stroke="#D4A880" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M145 59 Q148 55 151 59" stroke="#D4A880" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M132 73 Q142 84 152 73" stroke="#D4A880" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M153 62 L158 55" stroke="#D4A880" strokeWidth="0.8" strokeLinecap="round"/>
        <circle cx="159" cy="54" r="2" fill="none" stroke="#D4A880" strokeWidth="0.8"/>
        <text x="158" y="80" fontFamily="serif" fontSize="7" fill="#E8D5B0" opacity="0.7">ha</text>
        <text x="160" y="90" fontFamily="serif" fontSize="6" fill="#E8D5B0" opacity="0.5">ha</text>
        <path d="M55 105 Q78 95 78 105" stroke="#E8D5B0" strokeWidth="0.8" fill="none"/>
        <circle cx="66" cy="105" r="5" fill="none" stroke="#E8D5B0" strokeWidth="0.8"/>
      </svg>
    )
  },
  {
    id: 'T1',
    category: 'true',
    title: 'האמת העירומה',
    subtitle: 'כנות ללא פילטרים',
    desc: 'מהו הדבר שאתה הכי מפחד להגיד לי, אבל יודע שיקרב אותנו?',
    badge: 'שיחה עמוקה',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="110" cy="67" r="30" stroke="#3B82F6" strokeWidth="1.2" fill="none" opacity="0.3" />
        <path d="M110 45 L110 89 M88 67 L132 67" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'T2',
    category: 'true',
    title: 'זיכרון מוזהב',
    subtitle: 'מסע בזמן',
    desc: 'מהו הזיכרון הכי יפה ומרגש שיש לך מאיתנו כזוג?',
    badge: 'חיבור רגשי',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 Q130 30 150 50 Q130 70 110 90 Q90 70 70 50 Q90 30 110 40" stroke="#3B82F6" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'T3',
    category: 'true',
    title: 'שינוי בעבר',
    subtitle: 'מבט לאחור',
    desc: 'אם היית יכול לשנות דבר אחד קטן בעבר שלנו, מה זה היה ולמה?',
    badge: 'כנות עמוקה',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M80 67 L140 67 M110 37 L110 97" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="4 4" />
      </svg>
    )
  },
  {
    id: 'N1',
    category: 'nasty',
    title: 'אתגר הקרח',
    subtitle: 'תחושות מנוגדות',
    desc: 'השתמשו בקובית קרח אחת כדי לעבור על הגוף של הפרטנר במקומות מפתיעים.',
    badge: 'נועז במיוחד',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <rect x="90" y="47" width="40" height="40" rx="4" stroke="#EF4444" strokeWidth="1.2" fill="none" opacity="0.3" />
        <path d="M100 57 L120 77 M120 57 L100 77" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'N2',
    category: 'nasty',
    title: 'פנטזיה גלויה',
    subtitle: 'שיתוף אינטימי',
    desc: 'ספרו אחד לשני פנטזיה אחת שמעולם לא שיתפתם קודם לכן.',
    badge: 'אש ורגש',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 L110 90 M85 65 L135 65" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="110" cy="65" r="20" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    )
  },
  {
    id: 'N3',
    category: 'nasty',
    title: 'מגע עיוור',
    subtitle: 'חושים מחודדים',
    desc: 'אחד עוצם עיניים והשני נוגע בו במקומות שונים במשך 2 דקות.',
    badge: '⏱ 2 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <rect x="70" y="60" width="80" height="15" rx="7.5" fill="#EF4444" opacity="0.2" />
        <circle cx="110" cy="67" r="25" stroke="#EF4444" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'Q1',
    category: 'quick',
    title: 'מבט של דקה',
    subtitle: 'חיבור בעיניים',
    desc: 'הסתכלו אחד לשני בעיניים במשך דקה שלמה ללא מילים.',
    badge: '⏱ 60 שניות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="85" cy="67" r="15" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
        <circle cx="135" cy="67" r="15" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
        <circle cx="85" cy="67" r="5" fill="#F59E0B" />
        <circle cx="135" cy="67" r="5" fill="#F59E0B" />
      </svg>
    )
  },
  {
    id: 'Q2',
    category: 'quick',
    title: 'שלוש מחמאות',
    subtitle: 'חיזוק חיובי',
    desc: 'תנו אחד לשני 3 מחמאות כנות על משהו שקרה היום או השבוע.',
    badge: 'מהיר ומתוק',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 L115 55 L130 55 L118 65 L122 80 L110 70 L98 80 L102 65 L90 55 L105 55 Z" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'Q3',
    category: 'quick',
    title: 'חיבוק של 20',
    subtitle: 'הורמון האהבה',
    desc: 'התחבקו חיבוק חזק וארוך במשך 20 שניות לפחות.',
    badge: '⏱ 20 שניות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <circle cx="100" cy="67" r="20" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
        <circle cx="120" cy="67" r="20" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'QE1',
    category: 'quickie',
    title: 'נשיקה בהפתעה',
    subtitle: 'רגע של תשוקה',
    desc: 'תנו אחד לשני נשיקה ארוכה ומפתיעה באמצע היום.',
    badge: 'ספונטני',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M90 67 Q110 87 130 67 Q110 47 90 67" stroke="#A855F7" strokeWidth="1.2" fill="none" />
        <path d="M95 67 L125 67" stroke="#A855F7" strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  },
  {
    id: 'QE2',
    category: 'quickie',
    title: 'ריקוד סלוני',
    subtitle: 'קצב משותף',
    desc: 'שימו שיר אחד ורקדו יחד בסלון, פשוט ככה.',
    badge: 'כיף וקליל',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 L110 90 M90 60 L130 60" stroke="#A855F7" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="110" cy="40" r="5" fill="#A855F7" opacity="0.3" />
      </svg>
    )
  },
  {
    id: 'QE3',
    category: 'quickie',
    title: 'סלפי זוגי',
    subtitle: 'תיעוד הרגע',
    desc: 'צלמו סלפי זוגי מצחיק או רומנטי ממש עכשיו ושלחו אחד לשני.',
    badge: 'מזכרת מהירה',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <rect x="80" y="50" width="60" height="40" rx="4" stroke="#A855F7" strokeWidth="1.2" fill="none" />
        <circle cx="110" cy="70" r="10" stroke="#A855F7" strokeWidth="1" fill="none" />
      </svg>
    )
  },
  {
    id: 'NT1',
    category: 'night',
    title: 'עיסוי כפות רגליים',
    subtitle: 'רוגע לילי',
    desc: 'העניקו אחד לשני עיסוי כפות רגליים מפנק לפני השינה.',
    badge: '⏱ 10 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 Q130 40 130 60 Q130 80 110 80 Q90 80 90 60 Q90 40 110 40" stroke="#1E293B" strokeWidth="1.2" fill="none" opacity="0.3" />
        <path d="M100 95 Q110 85 120 95" stroke="#1E293B" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'NT2',
    category: 'night',
    title: 'חופשת חלומות',
    subtitle: 'תכנון משותף',
    desc: 'תכננו יחד את חופשת החלומות שלכם בפרטי פרטים - לאן, מתי ומה תעשו.',
    badge: 'זמן חלום',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M70 90 L110 40 L150 90 Z" stroke="#1E293B" strokeWidth="1.2" fill="none" />
        <circle cx="160" cy="40" r="10" stroke="#1E293B" strokeWidth="1" fill="none" />
      </svg>
    )
  },
  {
    id: 'NT3',
    category: 'night',
    title: 'הערכה יומית',
    subtitle: 'סיום חיובי',
    desc: 'שתפו אחד את השני בדבר אחד שאתם הכי מעריכים בו היום.',
    badge: 'לילה טוב',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 L110 90 M85 65 L135 65" stroke="#1E293B" strokeWidth="1.2" strokeDasharray="2 2" />
        <path d="M100 50 Q110 40 120 50" stroke="#1E293B" strokeWidth="1" fill="none" />
      </svg>
    )
  },
  {
    id: 'M1',
    category: 'morning',
    title: 'קפה במיטה',
    subtitle: 'בוקר של פינוק',
    desc: 'הכינו קפה אחד לשני והגישו אותו במיטה עם נשיקה.',
    badge: 'בוקר טוב',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M90 80 L130 80 L135 50 L85 50 Z" stroke="#FACC15" strokeWidth="1.2" fill="none" />
        <path d="M135 55 Q145 55 145 65 Q145 75 135 75" stroke="#FACC15" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'M2',
    category: 'morning',
    title: 'מתיחות זוגיות',
    subtitle: 'אנרגיה ליום',
    desc: 'בצעו יחד סדרת מתיחות קלה במיטה או לידה כדי להתחיל את היום באנרגיה.',
    badge: 'בוקר פעיל',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 L110 90 M80 65 L140 65" stroke="#FACC15" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M90 40 Q110 20 130 40" stroke="#FACC15" strokeWidth="1" fill="none" />
      </svg>
    )
  },
  {
    id: 'M3',
    category: 'morning',
    title: 'שיתוף חלום',
    subtitle: 'עולם התת-מודע',
    desc: 'שתפו אחד את השני בחלום שחלמתם הלילה, גם אם הוא נראה מוזר.',
    badge: 'בוקר יצירתי',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M70 67 Q110 37 150 67 Q110 97 70 67" stroke="#FACC15" strokeWidth="1.2" fill="none" opacity="0.3" />
        <circle cx="110" cy="67" r="10" stroke="#FACC15" strokeWidth="1" fill="none" />
      </svg>
    )
  },
  {
    id: 'O1',
    category: 'outside',
    title: 'פיקניק ספונטני',
    subtitle: 'חיבור לטבע',
    desc: 'צאו לפארק הקרוב עם שמיכה וכמה נשנושים לזמן איכות בחוץ.',
    badge: 'מחוץ לבית',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M110 40 L130 80 L90 80 Z" stroke="#22C55E" strokeWidth="1.2" fill="none" />
        <circle cx="110" cy="35" r="5" stroke="#22C55E" strokeWidth="1.2" fill="none" />
      </svg>
    )
  },
  {
    id: 'O2',
    category: 'outside',
    title: 'הליכה יד ביד',
    subtitle: 'קצב משותף',
    desc: 'צאו להליכה של 15 דקות בשכונה, פשוט לכו יד ביד ודברו.',
    badge: '⏱ 15 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <path d="M90 90 L90 60 L110 60 L110 90 M130 90 L130 60 L150 60 L150 90" stroke="#22C55E" strokeWidth="1.2" fill="none" />
        <path d="M110 75 L130 75" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'O3',
    category: 'outside',
    title: 'שקט בחוץ',
    subtitle: 'נוכחות משותפת',
    desc: 'מצאו מקום יפה בחוץ (ספסל, חוף הים) ופשוט שבו שם בשקט יחד במשך 5 דקות.',
    badge: '⏱ 5 דקות',
    illustration: (
      <svg viewBox="0 0 220 134" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="220" height="134" fill="#FDF6EE"/>
        <rect x="70" y="80" width="80" height="10" rx="2" stroke="#22C55E" strokeWidth="1.2" fill="none" />
        <path d="M110 40 L110 80" stroke="#22C55E" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }
];

export const KitchenCards = () => {
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  const generateRecipe = async (card: any) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Create a romantic couples recipe inspired by this experience card:
      Title: ${card.title}
      Description: ${card.desc}
      
      The recipe should be fun to cook together and fit the vibe of the card.
      Return ONLY a JSON object in Hebrew with this structure:
      {
        "title": "Recipe Name",
        "description": "Short romantic description",
        "ingredients": ["ing1", "ing2"],
        "instructions": ["step1", "step2"],
        "prepTime": "e.g., 30 דקות",
        "difficulty": "e.g., קל"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              prepTime: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ["title", "description", "ingredients", "instructions", "prepTime", "difficulty"]
          }
        }
      });

      const data = JSON.parse(response.text);
      setGeneratedRecipe(data);
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const filteredCards = cards.filter(c => c.category === selectedCategory).map(card => {
    if (card.id === 'M1') {
      return { ...card, title: `קפה במיטה (${currentTime})` };
    }
    return card;
  });

  return (
    <div className="bg-[#0A060A] min-h-screen py-16 px-6 flex flex-col items-center dir-rtl" dir="rtl">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .flip-wrapper {
          width: 220px;
          height: 320px;
          perspective: 1200px;
          cursor: pointer;
        }
        .flip-wrapper:hover .flip-inner {
          transform: rotateY(180deg);
        }
        .flip-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.75s cubic-bezier(.45,.05,.55,.95);
        }
        .face {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .face-back::before, .face-back::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          border-style: solid;
          border-color: #C9A96E;
          opacity: 0.38;
          z-index: 10;
        }
        .face-back::before { top: 13px; right: 13px; border-width: 1px 1px 0 0; border-radius: 0 3px 0 0; }
        .face-back::after { bottom: 13px; left: 13px; border-width: 0 0 1px 1px; border-radius: 0 0 3px 0; }
        
        .face-back {
          background: #080507;
          border: 1px solid rgba(201,169,110,0.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8), inset 0 0 80px rgba(201,169,110,0.03);
        }
        .face-front {
          transform: rotateY(180deg);
          background: #FFFFFF;
          border: 1px solid #E0C8B0;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
          padding: 0;
          justify-content: stretch;
          align-items: stretch;
          flex-direction: column;
        }
        .word-byond {
          font-family: 'Cinzel', serif;
          background: linear-gradient(180deg, #E8D5B0 0%, #C9A96E 50%, #9A7A48 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .word-intima {
          font-family: 'Cinzel', serif;
          background: linear-gradient(180deg, #E8D5B0 0%, #C9A96E 60%, #9A7A48 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <header className="text-center mb-14 w-full max-w-4xl">
        <div className="font-['Cinzel'] text-[0.58rem] tracking-[0.45em] uppercase text-[#C9A96E] font-light mb-4">couple experience cards</div>
        <h1 className="font-['Cinzel'] text-2xl font-light text-[#F9F3EC] tracking-[0.35em]">
          <span className="text-[#C9A96E]">BYOND</span> INTIMA
        </h1>
        <div className="w-[70px] h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent mx-auto my-4"></div>
        <div className="font-['Cormorant_Garamond'] text-lg italic text-[#E8D5B0] font-light tracking-[0.08em]">{currentCategory?.name}</div>
        
        {/* Category Selector */}
        <div className="mt-8 flex gap-3 overflow-x-auto no-scrollbar pb-4 px-4 justify-start md:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap text-xs tracking-widest uppercase font-['Cinzel'] ${
                selectedCategory === cat.id
                  ? 'bg-[#C9A96E] border-[#C9A96E] text-black'
                  : 'bg-transparent border-[#C9A96E]/30 text-[#C9A96E] hover:border-[#C9A96E]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[0.68rem] text-[#F9F3EC]/30 font-light tracking-[0.15em]">רחף על קלף לגלות את המשימה · {filteredCards.length} משימות</p>
      </header>

      <div className="flex flex-wrap gap-8 justify-center max-w-[1060px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-8 justify-center"
          >
            {filteredCards.map((card) => (
              <div key={card.id} className="flip-wrapper">
                <div className="flip-inner">
                  {/* Back Face */}
                  <div className="face face-back">
                    <div className="absolute w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.10)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%]"></div>
                    <div className="w-11 h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent relative z-10 mb-5"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="word-byond text-[1.6rem] font-normal tracking-[0.42em] leading-none indent-[0.42em]">BYOND</div>
                      <div className="word-intima text-[0.82rem] font-light tracking-[0.55em] mt-[5px] indent-[0.55em]">INTIMA</div>
                    </div>
                    <div className="w-11 h-[1px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent relative z-10 mt-5"></div>
                    <div className="relative z-10 mt-[18px] font-['Cinzel'] text-[0.5rem] tracking-[0.28em] uppercase text-[#C9A96E] border border-[#C9A96E]/30 rounded-[20px] px-[13px] py-[5px] font-light opacity-85">
                      {currentCategory?.name} · {card.id}
                    </div>
                    {card.category === 'food' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateRecipe(card);
                        }}
                        className="relative z-10 mt-4 px-4 py-2 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-full text-[#C9A96E] text-[0.55rem] tracking-widest uppercase font-['Cinzel'] hover:bg-[#C9A96E] hover:text-black transition-all flex items-center gap-2"
                      >
                        <Sparkles size={10} />
                        Generate Recipe
                      </button>
                    )}
                  </div>

                  {/* Front Face */}
                  <div className="face face-front">
                    <div className="w-full flex-[0_0_26%] relative overflow-hidden flex items-center justify-center bg-[#FDF6EE] border-b border-[#EDD8C0]">
                      <div className="absolute top-2 left-3 font-['Cinzel'] text-[0.52rem] font-light tracking-[0.12em] text-[#C9A96E] z-10">{card.id}</div>
                      {card.illustration}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center px-[18px] py-3 text-center">
                      <div className="font-['Cinzel'] text-[0.52rem] tracking-[0.3em] uppercase text-[#C9A96E] font-normal mb-[6px]">{currentCategory?.name}</div>
                      <div className="font-['Cormorant_Garamond'] text-2xl font-semibold leading-[1.15] text-[#2A1208] mb-1">{card.title}</div>
                      <div className="font-['Cormorant_Garamond'] text-base italic font-light text-[#A0522D] mb-[10px]">{card.subtitle}</div>
                      <div className="w-7 h-[1px] bg-[#D4A88A]/50 mx-auto mb-[10px]"></div>
                      <div className="text-[0.82rem] font-light leading-[1.65] text-[#4A2010] max-w-[175px]">{card.desc}</div>
                      <div className="inline-block mt-[10px] bg-[#FDF0E4] border border-[#D4A880] rounded-[20px] px-[13px] py-[5px] text-[0.68rem] font-normal text-[#8B3A1A] tracking-[0.05em] font-['Cormorant_Garamond'] italic">
                        {card.badge}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-center px-6"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="mb-8"
            >
              <ChefHat size={64} className="text-[#C9A96E]" />
            </motion.div>
            <h2 className="text-2xl font-serif text-[#F9F3EC] mb-4 tracking-widest uppercase">השף הדיגיטלי עובד...</h2>
            <p className="text-[#E8D5B0] italic font-light max-w-xs">מרכיב עבורכם מתכון רומנטי שמתאים בדיוק למשימה שבחרתם</p>
            <div className="mt-8 flex gap-2">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-[#C9A96E]" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#C9A96E]" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#C9A96E]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipe Modal */}
      <AnimatePresence>
        {generatedRecipe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#FDF6EE] max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-[30px] relative shadow-2xl border border-[#E0C8B0]"
            >
              <button
                onClick={() => setGeneratedRecipe(null)}
                className="absolute top-6 left-6 p-2 hover:bg-[#C9A96E]/10 rounded-full transition-colors text-[#C9A96E]"
              >
                <X size={24} />
              </button>

              <div className="p-8 md:p-12 text-right" dir="rtl">
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center text-[#C9A96E]">
                    <Utensils size={24} />
                  </div>
                </div>

                <div className="text-center mb-10">
                  <h3 className="text-3xl font-serif text-[#2A1208] mb-3">{generatedRecipe.title}</h3>
                  <p className="text-[#A0522D] italic font-light">{generatedRecipe.description}</p>
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2 text-[#8B3A1A] text-sm">
                      <Clock size={16} />
                      <span>{generatedRecipe.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#8B3A1A] text-sm">
                      <ChefHatIcon size={16} />
                      <span>{generatedRecipe.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <section>
                    <h4 className="text-lg font-serif text-[#C9A96E] mb-4 border-b border-[#C9A96E]/20 pb-2">מצרכים</h4>
                    <ul className="space-y-3">
                      {generatedRecipe.ingredients.map((ing: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-[#4A2010] text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]/50" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-lg font-serif text-[#C9A96E] mb-4 border-b border-[#C9A96E]/20 pb-2">אופן ההכנה</h4>
                    <div className="space-y-6">
                      {generatedRecipe.instructions.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-full bg-[#C9A96E]/10 flex items-center justify-center text-[#C9A96E] text-xs font-serif shrink-0 border border-[#C9A96E]/20">
                            {i + 1}
                          </div>
                          <p className="text-[#4A2010] text-sm leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="mt-12 pt-8 border-t border-[#C9A96E]/20 text-center">
                  <button
                    onClick={() => setGeneratedRecipe(null)}
                    className="px-12 py-4 bg-[#2A1208] text-white rounded-full font-serif tracking-widest uppercase hover:bg-[#C9A96E] transition-all shadow-lg"
                  >
                    בתיאבון!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
