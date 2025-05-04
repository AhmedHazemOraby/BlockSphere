import React from "react";
import logo from "../../images/logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#ffde00] text-black py-6">
      <div className="flex justify-between items-center px-4 max-w-screen-lg mx-auto">
        <div className="text-center">
          <img src={logo} alt="logo" className="w-24 md:w-32" />
        </div>
        <div className="flex flex-col text-center md:text-right">
          <p className="text-sm font-bold">
            Enhancing Your Professional Journey with Web3
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;