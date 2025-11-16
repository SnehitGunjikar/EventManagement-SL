const express = require('express');
const { 
    createEvent, 
    getEventsByProfile,
    updateEvent
} = require('../controllers/eventController');

const router = express.Router();

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`Event route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// POST /api/events - Create an event
router.post('/', createEvent);

// GET /api/events/:profileId - Get all events for a specific profile
router.get('/:profileId', getEventsByProfile);

// PUT /api/events/:id - Update a specific event
router.put('/:id', updateEvent);

module.exports = router;