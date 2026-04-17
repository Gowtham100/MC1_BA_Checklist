import express from "express";
import cors from "cors";
import db from "./db";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/features", (_req, res) => {
  const rows = db
    .prepare(
      `
      SELECT id, number, name, phases_json, created_at
      FROM features
      ORDER BY datetime(created_at) DESC
    `
    )
    .all();

  const features = rows.map((row: any) => ({
    id: row.id,
    number: row.number,
    name: row.name,
    phases: JSON.parse(row.phases_json),
    createdAt: row.created_at,
  }));

  res.json(features);
});

app.post("/api/features", (req, res) => {
  const { id, number, name, phases, createdAt } = req.body;

  if (!id || !number || !name || !phases || !createdAt) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.prepare(
    `
    INSERT INTO features (id, number, name, phases_json, created_at)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(id, number, name, JSON.stringify(phases), createdAt);

  res.status(201).json({ success: true });
});

app.put("/api/features/:id", (req, res) => {
  const { id } = req.params;
  const { number, name, phases } = req.body;

  db.prepare(
    `
    UPDATE features
    SET number = ?, name = ?, phases_json = ?
    WHERE id = ?
  `
  ).run(number, name, JSON.stringify(phases), id);

  res.json({ success: true });
});

app.delete("/api/features/:id", (req, res) => {
  const { id } = req.params;

  db.prepare(`DELETE FROM features WHERE id = ?`).run(id);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});