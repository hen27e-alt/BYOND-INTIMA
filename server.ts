import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("movies.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS user_movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    watched BOOLEAN DEFAULT 0,
    rating INTEGER DEFAULT 0,
    user_notes TEXT,
    watch_date TEXT,
    is_favorite BOOLEAN DEFAULT 0,
    UNIQUE(movie_id, user_id)
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  // TMDB Proxy Routes
  app.get("/api/movies/search", async (req, res) => {
    const { query } = req.query;
    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=he-IL`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/popular", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=he-IL`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/top_rated", async (req, res) => {
    try {
      const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=he-IL`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/genre/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${id}&language=he-IL&sort_by=popularity.desc`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  app.get("/api/movies/details/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [movieRes, videoRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=he-IL`),
        fetch(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`) // Videos often better in English
      ]);
      const movieData = await movieRes.json();
      const videoData = await videoRes.json();
      res.json({ ...movieData, videos: videoData.results });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch from TMDB" });
    }
  });

  // User Movie Data Routes
  app.get("/api/user/movies", (req, res) => {
    const { user_id } = req.query;
    const movies = db.prepare("SELECT * FROM user_movies WHERE user_id = ?").all(user_id);
    res.json(movies);
  });

  app.post("/api/user/movies/update", (req, res) => {
    const { movie_id, user_id, watched, rating, user_notes, watch_date, is_favorite } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO user_movies (movie_id, user_id, watched, rating, user_notes, watch_date, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(movie_id, user_id) DO UPDATE SET
        watched = excluded.watched,
        rating = excluded.rating,
        user_notes = excluded.user_notes,
        watch_date = excluded.watch_date,
        is_favorite = excluded.is_favorite
    `);
    
    stmt.run(movie_id, user_id, watched ? 1 : 0, rating, user_notes, watch_date, is_favorite ? 1 : 0);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
