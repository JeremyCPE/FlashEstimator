const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'flash_analysis.db');
const db = new sqlite3.Database(dbPath);

// Initialize FlashEvents table
const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS FlashEvents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      matchId TEXT,
      timestamp INTEGER,
      participantId INTEGER,
      puuid TEXT,
      summonerName TEXT,
      championName TEXT,
      classification TEXT,
      confidenceScore REAL,
      startPosX INTEGER,
      startPosY INTEGER,
      endPosX INTEGER,
      endPosY INTEGER
    )`);
  });
};

init();

module.exports = db;
