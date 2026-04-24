import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { boutiqueProducts } from './src/data/boutique';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// If firebase-applet-config.json exists, it should be used instead.
// But for a script running in the shell, we might need to read it manually.
import fs from 'fs';
import path from 'path';

let config = firebaseConfig;
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

const app = initializeApp(config);
const db = getFirestore(app, (config as any).firestoreDatabaseId);

async function seedProducts() {
  console.log('Seeding products...');
  const batch = writeBatch(db);
  boutiqueProducts.forEach((product) => {
    const docRef = doc(db, 'products', product.id);
    batch.set(docRef, product);
  });
  await batch.commit();
  console.log('Products seeded successfully!');
}

const initialMovies = [
  {
    id: 1,
    title: "The Notebook",
    overview: "An epic love story centered around an older man who reads aloud to a woman with Alzheimer's, a story of two young lovers whose romance is as timeless as it is beautiful.",
    poster_path: "https://image.tmdb.org/t/p/w500/rNzQ9nbwG1oY7ZqdQw1kyYNB79O.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/qom1oRSTBfA6mSHvPQvREST4z9X.jpg",
    release_date: "2004-06-25",
    vote_average: 7.9,
    genre_ids: [10749, 18]
  },
  {
    id: 2,
    title: "About Time",
    overview: "At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life. His decision to make his world a better place by getting a girlfriend turns out not to be as easy as you might think.",
    poster_path: "https://image.tmdb.org/t/p/w500/i96clndp9pSFE697IwuVhy6pT1j.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/3S7vX2E67S60V3ZshL7Y6d026pX.jpg",
    release_date: "2013-09-04",
    vote_average: 7.9,
    genre_ids: [18, 10749, 14]
  },
  {
    id: 3,
    title: "La La Land",
    overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, are struggling to make ends meet in a city known for crushing hopes and breaking hearts. Set in modern day Los Angeles, this original musical about everyday life explores the joy and pain of pursuing your dreams.",
    poster_path: "https://image.tmdb.org/t/p/w500/u7uS6S3L30v9uV9pS6S3L30v9uV.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/v7D9pS6S3L30v9uV9pS6S3L30v9uV.jpg",
    release_date: "2016-12-09",
    vote_average: 7.9,
    genre_ids: [35, 18, 10749, 10402]
  }
];

async function seedMovies() {
  console.log('Seeding movies...');
  const batch = writeBatch(db);
  initialMovies.forEach((movie) => {
    const docRef = doc(db, 'movies_catalog', movie.id.toString());
    batch.set(docRef, movie);
  });
  await batch.commit();
  console.log('Movies seeded successfully!');
}

async function seedSiteContent() {
  console.log('Seeding site content...');
  const configDoc = {
    siteName: 'Byond Intima',
    conciergeName: 'Byond AI',
    globalAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Byond',
    greetingVideoUrl: ''
  };
  await setDoc(doc(db, 'site_content', 'global_config'), configDoc);
  
  const heroTitle = {
    contentId: 'home_hero_title',
    text: 'Beyond Intimacy. Beyond Connection.'
  };
  await setDoc(doc(db, 'site_content', 'home_hero_title'), heroTitle);

  const heroSubtitle = {
    contentId: 'home_hero_subtitle',
    text: 'מסע זוגי של גילוי, תשוקה וקרבה.'
  };
  await setDoc(doc(db, 'site_content', 'home_hero_subtitle'), heroSubtitle);
  
  console.log('Site content seeded successfully!');
}

async function main() {
  try {
    await seedProducts();
    await seedMovies();
    await seedSiteContent();
    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();
