// Node Module Imports
import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import IconComp from "#components/IconComp/IconComp";
import { IoEarth } from "react-icons/io5";
import { FaHandsHelping } from "react-icons/fa";
import PropTypes from "prop-types";

// Local Imports
import "./SubPageSelect.css";
// Other Components
import NonProfitSelector from "#components/NonProfitSelector/NonProfitSelector";
// Util Functions
import { QueryParams } from "#utils/pathUtils";
import { setColorVariables } from "#utils/colorUtils";

function SubPageSelect({ changePage }) {
  // Constant Variables
  const location = useLocation();

  // State Variables
  const [errorText, setErrorText] = useState("");

  /**
   *  Changes the page to the given page if a non-profit is selected
   * @param {string} page The page to change to
   */
  function onRoleClick(page) {
    const params = new URLSearchParams(location.search);
    if (params.get(QueryParams.NONPROFIT) !== null) {
      changePage(page);
    } else {
      setErrorText("Please select a non-profit to continue");
    }
  }

  useEffect(() => {
    setColorVariables(null);
  }, []);

  return (
    <div className="SubPageSelect">
      <IconComp />
      <main>
        <div className="flexContent">
          <h1>Welcome to Newcomer Network!</h1>
          <p className="welcomeText">
            Newcomer Network is a site dedicated to matching refugees with
            essential services. To get started, click a button below that
            matches what your looking for. <br />
            {/* //TODO Maybe add more intro text here */}
            <br /> <strong>Refugee-</strong> A refugee looking to be matched
            with a service
            <br /> <strong>Non-Profit-</strong> A non-profit employee looking to
            edit/manage services
          </p>
          <NonProfitSelector
            errorText={errorText}
            setErrorText={setErrorText}
          />
          <h2>What Role Are you?</h2>
          <div className="select-div">
            <div
              className="select-buttons"
              onClick={() => onRoleClick("refugee")}
            >
              <IoEarth />
              Refugee
            </div>
            <div
              className="select-buttons"
              onClick={() => onRoleClick("nonprofit")}
            >
              <FaHandsHelping />
              Non-Profit
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

SubPageSelect.propTypes = {
  changePage: PropTypes.func.isRequired,
};

export default SubPageSelect;
