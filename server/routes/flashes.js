const express = require('express');
const router = express.Router();
const database = require('../models/database');

// GET /api/flashes - Récupérer tous les flashs (avec filtres optionnels)
router.get('/', (req, res) => {
  const { game_id, flash_type, player_name } = req.query;
  
  let query = `
    SELECT f.*, g.twitch_vod_url 
    FROM flashes f 
    JOIN games g ON f.game_id = g.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (game_id) {
    query += ' AND f.game_id = ?';
    params.push(game_id);
  }
  
  if (flash_type) {
    query += ' AND f.flash_type = ?';
    params.push(flash_type);
  }
  
  if (player_name) {
    query += ' AND f.player_name LIKE ?';
    params.push(`%${player_name}%`);
  }
  
  query += ' ORDER BY f.timestamp_game ASC';
  
  database.getDb().all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET /api/flashes/:id - Récupérer un flash spécifique
router.get('/:id', (req, res) => {
  const query = `
    SELECT f.*, g.twitch_vod_url 
    FROM flashes f 
    JOIN games g ON f.game_id = g.id 
    WHERE f.id = ?
  `;
  
  database.getDb().get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Flash non trouvé' });
      return;
    }
    res.json(row);
  });
});

// POST /api/flashes - Ajouter un nouveau flash
router.post('/', (req, res) => {
  const {
    game_id,
    player_name,
    champion,
    timestamp_game,
    timestamp_video,
    flash_type,
    x_coordinate,
    y_coordinate,
    confidence_score
  } = req.body;
  
  if (!game_id || !timestamp_game || !timestamp_video || !flash_type) {
    res.status(400).json({ 
      error: 'game_id, timestamp_game, timestamp_video et flash_type sont requis' 
    });
    return;
  }
  
  if (!['flash-in', 'flash-out'].includes(flash_type)) {
    res.status(400).json({ 
      error: 'flash_type doit être "flash-in" ou "flash-out"' 
    });
    return;
  }
  
  const query = `
    INSERT INTO flashes (
      game_id, player_name, champion, timestamp_game, timestamp_video,
      flash_type, x_coordinate, y_coordinate, confidence_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  database.getDb().run(query, [
    game_id, player_name, champion, timestamp_game, timestamp_video,
    flash_type, x_coordinate, y_coordinate, confidence_score
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      id: this.lastID,
      message: 'Flash ajouté avec succès'
    });
  });
});

// PUT /api/flashes/:id - Mettre à jour un flash
router.put('/:id', (req, res) => {
  const {
    player_name,
    champion,
    timestamp_game,
    timestamp_video,
    flash_type,
    x_coordinate,
    y_coordinate,
    confidence_score
  } = req.body;
  
  if (flash_type && !['flash-in', 'flash-out'].includes(flash_type)) {
    res.status(400).json({ 
      error: 'flash_type doit être "flash-in" ou "flash-out"' 
    });
    return;
  }
  
  const query = `
    UPDATE flashes SET 
      player_name = COALESCE(?, player_name),
      champion = COALESCE(?, champion),
      timestamp_game = COALESCE(?, timestamp_game),
      timestamp_video = COALESCE(?, timestamp_video),
      flash_type = COALESCE(?, flash_type),
      x_coordinate = COALESCE(?, x_coordinate),
      y_coordinate = COALESCE(?, y_coordinate),
      confidence_score = COALESCE(?, confidence_score)
    WHERE id = ?
  `;
  
  database.getDb().run(query, [
    player_name, champion, timestamp_game, timestamp_video,
    flash_type, x_coordinate, y_coordinate, confidence_score, req.params.id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Flash non trouvé' });
      return;
    }
    res.json({ message: 'Flash mis à jour avec succès' });
  });
});

// DELETE /api/flashes/:id - Supprimer un flash
router.delete('/:id', (req, res) => {
  const query = 'DELETE FROM flashes WHERE id = ?';
  
  database.getDb().run(query, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Flash non trouvé' });
      return;
    }
    res.json({ message: 'Flash supprimé avec succès' });
  });
});

module.exports = router;