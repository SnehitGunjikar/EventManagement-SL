// frontend/src/store/useProfileStore.js
import { create } from 'zustand';

// Define the shape of a Profile object (as returned from the backend)
const initialProfileState = {
  _id: null,
  name: 'Select profile...', 
  timezone: 'America/New_York', // Default timezone (ET)
};

const useProfileStore = create((set) => ({
  // State
  currentProfile: initialProfileState,

  // Actions
  /**
   * Sets the currently active user profile and their default viewing timezone.
   * @param {Object} profile - The selected profile object {_id, name, timezone}
   */
  setCurrentProfile: (profile) => {
    set({
      currentProfile: {
        _id: profile._id,
        name: profile.name,
       
        timezone: profile.timezone,
      },
    });
  },

  /**
   * Updates the user's *viewing* timezone without updating the backend.
   * [cite_start]This is used for the "View in Timezone" selector on the events page[cite: 68].
   * @param {string} newTimezone - The new timezone string (e.g., 'Asia/Kolkata')
   */
  setViewingTimezone: (newTimezone) => {
    set((state) => ({
      currentProfile: {
        ...state.currentProfile,
        timezone: newTimezone,
      },
    }));
  },
  

}));

export default useProfileStore;