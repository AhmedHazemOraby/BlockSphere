import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && role === "organization") {
      fetch(`http://localhost:5000/api/get-organization-notifications/${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [user]);

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

  const uploadResumeToIPFS = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url; // IPFS URL
  };

  const applyToJob = async (jobId, resumeUrl, email, phone) => {
    const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user._id,
        resumeUrl,
        email,
        phone,
      }),
    });
    return response.json();
  };  
  
  // Function to update user or organization profile
  const updateUserProfile = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("role", data.role);
  
      if (data.photo) {
        formData.append("photo", data.photo);
      } else {
        formData.append("photoUrl", data.photoUrl);
      }
  
      if (data.role === "organization") {
        formData.append("establishedSince", data.establishedSince);
        formData.append("numWorkers", data.numWorkers);
        formData.append("accolades", data.accolades);
      } else {
        formData.append("workplace", data.workplace);
        formData.append("degrees", data.degrees);
        formData.append("certifications", data.certifications);
        formData.append("walletAddress", data.walletAddress);
      }
  
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        body: formData,
      });
  
      if (response.ok) {
        const updatedData = await response.json();
        const updatedAccount = updatedData.updatedProfile;
        setUser(updatedAccount);
        setUserProfile(updatedAccount);
        setError(null);
        
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    }
  };

  // Function to log in user or organization (Email & Password)
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

  // ✅ New Function: Log in using MetaMask Wallet
  const loginWithWallet = async (walletAddress) => {
    try {
        const response = await fetch("http://localhost:5000/api/login-metamask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress }),
        });

        const loginData = await response.json();

        if (!response.ok) {
            throw new Error(loginData.message || "Wallet login failed");
        }

        // ✅ Ensure response contains user and role
        if (!loginData.user || !loginData.role) {
            throw new Error("Invalid response from server: Missing user or role");
        }

        console.log("MetaMask Login Successful:", loginData);

        setUser(loginData.user);
        setUserProfile(loginData.user);
        setRole(loginData.role); // ✅ Fix: Set the correct role
        setError(null);
    } catch (error) {
        console.error("Error logging in with wallet:", error.message);
        setError(error.message);
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
        notifications,
        registerUser,
        updateUserProfile,
        loginUser,
        loginWithWallet,
        logoutUser,
        loading,
        error,
        uploadResumeToIPFS,
        applyToJob,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
export default UserProvider;