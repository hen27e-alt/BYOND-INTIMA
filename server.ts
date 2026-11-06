// Local development server: the site's API (the same code that runs in Firebase
// Functions, see functions/src/app.js) plus Vite for the front end.
import express from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
// @ts-ignore: plain JS module shared with Firebase Functions
import { createLocalApp } from './functions/src/local.js';

dotenv.config();

const PORT = 3000;

const start = async () => {
  const app = express();
  app.use(createLocalApp());
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));
};

start();
