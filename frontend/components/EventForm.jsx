// Event form component
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TIMEZONE_OPTIONS } from '../src/utils/timezone';
import { convertLocalToUTC } from '../src/utils/timezoneUtils';
import ProfileSelector from './EnhancedMultiProfileSelector';
import { API_CONFIG } from '../src/config/api';

// Form starting values
const initialFormState = {
  // Array of profile IDs
  profiles: [],
 
  eventTimezone: 'America/New_York',

  startDate: '', 
  startTime: '09:00',
  endDate: '',
  endTime: '09:00',
};

function EventForm({ onEventCreated, profilesNeedRefresh }) {
  const [formData, setFormData] = useState(initialFormState);
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState(null);

  // Get profiles for dropdown
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(API_CONFIG.ENDPOINTS.PROFILES);
        setProfiles(response.data);
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };
    fetchProfiles();
  }, [profilesNeedRefresh]); // Re-fetch when profilesNeedRefresh changes

  // Handle input changes (date, time, timezone)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle multi-profile selector changes
  const handleProfileSelectionChange = (selectedProfileObjects) => {
    const profileIds = selectedProfileObjects.map(profile => profile._id);
    setFormData(prev => ({ ...prev, profiles: profileIds }));
  };

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Prepare UTC times for the backend
    const startUTC = convertLocalToUTC(formData.startDate, formData.startTime, formData.eventTimezone);
    const endUTC = convertLocalToUTC(formData.endDate, formData.endTime, formData.eventTimezone);

    // Check if everything is filled
    if (!formData.profiles || formData.profiles.length === 0) {
      setError('Please select at least one profile.');
      return;
    }
    if (!startUTC || !endUTC) {
      setError('Please provide valid start and end date/times.');
      return;
    }
    if (new Date(startUTC) >= new Date(endUTC)) {
      setError('End time must be after start time.');
      return;
    }

    // Data to send
    const payload = {
      profiles: formData.profiles,
      eventTimezone: formData.eventTimezone,
      startDateTime: startUTC,
      endDateTime: endUTC,
    };

    try {
      await axios.post(API_CONFIG.ENDPOINTS.EVENTS, payload);


      // Reset form
      setFormData(initialFormState);

      // Notify parent component
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (err) {
      console.error('Error creating event:', err);
      const msg = err.response?.data?.message || 'Failed to create event.';
      setError(msg);
    }
  };

  return (
    <div className="bg-white rounded border p-4">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 rounded p-2 mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Create New Event</h2>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 border text-sm text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Profiles Selection (Multi-select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Profiles</label>
          <ProfileSelector 
            selectedProfiles={profiles.filter(p => formData.profiles.includes(p._id))}
            onSelectionChange={handleProfileSelectionChange}
            profilesNeedRefresh={profilesNeedRefresh}
          />
        </div>

          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Timezone</label>
            <select 
              name="eventTimezone" 
              required
              value={formData.eventTimezone}
              onChange={handleChange}
              className="w-full border px-3 py-2 text-sm"
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
          
          {/* Start Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                required
                value={formData.startDate} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time" 
                name="startTime" 
                required
                value={formData.startTime} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>
          </div>

          {/* End Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                type="date" 
                name="endDate" 
                required
                value={formData.endDate} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                name="endTime" 
                required
                value={formData.endTime} 
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
      </form>
    </div>
  );
}

export default EventForm;
