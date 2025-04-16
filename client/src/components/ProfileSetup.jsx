import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProfileSetup = () => {
  const { registerUser } = useUser();
  const [isOrganization, setIsOrganization] = useState(false);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [establishedSince, setEstablishedSince] = useState('');
  const [numWorkers, setNumWorkers] = useState('');
  const [accolades, setAccolades] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("Wallet connection failed:", error);
        setError("Failed to connect wallet.");
      }
    } else {
      setError("Please install MetaMask to use this feature.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!walletAddress) {
      setError("Please connect your wallet before signing up.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("walletAddress", walletAddress);
      formData.append("role", isOrganization ? "organization" : "individual");

      if (photo) {
        formData.append("photo", photo);
      }

      if (isOrganization) {
        formData.append("organizationType", organizationType);
      }

      console.log("Submitting form data to the backend:", formData);

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register account");
      }

      alert("Signup successful!");
      navigate("/home");
    } catch (error) {
      console.error("Error creating profile:", error.message);
      setError(error.message || "Failed to create profile.");
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
              <label className="block text-gray-700 mb-2">
                Are you an organization?
              </label>
              <input
                type="checkbox"
                checked={isOrganization}
                onChange={(e) => setIsOrganization(e.target.checked)}
                className="mr-2"
              />
              <span>{isOrganization ? 'Yes' : 'No'}</span>
            </div>

            {isOrganization && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Type of Organization</label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

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
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Wallet Address</label>
              <p className="text-gray-500">{walletAddress || "Not connected"}</p>
              <button type="button" onClick={connectWallet}
                className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">
                {walletAddress ? "Wallet Connected" : "Connect Wallet"}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Profile Picture (optional)
              </label>
              <input
                type="file"
                name="photo"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#ffde00] text-black py-2 px-4 rounded-full hover:bg-[#e6c200]"
              disabled={!walletAddress}
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