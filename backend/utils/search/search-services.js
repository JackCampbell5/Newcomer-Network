// Node Module Imports
import { prisma } from "#utils/constants.js";

// Local Imports
import formatAddress from "#utils/search/address-utils.js";
import { calcDistance, getCords } from "#search/dist-utils.js";
import { errorReturn, successReturn } from "#utils/validate-utils.js";
import { routeBetween, createDirectionLink } from "#search/direction-utils.js";
import { dayToIndex } from "#utils/constants.js";
import { normalizeServiceFromRank } from "#utils/ranking-utils.js";
/**
 * The weights for each parameter as of now(Total = 100)
 */
const weightsDefault = {
  address: 30,
  services: 45,
  language: 10,
  date: 5,
  attend: 10,
};

/**
 * Gets the top 5 services based on the query parameters given
 * @param {object} query - The query parameters given in the search
 * @param {object} nonprofit - Object containing the nonprofit information
 * @returns
 */
export default async function searchServices(query, nonprofit) {
  // Validate the query params
  const params = await isValidParams(query, nonprofit);
  if (!params.valid) {
    return errorReturn(params.error);
  }
  // Weight and return the top 5 services
  const topData = await topServices(params.data, nonprofit);
  if (!topData.valid) {
    return errorReturn(topData.error);
  }
  return successReturn({
    searchResults: topData.data,
    params: params.data,
  });
}

/**
 * Takes the services, ranks them, and returns the top 5 services
 * @param {object} params - The valid query parameters given in the search
 * @param {object} nonprofit - The nonprofit object containing the nonprofits id and other information
 * @returns max 5 services with the highest ranking or an error
 */
async function topServices(params, nonprofit) {
  // Get the services for a given nonprofit
  const foundServices = await prisma.service.findMany({
    where: {
      nonprofit_ID: nonprofit.id,
    },
  });

  const weights = retrieveRankingWeights(params);
  const serviceWithWeight = calculateRankingScoreForServices(
    foundServices,
    params,
    weights
  );

  // Sort the services by ranking
  const rankedOrder = serviceWithWeight.sort((a, b) => {
    return b.ranking - a.ranking;
  });

  // Normalize the rankings to 100
  const normalizedServices = normalizeServiceFromRank(rankedOrder);

  // Return all services normalized above 50% if there are more than 5 services
  const overFiftyPercent = normalizedServices.filter(
    (service) => service.ranking > 50
  );
  const top =
    overFiftyPercent.length > 10
      ? overFiftyPercent
      : normalizedServices.slice(0, 10);

  const result = await addRouteData(top, params.address);
  if (!result.valid) {
    return errorReturn(result.error);
  }

  return successReturn(result.data);
}

/**
 * Takes all of the services and adds the route length and link to that route
 * @param {Array} services - Array of services to add route data to
 * @param {*} address - The address of the user
 * @returns The services with the route data added or an error
 */
async function addRouteData(services, address) {
  for (let service of services) {
    let result = await routeBetween(address, service.addressInfo);
    if (result.valid) {
      service.route_length = result.data;
      let link = createDirectionLink(address, service.addressInfo);
      service.links = service.links
        ? { ...service.links, route: link }
        : { route: link };
    } else {
      return errorReturn(result.error);
    }
  }
  return successReturn(services);
}

/**
 * Calculates the dynamic weights for each parameter based on the preference given and then normalizes
 * @param {object} params - The query parameters given in the search
 * @returns The weights for each parameter based on the preference given normalized to 100
 */
function retrieveRankingWeights(params) {
  const preference = params.preference;
  // Dynamic weights based on preference
  let weights = JSON.parse(JSON.stringify(weightsDefault));
  if (preference) {
    for (const singlePreference of preference) {
      weights[singlePreference] *= 1.5;
    }
    weights = normalizeWeights(weights);
  }
  return weights;
}

/**
 * Search thru the different services and calculate the weights for each one based on global weights
 * @param {object} foundServices - The services found in the database to search within
 * @param {object} params - Object containing the parameters for the search
 * @returns The list of services with their ranking
 */
function calculateRankingScoreForServices(foundServices, params, weights) {
  // Get the params
  const address = params.address;
  const services = params.services;
  const language = params.language;
  const date_entered = params.date_entered;
  const attend_time = params.attend_time;
  const attend_day = params.attend_day;

  // Calculate the weights for each service
  let weightTotals = [];
  const refugeeCords = getCords(address);
  for (const service of foundServices) {
    let ranking = 0;

    if (service.addressInfo) {
      // Add the address weight
      const cords = getCords(service.addressInfo);
      const distance = calcDistance(cords, refugeeCords);
      if (distance < 20) {
        ranking += ((20 - distance) / 20) * weights.address;
      }
    }

    let serviceWeightAlreadyAdded = false;
    // Add the services weight
    for (const service_needed of service.services_offered) {
      if (services.includes(service_needed)) {
        if (!serviceWeightAlreadyAdded) {
          serviceWeightAlreadyAdded = true;
          ranking += weights.services;
        } else {
          ranking += weights.services / 2;
        }
      }
    }
    // If the current service does not offer the services we are looking for
    // do not add them to the results
    if (!serviceWeightAlreadyAdded) {
      continue;
    }

    // Add the language weight
    let languageList = service.language;
    if (
      !language ||
      language === "english" ||
      languageList.includes(language) ||
      service.language === null
    ) {
      ranking += weights.language;
    }

    // Add the date weight
    if (
      !date_entered ||
      date_entered > new Date(service.date_created) ||
      service.date_needed === null
    ) {
      ranking += weights.date;
    }
    // If both day and time
    if (attend_time && attend_day) {
      const dayTimes = service.hours;
      for (const day of attend_day) {
        const dayIndex = dayToIndex[day];
        const times = dayTimes[dayIndex];
        if (dayIndex && timeInRange(attend_time, times)) {
          ranking += weights.attend / attend_day.length;
        }
      }
    } else {
      // Just time
      if (attend_time) {
        for (const times of service.hours) {
          if (timeInRange(attend_time, times)) {
            ranking += weights.attend / 7;
          }
        }
      }
      // Just day
      if (attend_day) {
        for (const day of attend_day) {
          const dayIndex = dayToIndex[day];
          const times = service.hours[dayIndex];
          if (dayIndex && times.start !== times.end) {
            ranking += weights.attend / attend_day.length;
          }
        }
      }
    }

    weightTotals.push({ ...service, ranking: ranking });
  }
  return weightTotals;
}

/**
 * Normalizes the weight values to 100
 * @param {object} weightsObj - The weights object to normalize where {key: weight}
 * @returns A object with the weights normalized
 */
function normalizeWeights(weightsObj) {
  let weights = JSON.parse(JSON.stringify(weightsObj));
  // Normalize the weights
  let total = 0;
  for (const key in weights) {
    total += weights[key];
  }
  for (const key in weights) {
    weights[key] /= total;
    weights[key] *= 100;
  }
  return weights;
}

/**
 * Checks if the given date object is within the given range
 * @param {Date} time - The date object to check
 * @param {object} range - The range to check against
 * @returns True if the time is within the range, false otherwise
 */
function timeInRange(time, range) {
  const startTime = new Date(range.start);
  const endTime = new Date(range.end);
  return time > startTime && time < endTime;
}

/**
 * Validates the query parameters given if they exist. Returning errors if there are validation errors
 * @param {object} query - The query parameters given in the search
 * @param {object} nonprofit - The nonprofit object containing the nonprofits id and other information
 * @returns The valid query parameters or an error
 */
async function isValidParams(query, nonprofit) {
  // Params that can be used for search
  const address_given = query.address;
  const services_needed_given = JSON.parse(query.services_needed);
  const language_given = query.language;
  const date_entered_given = query.date_entered;
  const attend_time_given = query.attend_time;
  const attend_day_given = query.attend_day;
  const preference_given = query.preference;

  let params = {};

  // Validate Address and return errors if they exist
  const result = await formatAddress(address_given, nonprofit);
  if (!result.valid) {
    return errorReturn(result.error);
  }
  params.address = result.data;

  // Extract Services Needed
  params.services = services_needed_given.map((option) => {
    return option.value;
  });

  // Validate Language
  if (language_given) {
    params.language = language_given
      .split(",")
      .map((language) => language.trim().toLowerCase());
  }

  // Validate Date
  params.date_entered = "";
  if (date_entered_given) {
    const date_valid = getAndValidateDate(date_entered_given);
    if (!date_valid.valid) {
      return errorReturn(date_valid.error);
    }
    params.date_entered = date_valid.data;
  }

  // The time the user is available to attend
  if (attend_time_given) {
    params.attend_time = new Date(attend_time_given);
  }

  // The days the user is available to attend
  if (attend_day_given) {
    params.attend_day = JSON.parse(attend_day_given).map((option) => {
      return option.value;
    });
  }

  // The preference of the user for top category
  if (preference_given) {
    params.preference = JSON.parse(preference_given).map((option) => {
      return option.value;
    });
  }
  return successReturn(params);
}

/**
 * Validates that the date is in the correct format of MM-DD-YYYY
 * @param {string} date- The date to validate
 * @returns A date object or an error
 */
export function getAndValidateDate(date) {
  const date_regex =
    /^(?:((?:0?[1-9])|10|11|12)-(0?[1-9]|[12]\d|30|31)-(\d{4}))$/;
  if (!date_regex.test(date)) {
    return errorReturn(
      "Invalid date format. Please use MM-DD-YYYY or leave blank."
    );
  } else {
    const dateParts = date.match(date_regex);
    return successReturn(
      new Date(dateParts[3], dateParts[1] - 1, dateParts[2])
    );
  }
}
