const express = require("express");
const multer = require("multer");
const { uploadToPinata } = require("./utils/pinataClient");
const Post = require("./postModel");
const User = require("./userModel");
const router = express.Router();
const organizationModel = require("./OrganizationModel");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  const { content, role } = req.body;
  let image = null;

  try {
    if (!req.body.userId || !content) {
      return res.status(400).json({ message: "User and content are required" });
    }

    const parsedUser = JSON.parse(req.body.userId);

    if (req.file) {
      console.log("Uploading image to Pinata...");
      image = await uploadToPinata(req.file.buffer, req.file.originalname);
    }

    const newPost = new Post({
      user: parsedUser.name,
      userId: parsedUser._id,
      userPhoto: req.body.userPhoto || "",
      userRole: role?.toLowerCase() === "organization" ? "Organization" : "User",
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

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();

    // Fetch user/org details manually
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const model = post.userRole === "Organization" ? organizationModel : User;
        const user = await model.findById(post.userId).select("name _id photoUrl organizationType");

        return {
          ...post,
          userId: user,
        };
      })
    );

    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

router.post("/:postId/like", async (req, res) => {
  const { username } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

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

router.post("/:postId/comment", async (req, res) => {
  const { username, userId, text } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: username, userId, text });
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

module.exports = router;