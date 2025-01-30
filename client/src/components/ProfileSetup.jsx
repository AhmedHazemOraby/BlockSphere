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
  const [establishedSince, setEstablishedSince] = useState('');
  const [numWorkers, setNumWorkers] = useState('');
  const [accolades, setAccolades] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", isOrganization ? "organization" : "individual");
  
      if (photo) {
        formData.append("photo", photo);
      }
  
      if (isOrganization) {
        formData.append("establishedSince", establishedSince);
        formData.append("numWorkers", numWorkers);
        formData.append("accolades", accolades);
      }
  
      console.log("Submitting form data to the backend:", formData);
  
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Register API error:", errorData);
        throw new Error(errorData.message || "Failed to register account");
      }
  
      const responseData = await response.json();
      console.log("Account registered successfully:", responseData);
  
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
            {isOrganization && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Established Since
                  </label>
                  <input
                    type="date"
                    value={establishedSince}
                    onChange={(e) => setEstablishedSince(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Number of Workers
                  </label>
                  <input
                    type="number"
                    value={numWorkers}
                    onChange={(e) => setNumWorkers(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Accolades</label>
                  <textarea
                    value={accolades}
                    onChange={(e) => setAccolades(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  ></textarea>
                </div>
              </>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Profile Picture (optional)
              </label>
              <input
                type="file"
                name="photo" // Match this with "photo" in multer
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