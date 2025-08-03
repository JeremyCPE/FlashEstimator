import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGame, getFlashes, startAnalysis } from '../services/api';
import '../styles/GameDetail.css';

const GameDetail = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [flashes, setFlashes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGameData();
  }, [id]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      const [gameData, flashesData] = await Promise.all([
        getGame(id),
        getFlashes({ game_id: id })
      ]);
      setGame(gameData);
      setFlashes(flashesData);
    } catch (err) {
      setError('Erreur lors du chargement des données: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const response = await startAnalysis(id);
      
      // Simuler un délai pour l'analyse
      setTimeout(() => {
        loadGameData();
        setAnalyzing(false);
      }, 3000);
      
    } catch (err) {
      setError('Erreur lors du démarrage de l\'analyse: ' + err.message);
      setAnalyzing(false);
    }
  };

  const formatTimestamp = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Non spécifiée';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="game-detail">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement de la partie...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-detail">
        <div className="container">
          <div className="error-message">Partie non trouvée</div>
          <Link to="/games" className="btn btn-secondary">
            Retour aux parties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="game-detail">
      <div className="container">
        <div className="page-header">
          <div>
            <Link to="/games" className="back-link">
              ← Retour aux parties
            </Link>
            <h2>Partie #{game.id}</h2>
          </div>
          
          {game.analysis_status !== 'completed' && (
            <button 
              onClick={handleStartAnalysis}
              disabled={analyzing || game.analysis_status === 'processing'}
              className="btn btn-primary"
            >
              {analyzing || game.analysis_status === 'processing' 
                ? 'Analyse en cours...' 
                : 'Démarrer l\'analyse'
              }
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="game-info-section">
          <div className="card">
            <div className="card-header">
              <h3>Informations de la Partie</h3>
            </div>
            <div className="game-details">
              <div className="info-item">
                <label>URL Twitch:</label>
                <a href={game.twitch_vod_url} target="_blank" rel="noopener noreferrer">
                  {game.twitch_vod_url}
                </a>
              </div>
              <div className="info-item">
                <label>Durée:</label>
                <span>{formatDuration(game.game_duration)}</span>
              </div>
              <div className="info-item">
                <label>Créée le:</label>
                <span>{new Date(game.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="info-item">
                <label>Statut:</label>
                <span className={`status ${game.analysis_status}`}>
                  {game.analysis_status === 'completed' ? 'Terminée' :
                   game.analysis_status === 'processing' ? 'En cours' :
                   game.analysis_status === 'error' ? 'Erreur' : 'En attente'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flashes-section">
          <div className="card">
            <div className="card-header">
              <h3>Flashs Détectés ({flashes.length})</h3>
            </div>
            
            {flashes.length === 0 ? (
              <div className="empty-flashes">
                <p>
                  {game.analysis_status === 'completed' 
                    ? 'Aucun flash détecté dans cette partie.'
                    : 'Aucun flash détecté pour le moment. Lancez l\'analyse pour détecter les flashs.'
                  }
                </p>
              </div>
            ) : (
              <div className="flashes-table">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Joueur</th>
                      <th>Champion</th>
                      <th>Temps (Jeu)</th>
                      <th>Temps (Vidéo)</th>
                      <th>Type</th>
                      <th>Confiance</th>
                      <th>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flashes.map(flash => (
                      <tr key={flash.id}>
                        <td>{flash.player_name || 'Inconnu'}</td>
                        <td>{flash.champion || 'Inconnu'}</td>
                        <td>{formatTimestamp(flash.timestamp_game)}</td>
                        <td>{formatTimestamp(flash.timestamp_video)}</td>
                        <td>
                          <span className={`flash-type ${flash.flash_type}`}>
                            {flash.flash_type === 'flash-in' ? 'Flash In' : 'Flash Out'}
                          </span>
                        </td>
                        <td>
                          {flash.confidence_score 
                            ? `${Math.round(flash.confidence_score * 100)}%`
                            : 'N/A'
                          }
                        </td>
                        <td>
                          {flash.x_coordinate && flash.y_coordinate
                            ? `(${Math.round(flash.x_coordinate)}, ${Math.round(flash.y_coordinate)})`
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetail;