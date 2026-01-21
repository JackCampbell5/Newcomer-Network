// Node Module Imports
import { prisma } from "#utils/constants.js";
import express from "express";

// Local Imports
import {
  ServiceNotFoundError,
  ServiceAlreadyExistsError,
} from "#errors/service-errors.js";
import {
  checkServiceName,
  checkServiceId,
} from "#api-helpers/service-utils.js";
import {
  validateAndFormatServiceData,
  prettyPrintServicesOfferedList,
  reformatServiceForReturn,
  dateString,
} from "#api-helpers/service-param-standardize.js";
import { createErrorReturn } from "#utils/validate-utils.js";
import searchServices from "#search/search-services.js";
import getFilter from "#search-filters/filter-create-utils.js";
import recServices from "#recs/rec-services.js";
import { checkSession, checkLogin } from "#utils/session-utils.js";
import { createSearchLog } from "#search/search-utils.js";
import { importCSV } from "#utils/csv/csv-import.js";
import { upload } from "#utils/constants.js";

const serviceRouter = express.Router();

serviceRouter.get("/", (req, res) => {
  const nonprofit = req.nonprofit;
  res.send(`Welcome to ${nonprofit.name}'s service database!`);
});

// Get all services
serviceRouter.get("/all", async (req, res, next) => {
  // if(!req.session.employee) {
  try {
    // Make sure the session is valid if it exists
    req = checkSession(req);

    const nonprofit = req.nonprofit;
    const foundServices = await prisma.service.findMany({
      where: {
        nonprofit_ID: nonprofit.id,
      },
      orderBy: {
        name: "asc",
      },
    });
    if (foundServices.length !== 0) {
      const formattedService = reformatServiceForReturn(foundServices);
      res.status(200).json(formattedService);
    } else {
      res.status(404).send("No services found");
    }
  } catch (e) {
    return next(e);
  }
});

// Get the service filters for a given nonprofit
serviceRouter.get("/filters", async (req, res, next) => {
  try {
    // Make sure the session is valid if it exists
    req = checkSession(req);

    const nonprofit = req.nonprofit;
    return res.status(200).json(await getFilter(nonprofit));
  } catch (e) {
    return next(e);
  }
});

// Get all services
serviceRouter.get("/search", async (req, res, next) => {
  try {
    // Make sure the session is valid if it exists
    req = checkSession(req);

    const nonprofit = req.nonprofit;
    const query = req.query;
    let result = await searchServices(query, nonprofit);
    if (result.valid) {
      const { params, searchResults } = result.data;
      createSearchLog(params, nonprofit, searchResults.length, req.session);
      const formattedService = reformatServiceForReturn(searchResults);
      res.status(200).json(formattedService);
    } else {
      res.status(404).send(result.error);
    }
  } catch (e) {
    return next(e);
  }
});

// Get all services
serviceRouter.get("/recommend", async (req, res, next) => {
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const nonprofit = req.nonprofit;
    let result = await recServices(nonprofit);
    if (result.valid) {
      const formattedService = reformatServiceForReturn(result.data);
      res.status(200).json(formattedService);
    } else {
      res.status(404).send(result.error);
    }
  } catch (e) {
    return next(e);
  }
});

// Get all services in dropdown format
serviceRouter.get("/all/name-list", async (req, res, next) => {
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const nonprofit = req.nonprofit;
    const foundServices = await prisma.service.findMany({
      where: {
        nonprofit_ID: nonprofit.id,
      },
    });
    if (foundServices.length !== 0) {
      const after = foundServices.map((service) => ({
        id: service.id,
        text: service.name,
      }));
      res.status(200).json(after);
    } else {
      res.status(404).send("No services found");
    }
  } catch (e) {
    return next(e);
  }
});

// Get one service by name
serviceRouter.get("/name/:service_name", async (req, res, next) => {
  const { service_name } = req.params;
  const nonprofit = req.nonprofit;
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const findService = await prisma.service.findMany({
      where: {
        name: service_name,
        nonprofit_ID: nonprofit.id,
      },
    });
    //If the find returns results
    if (findService) {
      // Make sure there is only one service with the same name
      if (findService.length !== 1) {
        throw new Error(
          "Multiple services with the same name in one nonprofit found"
        );
      }
      res.status(200).json(findService);
    } else {
      throw new ServiceNotFoundError(service_name);
    }
  } catch (e) {
    return next(e);
  }
});

// Get one service by id
serviceRouter.get("/:service_id", async (req, res, next) => {
  const { service_id } = req.params;
  const nonprofit = req.nonprofit;
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;
    const findService = await prisma.service.findUnique({
      where: {
        id: service_id,
        nonprofit_ID: nonprofit.id,
      },
    });
    if (findService) {
      res.status(200).json(findService);
    } else {
      throw new ServiceNotFoundError(service_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Get one service by id
serviceRouter.get("/:service_id/get-edit", async (req, res, next) => {
  const { service_id } = req.params;
  const nonprofit = req.nonprofit;
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const findService = await prisma.service.findUnique({
      where: {
        id: service_id,
        nonprofit_ID: nonprofit.id,
      },
    });
    if (findService) {
      // Remove the nonprofit_ID and id from the object
      let findServiceCopy = JSON.parse(JSON.stringify(findService));
      delete findServiceCopy.nonprofit_ID;
      delete findServiceCopy.id;
      delete findServiceCopy.addressInfo;
      findServiceCopy.services_offered = prettyPrintServicesOfferedList(
        findServiceCopy.services_offered
      );
      findServiceCopy.language = findServiceCopy.language.join(", ");
      findServiceCopy.date_needed = dateString(findServiceCopy.date_needed);
      // Reformat for frontend
      const keys = Object.keys(findServiceCopy);
      const values = Object.values(findServiceCopy);
      const after = keys.map((key, i) => ({
        id: key,
        value: values[i] ? values[i] : "",
      }));
      res.status(200).json(after);
    } else {
      throw new ServiceNotFoundError(service_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Add a new service by id
serviceRouter.post("/add", async (req, res, next) => {
  const serviceData = req.body.data;
  const name = serviceData.name;
  const nonprofit = req.nonprofit;
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const exists = await checkServiceName(name, nonprofit, next);
    const validatedService = await validateAndFormatServiceData(
      serviceData,
      nonprofit
    );

    if (!exists) {
      if (validatedService.valid) {
        const createService = await prisma.service.create({
          data: { ...validatedService.data, nonprofit_ID: nonprofit.id },
        });
        res.status(201).json(createService);
      } else {
        throw new Error(validatedService.error);
      }
    } else {
      throw new ServiceAlreadyExistsError(name);
    }
  } catch (e) {
    return next(e);
  }
});
// Add a new service via csv
serviceRouter.post("/csv", upload.single("file"), async (req, res, next) => {
  const serviceData = req.file;
  const nonprofit = req.nonprofit;
  try {
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;
    const result = await importCSV(serviceData, nonprofit);
    if (result.valid) {
      const reformatData = reformatServiceForReturn(result.data);
      res.status(201).json(reformatData);
    } else {
      throw new Error(result.error);
    }
  } catch (e) {
    return next(e);
  }
});

// Edit a service by id
serviceRouter.put("/:service_id/edit", async (req, res, next) => {
  const { service_id } = req.params;
  const nonprofit = req.nonprofit;
  const updatedData = req.body.data;
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const exists = await checkServiceId(service_id, nonprofit, next);
    const validatedService = await validateAndFormatServiceData(
      updatedData,
      nonprofit
    );

    if (exists) {
      if (validatedService.valid) {
        const updateOne = await prisma.service.update({
          where: {
            id: service_id,
          },
          data: validatedService.data,
        });
        res.json(updateOne);
        res.status(200).send();
      } else {
        throw new Error(validatedService.error);
      }
    } else {
      throw new ServiceNotFoundError(service_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Add a view to a service by id
serviceRouter.put("/:service_id/view-add", async (req, res) => {
  const nonprofit = req.nonprofit;
  const { service_id } = req.params;

  try {
    // Make sure the session is valid if it exists
    req = checkSession(req);

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const exists = await prisma.web_log.findMany({
      where: {
        nonprofit_ID: nonprofit.id,
        service_ID: service_id,
        timestamp: {
          gte: tenMinutesAgo,
        },
      },
    });
    if (exists.length === 0) {
      await prisma.web_log.create({
        data: {
          session_token: req.session.sessionUUID,
          user_type: 0, // TODO - get user type when more logging is added
          page_id: "null", // TODO - Will have page id when more logging is added
          action: "moreDetails",
          nonprofit: {
            connect: { id: nonprofit.id },
          },
          service: {
            connect: { id: service_id },
          },
        },
      });
    }
    res.status(204).send();
  } catch {
    res.status(404).send("Service not found");
  }
});

// Delete a service by id
serviceRouter.delete("/:service_id/delete", async (req, res, next) => {
  const { service_id } = req.params;
  const nonprofit = req.nonprofit;
  try {
    // Make sure the session is valid if it exists
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    const exists = await checkServiceId(service_id, nonprofit, next);

    if (exists) {
      await prisma.service.delete({
        where: {
          id: service_id,
        },
      });
      res.status(200).send(`Nonprofit ${service_id} deleted`);
    } else {
      throw new ServiceNotFoundError(service_id);
    }
  } catch (e) {
    return next(e);
  }
});

serviceRouter.use((err, req, res, next) => {
  if (err instanceof ServiceNotFoundError) {
    return res.status(404).send(createErrorReturn(err));
  } else if (err instanceof ServiceAlreadyExistsError) {
    return res.status(409).send(createErrorReturn(err));
  } else {
    return res.status(500).send(createErrorReturn(err));
  }
});

export default serviceRouter;
