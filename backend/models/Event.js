// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],

  
  eventTimezone: {
    type: String,
    required: true
  },

  
  startDateTime: {
    type: Date, 
    required: true
  },

  
  endDateTime: {
    type: Date,
    required: true,
  },


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);