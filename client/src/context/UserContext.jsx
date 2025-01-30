import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to register user or organization
  const registerUser = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();
        const account = userData.user || userData.organization;
        setUser(account);
        setUserProfile(account);
        setRole(userData.user ? 'individual' : 'organization');
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error registering account:', error.message);
      setError(error.message);
    }
  };

  // Function to update user or organization profile
  const updateUserProfile = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        const updatedAccount = updatedData.user || updatedData.organization;
        setUser(updatedAccount);
        setUserProfile(updatedAccount);
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setError(error.message);
    }
  };

  // Function to log in user or organization
  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const loginData = await response.json();
        const account = loginData.account;
        setUser(account);
        setUserProfile(account);
        setRole(loginData.role);
        setError(null);
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

  // Fetch user or organization profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile');
        if (response.ok) {
          const profileData = await response.json();
          setUser(profileData);
          setUserProfile(profileData);
          setRole(profileData.role || 'individual');
        } else {
          console.error('No profile data found.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  // Function to logout user
  const logoutUser = () => {
    setUser(null);
    setUserProfile(null);
    setRole(null);
    setError(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userProfile,
        role,
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