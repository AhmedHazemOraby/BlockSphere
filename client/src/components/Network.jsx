import React from 'react';
import { useUser } from '../context/UserContext';

const Network = () => {
  const { user } = useUser(); // Access user context

  // Handle case where user is not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Please log in to view your network.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">My Network</h1>
      {user.connections?.length ? (
        <ul className="list-disc list-inside">
          {user.connections.map((connection) => (
            <li key={connection.id} className="text-lg text-gray-800">
              {connection.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-lg text-gray-500">No connections yet.</p>
      )}
    </div>
  );
};

export default Network;