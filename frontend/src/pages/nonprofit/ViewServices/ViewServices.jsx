// Node Module Imports
import React from "react";
import { useState, useEffect } from "react";

// Local Imports
import "./ViewServices.css";
// Other components
import RecList from "#components/RecList/RecList";
// util functions
import { fetchAllServices } from "#fetch/serviceFetchUtils";
import { getNonProfit } from "#utils/pathUtils";

function ViewServices() {
  // Constant Variables
  const nonprofit = getNonProfit();

  // State Variables
  const [searchResults, setSearchResults] = useState([]);
  const [errorText, setErrorText] = useState("");

  /**
   * Sets the results or the error text based on the results of the fetchAllServices() function
   * @param {object} results - The results of the fetchAllServices() function
   */
  function allServicesCallback(results) {
    if (results.valid) {
      setErrorText("");
      setSearchResults(results.data);
    } else {
      setErrorText(results.error);
    }
  }

  useEffect(() => {
    fetchAllServices(nonprofit).then(allServicesCallback);
  }, []);
  return (
    <div className="ViewServices">
      <h1>All Services</h1>
      {searchResults.length > 0 ? (
        <RecList
          serviceList={searchResults}
          setServiceList={setSearchResults}
        />
      ) : null}
      <p className="errorText">{errorText}</p>
    </div>
  );
}

export default ViewServices;
