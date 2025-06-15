const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

// POST a new level
router.post("/", async (req, res) => {
  const { level_id, name, width, height, terrain, enemy_pieces } = req.body;

  if (!level_id || !name || !width || !height || !terrain || !enemy_pieces) {
    return res.status(400).json({ error: "Missing level data" });
  }

  try {
    await pool.query(
      `INSERT INTO levels (level_id, name, width, height, terrain, enemy_pieces)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        level_id,
        name,
        width,
        height,
        JSON.stringify(terrain),
        JSON.stringify(enemy_pieces),
      ]
    );
    res.status(201).json({ message: "Level saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save level" });
  }
});

// GET all level summaries
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT level_id, name FROM levels ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch levels" });
  }
});

// GET a full level by level_id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM levels WHERE level_id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Level not found" });
    }

    const level = result.rows[0];

    // Only parse if data is a string
    if (typeof level.terrain === "string") {
      level.terrain = JSON.parse(level.terrain);
    }

    if (typeof level.enemy_pieces === "string") {
      level.enemy_pieces = JSON.parse(level.enemy_pieces);
    }

    res.json(level);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch level" });
  }
});

module.exports = router;
