const fs = require("fs");
const path = require("path");
const { uploadToPinata } = require("./utils/pinataClient"); // Make sure this path is correct

const testUpload = async () => {
  try {
    const filePath = path.join(__dirname, "test-image.png"); // Ensure image exists

    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ File not found: ${filePath}`);
    }

    console.log("📤 Reading file...");
    const fileBuffer = fs.readFileSync(filePath);
    console.log("✅ File loaded successfully!");

    console.log("📤 Uploading to Pinata...");
    const uploadedUrl = await uploadToPinata(fileBuffer, "test-image.png");

    console.log("✅ File uploaded successfully! IPFS URL:", uploadedUrl);
  } catch (error) {
    console.error("❌ Upload test failed:", error.message);
  }
};

testUpload();