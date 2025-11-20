// Event list component
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useProfileStore from '../src/profStore/addProfStore';
import { displayInUserTimezone } from '../src/utils/timezoneUtils';
import { TIMEZONE_OPTIONS } from '../src/utils/timezone';
import EditEventModal from './EditEventModal';
import { API_CONFIG } from '../src/config/api';

function EventList({ profilesNeedRefresh }) {
  const { currentProfile, setViewingTimezone } = useProfileStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const getEvents = async () => {
      const profileId = currentProfile._id;
      if (!profileId) {
        setEvents([]);
        return; 
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_CONFIG.ENDPOINTS.EVENTS}/${profileId}`);
        setEvents(response.data);
      } catch (err) {
        setError('Failed to fetch events.');
        console.error("Fetch Event Error:", err);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, [currentProfile._id]); 

  const handleTimezoneChange = (e) => {
    const newTz = e.target.value;
    setViewingTimezone(newTz);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingEvent(null);
    setIsEditModalOpen(false);
  };

  const handleEventUpdated = (updatedEvent) => {
    // Update the events list with the updated event
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event._id === updatedEvent._id ? updatedEvent : event
      )
    );
  };

  if (!currentProfile._id) {
    return (
      <div className="bg-white rounded border p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Profile Selected</h3>
          <p className="text-gray-600 text-sm">Please select a profile to view events.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded border p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600 text-sm">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Events</h2>
          </div>
          
          {/* View in Timezone Selector */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">View in:</label>
            <select 
              value={currentProfile.timezone} 
              onChange={handleTimezoneChange}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm min-w-[140px]"
            >
              {TIMEZONE_OPTIONS.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {events.length === 0 ? (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L9 5m0 0l-2 2m2-2v12" />
            </svg>
            <p className="text-gray-600 text-sm">No events found for <strong>{currentProfile.name}</strong>.</p>
            <p className="text-xs text-gray-500 mt-1">Create your first event to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <EventCard 
                key={event._id} 
                event={event} 
                userTimezone={currentProfile.timezone}
                onEdit={() => handleEditEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      <EditEventModal
        event={editingEvent}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onEventUpdated={handleEventUpdated}
        profilesNeedRefresh={profilesNeedRefresh}
      />
    </div>
  );
}

// Event Card Component (Display Logic)
function EventCard({ event, userTimezone, onEdit }) {
    
    // Convert all UTC timestamps to the user's selected viewing timezone
    const startDisplay = displayInUserTimezone(event.startDateTime, userTimezone);
    const endDisplay = displayInUserTimezone(event.endDateTime, userTimezone);
    const createdDisplay = displayInUserTimezone(event.createdAt, userTimezone);
    const updatedDisplay = displayInUserTimezone(event.updatedAt, userTimezone);

    // Get assigned profile names
    const profileNames = event.profiles.map(p => {
      if (typeof p === 'object' && p !== null) {
        return p.name || 'Unknown Profile';
      } else if (typeof p === 'string') {
        return p; // Profile ID, show as is
      } else {
        return 'Unknown Profile';
      }
    }).join(', ');

    return (
        <div className="bg-gray-50 rounded p-3 border">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="text-sm font-semibold text-gray-900 truncate">Assigned to: {profileNames}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center">
                            <svg className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-600">Start</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{startDisplay}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <svg className="w-3 h-3 text-red-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-600">End</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{endDisplay}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                            <span>Created: {createdDisplay}</span>
                            <span>Updated: {updatedDisplay}</span>
                        </div>
                        <div className="flex items-center">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">{event.eventTimezone}</span>
                        </div>
                    </div>
                </div>
                
                <div className="ml-3 flex-shrink-0 space-x-2">
                    <button 
                        onClick={onEdit}
                        className="bg-green-600 text-white px-2 py-1 hover:bg-green-700 text-sm"
                    >
                        Edit
                    </button>
                    <button className="bg-blue-600 text-white px-2 py-1 hover:bg-blue-700 text-sm">
                        View Logs
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EventList;