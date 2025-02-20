import React from 'react';
import { useUser } from '../context/UserContext';

const OrganizationProfile = () => {
  const { user } = useUser();

  if (!user || user.role !== 'organization') {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Organization Profile</h2>
        <div className="mb-4">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Organization Type:</strong> {user.organizationType || "Not specified"}
          </p>
          </div>
        <div className="mb-4">
          <p>
            <strong>Established Since:</strong> {user.establishedSince}
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Number of Workers:</strong> {user.numWorkers}
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Accolades:</strong> {user.accolades}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfile;