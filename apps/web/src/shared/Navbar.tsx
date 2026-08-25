import React from "react";
import { Link } from "react-router-dom";
import { usePlanningPokerTransport } from "../transport/transport-context";

const Navbar: React.FC = () => {
  const transport = usePlanningPokerTransport();
  return (
    <nav className="bg-blue-600 flex items-center justify-between h-[60px] px-5">
      <h1 className="text-white text-xl font-bold">Planning Poker</h1>
      <div className="flex flex-row gap-5">
        <Link
          to="/"
          onClick={transport.returnHome}
          className="text-white font-bold hover:text-blue-200"
        >
          Home
        </Link>
        <Link to="/about" className="text-white font-bold hover:text-blue-200">
          About
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
