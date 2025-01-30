import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";

const Home = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [newImage, setNewImage] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api/posts";

  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Handle post submission
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return alert("Post content cannot be empty.");
    if (!user) return alert("You must be logged in to create a post.");

    const formData = new FormData();
    formData.append("content", newPost);
    formData.append("user", user.name || "Anonymous");
    if (newImage) formData.append("image", newImage);

    try {
      console.log("Submitting new post...");
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const createdPost = await response.json();
      console.log("Post created successfully:", createdPost);

      setPosts([createdPost, ...posts]);
      setNewPost("");
      setNewImage(null);
    } catch (error) {
      console.error("Error creating post:", error.message);
      alert("Error creating post. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">User Feed</h1>

      {user && (
        <div className="w-full max-w-2xl mb-8">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Write a post..."
          ></textarea>
          <input
            type="file"
            onChange={(e) => setNewImage(e.target.files[0])}
            className="my-2"
            accept="image/*"
          />
          <button
            onClick={handlePostSubmit}
            className="w-full bg-[#ffde00] text-black py-2 px-4 rounded-full hover:bg-[#e6c200] mt-2"
          >
            Post
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="w-full max-w-2xl">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="bg-white shadow-md rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{post.user}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-auto rounded-md"
                  />
                )}
              </div>
            ))
          ) : (
            <p>No posts to show yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;