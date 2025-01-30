const axios = require("axios");
const FormData = require("form-data");

// Pinata API credentials
const pinataApiKey = "cf0092476fb94cd972ba";
const pinataSecretApiKey = "45e9948b51b80dd4df00ff4fd3147389bc7613fdff83acbc789542eb55526008";

/**
 * Uploads a file to Pinata using the Pinata Cloud API.
 * @param {Buffer} fileBuffer - The file content in buffer format.
 * @param {string} fileName - The name of the file to be uploaded (default is "file").
 * @returns {string} - The URL of the uploaded file on IPFS.
 */
const uploadToPinata = async (fileBuffer, fileName = "file") => {
  const formData = new FormData();
  formData.append("file", fileBuffer, fileName);

  console.log("Preparing to upload file to Pinata...");
  console.log("File Name:", fileName);
  console.log("File Size:", fileBuffer.length);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      }
    );

    const fileUrl = `https://gray-familiar-porcupine-929.mypinata.cloud/ipfs/${response.data.IpfsHash}`;
    console.log("File successfully uploaded to Pinata:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading to Pinata:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.error("Authentication failed. Check your Pinata API credentials.");
    } else if (error.response?.status === 500) {
      console.error("Server error at Pinata. Try again later.");
    }

    throw new Error("Failed to upload file to Pinata");
  }
};

module.exports = { uploadToPinata };