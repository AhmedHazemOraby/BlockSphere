import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
  const { loginUser, error } = useUser(); // Access login function and error state
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null); // Local error state for better handling

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null); // Clear previous local errors

    try {
      await loginUser(email, password); // Attempt login
      navigate('/home'); // Redirect to home on successful login
    } catch (err) {
      console.error('Login failed:', err);
      setLocalError('Invalid email or password. Please try again.'); // Set a local error message
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  const goToSignup = () => {
    navigate('/profile-setup'); // Navigate to the signup page
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {loading && <p className="text-center">Logging in...</p>}
        {!loading && (
          <form onSubmit={handleLogin}>
            {/* Display any error messages */}
            {localError && <p className="text-red-500 text-center mb-4">{localError}</p>}
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#ffde00] text-black py-2 px-4 rounded-full hover:bg-[#e6c200]"
              disabled={loading} // Disable button during loading
            >
              Login
            </button>
          </form>
        )}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Don't have an account?</p>
          <button
            onClick={goToSignup}
            className="text-blue-500 hover:underline"
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;