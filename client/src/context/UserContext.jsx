import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [refetchTrigger, setRefetchTrigger] = useState(false);

  const fetchUnreadMessages = async () => {
    if (user?.email) {
      try {
        const res = await fetch(`http://localhost:5000/api/unread-messages/${user.email}`);
        const data = await res.json();
        setUnreadMessages(data);
      } catch (err) {
        console.error("Failed to refresh unread messages:", err);
      }
    }
  };

  useEffect(() => {
    if (user?.email) {
      socket.emit("join", user.email);
  
      socket.on("newNotification", fetchUnreadMessages);
    }
  
    return () => {
      socket.off("newNotification");
    };
  }, [user?.email]);

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

  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5000/api/unread-messages/${user.email}`)
        .then((res) => res.json())
        .then((data) => setUnreadMessages(data))
        .catch((err) => console.error("Failed to fetch unread messages:", err));
    }
  }, [user]);

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
    return data.url;
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
        formData.append("accolades", JSON.stringify(data.accolades));
      } else {
        formData.append("degrees", data.degrees);
        formData.append("certifications", data.certifications);
        formData.append("walletAddress", data.walletAddress);
        formData.append("education", JSON.stringify(data.education));
        formData.append("jobExperiences", JSON.stringify(data.jobExperiences));
        formData.append("internships", JSON.stringify(data.internships));

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
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
    }
  };

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

        if (!loginData.user || !loginData.role) {
            throw new Error("Invalid response from server: Missing user or role");
        }

        console.log("MetaMask Login Successful:", loginData);

        setUser(loginData.user);
        setUserProfile(loginData.user);
        setRole(loginData.role);
        setError(null);
    } catch (error) {
        console.error("Error logging in with wallet:", error.message);
        setError(error.message);
        throw error;
    }
};

  useEffect(() => {
    if (user) {
      fetchUserProfile(); 
    } else {
      setLoading(false);
    }
  }, [user]); 
  
  const fetchUserProfile = async () => {
    if (user && user.email) {
      console.log("Fetching profile for:", user.email);
      setLoading(true); 
      const email = encodeURIComponent(user.email);
      try {
        const res = await fetch(`http://localhost:5000/api/profile?email=${email}`);
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        if (data.profile) {
          console.log("Profile fetched:", data.profile);
          setUserProfile(data.profile);
          setRole(data.role || "individual");
          setRefetchTrigger(prev => !prev); 
        } else {
          setError("No profile data found.");
        }
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        setError(error.message); 
      } finally {
        setLoading(false); 
        console.log("Loading state:", loading); 
      }
    }
  }; 

  useEffect(() => {
    if (user && role === "organization") {
      fetch(`http://localhost:5000/api/get-organization-notifications/${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [user, role]);

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
        setUser,
        setRefetchTrigger,
        userProfile,
        role,
        notifications,
        registerUser,
        refetchTrigger,
        updateUserProfile,
        loginUser,
        loginWithWallet,
        logoutUser,
        loading,
        error,
        uploadResumeToIPFS,
        applyToJob,
        unreadMessages,
        fetchUnreadMessages,
        fetchUserProfile,
        refreshUnreadMessages: fetchUnreadMessages,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };
export default UserProvider;