import React, { createContext, useContext, useState, useEffect } from 'react';

// Create User Context
const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Track logged-in user
  const [userProfile, setUserProfile] = useState(null); // Optional user profile
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track error messages

  // Function to register user
  const registerUser = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Ensure name is part of `data`
      });
  
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setUserProfile(userData.user);
        setError(null);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error registering user:', error.message);
      setError(error.message);
    }
  };    

  // Function to update user profile
  const updateUserProfile = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user); // Update the user context after profile update
        setUserProfile(userData.user); // Update userProfile as well
        setError(null); // Clear any previous errors
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setError(error.message); // Set error message to show on UI
    }
  };

  // Function to log in user
  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user); // Update the user context
        setUserProfile(userData.user);
        setError(null); // Clear errors
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      throw error;
    }
  };  

  // Fetch user profile when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData); // Set user data
          setUserProfile(userData); // Optionally set profile data
        } else {
          console.error('No user data found.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
      } finally {
        setLoading(false); // Stop loading state
      }
    };
    fetchUserProfile();
  }, []); // Empty dependency array to run on mount

  // Function to logout user
  const logoutUser = () => {
    setUser(null); // Clear user context on logout
    setUserProfile(null); // Clear user profile on logout
    setError(null); // Clear error state
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        registerUser,
        updateUserProfile,
        loginUser,
        logoutUser,
        loading,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
export default UserProvider;