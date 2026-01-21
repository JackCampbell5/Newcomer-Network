// Node Module Imports
import React from "react";
import { useState } from "react";

// Local Imports
import "./SearchService.css";
// Other components
import SearchFilters from "#components/SearchFilters/SearchFilters";
import RecList from "#components/RecList/RecList";
// Util Functions
import { fetchSearch } from "#fetch/serviceFetchUtils";
import { getNonProfit } from "#utils/pathUtils";

function SearchService() {
  // Constant Variables
  const nonprofit = getNonProfit();

  // State Variables
  const [loading, setLoading] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [errorText, setErrorText] = useState("");

  /**
   * Sends a request to the backend to search for services
   * @param {object} data - The data to be sent to the backend and searched for
   */
  function searchFor(data) {
    setLoading(true);
    fetchSearch(nonprofit, data).then(searchForCallback);
  }

  /**
   *  Callback function for fetchSearch that sets the results of sets the error
   * @param {*} results - The result of searchForCallback
   */
  function searchForCallback(results) {
    setLoading(false);
    if (results.valid) {
      setErrorText("");
      setSearchResults(results.data);
    } else {
      setErrorText(results.error);
    }
  }

  return (
    <div className="SearchService">
      <h3>SearchService</h3>
      <SearchFilters
        loading={loading}
        setLoading={setLoading}
        searchFor={searchFor}
      />
      <p className="errorText">{errorText}</p>
      {searchResults.length !== 0 ? (
        <RecList
          serviceList={searchResults}
          setServiceList={setSearchResults}
        />
      ) : null}
    </div>
  );
}

export default SearchService;
