const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const express = require("express");
const fetch = require("node-fetch");

setGlobalOptions({ maxInstances: 10 });

const app = express();
app.use(express.json());

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

app.get("/movies/search", async (req, res) => {
  const { query } = req.query;
  const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=he-IL`);
  const data = await response.json();
  res.json(data);
});

app.get("/movies/popular", async (req, res) => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=he-IL`);
  const data = await response.json();
  res.json(data);
});

app.get("/movies/top_rated", async (req, res) => {
  const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=he-IL`);
  const data = await response.json();
  res.json(data);
});

app.get("/movies/genre/:id", async (req, res) => {
  const { id } = req.params;
  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${id}&language=he-IL&sort_by=popularity.desc`);
  const data = await response.json();
  res.json(data);
});

app.get("/movies/details/:id", async (req, res) => {
  const { id } = req.params;
  const [movieRes, videoRes] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=he-IL`),
    fetch(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`)
  ]);
  const movieData = await movieRes.json();
  const videoData = await videoRes.json();
  res.json({ ...movieData, videos: videoData.results });
});

exports.api = onRequest(app);