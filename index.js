const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Ensure database is initialized
require('./db');

const flashEventsRoute = require('./routes/flashEvents');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/flashevents', flashEventsRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
