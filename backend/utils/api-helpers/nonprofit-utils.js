// Local Imports
import { prisma } from "#utils/constants.js";

// Local Imports
import { NonProfitNotFoundError } from "#errors/nonprofit-errors.js";

/**
 * Checks if a nonprofit exists with that name
 * @param {String} name The name to check
 * @returns True if it exists, false otherwise
 */
export async function checkNonProfitName(name, next) {
  try {
    const resultData = await prisma.nonprofit.findUnique({
      where: {
        name: name,
      },
    });
    return resultData !== null;
  } catch (e) {
    next(e);
  }
}

/**
 * Checks if a nonprofit exists with that id
 * @param {String} id The id to check
 * @returns True if it exists, false otherwise
 */
export async function checkNonProfitId(id, next) {
  try {
    const resultData = await prisma.nonprofit.findUnique({
      where: {
        id: id,
      },
    });
    return resultData !== null;
  } catch (e) {
    next(e);
  }
}

/**
 * Finds the data associated with a nonprofit's name
 * @param {String} name The name to search for
 * @returns The data associated with the nonprofit
 */
async function getNonProfitData(id, next) {
  try {
    return await prisma.nonprofit.findUnique({
      where: {
        id: id,
      },
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Extracts the nonprofit name from the request, fetches its data, and adds it to the request body
 * @param {Object} req Request object
 * @param {Object} res Result object
 * @param {Function} next The function to call next
 * @returns The result of the next function or a 404 if the non profit is not found
 */
export async function getNonProfit(req, res, next) {
  try {
    const name = req.params.nonprofitname;
    const data = await getNonProfitData(name, next);
    if (!data) {
      throw new NonProfitNotFoundError(name);
    } else {
      if (!req) req = {};
      req.nonprofit = data;
      next();
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Converts a US state abbreviation to its full state name.
 *
 * @param {string} code - The two-letter state abbreviation (case-insensitive).
 * @returns {string|null} The full state name if the abbreviation is valid, or null if invalid or not provided.
 */
export function stateCodeToName(code) {
  const states = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };

  if (!code || typeof code !== "string") return null;

  const upperCode = code.trim().toUpperCase();
  return states[upperCode] || "";
}
