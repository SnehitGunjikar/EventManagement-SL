
const Event = require('../models/Event');
const Profile = require('../models/Profile');

exports.createEvent = async (req, res) => {
  const {
    profiles, // Array of Profile IDs
    eventTimezone,
    startDateTime, 
    endDateTime    
  } = req.body;

  // Basic validation
  if (!profiles || profiles.length === 0 || !eventTimezone || !startDateTime || !endDateTime) {
    return res.status(400).json({ message: 'All event fields are required.' });
  }

 
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (end <= start) {
    return res.status(400).json({ message: 'End date/time must be after the start date/time.' });
  }

  try {
    const newEvent = new Event({
      profiles,
      eventTimezone,
      startDateTime: start,
      endDateTime: end
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getEventsByProfile = async (req, res) => {
  const { profileId } = req.params;

  try {
  
    const events = await Event.find({
      profiles: profileId
    })
    .populate('profiles', 'name timezone') 
    .sort('startDateTime'); // Sorting by start date

    res.status(200).json(events);

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    profiles,
    eventTimezone,
    startDateTime,
    endDateTime
  } = req.body;


  if (!profiles || profiles.length === 0 || !eventTimezone || !startDateTime || !endDateTime) {
    return res.status(400).json({ message: 'All event fields are required.' });
  }
  
  // Validation Rule (same as creation)
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  if (end <= start) {
    return res.status(400).json({ message: 'End date/time must be after the start date/time.' });
  }

  try {


    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { 
        profiles, 
        eventTimezone, 
        startDateTime: start, 
        endDateTime: end,
        updatedAt: new Date() 
      },
      { new: true } 
    ).populate('profiles', 'name timezone');

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found.' });
    }

   

    res.status(200).json(updatedEvent);
    
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};