// Node Module Imports
import React, { useState } from "react";

// Local Imports
import "./RegisterPage.css";
// Other Components
import EditAccount from "#components/EditAccount/EditAccount";
// Util Functions
import { registerNonprofitEmployee } from "#fetch/nonprofitEmployeeFetchUtils";
import { useLocation, useNavigate } from "react-router";
import { createPageNavigator, NpPages } from "#utils/pathUtils";

function RegisterPage({ setLoggedIn, nav }) {
  // Constant Values
  const navigate = useNavigate();
  const location = useLocation();
  const pageNavigator = createPageNavigator(navigate, location);
  const registerFetch = registerNonprofitEmployee;

  /**
   * Navigates to the login page
   */
  function goToLogin() {
    const path = location.pathname;
    const allLocations = path.split("/");
    const ending = allLocations[allLocations.length - 1];
    const newPath = path.replace(ending, NpPages.LOGIN);
    pageNavigator(newPath);
  }
  {
    return (
      <div className="RegisterPage">
        <h1>Register For a New Account</h1>
        <p className="moreInfo">
          As you as registering another user that is not yourself, remember to
          sign out of their account before continuing. You have to have an
          account to register new users.
        </p>
        <div className="topButtons">
          <button onClick={goToLogin}>Login Instead?</button>
          <button onClick={() => navigate("/")}>Change Nonprofit</button>
        </div>
        <EditAccount
          setLoggedIn={setLoggedIn}
          nav={nav}
          editAccountFetch={registerFetch}
          newAccount={true}
        />
      </div>
    );
  }
}

export default RegisterPage;
