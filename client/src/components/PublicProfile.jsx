// PublicProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import ProfileView from "./ProfileView";
import { useNavigate } from "react-router-dom";

const PublicProfile = () => {
  const { userId } = useParams();
  const { user } = useUser();
  const [profileUser, setProfileUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const resUser = await fetch(`http://localhost:5000/api/users/${userId}`);
        const profileData = await resUser.json();
        setProfileUser(profileData);

        const resCerts = await fetch(`http://localhost:5000/api/get-user-certificates/${userId}`);
        const certData = await resCerts.json();
        setCertificates(certData.filter((c) => c.status === "verified"));

        const resDegrees = await fetch(`http://localhost:5000/api/get-user-degrees/${userId}`);
        const degreeData = await resDegrees.json();
        setDegrees(degreeData.filter((d) => d.status === "verified"));
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && user?._id !== userId) {
      fetchProfile();
    }
  }, [userId, user]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }

  if (!profileUser) {
    return <div className="text-center p-6">User not found.</div>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
    <button onClick={() => navigate(-1)} className="mb-4 bg-yellow-400 px-4 py-1 rounded text-black font-semibold hover:bg-yellow-500">
        ← Back
    </button>

    <ProfileView
        user={profileUser}
        role={profileUser.role}
        certificates={certificates}
        degrees={degrees}
        isPublic
    />
    </div>
  );
};

export default PublicProfile;