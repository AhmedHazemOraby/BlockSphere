require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Import postRoutes
const postRoutes = require('./postRoutes');
const { uploadToPinata } = require('./utils/pinataClient');

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer Configuration
const upload = multer({ storage: multer.memoryStorage() });

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: { type: String },
  establishedSince: Date,
  numWorkers: Number,
  accolades: String,
}, { timestamps: true });

const User = require("./userModel"); 
const organizationModel = mongoose.model('Organization', organizationSchema);

// Routes
// User and Organization Registration
app.post("/api/register", upload.single("photo"), async (req, res) => {
  const { name, email, password, role, establishedSince, numWorkers, accolades } = req.body;
  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl = req.file ? await uploadToPinata(req.file.buffer, req.file.originalname) : null;

    const userData = { name, email, password: hashedPassword, photoUrl };
    if (role === "organization") Object.assign(userData, { establishedSince, numWorkers, accolades });

    // ✅ Ensure we use `User` instead of redefining userModel
    const savedEntity =
      role === "organization"
        ? await new organizationModel(userData).save()
        : await User.create(userData); // ✅ FIXED

    res.status(201).json({ message: "Account registered successfully", entity: savedEntity });
  } catch (error) {
    console.error("Error registering account:", error.message);
    res.status(500).json({ message: "Error registering account", error: error.message });
  }
});

// User and Organization Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let account = await User.findOne({ email }); 
    let role = 'individual';

    if (!account) {
      account = await organizationModel.findOne({ email });
      role = 'organization';
    }

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, account.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const { password: _, ...accountWithoutPassword } = account._doc;
    res.status(200).json({ message: 'Login successful', account: accountWithoutPassword, role });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Fetch User or Organization Profile
app.put("/api/profile", upload.single("photo"), async (req, res) => {
  const { email, name, workplace, degrees, certifications, walletAddress, establishedSince, numWorkers, accolades, role } = req.body;
  try {
    // ✅ Fix: Ensure we process images properly
    let photoUrl = req.file ? await uploadToPinata(req.file.buffer, req.file.originalname) : req.body.photoUrl;

    // ✅ Fix: Ensure the correct data model is used based on role
    const updateData =
      role === "organization"
        ? { name, photoUrl, establishedSince, numWorkers, accolades }
        : { name, photoUrl, workplace, degrees, certifications, walletAddress };

    const model = role === "organization" ? organizationModel : User; // ✅ Fix reference

    const updatedProfile = await model.findOneAndUpdate({ email }, updateData, { new: true });

    if (!updatedProfile) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// Update User or Organization Profile
app.put("/api/profile", upload.single("photo"), async (req, res) => {
  const { email, name, workplace, degrees, certifications, walletAddress, establishedSince, numWorkers, accolades, role } = req.body;
  try {
    let photoUrl = req.file ? await uploadToPinata(req.file.buffer, req.file.originalname) : req.body.photoUrl;

    const updateData =
      role === "organization"
        ? { name, photoUrl, establishedSince, numWorkers, accolades }
        : { name, photoUrl, workplace, degrees, certifications, walletAddress };

    const model = role === "organization" ? organizationModel : userModel;

    const updatedProfile = await model.findOneAndUpdate({ email }, updateData, { new: true });

    if (!updatedProfile) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

// Upload Endpoint
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const url = await uploadToPinata(req.file.buffer, req.file.originalname);
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
});

// Use postRoutes for handling posts
app.use("/api/posts", postRoutes);

// Handle 404 Errors
app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));