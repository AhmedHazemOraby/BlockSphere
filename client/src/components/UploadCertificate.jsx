import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { ethers } from "ethers";

const UploadCertificate = () => {
  const { user } = useUser();
  const [certificate, setCertificate] = useState(null);
  const [description, setDescription] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [organizationWallet, setOrganizationWallet] = useState(""); // ✅ Store the selected org's wallet
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadedCertificate, setUploadedCertificate] = useState(null);

  // Fetch organizations when the user selects a type
  useEffect(() => {
    if (organizationType) {
        fetch(`http://localhost:5000/api/get-organizations?type=${organizationType}`)
            .then((res) => {
                console.log("📡 API Response Status:", res.status); // ✅ Debug
                return res.text(); // Read raw response first
            })
            .then((data) => {
                console.log("📜 Raw API Response:", data); // ✅ Debug raw response

                try {
                    const jsonData = JSON.parse(data); // Try parsing JSON
                    if (Array.isArray(jsonData)) {
                        setOrganizations(jsonData);
                    } else {
                        setOrganizations([]);
                    }
                } catch (err) {
                    console.error("❌ JSON Parse Error:", err, "Raw Data:", data);
                    setOrganizations([]);
                }
            })
            .catch((err) => {
                console.error("❌ Error fetching organizations:", err);
                setOrganizations([]);
            });
    } else {
        setOrganizations([]);
    }
}, [organizationType]);    

  // ✅ Fetch selected organization's wallet address
  useEffect(() => {
    if (selectedOrganization) {
      fetch(`http://localhost:5000/api/get-organization-wallet/${selectedOrganization}`)
        .then((res) => {
          console.log("📡 Fetching organization wallet, status:", res.status);
          
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          
          return res.json(); // Ensure JSON parsing happens only when response is valid
        })
        .then((data) => {
          console.log("✅ Organization Wallet Data:", data);
          setOrganizationWallet(data.walletAddress);
        })
        .catch((err) => {
          console.error("❌ Error fetching organization wallet:", err);
          setOrganizationWallet(""); // Reset wallet to avoid undefined errors
        });
    } else {
      setOrganizationWallet("");
    }
  }, [selectedOrganization]);    

  const handleFileChange = (e) => {
    setCertificate(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    if (!certificate || !description || !selectedOrganization) {
      setMessage("⚠️ Please fill in all fields.");
      setLoading(false);
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("organizationId", selectedOrganization);
      formData.append("certificate", certificate);
      formData.append("description", description);
  
      const response = await fetch("http://localhost:5000/api/upload-certificate", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      console.log("✅ Certificate Upload Response:", data);
  
      if (!response.ok || !data.certificate) {
        throw new Error(data.message || "Failed to upload certificate.");
      }
  
      setUploadedCertificate(data.certificate);
      setMessage("✅ Certificate uploaded successfully! Please pay the fee.");
    } catch (error) {
      setMessage("❌ Error uploading certificate.");
      console.error("Upload error:", error);
      setUploadedCertificate(null);
    } finally {
      setLoading(false);
    }
  };      
  
  console.log("📜 Uploaded Certificate Data:", uploadedCertificate);
  console.log("✅ Certificate URL:", uploadedCertificate?.certificateUrl);
  console.log("✅ Organization Wallet:", organizationWallet);  

  const [paying, setPaying] = useState(false); // Track payment process

  const handlePayFee = async () => {
    if (!window.ethereum) {
      setMessage("MetaMask is not installed.");
      return;
    }

    if (!uploadedCertificate) {
      setMessage("No certificate uploaded yet.");
      return;
    }

    if (!organizationWallet || !uploadedCertificate.certificateUrl) {
      setMessage("Error: Organization wallet or certificate URL is missing.");
      return;
    }

    try {
      setPaying(true); // Disable button
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const contractAddress = "0xAbf4f0FA104e6dF73bDC6f2177503dC56B5aB071";
      const abi = [
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
        }
      ];

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("🚀 Sending transaction with values:", {
        contractAddress,
        organizationWallet,
        certificateUrl: uploadedCertificate.certificateUrl,
        amount: "0.01 ETH",
      });

      const tx = await contract.uploadCertificate(
        organizationWallet,
        uploadedCertificate.certificateUrl,
        { value: ethers.parseEther("0.001") }
      );

      const receipt = await tx.wait();
      console.log("🧾 Full Transaction Receipt:", receipt);

      const iface = new ethers.Interface([
        "event CertificateUploaded(uint256 id, address user, address organization, string ipfsHash, uint256 fee)"
      ]);

      let contractCertificateId = null;

      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          if (parsedLog.name === "CertificateUploaded") {
            console.log("📦 Parsed CertificateUploaded Event:", parsedLog.args);
            contractCertificateId = Number(parsedLog.args.id); // or parsedLog.args[0]
            break;
          }
        } catch (err) {
          // Skip logs that don't match
        }
      }

      if (contractCertificateId === null) {
        throw new Error("❌ Could not extract contractId from transaction receipt!");
      }

      console.log("✅ Extracted contract ID:", contractCertificateId);

      // ✅ Store transaction hash + contractId in backend
      await fetch("http://localhost:5000/api/pay-certificate-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: uploadedCertificate._id,
          transactionHash: tx.hash,
          contractId: contractCertificateId,
        }),
      });

      setUploadedCertificate((prev) => ({
        ...prev,
        transactionHash: tx.hash,
        contractId: contractCertificateId,
      }));

      setMessage("✅ Payment successful! Your certificate is awaiting verification.");
    } catch (error) {
      console.error("❌ Payment error:", error);
      setMessage("Error processing payment.");
    } finally {
      setPaying(false);
    }
  }
      
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Certificate</h2>
      {message && <p className="text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <label className="block mb-2">Select Organization Type:</label>
        <select
          value={organizationType}
          onChange={(e) => setOrganizationType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="">Select Type</option>
          <option value="Business">Business</option>
          <option value="Education">Education</option>
          <option value="Other">Other</option>
        </select>

        {organizationType && (
          <>
            <label className="block mb-2">Select Issuing Organization:</label>
            <select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Organization</option>
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name} - {org.walletAddress}
                  </option>
                ))
              ) : (
                <option disabled>No organizations available (Check API)</option>
              )}
            </select>
          </>
        )}

        <label className="block mb-2">Certificate Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          required
        />

        <label className="block mb-2">Upload Certificate:</label>
        <input type="file" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded mb-4" />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit"}
        </button>
      </form>

      {uploadedCertificate && uploadedCertificate.certificateUrl ? (
      uploadedCertificate.transactionHash ? (
        <div className="mt-4 p-4 bg-green-100 rounded shadow-md">
          <p className="text-green-600 font-bold">✅ Payment successful! Your certificate is awaiting verification.</p>
        </div>
      ) : (
        <div className="mt-4 p-4 bg-gray-100 rounded shadow-md">
          <p className="text-green-500">Certificate uploaded! Please pay the fee to proceed.</p>
          <button
            onClick={handlePayFee}
            className={`bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 mt-2 ${
              paying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={paying} // Disable button while paying
          >
            {paying ? "Processing Payment..." : "Pay Fee (0.01 ETH)"}
          </button>
        </div>
      )
    ) : (
      <p className="text-gray-500">Upload a certificate to proceed.</p>
    )}
    </div>
  );
};

export default UploadCertificate;