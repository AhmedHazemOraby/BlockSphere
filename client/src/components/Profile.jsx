import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import defaultUserImage from '../../images/defaultUserImage.png';
import { FaBriefcase, FaGraduationCap, FaUserTie, FaCertificate, FaAward } from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();
  const { userProfile, role, updateUserProfile, fetchUserProfile } = useUser();
  const user = userProfile;
  const [certificates, setCertificates] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newEdu, setNewEdu] = useState({ title: "", description: "", year: "" });
  const [newJob, setNewJob] = useState({ title: "", description: "", year: "" });
  const [newIntern, setNewIntern] = useState({ title: "", description: "", year: "" });
  const [showEduForm, setShowEduForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showInternForm, setShowInternForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photo: null,
    degrees: "",
    certifications: "",
    walletAddress: "",
    establishedSince: "",
    numWorkers: "",
    accolades: "",
    education: Array.isArray(user?.education) ? user.education : [],
    jobExperiences: Array.isArray(user?.jobExperiences) ? user.jobExperiences : [],
    internships: Array.isArray(user?.internships) ? user.internships : [],
  });

  useEffect(() => {
  if (userProfile) {
    setFormData({
      name: userProfile.name || "",
      email: userProfile.email || "",
      degrees: userProfile.degrees || "",
      certifications: userProfile.certifications || "",
      walletAddress: userProfile.walletAddress || "",
      establishedSince: userProfile.establishedSince || "",
      numWorkers: userProfile.numWorkers || "",
      accolades: userProfile.accolades || "",
      education: Array.isArray(userProfile?.education) ? userProfile.education : [],
      jobExperiences: Array.isArray(userProfile?.jobExperiences) ? userProfile.jobExperiences : [],
      internships: Array.isArray(userProfile?.internships) ? userProfile.internships : [],
    });

    if (userProfile._id) {
      fetchVerifiedCertificates(userProfile._id);
      fetchVerifiedDegrees(userProfile._id);
    }
  }
}, [userProfile]);
  
  // ✅ Function to fetch verified certificates
  const fetchVerifiedCertificates = async (userProfileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get-user-certificates/${userProfileId}`);  
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      console.log("📦 Certificates fetched from API:", data);
      setCertificates(data.filter(cert => cert.status === "verified"));
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  }; 
  
  const fetchVerifiedDegrees = async (userProfileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get-user-degrees/${userProfileId}`);
      if (!response.ok) throw new Error("Failed to fetch degrees");
      const data = await response.json();
      setDegrees(data.filter((deg) => deg.status === "verified"));
    } catch (err) {
      console.error("Error fetching degrees:", err);
    }
  };  

  const sanitizedPhotoUrl = userProfile?.photoUrl
    ? userProfile.photoUrl.replace('http://localhost:8080', 'https://gateway.pinata.cloud/ipfs')
    : defaultUserImage;

  useEffect(() => {
  if (userProfile) {
    setFormData({
      name: userProfile.name || "",
      email: userProfile.email || "",
      degrees: userProfile.degrees || "",
      certifications: userProfile.certifications || "",
      walletAddress: userProfile.walletAddress || "",
      establishedSince: userProfile.establishedSince || "",
      numWorkers: userProfile.numWorkers || "",
      accolades: userProfile.accolades || "",
      education: Array.isArray(userProfile?.education) ? userProfile.education : [],
      jobExperiences: Array.isArray(userProfile?.jobExperiences) ? userProfile.jobExperiences : [],
      internships: Array.isArray(userProfile?.internships) ? userProfile.internships : [],
    });

    if (userProfile._id) {
      fetchVerifiedCertificates(userProfile._id);
      fetchVerifiedDegrees(userProfile._id);
    }
  }
}, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSave = async () => {
    try {
      const payload = new FormData();
      payload.append("email", formData.email);
      payload.append("role", role);
      payload.append("name", formData.name);
      payload.append("walletAddress", formData.walletAddress || "");
      payload.append("establishedSince", formData.establishedSince || "");
      payload.append("numWorkers", formData.numWorkers || "");
      payload.append("accolades", formData.accolades || "");
  
      // Convert structured fields into JSON strings
      payload.append("education", JSON.stringify(formData.education));
      payload.append("jobExperiences", JSON.stringify(formData.jobExperiences));
      payload.append("internships", JSON.stringify(formData.internships));
      payload.append("degrees", JSON.stringify(formData.degrees));
      payload.append("certifications", JSON.stringify(formData.certifications));
  
      if (formData.photo) {
        payload.append("photo", formData.photo);
      }
  
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        body: payload,
      });
  
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
  
      const data = await response.json();
      console.log("✅ Profile updated:", data);
  
      await fetchUserProfile(); // refresh context
  
      setTimeout(() => {
        alert("Profile updated successfully!");
        setIsEditing(false);
      }, 200);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };  

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
    setNewEdu({ title: "", description: "", year: "" });
    setShowEduForm(false);
  };
  
  const handleAddJob = () => {
    setFormData((prev) => ({
      ...prev,
      jobExperiences: [...prev.jobExperiences, newJob],
    }));
    setNewJob({ title: "", description: "", year: "" });
    setShowJobForm(false);
  };
  
  const handleAddIntern = () => {
    setFormData((prev) => ({
      ...prev,
      internships: [...prev.internships, newIntern],
    }));
    setNewIntern({ title: "", description: "", year: "" });
    setShowInternForm(false);
  };  

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const ipfsUrl = await uploadPhoto(file);
  
      const updatedData = {
        ...formData,
        photoUrl: ipfsUrl,
      };
  
      await updateUserProfile(updatedData);
      await fetchUserProfile();
      alert("Profile picture updated!");
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      alert("Failed to upload profile picture.");
    }
  };  

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      {!isEditing ? (
        <div className="bg-white p-8 w-full max-w-4xl mx-auto rounded-md shadow-sm space-y-8">
          <div className="flex flex-col items-center">
            <img
              src={sanitizedPhotoUrl}
              alt="Profile"
              onError={(e) => (e.target.src = defaultUserImage)}
              className="w-32 h-32 rounded-full mb-4"
            />
            <h2 className="text-xl font-bold">{userProfile.name}</h2>
            <p className="text-gray-500">{userProfile.email}</p>
            {role === 'organization' ? (
              <>
                <p className="text-gray-500">Organization Type: {userProfile.organizationType || "Not specified"}</p>
                <p className="text-gray-500">Established Since: {userProfile.establishedSince ? new Date(userProfile.establishedSince).getFullYear() : 'N/A'}</p>
                <p className="text-gray-500">Number of Workers: {userProfile.numWorkers || 'N/A'}</p>
                <p className="text-gray-500">Accolades: {userProfile.accolades || 'N/A'}</p>
              </>
            ) : (
              <>
                  <h3 className="text-lg font-bold mt-4 flex items-center gap-2">
                    <FaGraduationCap />Education
                  </h3>
                  {Array.isArray(userProfile.education) && userProfile.education.length > 0 ? (
                    <ul>
                      {userProfile.education.map((edu, idx) => (
                        <li key={idx} className="mb-2">
                          <strong>{edu.title}</strong>: {edu.description} <span className="text-xs text-gray-400">({edu.year})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No education entries yet.</p>
                  )}
                  <h3 className="text-lg font-bold mt-4 flex items-center gap-2">
                    <FaUserTie />Internships
                  </h3>
                    {Array.isArray(userProfile.internships) && userProfile.internships.length > 0 ? (
                      <ul className="mb-4">
                        {userProfile.internships.map((intern, idx) => (
                          <li key={idx} className="mb-2">
                            <strong>{intern.title}</strong> — {intern.description} <span className="text-xs text-gray-400">({intern.year})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-4">No internship entries yet.</p>
                    )}
                  <h3 className="text-lg font-bold mt-4 flex items-center gap-2">
                    <FaBriefcase />Job Experiences
                  </h3>
                    {Array.isArray(userProfile.jobExperiences) && userProfile.jobExperiences.length > 0 ? (
                      <ul className="mb-4">
                        {userProfile.jobExperiences.map((job, idx) => (
                          <li key={idx} className="mb-2">
                            <strong>{job.title}</strong> — {job.description} <span className="text-xs text-gray-400">({job.year})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-4">No job experiences yet.</p>
                    )}
                  <h3 className="text-lg font-bold mt-4 flex items-center gap-2">
                    <FaAward />Degrees
                  </h3>
                  <ul>
                    {degrees.length > 0 ? (
                      degrees.map((deg) => (
                        <li key={deg._id} className="mt-2 border p-2 rounded shadow-sm bg-white">
                          <img src={deg.degreeUrl} alt="Degree" className="w-full max-w-xs rounded-md" />
                          <p className="text-gray-600">{deg.description}</p>
                          <p className="text-sm text-gray-500">
                            Verified by: <span className="font-semibold">{deg.organizationId?.name || "Unknown Organization"}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Status:{" "}
                            <span className={`font-semibold ${deg.status === "verified" ? "text-green-600" : "text-yellow-600"}`}>
                              {deg.status}
                            </span>
                          </p>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500">No verified degrees yet.</p>
                    )}
                  </ul>
                  <h3 className="text-lg font-bold mt-4 flex items-center gap-2">
                    <FaCertificate />Certificates
                  </h3>
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
            <div className="flex flex-col items-center mb-4">
              <img
                src={formData.photo ? URL.createObjectURL(formData.photo) : sanitizedPhotoUrl}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-2"
                onError={(e) => (e.target.src = defaultUserImage)}
              />
              <label htmlFor="profilePicInput" className="bg-yellow-500 text-white text-sm px-4 py-1 rounded-full cursor-pointer hover:bg-yellow-600">
                Change Profile Picture
              </label>
              <input
                id="profilePicInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
          </div>
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
              <h3 className="text-md font-semibold mb-2">Education</h3>
              <ul>
                {formData.education.map((edu, i) => (
                  <li key={i} className="mb-2 border rounded p-2">
                    <strong>{edu.title}</strong> — {edu.description} <span className="text-xs text-gray-400">{edu.year}</span>
                  </li>
                ))}
              </ul>
              {showEduForm ? (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newEdu.title}
                    onChange={(e) => setNewEdu({ ...newEdu, title: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded"
                  />
                  <textarea
                    placeholder="Description"
                    value={newEdu.description}
                    onChange={(e) => setNewEdu({ ...newEdu, description: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={newEdu.year}
                    onChange={(e) => setNewEdu({ ...newEdu, year: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddEducation}
                      className="bg-green-500 text-white px-4 py-1 rounded"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowEduForm(false)}
                      className="bg-red-400 text-white px-4 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowEduForm(true)}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 px-4 py-1 rounded mt-2"
                >
                  + Add Education
                </button>
              )}
              <h3 className="text-md font-semibold mb-2 mt-4">Internships</h3>
                <ul>
                  {formData.internships.map((intern, i) => (
                    <li key={i} className="mb-2 border rounded p-2">
                      <strong>{intern.title}</strong> — {intern.description} <span className="text-xs text-gray-400">{intern.year}</span>
                    </li>
                  ))}
                </ul>
                {showInternForm ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newIntern.title}
                      onChange={(e) => setNewIntern({ ...newIntern, title: e.target.value })}
                      className="w-full mb-2 p-2 border border-gray-300 rounded"
                    />
                    <textarea
                      placeholder="Description"
                      value={newIntern.description}
                      onChange={(e) => setNewIntern({ ...newIntern, description: e.target.value })}
                      className="w-full mb-2 p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={newIntern.year}
                      onChange={(e) => setNewIntern({ ...newIntern, year: e.target.value })}
                      className="w-full mb-2 p-2 border border-gray-300 rounded"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddIntern}
                        className="bg-green-500 text-white px-4 py-1 rounded"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowInternForm(false)}
                        className="bg-red-400 text-white px-4 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowInternForm(true)}
                    className="bg-yellow-500 text-white px-4 py-1 rounded"
                  >
                    + Add Internship
                  </button>
                )}

              <h3 className="text-md font-semibold mb-2 mt-4">Job Experiences</h3>
              <ul>
                {formData.jobExperiences.map((job, i) => (
                  <li key={i} className="mb-2 border rounded p-2">
                    <strong>{job.title}</strong> — {job.description} <span className="text-xs text-gray-400">{job.year}</span>
                  </li>
                ))}
              </ul>
              {showJobForm ? (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded"
                  />
                  <textarea
                    placeholder="Description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={newJob.year}
                    onChange={(e) => setNewJob({ ...newJob, year: e.target.value })}
                    className="w-full mb-2 p-2 border border-gray-300 rounded"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddJob}
                      className="bg-green-500 text-white px-4 py-1 rounded"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowJobForm(false)}
                      className="bg-red-400 text-white px-4 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded"
                >
                  + Add Job Experience
                </button>
              )}    
              <h3 className="text-lg font-bold mt-6">Degrees</h3>
                <ul>
                  {degrees.length > 0 ? (
                    degrees.map((deg) => (
                      <li key={deg._id} className="mt-2 border p-2 rounded shadow-sm bg-white">
                        <img src={deg.degreeUrl} alt="Degree" className="w-full max-w-xs rounded-md" />
                        <p className="text-gray-600">{deg.description}</p>
                        <p className="text-sm text-gray-500">
                          Verified by: <span className="font-semibold">{deg.organizationId?.name || "Unknown Organization"}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Status:{" "}
                          <span className={`font-semibold ${deg.status === "verified" ? "text-green-600" : "text-yellow-600"}`}>
                            {deg.status}
                          </span>
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No verified degrees yet.</p>
                  )}
                </ul>
                <button
                  onClick={() => navigate("/upload-degree")}
                  className="bg-yellow-500 text-white px-4 py-1 rounded"
                >
                  Upload Degree
                </button>
              <div className="mb-4">
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
            {/* Upload Certificate Button */}
            {role !== "organization" && (
              <div className="mt-4">
                <button
                  onClick={() => navigate("/upload-certificate")}
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                >
                  Upload Certificate
                </button>
              </div>
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