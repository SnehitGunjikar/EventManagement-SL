const mongoose = require('mongoose');
const Profile_Schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  timezone: { type: String, required: true, default: 'UTC' }
},{
  timestamps: true
});

module.exports = mongoose.model('Profile', Profile_Schema);