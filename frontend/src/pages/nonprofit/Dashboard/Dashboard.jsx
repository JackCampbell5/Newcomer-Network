// Node Module Imports
import React from "react";
import { useState, useEffect } from "react";

// Local Imports
import "./Dashboard.css";
// Other components
import EditService from "#components/EditService/EditService";

// Helper functions
import { fetchNonProfitStats } from "#fetch/nonProfitFetchUtils";
import { statsDefault } from "#default-data/nonProfitDefaultData.js";
import { getNonProfit } from "#utils/pathUtils";

function Dashboard() {
  // Constant Variables
  const nonprofit = getNonProfit();

  // State Variables
  const [siteStats, setSiteStats] = useState(statsDefault);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    fetchNonProfitStats(nonprofit).then((result) => {
      if (result.valid) {
        setSiteStats(result.data);
      } else {
        setErrorText(result.error);
      }
    });
  }, []);
  return (
    <div className="Dashboard">
      <div className="dashHeader largeHeader">Dashboard</div>
      <p>This will give directions on how to use Strong Start </p>
      <div className="dashHeader smallHeader">Your Site</div>
      <p>How your sites doing</p>
      <div className="siteStats">
        <div className="siteStatLeft">
          {Object.entries(siteStats).map((obj) => {
            const key = obj[0]; // gets the key from obj.entries
            const dict = obj[1]; // gets the dict stored at the given key from obj.entries
            return <p key={key}>{dict.name}</p>;
          })}
        </div>
        <div className="siteStatRight">
          {Object.entries(siteStats).map((obj) => {
            const key = obj[0]; // gets the key from obj.entries
            const dict = obj[1]; // gets the dict stored at the given key from obj.entries
            return <p key={key}>{dict.key}</p>;
          })}
        </div>
      </div>
      <p className="errorText">{errorText}</p>
      <div className="dashHeader smallHeader">Create New Service</div>
      <EditService />
    </div>
  );
}

export default Dashboard;
