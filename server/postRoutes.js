const express = require('express');
const Post = require('./postModel'); // Import the Post model
const ipfsClient = require('ipfs-http-client').create({ url: 'http://localhost:5001/api/v0' }); // IPFS for image upload

const router = express.Router();

// Create a new post
router.post('/api/posts', async (req, res) => {
  const { user, content, image } = req.body;

  try {
    let imageUrl = '';

    // If image is provided, upload to IPFS
    if (image) {
      const added = await ipfsClient.add(image);
      imageUrl = `http://localhost:8080/ipfs/${added.path}`;
    }

    const newPost = new Post({
      user,
      content,
      image: imageUrl, // Save the image URL from IPFS
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Fetch all posts
router.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Latest posts first
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Update a post by ID
router.put('/api/posts/:id', async (req, res) => {
  const { content } = req.body;
  const { id } = req.params;

  try {
    const updatedPost = await Post.findByIdAndUpdate(id, { content }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete a post by ID
router.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;