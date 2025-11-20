import React, { useState, useEffect, useRef } from 'react';
import useProfileStore from '../src/profStore/addProfStore';
import axios from 'axios';
import { API_CONFIG } from '../src/config/api';

// Profile dropdown component
function EnhancedProfileSelector({ onProfileCreated }) {
  const [profiles, setProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentProfile, setCurrentProfile } = useProfileStore();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getProfiles = async () => {
      try {
        const response = await axios.get(API_CONFIG.ENDPOINTS.PROFILES);
        setProfiles(response.data);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      }
    };
    getProfiles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileSelect = (profile) => {
    setCurrentProfile(profile);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_CONFIG.ENDPOINTS.PROFILES, {
        name: newProfileName.trim()
      });
      
      const newProfile = response.data;
      setProfiles([...profiles, newProfile]);
      setCurrentProfile(newProfile);
      setNewProfileName('');
      setIsAddingProfile(false);
      setIsOpen(false);
      
      // Trigger refresh for other components
      if (onProfileCreated) {
        onProfileCreated();
      }
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddProfile();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Profiles</label>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border px-3 py-1 text-sm min-w-[120px] flex items-center justify-between"
        >
          <span className="truncate">
            {currentProfile.name || 'Select profiles...'}
          </span>
          <svg className="w-4 h-4 ml-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {currentProfile._id && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="whitespace-nowrap">{currentProfile.timezone}</span>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border"
              />
            </div>
          </div>

          {/* Profile Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <button
                  key={profile._id}
                  onClick={() => handleProfileSelect(profile)}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    currentProfile._id === profile._id 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700'
                  }`}
                >
                  {profile.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No profiles found
              </div>
            )}
          </div>

          {/* Add New Profile Section */}
          <div className="p-2 border-t border-gray-100">
            {!isAddingProfile ? (
              <button
                onClick={() => setIsAddingProfile(true)}
                className="w-full text-left px-2 py-1 text-sm text-blue-600 flex items-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add new profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter profile name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-2 py-1 text-sm border"
                  autoFocus
                />
                <button
                  onClick={handleAddProfile}
                  disabled={!newProfileName.trim() || isSubmitting}
                  className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedProfileSelector;