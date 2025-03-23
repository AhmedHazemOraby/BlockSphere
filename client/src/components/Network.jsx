import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { ethers } from "ethers";

// ✅ Define your contract address
const contractAddress = "0xAbf4f0FA104e6dF73bDC6f2177503dC56B5aB071"; // Replace with actual deployed contract address

// ✅ Define the ABI (contract functions)
const abi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_id", "type": "uint256" },
      { "internalType": "bool", "name": "_accepted", "type": "bool" },
      { "internalType": "string", "name": "_comment", "type": "string" }
    ],
    "name": "verifyCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const Network = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch notifications for organizations only
  useEffect(() => {
    if (!user) {
      console.error("❌ No user found, cannot fetch notifications.");
      return;
    }
  
    console.log("✅ User logged in:", user);
    console.log("🛠️ Checking user role:", user.role || "Role not yet available");
  
    if (!user.role) {
      console.warn("⚠️ User role is missing, waiting...");
      return; // Prevent further execution until role is defined
    }
  
    if (user.role !== "organization") {
      console.warn("❌ User is NOT an organization. Skipping notification fetch.");
      return;
    }
  
    console.log("✅ Fetching notifications for organization:", user._id);
  
    fetch(`http://localhost:5000/api/get-organization-notifications/${user._id}`)
      .then((res) => {
        console.log("📡 API Response Status:", res.status);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("📩 API Response Data:", JSON.stringify(data, null, 2));
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching notifications:", error);
        setLoading(false);
      });
  }, [user]);    

  // Handle accept/decline actions
  const handleResponse = async (notificationId, response, comment = "", notification) => {
    try {
      if (response === "accepted") {
        console.log("🔹 Processing blockchain transaction...");
  
        const contractId = notification?.certificateId?.contractId;
  
        if (contractId === undefined || contractId === null) {
          throw new Error("Missing contractId for this certificate.");
        }
  
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
  
        const tx = await contract.verifyCertificate(contractId, true, comment);
        await tx.wait();
        console.log("✅ Certificate verified on blockchain. TX:", tx.hash);
  
        await fetch("http://localhost:5000/api/respond-certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId, response, comment }),
        });
  
        setMessage("✅ Certificate approved and ETH sent.");
      } else {
        console.log("❌ Certificate declined, refunding user...");
  
        await fetch("http://localhost:5000/api/respond-certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId, response, comment }),
        });
  
        setMessage("Certificate declined and user refunded.");
      }
  
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (error) {
      console.error("❌ Error updating certificate:", error);
      setMessage("Error processing request.");
    }
  };      

  // If user is not logged in
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

      {/* ✅ Show notifications ONLY for organizations */}
      {user.role === "organization" && (
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">Pending Certificates</h2>

          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification._id} className="bg-white p-4 mb-4 shadow rounded">
                <p><strong>User:</strong> {notification.userId?.name || "Unknown"} ({notification.userId?.email || "No Email"})</p>
                <p><strong>Description:</strong> {notification.certificateId?.description || "No description provided."}</p>

                {notification.certificateId?.certificateUrl ? (
                  <a href={notification.certificateId.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View Certificate
                  </a>
                ) : (
                  <p className="text-red-500">No certificate available.</p>
                )}

                <div className="mt-2">
                <button
                  onClick={() => handleResponse(notification._id, "accepted", "", notification)}
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(notification._id, "declined", "", notification)}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Decline
                </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No pending notifications.</p>
          )}
        </div>
      )}

      {/* ✅ Show connections for both users & organizations */}
      <h2 className="text-2xl font-semibold mt-6">Connections</h2>
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