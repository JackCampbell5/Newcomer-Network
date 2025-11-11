const googleApiKey = process.env.MAPS_API_KEY;
import { errorReturn, successReturn } from "#utils/validate-utils.js";
import { getAreaAroundPoint } from "#search/dist-utils.js";
import { nonprofitRadius } from "#utils/constants.js";
import {
  serviceInPerimeter,
  getCords,
  getRadiusAroundPointObject,
} from "#search/dist-utils.js";

/**
 * Searches for an address using the search text API
 * + This will search around a nonprofit if given(The radius is defined in the radius global variable)
 * @param {string} address - The address to search for
 * @param {object} nonprofit - The nonprofit to search around if given
 * @returns
 */
export default async function formatAddress(address, nonprofit = null) {
  const searchURL = "https://places.googleapis.com/v1/places:searchText";

  // Data for the POST request
  let data = getSearchTextRequestBody(address, nonprofit);
  let mask = getSearchTextRequestMask();

  return await fetch(`${searchURL}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleApiKey,
      "X-Goog-FieldMask": mask,
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text(); // Read the response as text
        throw new Error(`${response.status}, ${errorText}`);
      }
      return response.json(); // Parse JSON data from the response
    })
    .then((data) => {
      return validateAndExtractSearchData(data, nonprofit);
    })
    .catch((error) => {
      // Handle error
      return errorReturn(error.message); // Return an error object
    });
}

/**
 *  Validates the data returned from the search text API to see if any results were found
 * + If multiple results are found, return an error with all possible addresses
 * @param {object} data - The data to validate and return if valid
 * @param {object} nonprofit - The nonprofit to search around
 * @returns - If the data is valid, return the data, otherwise return an error object containing the error
 */
function validateAndExtractSearchData(data, nonprofit) {
  // If the address is not found, return an error
  if (Object.keys(data).length === 0) {
    if (nonprofit === null) {
      return errorReturn("Can not locate address of nonprofit to create");
    } else {
      return errorReturn(
        `That address not found within ${nonprofitRadius} miles of nonprofit`
      );
    }
  }
  // If multiple addresses are found, return an error with all possible addresses
  const places = data.places;
  // if (places.length > 1) {
  //   let manyPlacesStr =
  //     "Multiple addresses found matching that address. Please be more specific: ";
  //   for (let i = 0; i < places.length; i++) {
  //     manyPlacesStr += places[i].formattedAddress + ", ";
  //   }
  //   return errorReturn(manyPlacesStr); // Return an error object
  // } else {
  const gottenCords = getCords(data.places[0]);
  if (nonprofit) {
    const radius = getRadiusAroundPointObject(
      getCords(nonprofit.addressInfo),
      nonprofitRadius
    );
    if (serviceInPerimeter(radius, gottenCords) === false) {
      return errorReturn(
        `We can not locate that address within ${nonprofitRadius} miles of the nonprofit please be more specific or try a different address`
      );
    }
  }

  // if there is only one option return the data
  return successReturn(data.places[0]); // Return the actual data instead of a container
  // }
}

/**
 * Creates the request body for the search text API
 * + Adds the location restriction if the nonprofit has a location based on the radius global variable
 * @param {string} address - The address to add to add to the request body
 * @param {object} nonprofit - The nonprofit to search around
 * @returns
 */
function getSearchTextRequestBody(address, nonprofit) {
  let data = { textQuery: address, languageCode: "en" };

  // Add the location restriction if the nonprofit has a location
  if (nonprofit !== null && nonprofit.addressInfo) {
    const info = nonprofit.addressInfo;
    const location = info?.location;
    if (location !== undefined) {
      const latLong = getRadiusAroundPointObject(location, nonprofitRadius);
      data.locationRestriction = { rectangle: latLong };
    }
  }
  return data;
}

/**
 * The mask for the search text API
 * @returns A string containing the mask for the search text API
 */
function getSearchTextRequestMask() {
  return [
    "places.shortFormattedAddress",
    "places.displayName",
    "places.containingPlaces",
    "places.formattedAddress",
    "places.name",
    "places.location",
    "places.postalAddress",
  ].join(",");
}

/**
 *
 * @param {string} address Extracts the zipcode from an address given
 * @returns
 */
export function extractZipcode(address) {
  const addressRegex = /(\d{5}(?:\-\d{4})?)(?:\s*)/;
  const matches = address.match(addressRegex);
  if (matches) {
    return matches[0];
  } else {
    return null;
  }
}
