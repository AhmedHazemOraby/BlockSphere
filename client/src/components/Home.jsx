import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

const Home = () => {
  const { user } = useUser();  // Access the logged-in user data
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState('');  // State for new post content
  const [newImage, setNewImage] = useState(null);  // State for new post image

  // Fetch posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Handle submitting a new post
  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;  // Prevent empty posts

    if (!user) {
      console.error('User is not logged in. Cannot submit post.');
      return;
    }

    let base64Image = '';
    if (newImage) {
      const reader = new FileReader();
      reader.readAsDataURL(newImage);
      reader.onloadend = async () => {
        base64Image = reader.result.split(',')[1];  // Get base64 data
        await submitPost(base64Image);  // Submit post with image
      };
    } else {
      await submitPost();  // Submit post without image
    }
  };

  const submitPost = async (image = '') => {
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user.name || 'Anonymous', // Use the user's name
          content: newPost,
          image,
        }),
      });
      const createdPost = await response.json();
      setPosts([createdPost, ...posts]); // Add new post to the feed
      setNewPost(''); // Clear post input
      setNewImage(null); // Clear image input
    } catch (error) {
      console.error('Error posting:', error);
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
            posts.map((post, index) => (
              <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{post.user}</h2>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.image && (
                  <img src={post.image} alt="Post" className="w-full h-auto rounded-md" />
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