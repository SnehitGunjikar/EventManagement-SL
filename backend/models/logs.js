const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
  
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
 
  changerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  
  changeDescription: {
    type: String,
    required: true
  },
  
  loggedAt: {
    type: Date,
    default: Date.now
  }
  // I might also need to add fields for 'prevValue' and 'newValue' for detailed logging. (If time permits)
});

module.exports = mongoose.model('EventLog', EventLogSchema);