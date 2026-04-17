import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "checklist.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS features (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    name TEXT NOT NULL,
    phases_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

export default db;