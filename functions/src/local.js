// Local development: the same API, with firebase-admin pointed at the project
// but without server credentials (token checks work; Firestore writes are skipped).
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createApp } from './app.js';

export const createLocalApp = () => {
  const admin = initializeApp({ projectId: 'byondintima-d1d4e' });
  return createApp({
    db: () => getFirestore(admin, 'ai-studio-1369fc46-d67d-482a-b4c5-dae7d8c9dda1'),
    auth: () => getAuth(admin),
    baseUrl: () => process.env.APP_URL || 'http://localhost:3000',
    dev: true,
  });
};
