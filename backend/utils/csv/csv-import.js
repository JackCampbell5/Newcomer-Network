import { errorReturn, successReturn } from "#utils/validate-utils.js";
import { Readable } from "stream";
import csv from "csv-parser";

import { checkServiceNameBoolean } from "#utils/api-helpers/service-utils.js";
import { validateAndFormatServiceData } from "#utils/api-helpers/service-param-standardize.js";
import { prisma } from "#utils/constants.js";

export async function importCSV(file, nonprofit) {
  let csvObject = await parseCSV(file);

  if (!csvObject.valid) {
    return errorReturn(csvObject.error);
  } else {
    csvObject = csvObject.data;
  }
  csvObject = csvObject.filter((row) =>
    Object.values(row).some((value) => value.trim() !== "")
  );
  const servicesWithErrors = await addAllServicesAndGetErrors(
    csvObject,
    nonprofit
  );
  return successReturn(servicesWithErrors);
}

/**
 * Reads all the data from the csv file and add it to an object
 * @param {object} file - File object with buffer
 * @returns The data from the csv file
 */
async function parseCSV(file) {
  const readableStream = Readable.from(file.buffer.toString()); // Convert buffer to string and create a readable stream
  const results = [];

  try {
    await new Promise((resolve, reject) => {
      readableStream
        .pipe(csv())
        .on("data", (data) => results.push(data)) // Collect parsed data rows
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    return errorReturn(error.message);
  }
  return successReturn(results);
}

/**
 *
 * @param {object} csvObject - Takes Json Format and makes it readable
 * @returns
 */
async function addAllServicesAndGetErrors(csvObject, nonprofit) {
  let formattedData = [];
  let num = 0;
  for (const row of csvObject) {
    for (const key in row) {
      if (typeof row[key] === "string") {
        row[key] = row[key].trim();
      }
    }
    let serviceData = row;
    const name = serviceData.name;
    const exists = await checkServiceNameBoolean(name, nonprofit); //If a service were to exist
    let error = exists ? "Service name already used in database" : "";
    const addHoursReturn = addHoursData(serviceData);
    if (!addHoursReturn.valid) {
      error = addHoursReturn.error + error;
    }

    const serviceDataWithHours = addHoursReturn.data;

    const serviceDataWithOffered = {
      ...serviceDataWithHours,
      services_offered: serviceDataWithHours.services_offered.split(","),
    };

    const validatedService = await validateAndFormatServiceData(
      serviceDataWithOffered,
      nonprofit
    );
    if (!validatedService.valid) {
      error = validatedService.error + error;
    }
    //TODO Check for required fields

    const date_regex = /^(www|https|http)/; // TODO Improve regex for URL validation
    if (!date_regex.test(date)) {
      error += "Website URL is not valid. ";
    }

    if (error) {
      serviceDataWithOffered.error = error;
      formattedData.push({
        ...serviceDataWithOffered,
        language: serviceDataWithOffered.language.split(","),
        id: num++,
      });
    } else {
      // TODO print a message for what services have been successfully added
      try {
        await prisma.service.create({
          data: { ...validatedService.data, nonprofit_ID: nonprofit.id },
        });
      } catch (err) {
        serviceDataWithOffered.error = err.message;
        formattedData.push({
          ...serviceDataWithOffered,
          language: serviceDataWithOffered.language.split(","),
          id: num++,
        });
      }
    }
  }
  return formattedData;
}

//TODO Add documentation
function addHoursData(data) {
  let error = "";
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const invalid_date = {
    start: "1899-12-31T00:00:00.000Z",
    end: "1899-12-31T00:00:00.000Z",
  };

  let hours = days.map((day) => {
    const startKey = `${day}_start`;
    const endKey = `${day}_end`;

    if (!data[startKey] || !data[endKey]) {
      // No hours set → return closed
      delete data[startKey];
      delete data[endKey];
      return invalid_date;
    }
    const sKey = data[startKey].trim();
    const eKey = data[endKey].trim();
    delete data[startKey];
    delete data[endKey];
    try {
      const start = new Date(`1899-12-31 ${sKey}`);
      const end = new Date(`1899-12-31 ${eKey}`);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    } catch {
      error = `Invalid time format for ${day}`;
      return invalid_date;
    }
  });
  data.hours = hours;
  if (error) {
    return { ...errorReturn(error), data: data };
  }
  return successReturn(data);
}
