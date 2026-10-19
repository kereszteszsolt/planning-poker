import React, { useRef } from "react";
import { appInfo } from "./app-info";
import { AboutDialog } from "./AboutDialog";
import { Link } from "react-router-dom";
import { usePlanningPokerTransport } from "../transport/transport-context";

const Navbar: React.FC = () => {
  const about = useRef<HTMLDialogElement>(null);
  const transport = usePlanningPokerTransport();
  return (
    <>
    <nav className="pp-navbar" aria-label="Primary navigation">
      <p className="pp-navbar-title">{appInfo.icon && <img src={appInfo.icon} width="36" height="36" alt="" />}<span>{appInfo.appName}</span></p>
      <div className="pp-navbar-links">
        <Link to="/" onClick={transport.returnHome} className="pp-navbar-link">
          Home
        </Link>
        <button type="button" className="pp-navbar-link" aria-haspopup="dialog" onClick={() => about.current?.showModal()}>About</button>
      </div>
    </nav>
    <AboutDialog dialogRef={about} />
    </>
  );
};

export default Navbar;
