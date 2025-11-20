import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedMultiProfileSelector from './EnhancedMultiProfileSelector';
import { TIMEZONE_OPTIONS } from '../src/utils/timezone';
import { convertLocalToUTC } from '../src/utils/timezoneUtils';
import { API_CONFIG } from '../src/config/api';

function EditEventModal({ event, isOpen, onClose, onEventUpdated, profilesNeedRefresh }) {
  const [formData, setFormData] = useState({
    profiles: [],
    eventTimezone: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event && isOpen) {
      // Parse the existing event data
      const startDateTime = new Date(event.startDateTime);
      const endDateTime = new Date(event.endDateTime);
      
      // Handle both profile objects and profile IDs
      const profiles = event.profiles || [];
      const processedProfiles = profiles.map(p => {
        if (typeof p === 'object' && p !== null) {
          return p; // Already a profile object
        } else if (typeof p === 'string') {
          return { _id: p, name: p }; // Convert ID to minimal profile object
        } else {
          return null;
        }
      }).filter(p => p !== null);
      
      setFormData({
        profiles: processedProfiles,
        eventTimezone: event.eventTimezone || '',
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5)
      });
      setError('');
    }
  }, [event, isOpen]);

  const handleProfileSelectionChange = (selectedProfiles) => {
    setFormData(prev => ({
      ...prev,
      profiles: selectedProfiles
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if event exists
      if (!event || !event._id) {
        throw new Error('Event data is missing or invalid');
      }

      // Convert local times to UTC
      const startDateTimeUTC = convertLocalToUTC(formData.startDate, formData.startTime, formData.eventTimezone);
      const endDateTimeUTC = convertLocalToUTC(formData.endDate, formData.endTime, formData.eventTimezone);

      const updateData = {
        profiles: formData.profiles.map(p => p._id || p), // Handle both objects and strings
        eventTimezone: formData.eventTimezone,
        startDateTime: startDateTimeUTC,
        endDateTime: endDateTimeUTC
      };

      const response = await axios.put(`${API_CONFIG.ENDPOINTS.EVENTS}/${event._id}`, updateData);
      
      if (onEventUpdated) {
        onEventUpdated(response.data);
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
      console.error('Update event error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form id="editEventForm" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]" onClick={(e) => e.stopPropagation()}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Profiles Section */}
          <div onClick={(e) => e.stopPropagation()}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profiles</label>
            <EnhancedMultiProfileSelector
              selectedProfiles={formData.profiles}
              onSelectionChange={handleProfileSelectionChange}
              profilesNeedRefresh={profilesNeedRefresh}
            />
          </div>

          {/* Timezone Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <div className="relative">
              <select
                name="eventTimezone"
                value={formData.eventTimezone}
                onChange={handleInputChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
              >
                {TIMEZONE_OPTIONS.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <svg className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="relative">
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editEventForm"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditEventModal;