const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

const profRoutes = require('./routes/profRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mock data for testing when database is unavailable
const mockProfiles = [
  { _id: 'mock1', name: 'Anuj Kumar', timezone: 'America/New_York' },
  { _id: 'mock2', name: 'Test User', timezone: 'UTC' }
];

const mockEvents = [
  {
    _id: 'event1',
    profiles: ['mock1'],
    eventTimezone: 'America/New_York',
    startDateTime: new Date('2025-11-20T10:00:00Z'),
    endDateTime: new Date('2025-11-20T11:00:00Z'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Try to connect to database, but continue with mock data if connection fails
let dbConnected = false;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    dbConnected = true;
  })
  .catch(err => {
    console.warn('⚠️  MongoDB connection failed, using mock data:', err.message);
    console.log('💡 To fix: Add your current IP to MongoDB Atlas whitelist');
    dbConnected = false;
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'running', 
    database: dbConnected ? 'connected' : 'disconnected (using mock data)',
    timestamp: new Date().toISOString()
  });
});

// Mock profiles endpoint (fallback when DB is unavailable)
app.get('/api/profiles', (req, res) => {
  if (dbConnected) {
    // Use actual database routes when connected
    return profRoutes(req, res);
  } else {
    // Use mock data when database is unavailable
    console.log('Using mock profiles data');
    res.json(mockProfiles);
  }
});

app.post('/api/profiles', (req, res) => {
  if (dbConnected) {
    return profRoutes(req, res);
  } else {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Profile name is required.' });
    }
    
    const newProfile = {
      _id: 'mock' + Date.now(),
      name: name,
      timezone: 'America/New_York'
    };
    
    mockProfiles.push(newProfile);
    console.log('Created mock profile:', newProfile);
    res.status(201).json(newProfile);
  }
});

// Mock events endpoint (fallback when DB is unavailable)
app.get('/api/events/:profileId', (req, res) => {
  if (dbConnected) {
    return eventRoutes(req, res);
  } else {
    const { profileId } = req.params;
    console.log('Using mock events data for profile:', profileId);
    const profileEvents = mockEvents.filter(event => 
      event.profiles.includes(profileId)
    );
    res.json(profileEvents);
  }
});

app.post('/api/events', (req, res) => {
  if (dbConnected) {
    return eventRoutes(req, res);
  } else {
    const { profiles, eventTimezone, startDateTime, endDateTime } = req.body;
    
    if (!profiles || profiles.length === 0 || !eventTimezone || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'All event fields are required.' });
    }
    
    const newEvent = {
      _id: 'event' + Date.now(),
      profiles,
      eventTimezone,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockEvents.push(newEvent);
    console.log('Created mock event:', newEvent);
    res.status(201).json(newEvent);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database status: ${dbConnected ? 'Connected' : 'Disconnected (using mock data)'}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/profiles`);
  console.log(`   POST http://localhost:${PORT}/api/profiles`);
  console.log(`   GET  http://localhost:${PORT}/api/events/:profileId`);
  console.log(`   POST http://localhost:${PORT}/api/events`);
});