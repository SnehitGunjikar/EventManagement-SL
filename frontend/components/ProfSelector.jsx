// frontend/src/components/ProfileSelector.jsx
import React, { useState, useEffect } from 'react';
import useProfileStore from '../src/profStore/addProfStore';
import axios from 'axios'; // Assuming you use axios for API calls

function ProfileSelector() {
  const [profiles, setProfiles] = useState([]);
  const { currentProfile, setCurrentProfile } = useProfileStore();

  useEffect(() => {
    // Fetch all profiles from the backend
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/profiles');
        setProfiles(response.data);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      }
    };
    fetchProfiles();
  }, []);

  const handleProfileChange = (e) => {
    const profileId = e.target.value;
    const selectedProfile = profiles.find(p => p._id === profileId);
    if (selectedProfile) {
      setCurrentProfile(selectedProfile);
    }
  };

  return (
    <div>
      <label>Select current profile...</label>
      <select value={currentProfile._id || ''} onChange={handleProfileChange}>
        <option value="" disabled>Select a Profile</option>
        {profiles.map(profile => (
          <option key={profile._id} value={profile._id}>
            {profile.name}
          </option>
        ))}
      </select>
      {currentProfile._id && (
        <p>Viewing events as **{currentProfile.name}** in **{currentProfile.timezone}**.</p>
      )}
    </div>
  );
}

export default ProfileSelector;