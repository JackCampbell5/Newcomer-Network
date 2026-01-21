// Node Module Imports
import { prisma } from "#utils/constants.js";
import express from "express";

// Local Imports
import {
  NonProfitNotFoundError,
  NonProfitAlreadyExistsError,
} from "#errors/nonprofit-errors.js";
import { createErrorReturn } from "#utils/validate-utils.js";
import { generateStats } from "#api-helpers/nonprofit-stat-utils.js";
import {
  checkNonProfitName,
  checkNonProfitId,
  stateCodeToName,
} from "#api-helpers/nonprofit-utils.js";
import formatAddress from "#search/address-utils.js";
import { checkLogin } from "#utils/session-utils.js";

const nonprofitRouter = express.Router();

// Default is to get all nonprofits
nonprofitRouter.get("/", async (req, res, next) => {
  res.status(200).json({ message: "Nonprofit route" });
});

// Get all nonprofits
nonprofitRouter.get("/all", async (req, res, next) => {
  try {
    const foundNonProfits = await prisma.nonprofit.findMany();
    res.status(200).json(foundNonProfits);
  } catch (e) {
    return next(e);
  }
});

// Get all nonprofits encoded for selector
nonprofitRouter.get("/all/short", async (req, res, next) => {
  try {
    const foundNonProfits = await prisma.nonprofit.findMany();
    const after = foundNonProfits.map((nonprofit) => ({
      id: nonprofit.id,
      text: `${nonprofit.name}(${stateCodeToName(
        nonprofit?.addressInfo?.postalAddress?.administrativeArea || ""
      )} Region)`,
    }));
    res.status(200).json(after);
  } catch (e) {
    return next(e);
  }
});

// Get one nonprofit by name
nonprofitRouter.get("/:nonprofit_name", async (req, res, next) => {
  const { nonprofit_name } = req.params;
  try {
    const findNonProfit = await prisma.nonprofit.findUnique({
      where: {
        name: nonprofit_name,
      },
    });
    if (findNonProfit) {
      res.status(200).json(findNonProfit);
    } else {
      throw new NonProfitNotFoundError(nonprofit_name);
    }
  } catch (e) {
    return next(e);
  }
});

// Get stats for one nonprofit by id
nonprofitRouter.get("/:nonprofit_id/stats", async (req, res, next) => {
  try {
    const { nonprofit_id } = req.params;
    const findNonProfit = await prisma.nonprofit.findUnique({
      where: {
        id: nonprofit_id,
      },
    });
    req.nonprofit = findNonProfit;
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;
    if (findNonProfit) {
      const stats = await generateStats(findNonProfit);
      res.status(200).json(stats);
    } else {
      throw new NonProfitNotFoundError(nonprofit_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Get one nonprofit by id
nonprofitRouter.get("/id/:nonprofit_id", async (req, res, next) => {
  const { nonprofit_id } = req.params;
  try {
    const findNonProfit = await prisma.nonprofit.findUnique({
      where: {
        id: nonprofit_id,
      },
    });
    if (findNonProfit) {
      res.status(200).json(findNonProfit);
    } else {
      throw new NonProfitNotFoundError(nonprofit_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Add a new nonprofit by id
nonprofitRouter.post("/add", async (req, res, next) => {
  [req, res] = checkLogin(req, res);
  if (res.statusCode === 401) return;
  let nonProfitData = req.body;
  const name = nonProfitData.name;
  try {
    const invalid = await checkNonProfitName(name, next);
    let addressInfo = await formatAddress(nonProfitData.address);

    if (!invalid) {
      if (addressInfo.valid) {
        nonProfitData.addressInfo = addressInfo.data;
        const createNonProfit = await prisma.nonprofit.create({
          data: nonProfitData,
        });
        res.status(201).json(createNonProfit);
      } else {
        throw new Error(addressInfo.error);
      }
    } else {
      throw new NonProfitAlreadyExistsError(name);
    }
  } catch (e) {
    return next(e);
  }
});

// Edit a nonprofit by id
nonprofitRouter.put("/:nonprofit_id/edit", async (req, res, next) => {
  [req, res] = checkLogin(req, res);
  if (res.statusCode === 401) return;
  const { nonprofit_id } = req.params;
  const nonProfitData = req.body;
  try {
    const exists = await checkNonProfitId(nonprofit_id, next);

    if (exists) {
      const updateOne = await prisma.nonprofit.update({
        where: {
          id: nonprofit_id,
        },
        data: nonProfitData,
      });
      res.json(updateOne);
      res.status(200).send();
    } else {
      throw NonProfitNotFoundError(nonprofit_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Delete a nonprofit by id
nonprofitRouter.delete("/:nonprofit_id/delete", async (req, res, next) => {
  [req, res] = checkLogin(req, res);
  if (res.statusCode === 401) return;
  const { nonprofit_id } = req.params;
  try {
    const exists = await checkNonProfitId(nonprofit_id, next);

    if (exists) {
      await prisma.nonprofit_employee.deleteMany({
        where: { nonprofit_ID: nonprofit_id },
      });
      await prisma.nonprofit.delete({
        where: {
          id: nonprofit_id,
        },
      });
      res.status(200).send(`Nonprofit ${nonprofit_id} deleted`);
    } else {
      throw new NonProfitNotFoundError(nonprofit_id);
    }
  } catch (e) {
    return next(e);
  }
});

nonprofitRouter.use((err, req, res, next) => {
  if (err instanceof NonProfitNotFoundError) {
    return res.status(404).send(createErrorReturn(err));
  } else if (err instanceof NonProfitAlreadyExistsError) {
    return res.status(409).send(createErrorReturn(err));
  } else {
    return res.status(500).send(createErrorReturn(err));
  }
});

export default nonprofitRouter;
