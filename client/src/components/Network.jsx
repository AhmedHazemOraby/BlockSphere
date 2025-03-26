import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { ethers } from "ethers";

const contractAddress = "0xAbf4f0FA104e6dF73bDC6f2177503dC56B5aB071";

const abi = [
  {
    inputs: [
      { internalType: "uint256", name: "_id", type: "uint256" },
      { internalType: "bool", name: "_accepted", type: "bool" },
      { internalType: "string", name: "_comment", type: "string" }
    ],
    name: "verifyCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const Network = () => {
  const { user, setUser } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    // Fetch friend list and requests
    fetch(`http://localhost:5000/api/network-users/${user._id}`)
      .then(res => res.json())
      .then(data => {
        setAllUsers(data.users);
        setRequests(data.requests);
      })
      .catch(err => console.error("Failed to fetch users:", err));

    // Fetch org certificate notifications
    if (user.role === "organization") {
      fetch(`http://localhost:5000/api/get-organization-notifications/${user._id}`)
        .then(res => res.json())
        .then(data => {
          setNotifications(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching notifications:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleConnect = async (receiverId) => {
    if (user.role !== "individual") return;
    try {
      const res = await fetch("http://localhost:5000/api/friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user._id, receiverId }),
      });
      const result = await res.json();
      if (res.ok) {
        setRequests(prev => [...prev, result]);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error sending request:", error.message);
    }
  };

  const handleResponse = async (notificationId, response, comment = "", notification) => {
    try {
      if (response === "accepted") {
        console.log("🔎 FULL Notification Object:", notification);
        console.log("🧩 Certificate ID:", notification?.certificateId);
        const contractId = notification?.certificateId?.contractId;
        if (contractId == null) {
          console.error("❌ contractId is missing for this certificate", notification);
          throw new Error("Missing contractId.");
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await contract.verifyCertificate(contractId, true, comment);
        await tx.wait();
        console.log("✅ Verified on blockchain:", tx.hash);
      }

      await fetch("http://localhost:5000/api/respond-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, response, comment }),
      });

      setNotifications(notifications.filter(n => n._id !== notificationId));
      setMessage(`Certificate ${response}`);
    } catch (error) {
      console.error("❌ Error updating certificate:", error);
      setMessage("Error processing request.");
    }
  };

  const handleFriendResponse = async (requestId, status) => {
    if (user.role !== "individual") return; // Ensure only individuals can handle friend requests
  
    try {
      const res = await fetch("http://localhost:5000/api/friend-request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
  
      const updated = await res.json();
  
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId)); // Remove processed request
  
        if (status === "accepted") {
          const otherUserId = updated.sender === user._id ? updated.receiver : updated.sender;
  
          // **Update user state immediately**
          setUser((prevUser) => ({
            ...prevUser,
            connections: [...(prevUser?.connections || []), otherUserId],
          }));
  
          // **Update allUsers to reflect the change**
          setAllUsers((prevUsers) => prevUsers.filter((u) => u._id !== otherUserId));
  
          setMessage("✅ Connection accepted.");
        }
      }
    } catch (err) {
      console.error("Failed to respond to friend request:", err.message);
    }
  };      

  const getFriendRequestStatus = (otherUserId) => {
    const request = requests.find(
      (r) =>
        (r.sender === user._id && r.receiver === otherUserId) ||
        (r.receiver === user._id && r.sender === otherUserId)
    );
  
    if (!request) return { status: null, requestId: null, direction: null };
  
    if (request.status === "pending") {
      if (request.sender === user._id) {
        return { status: "pending", requestId: request._id, direction: "sent" };
      } else {
        return { status: "respond", requestId: request._id, direction: "received" };
      }
    }
  
    return { status: null, requestId: null, direction: null };
  };   

  const isConnected = (userId) => user?.connections?.includes(userId);  

  if (!user || !user._id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-medium">Loading your network...</h1>
      </div>
    );
  }   

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">My Network</h1>

      {/* Certificate Notifications for Organizations */}
      {user.role === "organization" && (
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">Pending Certificates</h2>
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length ? (
            notifications.map((notification) => (
              <div key={notification._id} className="bg-white p-4 mb-4 shadow rounded">
                <p><strong>User:</strong> {notification.userId?.name} ({notification.userId?.email})</p>
                <p><strong>Description:</strong> {notification.certificateId?.description}</p>
                {notification.certificateId?.certificateUrl ? (
                  <a href={notification.certificateId.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    View Certificate
                  </a>
                ) : <p>No certificate available.</p>}
                <div className="mt-2">
                  <button onClick={() => handleResponse(notification._id, "accepted", "", notification)} className="bg-green-500 text-white py-1 px-3 rounded mr-2">Accept</button>
                  <button onClick={() => handleResponse(notification._id, "declined", "", notification)} className="bg-red-500 text-white py-1 px-3 rounded">Decline</button>
                </div>
              </div>
            ))
          ) : <p className="text-gray-500">No pending notifications.</p>}
        </div>
      )}

      {/* All Users List */}
      {user.role === "individual" && (
        <div className="w-full max-w-3xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          {allUsers.length ? (
            allUsers
              .filter((u) => !user.connections.includes(u._id)) // Hide connections from the user list
              .map((u) => {
                const { status, requestId } = getFriendRequestStatus(u._id);

                return (
                  <div
                    key={u._id}
                    className="flex justify-between items-center bg-white p-4 mb-2 rounded shadow"
                  >
                    <div>
                      <p className="font-semibold">
                        {u.name} ({u.email})
                      </p>
                    </div>
                    <div>
                      {status === "pending" ? (
                        <button
                          disabled
                          className="bg-yellow-400 text-white px-3 py-1 rounded"
                        >
                          Pending
                        </button>
                      ) : status === "respond" ? (
                        <>
                          <button
                            onClick={() => handleFriendResponse(requestId, "accepted")}
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleFriendResponse(requestId, "declined")}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(u._id)}
                          className="bg-indigo-500 text-white px-3 py-1 rounded"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          ) : (
            <p>No users found.</p>
          )}
        </div>
      )}
      {/* Connections */}
      {user.role === "individual" && (
        <div className="w-full max-w-3xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">Connections</h2>
          {user.connections?.length ? (
            allUsers
              .filter((u) => user.connections.includes(u._id))
              .map((u) => (
                <div
                  key={u._id}
                  className="flex justify-between items-center bg-white p-4 mb-2 rounded shadow"
                >
                  <p className="text-lg">
                    {u.name} ({u.email})
                  </p>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded">
                    Chat
                  </button>
                </div>
              ))
          ) : (
            <p className="text-gray-500">No connections yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Network;