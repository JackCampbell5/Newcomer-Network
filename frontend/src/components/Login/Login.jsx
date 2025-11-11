import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from "react-icons/md";

// Local Imports
import "./Login.css";
// Other components
import LoadingButton from "#components/LoadingButton/LoadingButton";
//Util Functions
import {
  loginNonprofitEmployee,
  checkEmployeeLoginStatus,
} from "#fetch/nonprofitEmployeeFetchUtils";
import { createPageNavigator, NpPages, getNonProfit } from "#utils/pathUtils";

function Login({ setLoggedIn, nav }) {
  // Constant Variables
  const nonprofit = getNonProfit();
  const navigate = useNavigate();
  const location = useLocation();
  const pageNavigator = createPageNavigator(navigate, location);

  // State Variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Checks if the username and password are valid and attempts to log in the user
   * If the login succeeds success text is set to the returned message if it fails
   * error text is set to the returned error message
   */
  function handleLogin() {
    setSuccessText("");
    setErrorText("");
    if (username === "") {
      setErrorText("Username cannot be empty");
      return;
    }
    if (password === "") {
      setErrorText("Password cannot be empty");
      return;
    }
    setLoading(true);
    loginNonprofitEmployee(nonprofit, username, password).then(loginCallback);
  }
  /**
   * Provides the error or success message from the login
   * @param {object} result - The result of the login
   */
  function loginCallback(result) {
    setLoading(false);
    if (result.valid) {
      setLoggedIn(true);
      setSuccessText(result.data);
      // Navigate to the home page after 2 seconds
      setTimeout(() => {
        nav("");
        setSuccessText("");
      }, 500); // 500 milliseconds = .5 seconds
    } else {
      setErrorText(result.error);
    }
  }

  /**
   * Navigates to the register page
   */
  function goToRegister() {
    const path = location.pathname;
    const allLocations = path.split("/");
    const ending = allLocations[allLocations.length - 1];
    const newPath = path.replace(ending, NpPages.REGISTER);
    pageNavigator(newPath);
  }

  /**
   *  If successful provides the username of the currently signed in employee and if not provides nothing
   * @param {object} result - The result of the test login
   */
  function checkEmployeeLoginStatusCallback(result) {
    if (result.valid) {
      const message = `${result.data.username} currently signed in`;
      setSuccessText(message);
    }
  }

  useEffect(() => {
    checkEmployeeLoginStatus(nonprofit).then(checkEmployeeLoginStatusCallback);
  }, []);

  return (
    <div className="Login">
      <div className="topButtons">
        {/* <button onClick={goToRegister}>Register Instead?</button> */}
        <button onClick={() => navigate("/")}>Change Nonprofit</button>
      </div>
      <div className="userInfo">
        <div className="loginField">
          <p>Username:</p>
          <input
            className="username"
            type="text"
            value={username}
            placeholder="username"
            autoComplete="username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </div>
        <div className="loginField">
          <p>Password:</p>
          <input
            className="password"
            type={showPassword ? "text" : "password"}
            value={password}
            placeholder="password"
            autoComplete="current-password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div
            className="showPassword"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <MdRemoveRedEye /> : <MdOutlineRemoveRedEye />}
          </div>
        </div>
      </div>
      <LoadingButton loading={loading} onClick={handleLogin} text="Log In" />
      <p className="errorText">{errorText}</p>
      <p className="successText">{successText}</p>
    </div>
  );
}

export default Login;
