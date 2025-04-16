import React from "react";
import defaultUserImage from "../../images/defaultUserImage.png";
import { FaGraduationCap, FaCertificate, FaBriefcase, FaUniversity, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileView = ({ user, role, certificates = [], degrees = [], isPublic = false }) => {
  const sanitizedPhotoUrl = user?.photoUrl?.replace("http://localhost:8080", "https://gateway.pinata.cloud/ipfs") || defaultUserImage;
  const navigate = useNavigate();

  const handleOrgClick = (orgId) => {
    if (isPublic && orgId) {
      navigate(`/user/${orgId}`);
    }
  };

  return (
    <div className="bg-white p-8 w-full max-w-4xl mx-auto rounded-md shadow space-y-6">
      <div className="flex flex-col items-center">
        <img
          src={sanitizedPhotoUrl}
          alt="Profile"
          onError={(e) => (e.target.src = defaultUserImage)}
          className="w-32 h-32 rounded-full mb-4"
        />
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>

      {role === "organization" ? (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700">
          <FaBriefcase />
          <span>Type</span>
        </div>
        <p className="text-gray-600">{user.organizationType || "N/A"}</p>

        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700">
          <FaGraduationCap />
          <span>Established</span>
        </div>
        <p className="text-gray-600">
          {user.establishedSince ? new Date(user.establishedSince).getFullYear() : "N/A"}
        </p>

        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700">
          <FaUserTie />
          <span>Workers</span>
        </div>
        <p className="text-gray-600">{user.numWorkers || "N/A"}</p>

        <div className="flex items-center justify-center gap-2 font-semibold text-gray-700">
          <FaCertificate />
          <span>Accolades</span>
        </div>
        {Array.isArray(user.accolades) && user.accolades.length > 0 ? (
          <ul className="space-y-2 text-gray-600">
            {user.accolades.map((acc, idx) => (
              <li key={idx} className="border rounded p-2">
                <strong>{acc.title}</strong> <span className="text-sm text-gray-500">({acc.year})</span>
                <p>{acc.description}</p>
                {acc.photoUrl && (
                  <img
                    src={acc.photoUrl.replace("http://localhost:8080", "https://gateway.pinata.cloud/ipfs")}
                    alt="Accolade"
                    className="w-full max-w-xs rounded mt-2"
                  />
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No accolades yet.</p>
        )}
      </div>
    ) : (
        <>
          <h3 className="text-lg font-bold flex items-center gap-2"><FaGraduationCap /> Education</h3>
          <ul>
            {Array.isArray(user.education) && user.education.length > 0 ? (
              user.education.map((edu, i) => (
                <li key={i} className="mb-1">
                  <strong>{edu.title}</strong>: {edu.description} <span className="text-sm text-gray-400">({edu.year})</span>
                </li>
              ))
            ) : (
              <p>No education entries yet.</p>
            )}
          </ul>

          <h3 className="text-lg font-bold"><FaUserTie /> Internships</h3>
          <ul>
            {Array.isArray(user.internships) && user.internships.length > 0 ? (
              user.internships.map((item, i) => (
                <li key={i} className="mb-1">
                  <strong>{item.title}</strong>: {item.description} <span className="text-sm text-gray-400">({item.year})</span>
                </li>
              ))
            ) : (
              <p>No internship entries yet.</p>
            )}
          </ul>

          <h3 className="text-lg font-bold"><FaBriefcase /> Job Experiences</h3>
          <ul>
            {Array.isArray(user.jobExperiences) && user.jobExperiences.length > 0 ? (
              user.jobExperiences.map((item, i) => (
                <li key={i} className="mb-1">
                  <strong>{item.title}</strong>: {item.description} <span className="text-sm text-gray-400">({item.year})</span>
                </li>
              ))
            ) : (
              <p>No job experiences yet.</p>
            )}
          </ul>

          <h3 className="text-lg font-bold"><FaUniversity /> Degrees</h3>
          <ul>
            {degrees.length > 0 ? (
              degrees.map((deg) => (
                <li key={deg._id} className="border rounded p-2 my-2 bg-gray-50">
                  <img src={deg.degreeUrl} alt="Degree" className="w-full max-w-xs rounded-md" />
                  <p>{deg.description}</p>
                  <p className="text-sm text-gray-500">
                    Verified by:{" "}
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleOrgClick(deg.organizationId?._id)}
                    >
                      {deg.organizationId?.name || "Unknown"}
                    </span>
                  </p>
                </li>
              ))
            ) : (
              <p>No verified degrees yet.</p>
            )}
          </ul>

          <h3 className="text-lg font-bold"><FaCertificate /> Certificates</h3>
          <ul>
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <li key={cert._id} className="border rounded p-2 my-2 bg-gray-50">
                  <img src={cert.certificateUrl} alt="Certificate" className="w-full max-w-xs rounded-md" />
                  <p>{cert.description}</p>
                  <p className="text-sm text-gray-500">
                    Issued by:{" "}
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => handleOrgClick(cert.organizationId?._id)}
                    >
                      {cert.organizationId?.name || "Unknown"}
                    </span>
                  </p>
                </li>
              ))
            ) : (
              <p>No verified certificates.</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProfileView;