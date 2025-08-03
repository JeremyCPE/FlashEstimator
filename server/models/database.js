const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function getDb() {
  if (!db) {
    const dbPath = path.join(__dirname, '../../data.sqlite');
    db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS FlashEvents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id TEXT,
        participant_id INTEGER,
        timestamp INTEGER,
        before_x REAL,
        before_y REAL,
        after_x REAL,
        after_y REAL,
        flash_type TEXT,
        confidence_score REAL
      )`);
    });
  }
  return db;
}

module.exports = { getDb };
