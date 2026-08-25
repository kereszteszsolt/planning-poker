import React from "react";
import { Link } from "react-router-dom";
import { usePlanningPokerTransport } from "../transport/transport-context";

const Navbar: React.FC = () => {
  const transport = usePlanningPokerTransport();
  return (
    <nav className="pp-navbar" aria-label="Primary navigation">
      <p className="pp-navbar-title">Planning Poker</p>
      <div className="pp-navbar-links">
        <Link to="/" onClick={transport.returnHome} className="pp-navbar-link">
          Home
        </Link>
        <Link to="/about" className="pp-navbar-link">
          About
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
