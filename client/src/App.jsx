import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Welcome from './components/Welcome';
import ProfileSetup from './components/ProfileSetup'; // Used as the signup page
import Home from './components/Home';
import Login from './components/Login';
import Network from './components/Network';
import Profile from './components/Profile';
import Jobs from './components/Jobs';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} /> {/* Signup page */}
          <Route path="/home" element={<Home />} />
          <Route path="/network" element={<Network />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;