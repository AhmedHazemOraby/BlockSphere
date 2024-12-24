import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ipfsClient from '../utils/ipfsClient';
import { useUser } from '../context/UserContext';

const ProfileSetup = () => {
  const { registerUser } = useUser(); // Use registerUser from context
  const [name, setName] = useState(''); // Name field
  const [photo, setPhoto] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoUrl = '';

      if (photo) {
        const added = await ipfsClient.add(photo);
        photoUrl = `http://localhost:8080/ipfs/${added.path}`;
      }

      // Send name, email, password, and optional photo to the server
      await registerUser({
        name, // Include the name field in the payload
        email,
        password,
        photoUrl,
      });

      navigate('/home'); // Redirect to home after successful account creation
    } catch (error) {
      console.error('Error during signup:', error);
      setError('An error occurred while creating your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
        {loading ? (
          <p className="text-center">Creating your profile...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Profile Picture (optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#ffde00] text-black py-2 px-4 rounded-full hover:bg-[#e6c200]"
            >
              Create Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;