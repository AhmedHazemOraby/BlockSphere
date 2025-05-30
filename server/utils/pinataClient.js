require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

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