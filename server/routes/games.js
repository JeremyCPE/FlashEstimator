const express = require('express');
const router = express.Router();
const database = require('../models/database');

// GET /api/games - Récupérer toutes les parties
router.get('/', (req, res) => {
  const query = `
    SELECT g.*, 
           COUNT(f.id) as flash_count,
           a.status as analysis_status
    FROM games g
    LEFT JOIN flashes f ON g.id = f.game_id
    LEFT JOIN analysis_sessions a ON g.id = a.game_id
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `;
  
  database.getDb().all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET /api/games/:id - Récupérer une partie spécifique
router.get('/:id', (req, res) => {
  const query = `
    SELECT g.*, 
           COUNT(f.id) as flash_count,
           a.status as analysis_status,
           a.total_flashes_detected,
           a.processing_time
    FROM games g
    LEFT JOIN flashes f ON g.id = f.game_id
    LEFT JOIN analysis_sessions a ON g.id = a.game_id
    WHERE g.id = ?
    GROUP BY g.id
  `;
  
  database.getDb().get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Partie non trouvée' });
      return;
    }
    res.json(row);
  });
});

// POST /api/games - Créer une nouvelle partie
router.post('/', (req, res) => {
  const { twitch_vod_url, game_duration, riot_api_key } = req.body;
  
  if (!twitch_vod_url) {
    res.status(400).json({ error: 'URL de la VOD Twitch requise' });
    return;
  }
  
  if (!riot_api_key) {
    res.status(400).json({ error: 'Clé API Riot Games requise' });
    return;
  }
  
  // Validation basique du format de la clé API Riot
  if (!riot_api_key.startsWith('RGAPI-') || riot_api_key.length < 42) {
    res.status(400).json({ error: 'Format de clé API Riot invalide' });
    return;
  }
  
  const query = 'INSERT INTO games (twitch_vod_url, game_duration, riot_api_key) VALUES (?, ?, ?)';
  
  database.getDb().run(query, [twitch_vod_url, game_duration, riot_api_key], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      twitch_vod_url,
      game_duration,
      message: 'Partie créée avec succès'
    });
  });
});

// DELETE /api/games/:id - Supprimer une partie
router.delete('/:id', (req, res) => {
  const query = 'DELETE FROM games WHERE id = ?';
  
  database.getDb().run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Partie non trouvée' });
      return;
    }
    res.json({ message: 'Partie supprimée avec succès' });
  });
});

module.exports = router;