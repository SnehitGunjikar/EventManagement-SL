// frontend/src/components/CreateEventForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TIMEZONE_OPTIONS } from '../src/utils/timezone';
import { convertLocalToUTC } from '../src/utils/timezoneUtils';

// Initial state for the form fields
const initialFormState = {
  // Array of profile IDs
  profiles: [],
 
  eventTimezone: 'America/New_York',

  startDate: '', 
  startTime: '09:00',
  endDate: '',
  endTime: '09:00',
};

function CreateEventForm({ onEventCreated }) {
  const [formData, setFormData] = useState(initialFormState);
  const [allProfiles, setAllProfiles] = useState([]);
  const [error, setError] = useState(null);

  // 1. Fetch all profiles for the multi-select dropdown
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profiles');
        setAllProfiles(response.data);
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };
    fetchProfiles();
  }, []);

  // Handle input changes (date, time, timezone)
  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    
    // Handle multi-select for profiles (if using a standard HTML select)
    if (name === 'profiles' && type === 'select-multiple') {
      const profileIds = Array.from(selectedOptions).map(option => option.value);
      setFormData(prev => ({ ...prev, profiles: profileIds }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Prepare UTC times for the backend
    const startUTC = convertLocalToUTC(formData.startDate, formData.startTime, formData.eventTimezone);
    const endUTC = convertLocalToUTC(formData.endDate, formData.endTime, formData.eventTimezone);

    // Basic Client-side validation
    if (new Date(endUTC) <= new Date(startUTC)) {
      return setError('End date/time cannot be in the past relative to the start date/time.');
    }
    if (formData.profiles.length === 0) {
      return setError('At least one profile must be selected.');
    }

    const eventData = {
      profiles: formData.profiles,
      eventTimezone: formData.eventTimezone,
      startDateTime: startUTC,
      endDateTime: endUTC,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/events', eventData);
      
      // Success: Reset form and notify parent component
      setFormData(initialFormState);
      alert('Event created successfully!');
      if (onEventCreated) onEventCreated(response.data);

    } catch (err) {
      // Use the error message sent from the backend (like the validation error)
      const msg = err.response?.data?.message || 'Failed to create event.';
      setError(msg);
      console.error("API Error:", err.response?.data);
    }
  };

  return (
    <div className="card">
      <h2>Create Event</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <form onSubmit={handleSubmit}>
        
        {/* Profiles Selection (Multi-select) */}
        <div>
          <label>Profiles </label>
          {/* Note: In a real app, you would use a dedicated multi-select component (like react-select) */}
          <select 
            name="profiles" 
            multiple 
            required
            value={formData.profiles}
            onChange={handleChange}
            style={{ minHeight: '100px' }}
          >
            {allProfiles.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Timezone Selection */}
        <div>
          <label>Timezone</label>
          <select 
            name="eventTimezone" 
            required
            value={formData.eventTimezone}
            onChange={handleChange}
          >
            {TIMEZONE_OPTIONS.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
        
        {/* Start Date + Time */}
        <div>
          <label>Start Date + Time </label>
          <input 
            type="date" 
            name="startDate" 
            required
            value={formData.startDate} 
            onChange={handleChange} 
          />
          <input 
            type="time" 
            name="startTime" 
            required
            value={formData.startTime} 
            onChange={handleChange} 
          />
        </div>
        
        {/* End Date + Time */}
        <div>
          <label>End Date + Time</label>
          <input 
            type="date" 
            name="endDate" 
            required
            value={formData.endDate} 
            onChange={handleChange} 
          />
          <input 
            type="time" 
            name="endTime" 
            required
            value={formData.endTime} 
            onChange={handleChange} 
          />
        </div>
        
        <button type="submit">+ Create Event </button>
      </form>
    </div>
  );
}

export default CreateEventForm;