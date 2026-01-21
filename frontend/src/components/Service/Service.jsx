// Node Module Imports
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { MdArrowDropDownCircle } from "react-icons/md";

// Local Imports
import "./Service.css";
// Util Functions
import { addServiceView } from "#fetch/serviceFetchUtils";
import serviceDisplayDefault from "#default-data/serviceDisplayDefault.json";
import { fillMissingDataFields } from "#utils/selectUtils";
import { serviceSearchIconMap } from "#utils/serviceIconUtils";
import { getNonProfit } from "#utils/pathUtils";
import { stringifyHours } from "#utils/hoursUtils";

/**
 *  A service component that displays info about a specific service a nonprofit has added
 * @param {object} data - Info on a specific service
 */
function Service({ inputData }) {
  // Constant Variables
  const nonprofit = getNonProfit();
  const hiddenFields = ["id", "addressInfo", "links", "nonprofit_ID"];
  const topFields = ["name", "description", "route_length", "ranking"];
  // State Variables
  const [serviceData, setServiceData] = useState({ bottom: [], top: [] });
  const [links, setLinks] = useState({});
  const [expanded, setExpanded] = useState(false);

  function onMoreDetailsClick() {
    setExpanded((pre) => !pre);
    if (inputData.nonprofit_ID) {
      addServiceView(nonprofit, inputData.id);
    }
  }

  /**
   * Divides the data based on what is on the topFields or not. Also makes sure the hiddenFields does not make into either array
   * @param {object} dataObj - The object to divide
   * @returns The divided data in the form [top, bottom, links]
   */
  function divideData(dataObj) {
    const data = JSON.parse(JSON.stringify(dataObj));
    let topData = [];
    let bottomData = [];
    for (const field in data) {
      if (topFields.includes(field)) {
        topData.push({ id: field, value: data[field] });
      } else if (!hiddenFields.includes(field)) {
        bottomData.push({ id: field, value: data[field] });
      }
    }
    return [topData, bottomData, data.links];
  }

  /**
   * Restructure the input data for display and then sets the data to that value
   * @param {obj} data - The data to restructure and then set
   */
  function restructureData(data) {
    // Divide the data
    const [topData, bottomData, links] = divideData(data);
    setLinks(links); // Set the links

    // Fill the fields to add icon and name
    const completeTop = fillMissingDataFields(topData, serviceDisplayDefault);
    let completeBottom = fillMissingDataFields(
      bottomData,
      serviceDisplayDefault
    );
    completeBottom = completeBottom.map((obj) => {
      obj.id === "hours" ? (obj.value = stringifyHours(obj.value)) : null;
      return obj;
    });
    // Restructure the top for easier form to get
    let updatedTopData = completeTop.reduce((acc, obj) => {
      return { ...acc, [obj.id]: obj.value };
    }, {});
    const completeData = { top: updatedTopData, bottom: completeBottom };
    setServiceData(completeData);
  }

  useEffect(() => {
    restructureData(inputData);
  }, [inputData]);
  return (
    <div className={["Service", serviceData.top.name && "borderYes"].join(" ")}>
      <div className="serviceTop">
        <div className="topLeft">
          {serviceData.top.name ? <h3>{serviceData.top.name}</h3> : null}
          {serviceData.top.description ? (
            <p className="serviceDescription">{serviceData.top.description}</p>
          ) : null}
        </div>
        <div className="topRight">
          {serviceData.top.route_length ? (
            <div
              className={[
                "topParam",
                serviceData.top.route_length < 10
                  ? "greenOutline"
                  : serviceData.top.route_length < 20
                  ? "yellowOutline"
                  : "redOutline",
              ].join(" ")}
            >
              <div className="bigText">{serviceData.top.route_length}</div>
              <div className="smallText">Miles</div>
            </div>
          ) : null}
          {serviceData.top.ranking ? (
            <div
              className={[
                "topParam",
                serviceData.top.ranking > 75
                  ? "greenOutline"
                  : serviceData.top.ranking > 50
                  ? "yellowOutline"
                  : "redOutline",
              ].join(" ")}
            >
              <div className="bigText">
                {Math.round(serviceData.top.ranking)}%
              </div>
              <div className="smallText">Match</div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="serviceMid">
        <div
          onClick={onMoreDetailsClick}
          className={[
            "moreDetails",
            expanded ? "expanded" : "notExpanded",
          ].join(" ")}
        >
          {expanded ? "Hide Details" : "More Details"}
          <MdArrowDropDownCircle />
        </div>
      </div>
      {expanded ? (
        <div className="serviceBottom">
          {serviceData.bottom.map((obj) => {
            return obj?.value ? (
              <div className="serviceParam" key={obj.id}>
                <div className="serviceParamName">
                  {obj.icon
                    ? React.createElement(serviceSearchIconMap[obj.icon], {})
                    : null}
                  <div className="serviceParamNameText">{obj.name}</div>
                </div>
                <div className="serviceParamValue">
                  {obj.id === "address" ? (
                    inputData.addressInfo ? (
                    <div>
                      {obj.value}
                      {" ("}
                      <a href={links?.route} target="_blank">
                        <strong>Directions</strong>
                      </a>
                      {")"}
                    </div>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#666' }}>
                        Virtual Service - Available Online
                      </span>
                    )
                  ) : obj.id === "website" ? (
                    <a href={obj.value} target="_blank">
                      {obj.value}
                    </a>
                  ) : obj.id === "hours" ? (
                    <div className="hoursTable">
                      <table>
                        <thead>
                          <tr className="headerFields">
                            {obj.value.map((day, index) => (
                              <th key={index}>{day.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {obj.value.map((day, index) => (
                              <td key={index}>{day.value}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <span>{obj.value}</span>
                  )}
                </div>
              </div>
            ) : null;
          })}
        </div>
      ) : null}
    </div>
  );
}

Service.propTypes = {
  data: PropTypes.object.isRequired,
};

export default Service;
