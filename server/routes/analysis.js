const express = require('express');
const router = express.Router();
const database = require('../models/database');

// POST /api/analysis/start/:gameId - Démarrer l'analyse d'une partie
router.post('/start/:gameId', async (req, res) => {
  const gameId = req.params.gameId;
  
  try {
    // Vérifier si la partie existe
    const gameQuery = 'SELECT * FROM games WHERE id = ?';
    database.getDb().get(gameQuery, [gameId], (err, game) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!game) {
        res.status(404).json({ error: 'Partie non trouvée' });
        return;
      }
      
      // Créer une session d'analyse
      const analysisQuery = `
        INSERT INTO analysis_sessions (game_id, status) 
        VALUES (?, 'processing')
      `;
      
      database.getDb().run(analysisQuery, [gameId], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Ici on démarrerait le processus d'analyse réel
        // Pour l'instant, on simule avec un délai
        setTimeout(() => {
          simulateAnalysis(gameId, this.lastID);
        }, 1000);
        
        res.json({
          analysis_id: this.lastID,
          message: 'Analyse démarrée',
          status: 'processing'
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analysis/status/:analysisId - Récupérer le statut d'une analyse
router.get('/status/:analysisId', (req, res) => {
  const query = `
    SELECT a.*, g.twitch_vod_url 
    FROM analysis_sessions a 
    JOIN games g ON a.game_id = g.id 
    WHERE a.id = ?
  `;
  
  database.getDb().get(query, [req.params.analysisId], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Session d\'analyse non trouvée' });
      return;
    }
    res.json(row);
  });
});

// GET /api/analysis/game/:gameId - Récupérer les analyses d'une partie
router.get('/game/:gameId', (req, res) => {
  const query = `
    SELECT * FROM analysis_sessions 
    WHERE game_id = ? 
    ORDER BY created_at DESC
  `;
  
  database.getDb().all(query, [req.params.gameId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Fonction de simulation d'analyse (à remplacer par la vraie logique)
function simulateAnalysis(gameId, analysisId) {
  const startTime = Date.now();
  
  // Simuler la détection de flashs
  const simulatedFlashes = [
    {
      player_name: 'Player1',
      champion: 'Ezreal',
      timestamp_game: 120000, // 2 minutes
      timestamp_video: 125000, // 2:05 minutes
      flash_type: 'flash-out',
      x_coordinate: 150.5,
      y_coordinate: 200.3,
      confidence_score: 0.95
    },
    {
      player_name: 'Player2',
      champion: 'Jinx',
      timestamp_game: 180000, // 3 minutes
      timestamp_video: 185000, // 3:05 minutes
      flash_type: 'flash-in',
      x_coordinate: 300.2,
      y_coordinate: 150.8,
      confidence_score: 0.87
    }
  ];
  
  // Insérer les flashs simulés
  const flashQuery = `
    INSERT INTO flashes (
      game_id, player_name, champion, timestamp_game, timestamp_video,
      flash_type, x_coordinate, y_coordinate, confidence_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  simulatedFlashes.forEach(flash => {
    database.getDb().run(flashQuery, [
      gameId, flash.player_name, flash.champion,
      flash.timestamp_game, flash.timestamp_video,
      flash.flash_type, flash.x_coordinate, flash.y_coordinate,
      flash.confidence_score
    ]);
  });
  
  // Mettre à jour la session d'analyse
  const processingTime = Date.now() - startTime;
  const updateQuery = `
    UPDATE analysis_sessions 
    SET status = 'completed', 
        total_flashes_detected = ?, 
        processing_time = ?,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  database.getDb().run(updateQuery, [
    simulatedFlashes.length, 
    processingTime, 
    analysisId
  ], (err) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de l\'analyse:', err);
    } else {
      console.log(`Analyse ${analysisId} terminée avec ${simulatedFlashes.length} flashs détectés`);
    }
  });
}

module.exports = router;