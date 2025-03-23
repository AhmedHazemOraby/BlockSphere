import React, { useState, useEffect } from "react";

const OrganizationDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/get-organization-notifications/ORGANIZATION_ID`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      });
  }, []);

  const handleResponse = async (notificationId, response, comment = "") => {
    try {
      const res = await fetch("http://localhost:5000/api/respond-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, response, comment }),
      });

      if (!res.ok) {
        throw new Error("Failed to update certificate status.");
      }

      setNotifications(notifications.filter((n) => n._id !== notificationId));
      setMessage(`Certificate ${response} successfully.`);
    } catch (error) {
      console.error("Error updating certificate:", error);
      setMessage("Error processing request.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Organization Dashboard</h2>
      {message && <p className="text-green-600">{message}</p>}

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No pending notifications.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification._id} className="bg-white p-4 mb-4 shadow rounded">
            <p><strong>User:</strong> {notification.userId.name} ({notification.userId.email})</p>
            <p><strong>Description:</strong> {notification.message}</p>
            <a href={notification.certificateId.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              View Certificate
            </a>

            <div className="mt-2">
              <button
                onClick={() => handleResponse(notification._id, "accepted")}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleResponse(notification._id, "declined")}
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrganizationDashboard;