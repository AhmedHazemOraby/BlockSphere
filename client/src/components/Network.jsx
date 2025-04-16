import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { ethers } from "ethers";
import { useNavigate } from 'react-router-dom'; 

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "organization",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "CertificateUploaded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "accepted",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "comment",
        "type": "string"
      }
    ],
    "name": "CertificateVerified",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "PaymentTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RefundIssued",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "certificateCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "certificates",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "organization",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "rejected",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "comment",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "organization",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "rejected",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "comment",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_organization",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      }
    ],
    "name": "uploadCertificate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "_accepted",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "_comment",
        "type": "string"
      }
    ],
    "name": "verifyCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const Network = () => {
  const { user, setUser } = useUser();
  const [notifications, setNotifications] = useState({ certificates: [], degrees: [] });
  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { fetchUserProfile, setRefetchTrigger } = useUser();

  const navigate = useNavigate();

  if (!user || !user._id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-medium">Loading your network...</h1>
      </div>
    );
  }

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5000/api/network-users/${user._id}`)
      .then(res => res.json())
      .then(data => {
        setAllUsers(data.users);
        setRequests(data.requests);
      })
      .catch(err => console.error("Failed to fetch users:", err));

    if (user.role === "organization") {
      fetch(`http://localhost:5000/api/get-organization-notifications/${user._id}`)
      .then(res => res.json())
      .then(data => {
        setNotifications({
          certificates: data.certificates || [],
          degrees: data.degrees || [],
        });
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

  const fetchNotifications = async () => {
    const res = await fetch(`http://localhost:5000/api/get-organization-notifications/${user._id}`);
    const data = await res.json();
    setNotifications(data);
  };  

  const handleResponse = async (notificationId, response, comment = "", notification) => {
    try {
      if (response === "accepted") {
        console.log("🔎 FULL Notification Object:", notification);
        console.log("🧩 Certificate ID:", notification?.certificateId);
        const contractId = notification?.documentId?.contractId ?? null;
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

      setNotifications((prev) => ({
        ...prev,
        certificates: prev.certificates.filter((n) => n._id !== notificationId),
      }));
      setMessage(`Certificate ${response}`);
    } catch (error) {
      console.error("❌ Error updating certificate:", error);
      setMessage("Error processing request.");
    }
  };

  const handleDegreeResponse = async (notificationId, response, comment = "") => {
    try {
      const res = await fetch("http://localhost:5000/api/respond-degree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, response, comment }),
      });
  
      if (!res.ok) throw new Error("Failed to respond to degree");
  
      const data = await res.json();
      console.log("✅ Degree response submitted:", data);
  
      await fetchUserProfile();            
      setRefetchTrigger(prev => !prev);   
  
      await fetchNotifications();        
  
    } catch (error) {
      console.error("❌ Error handling degree verification:", error);
    }
  };  
  
  const handleFriendResponse = async (requestId, status) => {
    if (user.role !== "individual") return;

    try {
      const res = await fetch("http://localhost:5000/api/friend-request/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });

      const updated = await res.json();

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== requestId));

        if (status === "accepted") {
          const otherUserId = updated.sender === user._id ? updated.receiver : updated.sender;

          setUser((prevUser) => ({
            ...prevUser,
            connections: [...(prevUser?.connections || []), otherUserId],
          }));

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

  if (loading) {
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
{notifications.certificates.length ? (
  notifications.certificates.map((notification) => (
    <div key={notification._id} className="bg-white p-4 mb-4 shadow rounded">
      <p><strong>User:</strong> {notification.userId?.name} ({notification.userId?.email})</p>
      <p><strong>Description:</strong> {notification.documentId?.description}</p>
      {notification.documentId?.certificateUrl && (
        <a href={notification.documentId.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-1 px-4 rounded mt-2"> View Certificate </a>      
      )}
      <div className="mt-2">
        <button onClick={() => handleResponse(notification._id, "accepted", "", notification)} className="bg-green-500 text-white py-1 px-3 rounded mr-2">Accept</button>
        <button onClick={() => handleResponse(notification._id, "declined", "", notification)} className="bg-red-500 text-white py-1 px-3 rounded">Decline</button>
      </div>
    </div>
  ))
) : <p className="text-gray-500">No pending certificates.</p>}

<h2 className="text-2xl font-semibold mt-6 mb-4">Pending Degrees</h2>
{notifications.degrees.length ? (
  notifications.degrees.map((notification) => (
    <div key={notification._id} className="bg-white p-4 mb-4 shadow rounded">
      <p><strong>User:</strong> {notification.userId?.name} ({notification.userId?.email})</p>
      <p><strong>Description:</strong> {notification.documentId?.description}</p>
      {notification.documentId?.degreeUrl && (
        <a href={notification.documentId.degreeUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-1 px-4 rounded mt-2"> View Degree </a>
      )}
      <div className="mt-2">
        <button onClick={() => handleDegreeResponse(notification._id, "accepted")} className="bg-green-500 text-white py-1 px-3 rounded mr-2">Accept</button>
        <button onClick={() => handleDegreeResponse(notification._id, "declined")} className="bg-red-500 text-white py-1 px-3 rounded">Decline</button>
      </div>
    </div>
  ))
) : <p className="text-gray-500">No pending degrees.</p>}
        </div>
      )}

      {/* All Users List */}
      {user.role === "individual" && (
        <div className="w-full max-w-3xl mt-8">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          {allUsers.length ? (
            allUsers
              .filter((u) => !user.connections.includes(u._id))
              .map((u) => {
                const { status, requestId } = getFriendRequestStatus(u._id);
                return (
                  <div
                    key={u._id}
                    className="flex justify-between items-center bg-white p-4 mb-2 rounded shadow"
                  >
                    <div>
                    <p>
                      <span className="font-semibold text-blue-600 hover:underline cursor-pointer"
                        onClick={() => navigate(`/user/${u._id}`)}>
                        {u.name}
                      </span> ({u.email})
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
                        !isConnected(u._id) ? (
                          <button
                            onClick={() => handleConnect(u._id)}
                            className="bg-indigo-500 text-white px-3 py-1 rounded"
                          >
                            Connect
                          </button>
                        ) : (
                          <span className="text-green-500">Connected</span>
                        )
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
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => navigate(`/user/${u._id}`)}
                    >
                      {u.name}
                    </span> ({u.email})
                  </p>
                  <button onClick={() => navigate(`/chat/${u._id}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded">Chat</button>
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