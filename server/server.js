require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const User = require("./userModel");
const Notification = require("./notificationModel");
const Job = require('./jobModel');
const Application = require('./applicationModel');
const FriendRequest = require("./FriendRequest");
const Message = require("./Message");
const Degree = require("./degreeModel");
const postRoutes = require('./postRoutes');
const { uploadToPinata } = require('./utils/pinataClient');
const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({ storage: multer.memoryStorage() });

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

  const organizationModel = require("./OrganizationModel");
 
  const Certificate = require("./certificateModel");

app.post("/api/upload-certificate", upload.single("certificate"), async (req, res) => {
  const { userId, organizationId, description } = req.body;

  try {

    if (!userId || !organizationId || !req.file || !description) {
      console.error("Missing required fields:", { userId, organizationId, reqFile: req.file, description });
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ipfsUrl = await uploadToPinata(req.file.buffer, req.file.originalname);

    const newCertificate = new Certificate({
      userId,
      organizationId,
      certificateUrl: ipfsUrl,
      description,
      status: "unpaid",
    });

    await newCertificate.save();

    res.status(201).json({ message: "Certificate uploaded successfully. Awaiting payment.", certificate: newCertificate });
  } catch (error) {
    console.error("Error uploading certificate:", error.message);
    res.status(500).json({ message: "Error uploading certificate", error: error.message });
  }
});

app.post("/api/upload-degree", upload.single("degree"), async (req, res) => {
  const { userId, organizationId, description } = req.body;

  try {
    if (!userId || !organizationId || !req.file || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ipfsUrl = await uploadToPinata(req.file.buffer, req.file.originalname);

    const newDegree = new Degree({
      userId,
      organizationId,
      degreeUrl: ipfsUrl,
      description,
      status: "unpaid",
    });

    await newDegree.save();

    res.status(201).json({ message: "Degree uploaded successfully", degree: newDegree });
  } catch (error) {
    res.status(500).json({ message: "Error uploading degree", error: error.message });
  }
});

app.post("/api/pay-degree-fee", async (req, res) => {
  const { degreeId, transactionHash, contractId } = req.body;

  try {

    const degree = await Degree.findByIdAndUpdate(
      degreeId,
      { transactionHash, contractId, status: "pending" },
      { new: true }
    );

    if (!degree) {
      console.error("Degree not found for ID:", degreeId);
      return res.status(404).json({ message: "Degree not found" });
    }

    const newNotification = new Notification({
      organizationId: degree.organizationId,
      userId: degree.userId,
      documentId: degree._id,
      status: "pending",
      type: "degree",
    });

    await newNotification.save();

    res.status(200).json({ message: "Payment saved and degree pending", degree });
  } catch (error) {
    console.error("Error in /pay-degree-fee:", error.message, error);
    res.status(500).json({ message: "Error saving payment", error: error.message });
  }
});

app.post("/api/respond-degree", async (req, res) => {
  const { notificationId, response, comment } = req.body;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.type !== "degree")
      return res.status(400).json({ message: "Invalid notification type" });

    const degree = await Degree.findById(notification.documentId);
    if (!degree) return res.status(404).json({ message: "Degree not found" });

    if (response === "accepted") {
      degree.status = "verified";
      await degree.save();

      await User.findByIdAndUpdate(
        degree.userId,
        { $addToSet: { degrees: degree._id } },
        { new: true }
      );
    } else {
      degree.status = "declined";
      await degree.save();
    }

    notification.status = response;
    if (comment) notification.responseComment = comment;
    await notification.save();

    res.status(200).json({ message: `Degree ${response} and notification updated` });
  } catch (error) {
    console.error("Error in /api/respond-degree:", error.message);
    res.status(500).json({ message: "Error responding to degree", error: error.message });
  }
});

app.get("/api/get-user-degrees/:userId", async (req, res) => {
  try {
    const degrees = await Degree.find({
      userId: req.params.userId,
      status: "verified",
    }).populate("organizationId", "name");

    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching degrees", error: error.message });
  }
});

app.delete('/api/delete-certificate/:id', async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Certificate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting certificate" });
  }
});

app.delete('/api/delete-degree/:id', async (req, res) => {
  try {
    await Degree.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Degree deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting degree" });
  }
});

app.delete('/api/jobs/:jobId/applicants/:applicantId', async (req, res) => {
  const { jobId, applicantId } = req.params;

  try {
    const application = await Application.findOneAndDelete({
      _id: applicantId, 
      jobId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Applicant removed successfully" });
  } catch (err) {
    console.error("Error removing applicant:", err.message);
    res.status(500).json({ message: "Failed to remove applicant", error: err.message });
  }
});

app.post("/api/friend-request", async (req, res) => {
  const { senderId, receiverId } = req.body;

  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    return res.status(404).json({ message: "User(s) not found" });
  }

  if (sender.role === "organization" || receiver.role === "organization") {
    return res.status(403).json({ message: "Organizations can't send or receive requests" });
  }

  const existing = await FriendRequest.findOne({ sender: senderId, receiver: receiverId });
  if (existing) return res.status(400).json({ message: "Request already sent" });

  const request = await FriendRequest.create({ sender: senderId, receiver: receiverId });
  res.status(201).json(request);
});

app.post("/api/friend-request/respond", async (req, res) => {
  const { requestId, status } = req.body;

  try {

    const request = await FriendRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) {
      console.error("Friend request not found");
      return res.status(404).json({ message: "Request not found" });
    }

    if (status === "accepted") {
      if (!request.sender || !request.receiver) {
        return res.status(400).json({ message: "Missing sender or receiver in request" });
      }

      await User.findByIdAndUpdate(request.sender, {
        $addToSet: { connections: request.receiver },
      });

      await User.findByIdAndUpdate(request.receiver, {
        $addToSet: { connections: request.sender },
      });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Error responding to request:", error.message);
    res.status(500).json({ message: "Error responding to request", error: error.message });
  }
});

app.get("/api/network-users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const users = await User.find({ _id: { $ne: userId } }).select("name email photoUrl");
    const requests = await FriendRequest.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    res.json({ users, requests });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
});

app.get("/api/get-organization-wallet/:id", async (req, res) => {
  try {

    const organization = await organizationModel.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({ walletAddress: organization.walletAddress });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/get-user-certificates/:userId", async (req, res) => {
  try {
    const certificates = await Certificate.find({
      userId: req.params.userId,
    }).populate("organizationId", "name");

    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error.message);
    res.status(500).json({ message: "Error fetching certificates", error: error.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('organizationId', 'name photoUrl');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('organizationId', 'name photoUrl');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:jobId/has-applied/:userId', async (req, res) => {
  try {
    const exists = await Application.findOne({
      jobId: req.params.jobId,
      userId: req.params.userId,
    });
    res.json({ applied: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:jobId/applicants', async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email photoUrl');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs/:id/apply', async (req, res) => {
  const { userId, resumeUrl, email, phone } = req.body;

  try {
    const existing = await Application.findOne({ jobId: req.params.id, userId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    const application = await Application.create({
      jobId: req.params.id,
      userId,
      resumeUrl,
      email,
      phone,
    });

    res.status(201).json({ message: 'Application submitted', success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/my-jobs/:orgId', async (req, res) => {
  try {
    const jobs = await Job.find({ organizationId: req.params.orgId });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/get-organization-notifications/:organizationId", async (req, res) => {
  try {
    const orgId = req.params.organizationId;
    console.log("Incoming notification request for org:", orgId);

    const organization = await organizationModel.findById(orgId);
    if (!organization) {
      console.warn("Organization not found for ID:", orgId);
      return res.status(404).json({ message: "Organization not found" });
    }

    const allNotifications = await Notification.find({
      organizationId: orgId,
      status: "pending",
    })
      .populate("userId", "name email")
      .populate("documentId");

    if (!allNotifications.length) {
      console.info("No pending notifications for org:", orgId);
    }

    const certificates = allNotifications.filter(n => (n.type || "").toLowerCase() === "certificate");
    const degrees = allNotifications.filter(n => (n.type || "").toLowerCase() === "degree" &&
    n.documentId);

    return res.status(200).json({ certificates, degrees });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
});

app.post("/api/respond-certificate", async (req, res) => {
  const { notificationId, response, comment } = req.body;

  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.status = response;
    if (comment) notification.responseComment = comment;
    await notification.save();

    const certificate = await Certificate.findById(notification.documentId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (response === "accepted") {
      certificate.status = "verified";

      await User.findByIdAndUpdate(
        certificate.userId,
        { $push: { certificates: certificate._id } },
        { new: true }
      );
    } else {
      certificate.status = "declined";
    }

    await certificate.save();

    res.status(200).json({ message: `Certificate ${response} successfully` });
  } catch (error) {
    console.error("Error responding to certificate:", error.message);
    res.status(500).json({ message: "Error processing response", error: error.message });
  }
});

app.get("/api/degrees/:id", async (req, res) => {
  try {
    const degree = await Degree.findById(req.params.id);
    if (!degree) return res.status(404).json({ message: "Degree not found" });
    res.status(200).json(degree);
  } catch (err) {
    res.status(500).json({ message: "Error fetching degree", error: err.message });
  }
});

app.get("/api/get-organizations", async (req, res) => {
  const { type } = req.query;

  try {
      if (!type) {
          console.error("Error: Organization type is missing");
          return res.status(400).json({ message: "Organization type is required" });
      }

      const organizations = await organizationModel.find({ organizationType: type });

      if (!organizations.length) {
          console.warn("Warning: No organizations found for type:", type);
          return res.status(200).json([]);
      }

      res.status(200).json(organizations);
  } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Error fetching organizations", error: error.message });
  }
});

app.get("/api/get-verified-certificates/:userId", async (req, res) => {
  try {
    const certificates = await Certificate.find({
      userId: req.params.userId,
      status: "verified",
    }).populate("organizationId", "name");

    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificates", error: error.message });
  }
});

app.post("/api/pay-certificate-fee", async (req, res) => {
  const { certificateId, transactionHash, contractId } = req.body;

  try {

    if (!certificateId || !transactionHash || contractId === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      certificateId,
      {
        transactionHash,
        contractId,
        status: "pending",
      },
      { new: true }
    );

    if (!updatedCertificate) {
      console.error("Certificate not found for ID:", certificateId);
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (!updatedCertificate.organizationId || !updatedCertificate.userId) {
      return res.status(400).json({ message: "Missing organization or user ID in certificate" });
    }

    const newNotification = new Notification({
      organizationId: updatedCertificate.organizationId,
      userId: updatedCertificate.userId,
      documentId: updatedCertificate._id,
      status: "pending",
      type: "certificate",
    });

    const saved = await newNotification.save();

    res.status(200).json({
      message: "Payment recorded and certificate is now pending verification.",
      certificate: updatedCertificate,
    });

  } catch (error) {
    console.error("Error processing certificate fee:", error);
    res.status(500).json({
      message: "Error storing transaction hash",
      error: error.message,
    });
  }
});

app.post("/api/register", upload.single("photo"), async (req, res) => {
  const { name, email, password, role, organizationType, walletAddress } = req.body;

  try {
    if (!name || !email || !password || !role || !walletAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let photoUrl = req.file ? await uploadToPinata(req.file.buffer, req.file.originalname) : null;

    let savedEntity;

    if (role === "organization") {
      if (!organizationType) {
        return res.status(400).json({ message: "Organization type is required" });
      }

      const organizationData = { name, email, password: hashedPassword, photoUrl, organizationType, walletAddress };
      savedEntity = await new organizationModel(organizationData).save();
    } else {
      const userData = { name, email, password: hashedPassword, photoUrl, walletAddress };
      savedEntity = await new User(userData).save();
    }

    res.status(201).json({ message: "Account registered successfully", entity: savedEntity });
  } catch (error) {
    console.error("Error registering account:", error.message);
    res.status(500).json({ message: "Error registering account", error: error.message });
  }
});

app.post('/api/login-metamask', async (req, res) => {
  const { walletAddress } = req.body;

  try {
    let account = await User.findOne({ walletAddress });
    let role = "individual";

    if (!account) {
      account = await organizationModel.findOne({ walletAddress });
      role = "organization";
    }

    if (!account) {
      return res.status(404).json({ message: "Wallet not registered." });
    }

    const { password, ...accountWithoutPassword } = account.toObject();

    res.status(200).json({
      message: "Login successful",
      user: { ...accountWithoutPassword, role }, 
      role, 
    });

  } catch (error) {
    console.error("Error logging in with MetaMask:", error);
    res.status(500).json({ message: "Error logging in with MetaMask", error: error.message });
  }
});

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

    res.status(200).json({
      message: 'Login successful',
      account: { ...accountWithoutPassword, role }, 
      role,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

app.get("/api/profile", async (req, res) => {
  const { email } = req.query;  

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    let profile = await User.findOne({ email }).populate("connections", "name email");
    let role = "individual";

    if (!profile) {
      profile = await organizationModel.findOne({ email });
      role = "organization";
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile, role });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/profile", upload.single("photo"), async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required" });
  }

  try {
    let updateData = { ...req.body };

    if (req.file) {
      const photoUrl = await uploadToPinata(req.file.buffer, req.file.originalname);
      updateData.photoUrl = photoUrl;
    }

    delete updateData.role;
    delete updateData.photo;

    const fieldsToParse = [
      "degrees",
      "certifications",
      "education",
      "jobExperiences",
      "internships",
      "accolades",
    ];

    fieldsToParse.forEach((field) => {
      if (updateData[field] && typeof updateData[field] === "string") {
        try {
          const parsed = JSON.parse(updateData[field]);
          if (Array.isArray(parsed)) {
            updateData[field] = parsed;
          } else {
            console.warn(`Parsed '${field}' is not an array`);
          }
        } catch (err) {
          console.warn(`Failed to parse field '${field}':`, err.message);
          updateData[field] = [];
        }
      }
    });    

    let updatedProfile;
    if (role === "organization") {
      updatedProfile = await organizationModel.findOneAndUpdate(
        { email },
        updateData,
        { new: true }
      );
    } else {
      updatedProfile = await User.findOneAndUpdate(
        { email },
        updateData,
        { new: true }
      );
    }

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  const currentUserId = req.query.currentUserId;

  if (!currentUserId) {
    return res.status(400).json({ message: "currentUserId query param is required" });
  }

  try {
    const users = await User.find({ _id: { $ne: currentUserId } }).select("name email photoUrl");
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const { sender, receiver, content, type } = req.body;

    if (!sender || !receiver || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = new Message({ sender, receiver, content, type });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error("Error saving message:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/mark-messages-seen", async (req, res) => {
  const { sender, receiver } = req.body;

  try {
    await Message.updateMany(
      { sender, receiver, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    console.error("Error marking messages seen:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/messages/mark-seen", async (req, res) => {
  const { userEmail, otherEmail } = req.body;
  try {
    await Message.updateMany(
      { sender: otherEmail, receiver: userEmail, seen: false },
      { seen: true }
    );
    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    console.error("Mark seen error:", err.message);
    res.status(500).json({ error: "Failed to update seen status" });
  }
});

app.get("/api/messages/:sender/:receiver", async (req, res) => {
  const { sender, receiver } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
});

app.get("/api/unread-messages/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;

    const unread = await Message.aggregate([
      { $match: { receiver: userEmail, seen: false } },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(unread);
  } catch (err) {
    console.error("Error fetching unread messages:", err);
    res.status(500).json({ message: "Failed to fetch unread messages" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id).select("name email photoUrl role accolades orgType numWorkers establishedSince");
    let role = "individual";

    if (!user) {
      user = await organizationModel.findById(req.params.id).select("name email photoUrl organizationType numWorkers establishedSince accolades");
      role = "organization";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ ...user.toObject(), role });
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

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

app.use("/api/posts", postRoutes);

app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));

const http = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {

  socket.on("join", (email) => {
    socket.join(email); 
  });

  socket.on("sendMessage", (message) => {
    const { receiver, sender } = message;
    io.to(receiver).emit("receiveMessage", message);
    io.to(sender).emit("receiveMessage", message);  
    io.to(receiver).emit("newNotification");
  });  

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log(`Server with Socket.IO running on port ${PORT}`));