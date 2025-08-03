const express = require('express');
const router = express.Router();
const database = require('../models/database');

// GET /api/flash-events/:matchId - Retrieve flash events for a match
router.get('/:matchId', (req, res) => {
  const query = `
    SELECT participantId, summonerName, championName, timestamp,
           classification, confidenceScore, startPosX, startPosY,
           endPosX, endPosY
    FROM FlashEvents
    WHERE matchId = ?
    ORDER BY timestamp ASC
  `;

  database.getDb().all(query, [req.params.matchId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;
