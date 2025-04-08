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
import JobList from './components/JobList';
import OrganizationJobs from './components/OrganizationJobs';
import OrganizationProfile from './components/OrganizationProfile';
import UploadCertificate from "./components/UploadCertificate";
import OrganizationDashboard from "./components/OrganizationDashboard";
import JobDetails from './components/JobDetails';
import CreateJob from './components/CreateJob';
import MyJobs from './components/MyJobs';
import ChatRoom from './components/ChatRoom';
import UploadDegree from "./components/UploadDegree";

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
          <Route path="/jobs" element={<JobList />} />
          <Route path="/organization-jobs" element={<OrganizationJobs />} />
          <Route path="/organization-profile" element={<OrganizationProfile />} />
          <Route path="/upload-certificate" element={<UploadCertificate />} />
          <Route path="/organization-dashboard" element={<OrganizationDashboard />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/chat/:userId" element={<ChatRoom />} />
          <Route path="/upload-degree" element={<UploadDegree />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;