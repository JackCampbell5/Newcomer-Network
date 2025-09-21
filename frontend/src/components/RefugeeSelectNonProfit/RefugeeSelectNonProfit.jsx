// Node Module Imports
import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { IoEarth } from "react-icons/io5";
import PropTypes from "prop-types";

// Local Imports
import "./RefugeeSelectNonProfit.css";
// Other Components
import IconComp from "#components/IconComp/IconComp";
import NonProfitSelector from "#components/NonProfitSelector/NonProfitSelector";
// Util Functions
import { QueryParams, OverallPages } from "#utils/pathUtils";
import { setColorVariables } from "#utils/colorUtils";

function RefugeeSelectNonProfit({ changePage }) {
  // Constant Variables
  const location = useLocation();

  // State Variables
  const [errorText, setErrorText] = useState("");

  /**
   *  Changes the page to the given page if a non-profit is selected
   * @param {string} page The page to change to
   */
  function onRoleClick() {
    const params = new URLSearchParams(location.search);
    if (params.get(QueryParams.NONPROFIT) !== null) {
      changePage(OverallPages.REFUGEE);
    } else {
      setErrorText("Please select a non-profit to continue");
    }
  }

  useEffect(() => {
    setColorVariables(null);
  }, []);

  return (
    <div className="RefugeeSelectNonProfit">
      <IconComp />
      <div className="flexContent">
        <h1>Welcome to Newcomer Network!</h1>
        <p className="welcomeText">
          Newcomer Network is a site dedicated to matching refugees with
          essential services. To get started, select the nonprofit that best
          matches your area and click start. <br />
        </p>
        <NonProfitSelector errorText={errorText} setErrorText={setErrorText} />
        <div className="select-div">
          <div className="select-button" onClick={() => onRoleClick()}>
            <IoEarth />
            Start
          </div>
        </div>
      </div>
    </div>
  );
}

RefugeeSelectNonProfit.propTypes = {
  changePage: PropTypes.func.isRequired,
};

export default RefugeeSelectNonProfit;
