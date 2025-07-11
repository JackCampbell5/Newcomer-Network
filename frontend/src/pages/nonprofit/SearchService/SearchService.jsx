// Node Module Imports
import React from "react";
import { useState } from "react";

// Local Imports
import "./SearchService.css";
// Other components
import SearchFilters from "#components/SearchFilters/SearchFilters";
import ServiceList from "#components/ServiceList/ServiceList";
// Util Functions
import { fetchSearch } from "#fetch/serviceFetchUtils";
import { getNonProfit } from "#utils/pathUtils";

function SearchService() {
  // Constant Variables
  let nonprofit = getNonProfit();

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
    fetchSearch(nonprofit, data).then((results) => {
      setLoading(false);
      if (results.valid) {
        setSearchResults(results.data);
      } else {
        setErrorText(results.error);
      }
    });
  }
  return (
    <div className="SearchService">
      <h3>SearchService</h3>
      <SearchFilters loading={loading} searchFor={searchFor} />
      {searchResults.length !== 0 ? <ServiceList data={searchResults} /> : null}
      <p className="errorText">{errorText}</p>
    </div>
  );
}

export default SearchService;
