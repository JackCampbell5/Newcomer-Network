// Node Module Imports
import React, { use, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { useState } from "react";

// Local imports
import "./RecList.css";
// Other components
import RecService from "#components/RecService/RecService";

function RecList({ serviceList, setServiceList }) {
  // Constant Variables
  const pageSize = 10;
  let highestPage = Math.ceil(serviceList.length / pageSize);

  // State Variables
  const [currentServices, setCurrentServices] = useState([]);
  const [successText, setSuccessText] = useState("");
  const [page, setPage] = useState(0);

  /**
   * Changes the page to the new page
   * @param {number} newPage - The page to change to
   */
  function changePage(newPage) {
    setPage(newPage);
    setCurrentServices(
      serviceList.slice(newPage * pageSize - pageSize, newPage * pageSize),
    );
  }

  /**
   * Loops thru the existing data, finds the matching the id given. Then updates that existing object with any matching params from dataToUpdateWith
   * @param {object} existingData -  The existing data to update
   * @param {object} dataToUpdateWith - The new data to update the existing data with
   * @param {string} idToUpdate - The ID to update
   * @returns The updated existing data
   */
  function editParamsInDict(existingData, dataToUpdateWith, idToUpdate) {
    return existingData.map((element) => {
      if (element.id === idToUpdate) {
        for (let param in dataToUpdateWith) {
          element[param] = dataToUpdateWith[param];
        }
        return element;
      } else {
        return element;
      }
    });
  }

  /**
   * Removes the service from the list of services using the id of the service
   * + This will show a success message for 5 seconds and no longer show the service
   * @param {string} id - The id of the service that was added
   * @param {object} validData - The updated data if the service was edited
   * @param {boolean} editOnly - If the service was edited or not
   * @param {boolean} deleteButtonUsed - If this was from the delete button press
   */
  function serviceAddOrDeleteSuccessfully(
    id,
    validData = {},
    editOnly = false,
    deleteButtonUsed = false,
  ) {
    let updatedData;
    let updatedPage;
    if (editOnly) {
      // Update the existing data
      updatedData = editParamsInDict(serviceList, validData, id);
      updatedPage = editParamsInDict(currentServices, validData, id);
      setSuccessText("Service Updated Successfully");
    } else {
      // Remove the id from the list
      updatedData = serviceList.filter((item) => item.id !== id);
      updatedPage = currentServices.filter((item) => item.id !== id);
      if (deleteButtonUsed) {
        setSuccessText("Service Deleted Successfully");
      } else {
        setSuccessText("Service Added Successfully");
      }
    }
    setTimeout(() => {
      setSuccessText("");
    }, 5000);

    // Update the data/vars
    setServiceList(updatedData);
    setCurrentServices(updatedPage);
  }
  useEffect(() => {
    changePage(1);
  }, [serviceList]);

  return (
    <div className="RecList">
      <p className="successText">{successText}</p>
      <div className="allRecs">
        {currentServices
          ? currentServices.map((obj) => {
              return (
                <RecService
                  key={obj.id}
                  data={obj}
                  serviceAddOrDeleteSuccessfully={
                    serviceAddOrDeleteSuccessfully
                  }
                />
              );
            })
          : null}
      </div>
      <div className="ServiceTotal">
        <p className="ServiceTotalNum">{currentServices.length} </p>
        <p className="ServiceTotalLabel"> Services on This Page</p>
      </div>
      <div className="pagination">
        <button
          className={page <= 1 ? "disabled" : undefined}
          onClick={() => {
            if (page > 1) {
              changePage(page - 1);
            }
          }}
        >
          Prev
        </button>
        <button
          className={page >= highestPage ? "disabled" : undefined}
          onClick={() => {
            if (page < highestPage) {
              changePage(page + 1);
            }
          }}
        >
          Next
        </button>
        <div>
          Page {page} of {highestPage}
          <br />
          Total Services: {serviceList.length}
        </div>
      </div>
    </div>
  );
}

RecList.propTypes = {
  serviceList: PropTypes.array.isRequired,
  setServiceList: PropTypes.func.isRequired,
};

export default RecList;
