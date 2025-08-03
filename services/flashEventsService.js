const db = require('../db');

function getAllFlashEvents() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM FlashEvents', [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function createFlashEvent(event) {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO FlashEvents (
      matchId, timestamp, participantId, puuid, summonerName,
      championName, classification, confidenceScore,
      startPosX, startPosY, endPosX, endPosY
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      event.matchId,
      event.timestamp,
      event.participantId,
      event.puuid,
      event.summonerName,
      event.championName,
      event.classification,
      event.confidenceScore,
      event.startPosX,
      event.startPosY,
      event.endPosX,
      event.endPosY
    ];
    db.run(query, params, function(err) {
      if (err) {
        return reject(err);
      }
      resolve(this.lastID);
    });
  });
}

module.exports = {
  getAllFlashEvents,
  createFlashEvent
};
