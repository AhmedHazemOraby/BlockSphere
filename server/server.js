require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, `profile-${uniqueSuffix}`);
  },
});
const upload = multer({ storage });

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: String,
  workplace: String,
  degrees: String,
  certifications: String,
  walletAddress: String,
}, { timestamps: true });

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: String,
  establishedSince: Date,
  numWorkers: Number,
  accolades: String,
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  user: String,
  content: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Organization = mongoose.model('Organization', organizationSchema);
const Post = mongoose.model('Post', postSchema);

// Routes

// User and Organization Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password, photoUrl, role, establishedSince, numWorkers, accolades } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'organization') {
      const existingOrganization = await Organization.findOne({ email });
      if (existingOrganization) {
        return res.status(400).json({ message: 'Organization already exists' });
      }

      const organization = new Organization({
        name,
        email,
        password: hashedPassword,
        photoUrl,
        establishedSince,
        numWorkers,
        accolades,
      });

      await organization.save();
      return res.status(201).json({ message: 'Organization registered successfully', organization });
    } else {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({ name, email, password: hashedPassword, photoUrl });
      await user.save();
      return res.status(201).json({ message: 'User registered successfully', user });
    }
  } catch (error) {
    console.error('Error registering account:', error);
    res.status(500).json({ message: 'Error registering account' });
  }
});

// User and Organization Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let account = await User.findOne({ email });
    let role = 'individual';

    if (!account) {
      account = await Organization.findOne({ email });
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
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Fetch User or Organization Profile
app.get('/api/profile', async (req, res) => {
  const { email, role } = req.query;

  try {
    const profile =
      role === 'organization'
        ? await Organization.findOne({ email })
        : await User.findOne({ email });

    if (!profile) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update User or Organization Profile
app.put('/api/profile', upload.single('photo'), async (req, res) => {
  const { email, name, workplace, degrees, certifications, walletAddress, establishedSince, numWorkers, accolades, role } = req.body;
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl;

  try {
    const updateData =
      role === 'organization'
        ? { name, photoUrl, establishedSince, numWorkers, accolades }
        : { name, photoUrl, workplace, degrees, certifications, walletAddress };

    const model = role === 'organization' ? Organization : User;

    const updatedProfile = await model.findOneAndUpdate({ email }, updateData, { new: true });

    if (!updatedProfile) {
      return res.status(404).json({ message: `${role} not found` });
    }

    res.status(200).json({ message: 'Profile updated successfully', updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Fetch Posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Handle 404 Errors
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));