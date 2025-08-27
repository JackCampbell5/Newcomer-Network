// Node Module Imports
import React, { use, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  MdLocationOn,
  MdWeb,
  MdLocalPhone,
  MdEmail,
  MdOutlineQuestionMark,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";

// Local Imports
import "./FooterNonProfit.css";
import { setColorVariables } from "#utils/colorUtils";

function FooterNonProfit({ data }) {
  // Constant Variables
  const strongEmail = "newcomernetworkweb@gmail.com";
  const name = data.name;
  const email = data.email;
  const phone = data.phone;
  const address = data.address;
  const addressLink =
    "https://www.google.com/maps/search/?api=1&query=" +
    new URLSearchParams(address).toString();
  const website = data.website;
  const logo = data.logo;
  const color = data.color;
  const darkModeGiven = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  // State Variables
  const [darkMode, setDarkMode] = useState(darkModeGiven);

  /**
   * When the dark mode button is clicked, toggle the dark mode state and change the color variables to fit accordingly
   */
  function changeDarkMode() {
    setDarkMode((prv) => !prv);
    setColorVariables(color, !darkMode);
  }

  useEffect(() => {
    setColorVariables(color, darkMode);
  }, [color]);

  return (
    <div className="FooterNonProfit">
      <div className="insideFooter">
        {logo ? <img className="logo" src={logo} /> : null}
        <div className="leftFooter">
          <p className="nonprofitName">{name}</p>
          {phone && (
            <p className="nonprofitInfo">
              <MdLocalPhone />
              <a href={"tel:+" + phone} target="_blank">
                {phone}
              </a>
            </p>
          )}
          {email && (
            <p className="nonprofitInfo">
              <MdEmail />
              <a href={"mailto:" + email} target="_blank">
                {email}
              </a>
            </p>
          )}
        </div>
        <div className="rightFooter">
          {address && (
            <p className="nonprofitInfo">
              <MdLocationOn />
              <a href={addressLink} target="_blank">
                {address}
              </a>
            </p>
          )}
          {website && (
            <p className="nonprofitInfo">
              <MdWeb />
              <a href={website} target="_blank">
                {website}
              </a>
            </p>
          )}
          <p className="nonprofitInfo">
            <MdOutlineQuestionMark />
            <a href={"mailto:" + strongEmail} target="_blank">
              {strongEmail}
            </a>
          </p>
        </div>
        <div className="darkMode" onClick={changeDarkMode}>
          {darkMode ? <MdLightMode /> : <MdDarkMode />}
        </div>
      </div>
    </div>
  );
}

FooterNonProfit.propTypes = {
  data: PropTypes.object.isRequired,
};

export default FooterNonProfit;
