require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ipfsClient = require('ipfs-http-client').create({ url: 'http://localhost:5001/api/v0' });

const app = express();

app.use(cors({
  origin: '*', // Adjust this in production to your frontend domain
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User schema (without walletAddress)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: String,  // Optional profile picture from IPFS
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Define Post schema for the feed
const postSchema = new mongoose.Schema({
  user: String,
  content: String,
  image: String,  // Optional image in base64 or URL
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);

// Register user endpoint (removed walletAddress)
app.post('/api/register', async (req, res) => {
  const { email, password, photoUrl } = req.body;

  try {
    console.log('Registering new user:', email);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      photoUrl,  // Optional photo URL
    });

    await user.save();  // Save the user to the database
    console.log('User registered successfully:', user);

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const { password: _, ...userWithoutPassword } = user._doc; // Exclude password from response
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Endpoint to update user profile
app.post('/api/updateProfile', async (req, res) => {
  const { email, photoUrl } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { photoUrl },
      { new: true }
    );

    if (user) {
      res.status(200).json({ message: 'Profile updated successfully', user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Fetch user profile by email
app.get('/api/profile', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Endpoint to create a new post
app.post('/api/posts', async (req, res) => {
  const { user, content, image } = req.body;

  try {
    const post = new Post({
      user,
      content,
      image,  // Optional image
    });

    await post.save();  // Save post to the database
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Endpoint to fetch all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });  // Fetch posts, sorted by creation date
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});