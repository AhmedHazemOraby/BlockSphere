import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import defaultUserImage from '../../images/defaultUserImage.png';

const Profile = () => {
  const navigate = useNavigate();
  const { user, role, updateUserProfile } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: null,
    workplace: "",
    degrees: "",
    certifications: "",
    walletAddress: "",
    establishedSince: "",
    numWorkers: "",
    accolades: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        workplace: user.workplace || "",
        degrees: user.degrees || "",
        certifications: user.certifications || "",
        walletAddress: user.walletAddress || "",
        establishedSince: user.establishedSince || "",
        numWorkers: user.numWorkers || "",
        accolades: user.accolades || "",
      });

      // ✅ Ensure user ID exists before fetching certificates
      if (user._id) {
        fetchVerifiedCertificates(user._id);
      }
    }
  }, [user]);

  // ✅ Function to fetch verified certificates
  const fetchVerifiedCertificates = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get-user-certificates/${userId}`);  
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      console.log("📦 Certificates fetched from API:", data);
      setCertificates(data.filter(cert => cert.status === "verified"));
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };  

  const sanitizedPhotoUrl = user?.photoUrl
    ? user.photoUrl.replace('http://localhost:8080', 'https://gateway.pinata.cloud/ipfs')
    : defaultUserImage;

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        workplace: user.workplace || '',
        degrees: user.degrees || '',
        certifications: user.certifications || '',
        walletAddress: user.walletAddress || '',
        establishedSince: user.establishedSince || '',
        numWorkers: user.numWorkers || '',
        accolades: user.accolades || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSave = async () => {
    try {
      let photoUrl = formData.photo ? await uploadPhoto(formData.photo) : user.photoUrl;

      const updatedData = {
        ...formData,
        photoUrl,
        role,
      };

      await updateUserProfile(updatedData);
      alert("Profile updated successfully!");
      setIsEditing(false);

      // ✅ Fix: Reload user data in UI after saving
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const uploadPhoto = async (photo) => {
    const formData = new FormData();
    formData.append('file', photo);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer YOUR_PINATA_JWT`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    const data = await response.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      {!isEditing ? (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <div className="flex flex-col items-center">
            <img
              src={sanitizedPhotoUrl}
              alt="Profile"
              onError={(e) => (e.target.src = defaultUserImage)} // Fallback image
              className="w-32 h-32 rounded-full mb-4"
            />
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            {role === 'organization' ? (
              <>
                <p className="text-gray-500">Organization Type: {user.organizationType || "Not specified"}</p>
                <p className="text-gray-500">Established Since: {user.establishedSince ? new Date(user.establishedSince).getFullYear() : 'N/A'}</p>
                <p className="text-gray-500">Number of Workers: {user.numWorkers || 'N/A'}</p>
                <p className="text-gray-500">Accolades: {user.accolades || 'N/A'}</p>
              </>
            ) : (
              <>
                <p className="text-gray-500">Workplace: {user.workplace || 'N/A'}</p>
                <p className="text-gray-500">Degrees: {user.degrees || 'N/A'}</p>
                <h3 className="text-lg font-bold mt-4">Certificates</h3>
                <ul>
                  {certificates.length > 0 ? (
                    certificates.map((cert) => (
                      <li key={cert._id} className="mt-2 border p-2 rounded shadow-sm bg-white">
                        <img src={cert.certificateUrl} alt="Certificate" className="w-full max-w-xs rounded-md" />
                        <p className="text-gray-600">{cert.description}</p>
                        <p className="text-sm text-gray-500">
                          Issued by: <span className="font-semibold">{cert.organizationId?.name || 'Unknown'}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-semibold ${cert.status === "verified" ? "text-green-600" : "text-yellow-600"}`}>
                            {cert.status}
                          </span>
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No certificates yet.</p>
                  )}
                </ul>
              </>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-yellow-500 text-white py-2 px-4 rounded-full hover:bg-yellow-600"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          {role === 'organization' ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Established Since</label>
                <input
                  type="date"
                  name="establishedSince"
                  value={formData.establishedSince}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Number of Workers</label>
                <input
                  type="number"
                  name="numWorkers"
                  value={formData.numWorkers}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Accolades</label>
                <textarea
                  name="accolades"
                  value={formData.accolades}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Workplace</label>
                <input
                  type="text"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Degrees</label>
                <input
                  type="text"
                  name="degrees"
                  value={formData.degrees}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
              {/* Upload Certificate Button */}
              <div className="mt-4">
                <button
                  onClick={() => navigate("/upload-certificate")} // Redirects to UploadCertificate.jsx
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Upload Certificate
                </button>
              </div>

              {/* Verified Certificates Section */}
              <h3 className="text-lg font-bold mt-4">Certificates</h3>
              <ul>
                {certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <li key={cert._id} className="mt-2 border p-2 rounded shadow-sm bg-white">
                      <img src={cert.certificateUrl} alt="Certificate" className="w-full max-w-xs rounded-md" />
                      <p className="text-gray-600">{cert.description}</p>
                      <p className="text-sm text-gray-500">
                      Verified by: <span className="font-semibold">{cert.organizationId?.name || "Unknown Organization"}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Status:{" "}
                        <span className={`font-semibold ${cert.status === "verified" ? "text-green-600" : "text-yellow-600"}`}>
                          {cert.status}
                        </span>
                      </p>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">No verified certificates yet.</p>
                )}
              </ul>
              </div>
            </>
          )}
          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 mt-2"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;