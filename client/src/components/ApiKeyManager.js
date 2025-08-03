import React, { useState, useEffect } from 'react';
import '../styles/ApiKeyManager.css';

const ApiKeyManager = ({ onApiKeyChange, initialValue = '' }) => {
  const [apiKey, setApiKey] = useState(initialValue);
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    validateApiKey(apiKey);
  }, [apiKey]);

  const validateApiKey = (key) => {
    setError('');
    
    if (!key) {
      setIsValid(false);
      return;
    }

    // Validation du format de la clé API Riot
    if (!key.startsWith('RGAPI-')) {
      setError('La clé API doit commencer par "RGAPI-"');
      setIsValid(false);
      return;
    }

    if (key.length < 42) {
      setError('La clé API semble trop courte');
      setIsValid(false);
      return;
    }

    // Pattern basique pour une clé Riot API
    const riotApiPattern = /^RGAPI-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!riotApiPattern.test(key)) {
      setError('Format de clé API invalide');
      setIsValid(false);
      return;
    }

    setIsValid(true);
  };

  const handleApiKeyChange = (value) => {
    setApiKey(value);
    if (onApiKeyChange) {
      onApiKeyChange(value);
    }
  };

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  const clearApiKey = () => {
    setApiKey('');
    if (onApiKeyChange) {
      onApiKeyChange('');
    }
  };

  return (
    <div className="api-key-manager">
      <div className="api-key-input-group">
        <div className="input-wrapper">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className={`api-key-input ${isValid ? 'valid' : ''} ${error ? 'error' : ''}`}
          />
          
          <div className="input-actions">
            <button
              type="button"
              onClick={toggleShowKey}
              className="toggle-visibility-btn"
              title={showKey ? 'Masquer la clé' : 'Afficher la clé'}
            >
              {showKey ? '👁️' : '👁️‍🗨️'}
            </button>
            
            {apiKey && (
              <button
                type="button"
                onClick={clearApiKey}
                className="clear-btn"
                title="Effacer la clé"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {isValid && (
          <div className="validation-indicator valid">
            ✓ Clé API valide
          </div>
        )}
        
        {error && (
          <div className="validation-indicator error">
            ⚠️ {error}
          </div>
        )}
      </div>

      <div className="api-key-help">
        <div className="help-section">
          <h4>Comment obtenir votre clé API Riot ?</h4>
          <ol>
            <li>
              Rendez-vous sur{' '}
              <a 
                href="https://developer.riotgames.com/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                developer.riotgames.com
              </a>
            </li>
            <li>Connectez-vous avec votre compte Riot Games</li>
            <li>Cliquez sur "Generate API Key"</li>
            <li>Copiez la clé générée (elle commence par "RGAPI-")</li>
          </ol>
        </div>

        <div className="help-section">
          <h4>Sécurité</h4>
          <p>
            Votre clé API est stockée temporairement pour cette session uniquement. 
            Elle n'est pas sauvegardée de manière permanente sur nos serveurs.
          </p>
        </div>

        <div className="help-section">
          <h4>Limitations</h4>
          <ul>
            <li>Les clés de développement ont une limite de 100 requêtes par 2 minutes</li>
            <li>Les clés expirent après 24 heures</li>
            <li>Une nouvelle clé doit être générée quotidiennement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;