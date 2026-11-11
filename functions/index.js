// Firebase Functions entry: the whole /api lives in one function, reached through
// the hosting rewrite in firebase.json. Keys are Secret Manager secrets.
import { readFileSync } from 'node:fs';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createApp } from './src/app.js';

const DATABASE_ID = 'ai-studio-1369fc46-d67d-482a-b4c5-dae7d8c9dda1';
// Only the secrets listed in secrets.json are bound: a deploy fails on a secret that doesn't
// exist yet. Add a key with `firebase functions:secrets:set NAME`, list it there, redeploy.
// Known: GEMINI_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, TMDB_API_KEY, RESEND_API_KEY.
// Without a key its feature stays off (the app checks process.env for each).
const secrets = JSON.parse(readFileSync(new URL('./secrets.json', import.meta.url), 'utf8')).map((n) => defineSecret(n));

const admin = initializeApp();
const app = createApp({
  db: () => getFirestore(admin, DATABASE_ID),
  auth: () => getAuth(admin),
  baseUrl: (req) => process.env.APP_URL || `https://${req.get('x-forwarded-host') || req.get('host')}`,
});

export const api = onRequest({ region: 'us-central1', invoker: 'public', secrets, memory: '512MiB', timeoutSeconds: 120, maxInstances: 10 }, app);
