import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGames, deleteGame } from '../services/api';
import '../styles/GameList.css';

const GameList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await getGames();
      setGames(data);
    } catch (err) {
      setError('Erreur lors du chargement des parties: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (gameId, e) => {
    e.preventDefault();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette partie ?')) {
      try {
        await deleteGame(gameId);
        setGames(games.filter(game => game.id !== gameId));
      } catch (err) {
        setError('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Non spécifiée';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status, flashCount) => {
    if (status === 'completed') {
      return <span className="status-badge completed">{flashCount} flashs détectés</span>;
    } else if (status === 'processing') {
      return <span className="status-badge processing">En cours d'analyse</span>;
    } else if (status === 'error') {
      return <span className="status-badge error">Erreur</span>;
    } else {
      return <span className="status-badge pending">En attente</span>;
    }
  };

  if (loading) {
    return (
      <div className="game-list">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement des parties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-list">
      <div className="container">
        <div className="page-header">
          <h2>Parties Analysées</h2>
          <Link to="/" className="btn btn-primary">
            Nouvelle Partie
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {games.length === 0 ? (
          <div className="empty-state">
            <h3>Aucune partie trouvée</h3>
            <p>Commencez par créer votre première analyse depuis la page d'accueil.</p>
            <Link to="/" className="btn btn-primary">
              Créer une Partie
            </Link>
          </div>
        ) : (
          <div className="games-grid">
            {games.map(game => (
              <Link 
                key={game.id} 
                to={`/games/${game.id}`} 
                className="game-card"
              >
                <div className="card-header">
                  <h3>Partie #{game.id}</h3>
                  <button 
                    onClick={(e) => handleDelete(game.id, e)}
                    className="delete-btn"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
                
                <div className="card-content">
                  <div className="game-info">
                    <p className="twitch-url">
                      <strong>VOD:</strong> {game.twitch_vod_url}
                    </p>
                    <p className="duration">
                      <strong>Durée:</strong> {formatDuration(game.game_duration)}
                    </p>
                    <p className="created-at">
                      <strong>Créée:</strong> {new Date(game.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div className="game-stats">
                    {getStatusBadge(game.analysis_status, game.flash_count)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameList;