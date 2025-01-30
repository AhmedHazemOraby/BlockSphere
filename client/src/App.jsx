import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Welcome from './components/Welcome';
import ProfileSetup from './components/ProfileSetup';
import Home from './components/Home';
import Login from './components/Login';
import Network from './components/Network';
import Profile from './components/Profile';
import Jobs from './components/Jobs';
import OrganizationJobs from './components/OrganizationJobs';
import OrganizationProfile from './components/OrganizationProfile';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/network" element={<Network />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/organization-jobs" element={<OrganizationJobs />} />
          <Route path="/organization-profile" element={<OrganizationProfile />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;