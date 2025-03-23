import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
  const { loginUser, loginWithWallet, error } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      await loginUser(email, password);
      navigate('/home');
    } catch (err) {
      setLocalError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setLoading(true);
    setLocalError(null);

    if (!window.ethereum) {
      setLocalError("MetaMask is not installed. Please install it first.");
      setLoading(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      await loginWithWallet(walletAddress);
      navigate('/home');
    } catch (error) {
      console.error("Wallet login failed:", error);
      setLocalError("Failed to log in with wallet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {localError && <p className="text-red-500 text-center mb-4">{localError}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded" required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded" required />
          </div>

          <button type="submit"
            className="w-full bg-yellow-500 text-black py-2 px-4 rounded-full hover:bg-yellow-600">
            Login
          </button>
        </form>

        <button onClick={handleWalletLogin}
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">
          Login with MetaMask
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Don't have an account?</p>
          <button onClick={() => navigate('/profile-setup')}
            className="text-blue-500 hover:underline">
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;