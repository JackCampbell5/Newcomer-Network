import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate, useLocation } from "react-router";

// Local Imports
import "./RefugeeOverall.css";
// Other pages
import Contact from "#refugeePage/Contact/Contact";
import Home from "#refugeePage/Home/Home";
import AllServices from "#refugeePage/AllServices/AllServices";
import Help from "#refugeePage/Help/Help";
//Other Components
import FooterNonProfit from "#components/FooterNonProfit/FooterNonProfit";
import NavRefugee from "#components/NavRefugee/NavRefugee";
// Utils
import { fetchNonProfitInfo } from "#fetch/nonProfitFetchUtils";
import { RPages } from "#utils/pathUtils";
import { createPageNavigator } from "#utils/pathUtils";
import { getNonProfit } from "#utils/pathUtils";

function RefugeeOverall() {
  // Constant Variables
  const priorPart = "/refugee/";
  const navigate = useNavigate();
  const location = useLocation();
  const nonprofit = getNonProfit();
  const pageNavigator = createPageNavigator(navigate, location);
  // State Variables
  const [nonprofitInfo, setNonprofitInfo] = useState({});

  /**
   * Navigate to a new page
   * @param {string} path - The path to navigate to
   */
  function nav(path) {
    pageNavigator(priorPart + path);
  }
  function fetchNonProfitInfoCallback(result) {
    if (result.valid) {
      setNonprofitInfo(result.data);
    } else {
      setNonprofitInfo({ error: result.error });
    }
  }

  useEffect(() => {
    // Move to homepage if no stats
    if (!nonprofit) {
      navigate("/refugee");
    } else {
      fetchNonProfitInfo(nonprofit).then(fetchNonProfitInfoCallback);
    }
  }, [nonprofit]);

  return (
    <div className="RefugeeOverall">
      <NavRefugee onNavigate={nav} />
      <div className="mainContent">
        <Routes>
          <Route path={`/${RPages.HOME}`} element={<Home />} />
          {/* The default path will probably end up as the home page*/}
          <Route path={`/${RPages.ALLSERVICES}`} element={<AllServices />} />
          <Route
            path={`/${RPages.CONTACT}`}
            element={<Contact data={nonprofitInfo} />}
          />
          <Route path={`/${RPages.HELP}`} element={<Help />} />
        </Routes>
      </div>
      <FooterNonProfit data={nonprofitInfo} />
    </div>
  );
}

export default RefugeeOverall;
