import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../src/config/api';

function EnhancedMultiProfileSelector({ selectedProfiles, onSelectionChange, profilesNeedRefresh }) {
  const [profiles, setProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get(API_CONFIG.ENDPOINTS.PROFILES);
        setProfiles(response.data);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      }
    };
    fetchProfiles();
  }, [profilesNeedRefresh]); // Re-fetch when profilesNeedRefresh changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileToggle = (profile) => {
    const isSelected = selectedProfiles.some(p => p._id === profile._id);
    
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedProfiles.filter(p => p._id !== profile._id);
    } else {
      newSelection = [...selectedProfiles, profile];
    }
    
    onSelectionChange(newSelection);
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
      onSelectionChange([...selectedProfiles, newProfile]);
      setNewProfileName('');
      setIsAddingProfile(false);
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

  const getSelectedNames = () => {
    if (selectedProfiles.length === 0) return 'Select profiles...';
    if (selectedProfiles.length === 1) return selectedProfiles[0].name;
    return `${selectedProfiles.length} profiles selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="truncate">
          {getSelectedNames()}
        </span>
        <svg className="w-4 h-4 ml-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] max-h-64 overflow-y-auto">
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
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Profile Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => {
                const isSelected = selectedProfiles.some(p => p._id === profile._id);
                return (
                  <button
                    key={profile._id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleProfileToggle(profile);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{profile.name}</span>
                    {isSelected && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
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
                className="w-full text-left px-2 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors flex items-center space-x-2"
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
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                />
                <button
                  onClick={handleAddProfile}
                  disabled={!newProfileName.trim() || isSubmitting}
                  className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Done Button */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedMultiProfileSelector;
