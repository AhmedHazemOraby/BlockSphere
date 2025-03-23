import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import defaultUserImage from '../../images/defaultUserImage.png';

const EditProfile = () => {
  const { user, updateUserProfile } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    photo: null,
    workplace: user?.workplace || '',
    degrees: user?.degrees || '',
    certifications: user?.certifications || '',
    walletAddress: user?.walletAddress || '',
  });

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
      let photoUrl = user.photoUrl;
      if (formData.photo) {
        photoUrl = await uploadPhoto(formData.photo);
      }

      const updatedData = {
        ...formData,
        photoUrl,
      };

      await updateUserProfile(updatedData);
      alert("Profile updated successfully!");

      // ✅ Ensure profile page updates
      navigate("/profile");
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile!");
    }
  };

  const uploadPhoto = async (photo) => {
    const formData = new FormData();
    formData.append('file', photo);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
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
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Profile Picture</label>
          <input
            type="file"
            name="photo"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
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
          <label className="block text-gray-700 mb-2">Certifications</label>
          <input
            type="text"
            name="certifications"
            value={formData.certifications}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600 mt-2"
        >
          Save Changes
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;