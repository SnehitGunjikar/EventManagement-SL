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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'running', 
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/profiles', profRoutes);
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Ready to accept your data input!`);
      console.log(`🧪 Test endpoints:`);
      console.log(`   GET  http://localhost:${PORT}/api/health`);
      console.log(`   GET  http://localhost:${PORT}/api/profiles`);
      console.log(`   POST http://localhost:${PORT}/api/profiles`);
      console.log(`   GET  http://localhost:${PORT}/api/events/:profileId`);
      console.log(`   POST http://localhost:${PORT}/api/events`);
      console.log(`   PUT  http://localhost:${PORT}/api/events/:id`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas connection error:', err);
    console.log('💡 Make sure your MONGO_URI is correct in the .env file');
    process.exit(1);
  });