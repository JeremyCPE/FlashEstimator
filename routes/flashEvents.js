const express = require('express');
const router = express.Router();
const flashEventsService = require('../services/flashEventsService');

router.get('/', async (req, res) => {
  try {
    const events = await flashEventsService.getAllFlashEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = await flashEventsService.createFlashEvent(req.body);
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
