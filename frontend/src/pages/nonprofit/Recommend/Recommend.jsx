// Node Module Imports
import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";

// Local imports
import "./Recommend.css";
// Other components
import RecList from "#components/RecList/RecList";
import LoadingButton from "#components/LoadingButton/LoadingButton";
// util functions
import { fetchRecs } from "#fetch/serviceFetchUtils";
import { getNonProfit } from "#utils/pathUtils";

function Recommend() {
  // Constant Variables
  const nonprofit = getNonProfit();

  // State Variables
  const [searchResults, setSearchResults] = useState([]);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  function getRecs() {
    setLoading(true);
    fetchRecs(nonprofit).then(fetchRecsCallback);
  }
  function fetchRecsCallback(result) {
    setLoading(false);
    if (!result.valid) {
      setErrorText(result.error);
    } else {
      // If the data is valid but empty return an error
      if (result.data.length === 0) {
        setErrorText("No recommended services found for this nonprofit");
      } else {
        setErrorText("");
        setSearchResults(result.data);
      }
    }
  }

  return (
    <div className="Recommend">
      <h1>Service Recommendations</h1>
      {searchResults.length === 0 ? (
        <LoadingButton
          onClick={getRecs}
          loading={loading}
          text={"Recommend Services for my NonProfit"}
          fit={true}
        />
      ) : (
        <RecList
          serviceList={searchResults}
          setServiceList={setSearchResults}
        />
      )}
      <p className="errorText">{errorText}</p>
    </div>
  );
}

export default Recommend;
