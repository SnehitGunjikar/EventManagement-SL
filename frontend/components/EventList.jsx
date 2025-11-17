// frontend/src/components/EventList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useProfileStore from '../src/profStore/addProfStore';
import { displayInUserTimezone } from '../src/utils/timezoneUtils';
import { TIMEZONE_OPTIONS } from '../src/utils/timezone';
// Assuming you'll build an EditForm next
 

function EventList() {
  const { currentProfile, setViewingTimezone } = useProfileStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for the Edit Modal/Form
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 1. Fetch Events when the selected profile changes
  useEffect(() => {
    const fetchEvents = async () => {
      const profileId = currentProfile._id;
      if (!profileId) {
        setEvents([]);
        return; // Exit if no profile is selected
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all events assigned to the current profile [cite: 30]
        const response = await axios.get(`http://localhost:5000/api/events/${profileId}`);
        setEvents(response.data);
      } catch (err) {
        setError('Failed to fetch events.');
        console.error("Fetch Event Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // Re-run whenever the profile ID or the viewing timezone changes
  }, [currentProfile._id]); 
  
  // Handler for changing the display timezone (View in Timezone selector)
  const handleTimezoneChange = (e) => {
    const newTz = e.target.value;
    // This updates the global state, triggering the event list re-render
    // and recalculation of display times.
    setViewingTimezone(newTz);
  };
  
  // Handler for opening the Edit modal
  const handleEditClick = (event) => {
      setSelectedEvent(event);
      setIsEditing(true);
  }

  // If the list is included in App.jsx with a key that changes (as shown previously),
  // it will refresh automatically when an event is created/updated.

  if (!currentProfile._id) {
    return <div className="events-panel"><h3>Events</h3><p>Please select a current profile to view events.</p></div>;
  }

  if (loading) {
    return <div className="events-panel"><h3>Events</h3><p>Loading events...</p></div>;
  }
  
  return (
    <div className="events-panel">
      <h2>Events</h2>
      
      {/* View in Timezone Selector [cite: 68] */}
      <div className="timezone-selector">
        <label>View in Timezone:</label>
        <select 
          value={currentProfile.timezone} 
          onChange={handleTimezoneChange}
        >
          {TIMEZONE_OPTIONS.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {events.length === 0 ? (
        <p>No events found [cite: 70] for **{currentProfile.name}**.</p>
      ) : (
        <div className="event-list">
          {events.map(event => (
            <EventCard 
              key={event._id} 
              event={event} 
              userTimezone={currentProfile.timezone}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      )}
      
      {/* Render the Edit Modal/Form */}
      {/* {isEditing && selectedEvent && (
        <EditEventForm 
          event={selectedEvent} 
          onClose={() => setIsEditing(false)} 
          onUpdate={() => { 
            setIsEditing(false); 
            // Trigger manual refresh of events after successful update
            // (You might need to re-fetch events here if not using the App.jsx key trick)
          }}
        />
      )} */}
    </div>
  );
}

// 2. Event Card Component (Display Logic)
function EventCard({ event, userTimezone }) {
    
    // Convert all UTC timestamps to the user's selected viewing timezone
    const startDisplay = displayInUserTimezone(event.startDateTime, userTimezone);
    const endDisplay = displayInUserTimezone(event.endDateTime, userTimezone);
    const createdDisplay = displayInUserTimezone(event.createdAt, userTimezone);
    const updatedDisplay = displayInUserTimezone(event.updatedAt, userTimezone);

    // Get assigned profile names
    const profileNames = event.profiles.map(p => p.name).join(', ');

    return (
        <div className="event-card">
            <p className="profiles">Assigned to: **{profileNames}**</p>
            <p>Start: **{startDisplay}**</p>
            <p>End: **{endDisplay}**</p>
            <p className="timestamps">
                *Created:* {createdDisplay} | 
                *Updated:* {updatedDisplay}
            </p>
            <p>Original Event Timezone: {event.eventTimezone}</p>
            
            <div className="actions">
                {/* Users can update all events assigned to them  */}
 
                <button>View Logs [cite: 172]</button> {/* For Bonus Credit */}
            </div>
        </div>
    );
}

export default EventList;