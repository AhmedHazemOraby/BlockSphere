import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import defaultUserImage from '../../images/defaultUserImage.png';

const Profile = () => {
  const navigate = useNavigate();
  const { user, role, updateUserProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    photo: null,
    workplace: user?.workplace || '',
    degrees: user?.degrees || '',
    certifications: user?.certifications || '',
    walletAddress: user?.walletAddress || '',
    establishedSince: user?.establishedSince || '',
    numWorkers: user?.numWorkers || '',
    accolades: user?.accolades || '',
  });

  const [walletConnected, setWalletConnected] = useState(!!user?.walletAddress);

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
      let photoUrl = formData.photo
        ? await uploadPhoto(formData.photo)
        : user.photoUrl;
  
      const updatedData = {
        ...formData,
        photoUrl,
        role,
      };
  
      await updateUserProfile(updatedData);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
                <p className="text-gray-500">Established Since: {user.establishedSince || 'N/A'}</p>
                <p className="text-gray-500">Number of Workers: {user.numWorkers || 'N/A'}</p>
                <p className="text-gray-500">Accolades: {user.accolades || 'N/A'}</p>
              </>
            ) : (
              <>
                <p className="text-gray-500">Workplace: {user.workplace || 'N/A'}</p>
                <p className="text-gray-500">Degrees: {user.degrees || 'N/A'}</p>
                <p className="text-gray-500">Certifications: {user.certifications || 'N/A'}</p>
                <p className="text-gray-500">Wallet: {user.walletAddress || 'Not connected'}</p>
              </>
            )}
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
                <label className="block text-gray-700 mb-2">Certifications</label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </>
          )}
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