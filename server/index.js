const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Upload configuration
const upload = multer({ dest: 'uploads/' });

// Routes
app.use('/api/games', require('./routes/games'));
app.use('/api/flashes', require('./routes/flashes'));
app.use('/api/flash-events', require('./routes/flash-events'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/match', require('./routes/match'));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});