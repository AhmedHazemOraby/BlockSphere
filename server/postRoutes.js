const express = require("express");
const multer = require("multer");
const { uploadToPinata } = require("./utils/pinataClient");
const Post = require("./postModel");
const router = express.Router();

// Multer Configuration
const upload = multer({ storage: multer.memoryStorage() });

// Create a new post (Handles text + optional image upload)
router.post("/", upload.single("image"), async (req, res) => {
  const { user, content } = req.body;
  let image = null;

  try {
    // Ensure required fields are present
    if (!user || !content) {
      return res.status(400).json({ message: "User and content are required" });
    }

    // Upload image to Pinata only if it exists
    if (req.file) {
      console.log("Uploading image to Pinata...");
      image = await uploadToPinata(req.file.buffer, req.file.originalname);
      console.log("Image uploaded to Pinata:", image);
    }

    // Save the post in the database
    const newPost = new Post({ user, content, image });
    const savedPost = await newPost.save();

    console.log("Post successfully created:", savedPost);
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
});

// Fetch all posts (Sorted by latest)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

module.exports = router;