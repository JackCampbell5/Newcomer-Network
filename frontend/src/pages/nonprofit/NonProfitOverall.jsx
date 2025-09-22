// Node Module Imports
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate, useLocation } from "react-router";

// Local Imports
import "./NonProfitOverall.css";
// Other pages
import Account from "#nonprofitPage/Account/Account";
import Dashboard from "#nonprofitPage/Dashboard/Dashboard";
import EditService from "#nonprofitPage/EditServicePage/EditServicePage";
import LoginPage from "#nonprofitPage/LoginPage/LoginPage";
import NewService from "#nonprofitPage/NewService/NewService";
import SearchService from "#nonprofitPage/SearchService/SearchService";
import ViewServices from "#nonprofitPage/ViewServices/ViewServices";
import RegisterPage from "#nonprofitPage/RegisterPage/RegisterPage";
import Recommend from "#nonprofitPage/Recommend/Recommend";
import CsvImport from "./CsvImport/CsvImport";
//Other Components
import PrivateRoutes from "#components/PrivateRoutes/PrivateRoutes";
import NavNonProfit from "#components/NavNonProfit/NavNonProfit";
import FooterNonProfit from "#components/FooterNonProfit/FooterNonProfit";
// Util Functions
import { fetchNonProfitInfo } from "#fetch/nonProfitFetchUtils";
import { NpPages } from "#utils/pathUtils";
import { createPageNavigator, getNonProfit } from "#utils/pathUtils";
import { checkEmployeeLoginStatus } from "#utils/fetch/nonprofitEmployeeFetchUtils";

function NonProfitOverall() {
  // Constant Variables
  const priorPart = "/nonprofit/";
  const navigate = useNavigate();
  const location = useLocation();
  const nonprofit = getNonProfit();
  const pageNavigator = createPageNavigator(navigate, location);
  // State Variables
  const [footerInfo, setFooterInfo] = useState({});
  const [loggedIn, setLoggedIn] = useState(true);

  /**
   * Navigate to a new page.
   * @param {string} path - The path to navigate to.
   */
  function nav(path) {
    pageNavigator(priorPart + path);
  }

  /**
   * Call back function for the fetchNonProfitInfo function. To set the footer info based on the result.
   * @param {object} result - The result object from the fetchNonProfitInfo function.
   */
  function fetchNonProfitInfoCallback(result) {
    if (result.valid) {
      setFooterInfo(result.data);
    } else {
      setFooterInfo({ name: result.error });
    }
  }
  /**
   * Callback function for the checkEmployeeLoginStatus function. To set the loggedIn status based on the result.
   * @param {object} result - The result object from the checkEmployeeLoginStatus function.
   */
  function checkEmployeeLoginStatusCallback(result) {
    if (result.valid) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }

  useEffect(() => {
    // Move to homepage if no stats
    if (!nonprofit) {
      navigate("/");
    } else {
      fetchNonProfitInfo(nonprofit).then(fetchNonProfitInfoCallback);
    }
    checkEmployeeLoginStatus(nonprofit).then(checkEmployeeLoginStatusCallback);
  }, [nonprofit]);
  return (
    <div className="NonProfitOverall">
      {loggedIn ? (
        <NavNonProfit onNavigate={nav} setLoggedIn={setLoggedIn} />
      ) : null}
      <div className="mainContent">
        <Routes>
          <Route element={<PrivateRoutes loggedIn={loggedIn} />}>
            <Route path="" element={<Dashboard />} />{" "}
            <Route path={`/${NpPages.EDITSERVICE}`} element={<EditService />} />
            <Route path={`/${NpPages.NEWSERVICE}`} element={<NewService />} />
            <Route
              path={`/${NpPages.SEARCHSERVICE}`}
              element={<SearchService />}
            />
            <Route
              path={`/${NpPages.VIEWSERVICES}`}
              element={<ViewServices />}
            />
            <Route path={`/${NpPages.RECOMMEND}`} element={<Recommend />} />
            <Route
              path={`/${NpPages.ACCOUNT}`}
              element={<Account nav={nav} />}
            />
            <Route
              path={`/${NpPages.CSV_IMPORT}`}
              element={<CsvImport nav={nav} />}
            />
            <Route
              path={`/${NpPages.REGISTER}`}
              element={<RegisterPage setLoggedIn={setLoggedIn} nav={nav} />}
            />
          </Route>
          <Route
            path={`/${NpPages.LOGIN}`}
            element={<LoginPage setLoggedIn={setLoggedIn} nav={nav} />}
          />
        </Routes>
      </div>
      <FooterNonProfit data={footerInfo} />
    </div>
  );
}

export default NonProfitOverall;
