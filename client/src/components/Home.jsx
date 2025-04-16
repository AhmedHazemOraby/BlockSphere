import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import defaultUserImage from "../../images/defaultUserImage.png";

const Home = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const navigate = useNavigate();

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
    formData.append("userId", JSON.stringify({ _id: user._id, name: user.name }));
    formData.append("role", user.role);
    formData.append("content", newPost);
    formData.append("userPhoto", user.photoUrl || "");
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
      setPosts([createdPost, ...posts]);
      setNewPost("");
      setNewImage(null);
    } catch (error) {
      console.error("Error creating post:", error.message);
      alert("Error creating post. Please try again.");
    }
  };

  // Handle Likes
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.name }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
      }
    } catch (error) {
      console.error("Error liking post:", error.message);
    }
  };

  // Handle Comment Submission
  const handleComment = async (postId) => {
    if (!commentTexts[postId]?.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.name,
          userId: user._id,
          text: commentTexts[postId],
        }),        
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map((p) => (p._id === postId ? updatedPost : p)));
        setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">User Feed</h1>

      {/* Post Creation Section */}
      {user && (
        <div className="w-full max-w-2xl mb-8 p-4 bg-white shadow-lg rounded-lg">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Write a post..."
          ></textarea>
          <input
            type="file"
            onChange={(e) => setNewImage(e.target.files[0])}
            className="my-2 p-2 border border-gray-300 rounded-md w-full"
            accept="image/*"
          />
          <button
            onClick={handlePostSubmit}
            className="w-full bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200"
          >
            Post
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? <p>Loading posts...</p> : (
        <div className="w-full max-w-2xl">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post._id} className="bg-white shadow-md rounded-lg p-6 mb-6">
                {/* Post Header */}
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    {post.userPhoto ? (
                      <img
                      src={post.userPhoto || defaultUserImage}
                      alt="Profile"
                      onError={(e) => (e.target.src = defaultUserImage)}
                      className="w-10 h-10 rounded-full"
                      />                    
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                        {post.user.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                  {console.log("Post:", post)}
                  {(post.userId || post.user) ? (
                  <h2
                  className="text-lg font-semibold text-blue-600 cursor-pointer hover:underline"
                  onClick={() => {
                    const authorId = post.userId?._id || post.userId;
                
                    if (authorId) {
                      if (authorId === user?._id) {
                        navigate("/profile");
                      } else {
                        navigate(`/user/${authorId}`);
                      }
                    } else {
                      if (post.userRole === "organization") {
                        navigate(`/organization/name/${post.user}`);
                      } else {
                        navigate(`/user/name/${post.user}`);
                      }
                    }
                  }}
                >
                  {post.userId?.name || post.user || "Unknown"}
                </h2>                
                ) : (
                  <span className="text-lg font-semibold text-gray-600">Unknown</span>
                )}
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {/* Post Content */}
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full h-auto rounded-md border border-gray-200"
                  />
                )}

                {/* Like & Comment Buttons */}
                <div className="flex items-center space-x-4 mt-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition duration-200"
                  >
                    👍 <span>{post.likes?.length || 0} Likes</span>
                  </button>

                  <button className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition duration-200">
                    💬 {post.comments?.length || 0} Comments
                  </button>
                </div>

                {/* Comment Section */}
                <div className="mt-4">
                {post.comments?.map((comment, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded-lg my-1">
                  {(comment?.userId || comment?.user) ? (
                  <strong
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                      const commentUserId = comment.userId?._id || comment.userId;

                      if (!commentUserId) return;

                      if (commentUserId === user?._id) {
                        navigate("/profile");
                      } else {
                        navigate(`/user/${commentUserId}`);
                      }
                    }}
                  >
                    {comment.userId?.name || comment.user || "Unknown"}
                  </strong>
                ) : (
                  <span className="text-gray-500">Unknown</span>
                )}
                  : {comment.text}
                </div>
              ))}
                </div>
                {/* Add Comment Input */}
                <div className="mt-3 flex">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentTexts[post._id] || ""}
                    onChange={(e) =>
                      setCommentTexts((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    className="ml-2 bg-yellow-500 text-white font-semibold px-3 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
                  >
                    💬
                  </button>
                </div>
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