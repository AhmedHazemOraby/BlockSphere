import React from 'react';
import { HiMenuAlt4 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';
import defaultUserImage from '../../images/defaultUserImage.png';
import { useUser } from '../context/UserContext';
import { MdNotificationsNone } from "react-icons/md";

const NavBarItem = ({ title, link, classprops }) => (
  <li className={`mx-4 cursor-pointer text-black hover:text-yellow-500 ${classprops}`}>
    <Link to={link}>{title}</Link>
  </li>
);

const Navbar = () => {
  const { userProfile, logoutUser, loading, unreadMessages, refetchTrigger } = useUser();
  const [toggleMenu, setToggleMenu] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {}, [refetchTrigger]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading) return null;

  const sanitizedPhotoUrl = userProfile?.photoUrl?.replace('http://localhost:8080', 'https://gateway.pinata.cloud/ipfs');

  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4 bg-transparent">
      <div className="md:flex-[0.5] flex-initial justify-center items-center">
        <img src={logo} alt="logo" className="w-32 cursor-pointer" />
      </div>

      <ul className="md:flex hidden list-none flex-row justify-between items-center flex-initial">
        <NavBarItem title="Home" link="/home" />
        <NavBarItem title="Network" link="/network" />
        <NavBarItem title="Jobs" link="/jobs" />
        <NavBarItem title="Profile" link="/profile" />
        {userProfile ? (
  <div className="flex items-center gap-4">
    {/* Notification bell */}
    <div className="relative cursor-pointer">
      <MdNotificationsNone size={24} />
      {unreadMessages.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {unreadMessages.length}
        </span>
      )}
    </div>
          {/* Profile image and logout dropdown */}
          <div className="relative group">
          {/* Profile image trigger */}
          <img
            src={sanitizedPhotoUrl || defaultUserImage}
            alt="Profile"
            onError={(e) => (e.target.src = defaultUserImage)}
            className="w-10 h-10 rounded-full cursor-pointer object-cover"
          />

          {/* BIGGER HOVER AREA */}
          <div className="absolute top-full right-0 w-32 pt-2 z-50 group-hover:block hidden">
            <div className="bg-white shadow-md py-2 rounded-md">
              <li
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </li>
            </div>
          </div>
        </div>
        </div>
        ) : (
          <Link
            to="/login"
            className="bg-[#ffde00] text-black py-2 px-4 rounded-full hover:bg-[#e6c200]"
          >
            Login
          </Link>
        )}
      </ul>

      {/* Mobile menu */}
      <div className="flex relative">
        {!toggleMenu && (
          <HiMenuAlt4
            fontSize={28}
            className="text-black md:hidden cursor-pointer"
            onClick={() => setToggleMenu(true)}
          />
        )}
        {toggleMenu && (
          <AiOutlineClose
            fontSize={28}
            className="text-black md:hidden cursor-pointer"
            onClick={() => setToggleMenu(false)}
          />
        )}
        {toggleMenu && (
          <ul
            className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-start items-end rounded-md bg-white text-black animate-slide-in"
          >
            <li className="text-xl w-full my-2">
              <AiOutlineClose onClick={() => setToggleMenu(false)} />
            </li>
            <NavBarItem title="Home" link="/home" classprops="my-2 text-lg" />
            <NavBarItem title="Network" link="/network" classprops="my-2 text-lg" />
            <NavBarItem title="Jobs" link="/jobs" classprops="my-2 text-lg" />
            <NavBarItem title="Profile" link="/profile" classprops="my-2 text-lg" />
            {userProfile ? (
              <li
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 bg-[#e6c200] rounded-md text-black hover:bg-[#ffde00] my-2"
              >
                Logout
              </li>
            ) : (
              <Link
                to="/login"
                className="cursor-pointer px-4 py-2 bg-[#ffde00] rounded-md text-black hover:bg-[#e6c200] my-2"
              >
                Login
              </Link>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;