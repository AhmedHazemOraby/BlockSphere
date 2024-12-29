import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import defaultUserImage from '../../images/defaultUserImage.png';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    photo: null,
    workplace: user?.workplace || '',
    degrees: user?.degrees || '',
    certifications: user?.certifications || '',
    walletAddress: user?.walletAddress || '',
  });

  const [walletConnected, setWalletConnected] = useState(!!user?.walletAddress);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData((prev) => ({ ...prev, walletAddress: accounts[0] }));
        setWalletConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet!');
    }
  };

  const handleSave = async () => {
    try {
      // Ensure the photo file is uploaded and URL is generated before saving
      let photoUrl = formData.photo ? await uploadPhoto(formData.photo) : user.photoUrl;

      // Update the profile data
      const updatedData = {
        ...formData,
        photoUrl,
      };

      await updateUserProfile(updatedData); // This should update the backend
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const uploadPhoto = async (photo) => {
    // Function to upload the photo to IPFS or a file storage system
    const formData = new FormData();
    formData.append('file', photo);

    const response = await fetch('/api/upload', { // Example upload endpoint
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    const data = await response.json();
    return data.photoUrl; // Assumes API returns a `photoUrl`
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
              src={user.photoUrl || defaultUserImage}
              alt="Profile"
              className="w-32 h-32 rounded-full mb-4"
            />
            <h2 className="text-xl font-bold">{user.name || 'Unnamed User'}</h2>
            <p className="text-gray-500">{user.email || 'No email provided'}</p>
            <p className="text-gray-500">Workplace: {user.workplace || 'N/A'}</p>
            <p className="text-gray-500">Degrees: {user.degrees || 'N/A'}</p>
            <p className="text-gray-500">Certifications: {user.certifications || 'N/A'}</p>
            <p className="text-gray-500">
              Wallet: {user.walletAddress || 'Not connected'}
            </p>
            <button
              onClick={connectWallet}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600"
            >
              {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
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
            onClick={() => setIsEditing(false)}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 mt-2"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;