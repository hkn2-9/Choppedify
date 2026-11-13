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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});