import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../services/api';
import ApiKeyManager from '../components/ApiKeyManager';
import '../styles/Home.css';

const Home = () => {
  const [twitchUrl, setTwitchUrl] = useState('');
  const [gameDuration, setGameDuration] = useState('');
  const [riotApiKey, setRiotApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const gameData = {
        twitch_vod_url: twitchUrl,
        game_duration: gameDuration ? parseInt(gameDuration) : null,
        riot_api_key: riotApiKey
      };

      const response = await createGame(gameData);
      navigate(`/games/${response.id}`);
    } catch (err) {
      setError('Erreur lors de la création de la partie: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      <div className="home-container">
        <div className="hero-section">
          <h2>Analyseur de Flashs League of Legends</h2>
          <p>
            Analysez automatiquement les VOD Twitch pour détecter et classifier 
            tous les Flashs d'une partie de League of Legends.
          </p>
        </div>

        <div className="form-section">
          <h3>Nouvelle Analyse</h3>
          <form onSubmit={handleSubmit} className="game-form">
            <div className="form-group">
              <label htmlFor="twitchUrl">URL de la VOD Twitch *</label>
              <input
                type="url"
                id="twitchUrl"
                value={twitchUrl}
                onChange={(e) => setTwitchUrl(e.target.value)}
                placeholder="https://www.twitch.tv/videos/..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gameDuration">Durée de la partie (secondes)</label>
              <input
                type="number"
                id="gameDuration"
                value={gameDuration}
                onChange={(e) => setGameDuration(e.target.value)}
                placeholder="Ex: 1800 (30 minutes)"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="riotApiKey">Clé API Riot Games *</label>
              <ApiKeyManager 
                onApiKeyChange={setRiotApiKey}
                initialValue={riotApiKey}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer la Partie'}
            </button>
          </form>
        </div>

        <div className="features-section">
          <h3>Fonctionnalités</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>Détection Automatique</h4>
              <p>Détection automatique des Flashs dans les VOD Twitch</p>
            </div>
            <div className="feature-card">
              <h4>Classification</h4>
              <p>Classification en Flash-in et Flash-out avec coordonnées</p>
            </div>
            <div className="feature-card">
              <h4>Synchronisation</h4>
              <p>Synchronisation précise avec le timestamp de la vidéo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;