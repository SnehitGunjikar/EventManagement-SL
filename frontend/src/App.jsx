// Main App component
import React, { useState } from 'react';
import EnhancedProfileSelector from '../components/EnhancedProfileSelector'; 
import EventForm from '../components/EventForm'; 
import EventList from '../components/EventList';

function App() {
  // Counter to refresh data
  const [refreshEvents, setRefreshEvents] = useState(0);
  const [refreshProfiles, setRefreshProfiles] = useState(0);

  // Refresh events when something changes
  const handleEventUpdate = () => {
    setRefreshEvents(prev => prev + 1);
  };

  // Refresh profiles when something changes
  const handleProfileUpdate = () => {
    setRefreshProfiles(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Event Manager</h1>
                <p className="text-sm text-gray-600">Manage events across time zones</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-gray-100 rounded px-3 py-2">
                <EnhancedProfileSelector key={refreshProfiles} onProfileCreated={handleProfileUpdate} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Create Event */}
          <div>
            <EventForm onEventCreated={handleEventUpdate} profilesNeedRefresh={refreshProfiles} />
          </div>

          {/* Right Column: Event List */}
          <div>
            <EventList key={refreshEvents} profilesNeedRefresh={refreshProfiles} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <p className="text-center text-gray-500 text-sm">
            Event Management System - React & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;