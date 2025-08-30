import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 m-[100px] flex items-center justify-between h-[60px]">
      <h1 className="text-white text-xl font-bold">Planning Poker</h1>
      <div className="flex flex-row gap-5">
        <Link to="/" className="text-white hover:text-blue-200">
          Home
        </Link>
        <Link to="/about" className="text-white hover:text-blue-200">
          About
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
