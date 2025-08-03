import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisStatus } from '../services/api';
import '../styles/Analysis.css';

const Analysis = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalysisData();
    
    // Polling pour les analyses en cours
    const interval = setInterval(() => {
      if (analysis && analysis.status === 'processing') {
        loadAnalysisData();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [id, analysis?.status]);

  const loadAnalysisData = async () => {
    try {
      const data = await getAnalysisStatus(id);
      setAnalysis(data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement de l\'analyse: ' + err.message);
      setLoading(false);
    }
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'processing': return 'En cours';
      case 'error': return 'Erreur';
      default: return 'En attente';
    }
  };

  if (loading) {
    return (
      <div className="analysis">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Chargement de l'analyse...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis">
        <div className="container">
          <div className="error-message">Analyse non trouvée</div>
          <Link to="/games" className="btn btn-secondary">
            Retour aux parties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis">
      <div className="container">
        <div className="page-header">
          <div>
            <Link to={`/games/${analysis.game_id}`} className="back-link">
              ← Retour à la partie
            </Link>
            <h2>Analyse #{analysis.id}</h2>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="analysis-overview">
          <div className="card">
            <div className="card-header">
              <h3>Statut de l'Analyse</h3>
            </div>
            <div className="analysis-info">
              <div className="status-section">
                <div className="status-badge-large">
                  <span className={`status-indicator ${getStatusColor(analysis.status)}`}>
                    {getStatusText(analysis.status)}
                  </span>
                  {analysis.status === 'processing' && (
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="analysis-details">
                <div className="detail-item">
                  <label>VOD Twitch:</label>
                  <a href={analysis.twitch_vod_url} target="_blank" rel="noopener noreferrer">
                    {analysis.twitch_vod_url}
                  </a>
                </div>
                
                <div className="detail-item">
                  <label>Démarrée le:</label>
                  <span>
                    {new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {analysis.completed_at && (
                  <div className="detail-item">
                    <label>Terminée le:</label>
                    <span>
                      {new Date(analysis.completed_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                <div className="detail-item">
                  <label>Temps de traitement:</label>
                  <span>{formatDuration(analysis.processing_time)}</span>
                </div>

                <div className="detail-item">
                  <label>Flashs détectés:</label>
                  <span className="flash-count">
                    {analysis.total_flashes_detected || 0}
                  </span>
                </div>

                {analysis.error_message && (
                  <div className="detail-item">
                    <label>Message d'erreur:</label>
                    <span className="error-text">{analysis.error_message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {analysis.status === 'processing' && (
          <div className="processing-info">
            <div className="card">
              <div className="card-header">
                <h3>Analyse en cours...</h3>
              </div>
              <div className="processing-steps">
                <div className="step completed">
                  <div className="step-icon">✓</div>
                  <div className="step-text">Téléchargement de la VOD</div>
                </div>
                <div className="step processing">
                  <div className="step-icon">
                    <div className="spinner small"></div>
                  </div>
                  <div className="step-text">Extraction des frames</div>
                </div>
                <div className="step pending">
                  <div className="step-icon">○</div>
                  <div className="step-text">Détection des flashs</div>
                </div>
                <div className="step pending">
                  <div className="step-icon">○</div>
                  <div className="step-text">Classification et synchronisation</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysis.status === 'completed' && (
          <div className="results-summary">
            <div className="card">
              <div className="card-header">
                <h3>Résultats de l'Analyse</h3>
              </div>
              <div className="results-grid">
                <div className="result-item">
                  <div className="result-number">{analysis.total_flashes_detected}</div>
                  <div className="result-label">Flashs détectés</div>
                </div>
                <div className="result-item">
                  <div className="result-number">{formatDuration(analysis.processing_time)}</div>
                  <div className="result-label">Temps de traitement</div>
                </div>
              </div>
              
              <div className="action-buttons">
                <Link to={`/games/${analysis.game_id}`} className="btn btn-primary">
                  Voir les résultats détaillés
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;