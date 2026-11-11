// Firebase Functions entry: the whole /api lives in one function, reached through
// the hosting rewrite in firebase.json. Keys are Secret Manager secrets.
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createApp } from './src/app.js';

const DATABASE_ID = 'ai-studio-1369fc46-d67d-482a-b4c5-dae7d8c9dda1';
const secrets = ['GEMINI_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'TMDB_API_KEY', 'RESEND_API_KEY'].map((n) => defineSecret(n));

const admin = initializeApp();
const app = createApp({
  db: () => getFirestore(admin, DATABASE_ID),
  auth: () => getAuth(admin),
  baseUrl: (req) => process.env.APP_URL || `https://${req.get('x-forwarded-host') || req.get('host')}`,
});

export const api = onRequest({ region: 'us-central1', secrets, memory: '512MiB', timeoutSeconds: 120, maxInstances: 10 }, app);
