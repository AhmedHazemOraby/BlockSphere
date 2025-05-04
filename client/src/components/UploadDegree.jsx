import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { ethers } from "ethers";

const UploadDegree = () => {
  const { user } = useUser();
  const [degree, setDegree] = useState(null);
  const [description, setDescription] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [organizationWallet, setOrganizationWallet] = useState("");
  const [uploadedDegree, setUploadedDegree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (organizationType) {
      fetch(`http://localhost:5000/api/get-organizations?type=${organizationType}`)
        .then((res) => res.json())
        .then((data) => setOrganizations(data))
        .catch((err) => console.error("Error fetching organizations:", err));
    }
  }, [organizationType]);

  useEffect(() => {
    if (selectedOrganization) {
      fetch(`http://localhost:5000/api/get-organization-wallet/${selectedOrganization}`)
        .then((res) => res.json())
        .then((data) => setOrganizationWallet(data.walletAddress))
        .catch((err) => {
          console.error("Error fetching organization wallet:", err);
          setOrganizationWallet("");
        });
    }
  }, [selectedOrganization]);

  const handleFileChange = (e) => setDegree(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!degree || !description || !selectedOrganization) {
      setMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("organizationId", selectedOrganization);
      formData.append("degree", degree);
      formData.append("description", description);

      const res = await fetch("http://localhost:5000/api/upload-degree", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setUploadedDegree(data.degree);
      setMessage("Degree uploaded! Please pay the fee to proceed.");
    } catch (error) {
      setMessage("Error uploading degree.");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async () => {
    if (!window.ethereum || !uploadedDegree || !organizationWallet) {
      setMessage("Missing Ethereum environment or data.");
      return;
    }

    try {
      setPaying(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
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

      const contract = new ethers.Contract(contractAddress, abi, signer);
      console.log("Uploading with IPFS URL:", uploadedDegree.degreeUrl);
      const ipfsHash = uploadedDegree.degreeUrl || uploadedDegree.fileUrl || uploadedDegree.ipfsHash;

      if (!ipfsHash) {
        throw new Error("Missing IPFS hash for the uploaded degree.");
      }

      const tx = await contract.uploadCertificate(
        organizationWallet,
        ipfsHash,
        { value: ethers.parseEther("0.001") }
      );

      const receipt = await tx.wait();

      let contractDegreeId = null;

      const filter = contract.filters.CertificateUploaded();
      const fromBlock = Math.max(receipt.blockNumber - 5, 0);
const toBlock = receipt.blockNumber + 5;

const events = await contract.queryFilter(filter, fromBlock, toBlock);


for (const event of events) {
  if (event.transactionHash === tx.hash) {
    contractDegreeId = Number(event.args.id);
    break;
  }
}

      if (contractDegreeId == null) throw new Error("Missing contract ID");

      await fetch("http://localhost:5000/api/pay-degree-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          degreeId: uploadedDegree._id,
          transactionHash: tx.hash,
          contractId: contractDegreeId,
        }),
      });

      setUploadedDegree((prev) => ({ ...prev, transactionHash: tx.hash, contractId: contractDegreeId }));
      setMessage("Payment successful! Awaiting verification.");
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Degree</h2>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <label className="block mb-2">Select Organization Type:</label>
        <select value={organizationType} onChange={(e) => setOrganizationType(e.target.value)} className="w-full p-2 border mb-4">
          <option value="">Select Type</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>

        {organizations.length > 0 && (
          <>
            <label className="block mb-2">Select Organization:</label>
            <select value={selectedOrganization} onChange={(e) => setSelectedOrganization(e.target.value)} className="w-full p-2 border mb-4">
              <option value="">Select</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>{org.name} - {org.walletAddress}</option>
              ))}
            </select>
          </>
        )}

        <label className="block mb-2">Degree Description:</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border mb-4" required />

        <label className="block mb-2">Upload Degree:</label>
        <input type="file" onChange={handleFileChange} className="w-full p-2 border mb-4" />

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded" disabled={loading}>
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>

      {uploadedDegree && !uploadedDegree.transactionHash && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>Degree uploaded! Please pay the fee.</p>
          <button onClick={handlePayFee} disabled={paying} className="bg-yellow-500 text-white py-2 px-4 rounded mt-2">
            {paying ? "Processing..." : "Pay Fee (0.001 ETH)"}
          </button>
        </div>
      )}

      {uploadedDegree?.transactionHash && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-600">Payment successful. Awaiting verification.</p>
        </div>
      )}
    </div>
  );
};

export default UploadDegree;