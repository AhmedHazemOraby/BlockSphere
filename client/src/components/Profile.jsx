import React from 'react';
import { useUser } from '../context/UserContext';
import defaultUserImage from '../../images/defaultUserImage.png';

const Profile = () => {
  const { user } = useUser(); // Access user context

  // Handle case where user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Please log in to view your profile.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center">
          <img
            src={user.photoUrl || defaultUserImage}
            alt="Profile"
            className="w-32 h-32 rounded-full mb-4"
          />
          <h2 className="text-xl font-bold">{user.name || 'Unnamed User'}</h2>
          <p className="text-gray-500">{user.email || 'No email provided'}</p>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-bold">Achievements</h3>
          <ul className="list-disc list-inside text-gray-700">
            {user.achievements?.length ? (
              user.achievements.map((achievement, index) => (
                <li key={index}>{achievement}</li>
              ))
            ) : (
              <p className="text-gray-500">No achievements added yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;