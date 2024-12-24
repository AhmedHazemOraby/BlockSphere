import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/profile-setup');  // Redirect to profile setup page
  };

  return (
    <div className="flex w-full justify-center items-center">
      <div className="flex md:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
        <div className="flex flex-1 justify-start flex-col md:mr-10">
          <h1 className="text-3xl sm:text-5xl text-black text-gradient py-1">
            Find Jobs <br /> Expand Your Network
          </h1>
          <p className="text-left mt-5 text-black font-light md:w-9/12 w-11/12 text-base">
            Make your Worklife Better. Join the Sphere.
          </p>
          <button
            type="button"
            onClick={handleSignUp}  // Navigate to the profile setup page
            className="flex flex-row justify-center items-center my-5 bg-[#ffde00] p-3 rounded-full cursor-pointer hover:bg-[#e6c200]"
          >
            <p className="text-black text-base font-semibold">Sign Up</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;