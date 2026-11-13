const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
const config = require("./config");
const app = express();
const PORT = 8000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ChoppedifyDB",
  password: config.dbPassword,
  port: 5432,
});

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Server is working" });
});

app.use("/audio", express.static(path.join(__dirname, "music")));

app.get("/api/tracks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tracks ORDER BY title");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load tracks" });
  }
});

app.get("/api/tracks/:id/reviews", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, rating, comment, created_at FROM reviews WHERE track_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load reviews" });
  }
});

app.post("/api/tracks/:id/reviews", async (req, res) => {
  const { rating, comment } = req.body;
  const stars = Number(rating);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "Rating must be 1 to 5" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reviews (track_id, rating, comment)
       VALUES ($1, $2, $3)
       RETURNING id, rating, comment, created_at`,
      [req.params.id, stars, (comment || "").slice(0, 1000)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save review" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});