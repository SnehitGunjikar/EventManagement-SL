
const express = require('express');
const { createProfile, getAllProfiles } = require('../controllers/profController');

const router = express.Router();

// Middleware to log requests to this route
router.use((req, res, next) => {
  console.log(`Profile route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// POST /api/profiles - To create a new profile
router.post('/', createProfile);

// GET /api/profiles - To get the list of all profiles
router.get('/', getAllProfiles);

module.exports = router;