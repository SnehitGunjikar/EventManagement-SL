
const Profile = require('../models/Profile');


exports.createProfile = async (req, res) => {
  const { name } = req.body;


  if (!name) {
    return res.status(400).json({ message: 'Profile name is required.' });
  }

  try {
    
    const newProfile = await Profile.create({ name, timezone: 'America/New_York' });
    res.status(201).json(newProfile);

  } catch (error) {
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A profile with this name already exists.' });
    }
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().select('id name timezone');
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};