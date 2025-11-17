// frontend/src/App.jsx (Simplified Example)
import React, { useState } from 'react';
import ProfileSelector from '../components/ProfSelector'; 
import CreateEventForm from '../components/EventForm'; 
import EventList from '../components/EventList'; // To be built next

function App() {
  const [eventsNeedRefresh, setEventsNeedRefresh] = useState(0);

  // Callback function to trigger event list refresh after creation/update
  const handleEventChange = () => {
    setEventsNeedRefresh(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <h1>Event Management System</h1>
      
      {/* Top Section: Profile Selection */}
      <ProfileSelector />
      
      <div className="main-content">
        {/* Left Section: Create Event Form */}
        <CreateEventForm onEventCreated={handleEventChange} />
        
        {/* Right Section: Event List */}
        <EventList key={eventsNeedRefresh} /> 
      </div>
    </div>
  );
}

export default App;