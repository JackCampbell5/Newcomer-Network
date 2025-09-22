// Node Module Imports
import React from "react";
import PropTypes from "prop-types";

// Local Imports
import "./NavRefugee.css";
// Other components
import IconComp from "#components/IconComp/IconComp";
import { getLocation, RPages } from "#utils/pathUtils";

function NavRefugee({ onNavigate }) {
  // Constant Variables
  const location = getLocation();

  return (
    <div className="NavRefugee">
      <div className="navLogo" onClick={() => onNavigate(RPages.HOME)}>
        <IconComp />
      </div>{" "}
      <h3>Refugee</h3>
      <div className="navAllButtons">
        <button
          className={[
            "navBarButton",
            (location === "refugee" || location === "") && "selected",
          ].join(" ")}
          onClick={() => onNavigate(RPages.HOME)}
        >
          Home
        </button>
        <button
          className={[
            "navBarButton",
            location === RPages.ALLSERVICES && "selected",
          ].join(" ")}
          onClick={() => onNavigate(RPages.ALLSERVICES)}
        >
          All Services
        </button>
        <button
          className={[
            "navBarButton",
            location === RPages.CONTACT && "selected",
          ].join(" ")}
          onClick={() => onNavigate(RPages.CONTACT)}
        >
          Contact
        </button>
        <button
          className={[
            "navBarButton",
            location === RPages.HELP && "selected",
          ].join(" ")}
          onClick={() => onNavigate(RPages.HELP)}
        >
          Help
        </button>
      </div>
    </div>
  );
}

NavRefugee.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

export default NavRefugee;
