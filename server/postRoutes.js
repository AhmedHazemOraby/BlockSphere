const express = require("express");
const multer = require("multer");
const { uploadToPinata } = require("./utils/pinataClient");
const Post = require("./postModel");
const User = require("./userModel"); // Import user model
const router = express.Router();

// Multer Configuration
const upload = multer({ storage: multer.memoryStorage() });

// Create a new post (Handles text + optional image upload)
router.post("/", upload.single("image"), async (req, res) => {
  const { user, content, role } = req.body;
  let image = null;

  try {
    if (!user || !content) return res.status(400).json({ message: "User and content are required" });

    if (req.file) {
      console.log("Uploading image to Pinata...");
      image = await uploadToPinata(req.file.buffer, req.file.originalname);
    }

    const newPost = new Post({
      user,
      userPhoto: role === "organization" ? "organization-default.png" : req.body.userPhoto,
      content,
      image,
      likes: [],
      comments: [],
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
});

// Fetch all posts with correct user photo
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

// Like a post
router.post("/:postId/like", async (req, res) => {
  const { username } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Toggle Like (Remove if already liked)
    const likeIndex = post.likes.indexOf(username);
    if (likeIndex === -1) {
      post.likes.push(username);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error liking post:", error.message);
    res.status(500).json({ message: "Error liking post", error: error.message });
  }
});

// Add a comment to a post
router.post("/:postId/comment", async (req, res) => {
  const { username, text } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: username, text });
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

module.exports = router;