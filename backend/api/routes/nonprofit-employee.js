// Node Module Imports
import { prisma } from "#utils/constants.js";
import express from "express";

// Local Imports
import {
  EmployeeNotFoundError,
  EmployeeUsernameTakenError,
  EmployeeLogInError,
} from "#errors/employee-errors.js";
import { hashPassword, verifyPassword } from "#utils/auth-utils.js";
import {
  checkEmployeeUsername,
  checkEmployeeId,
  secureEmployeeData,
  getEmployeeData,
} from "#api-helpers/employee-valid-utils.js";
import { createErrorReturn } from "#utils/validate-utils.js";
import { checkLogin } from "#utils/session-utils.js";

const employeeRouter = express.Router();

// Default is to get all nonprofits
employeeRouter.get("/", async (req, res, next) => {
  const nonprofit = req.nonprofit;
  res.send(`Welcome to ${nonprofit.name}'s employee database!`);
});

// Default is to get all nonprofits
employeeRouter.get("/all", async (req, res, next) => {
  res.send(`Welcome to ${nonprofit.name}'s employee database!`);
  // const findNonProfits = await prisma.nonprofit_employee.findMany();
  // // Hide the password
  // for (let employee of findNonProfits) {
  //   employee.password = "*********";
  // }
  // res.status(200).json(findNonProfits);
});

// Get one nonprofit by id (No get by name for security)
employeeRouter.get("/:employee_id", async (req, res, next) => {
  const { employee_id } = req.params;
  try {
    const findEmployee = await prisma.nonprofit_employee.findUnique({
      where: {
        id: employee_id,
      },
    });

    // Remove password from response just in case
    if (findEmployee) {
      const secureEmployee = secureEmployeeData(findEmployee);
      res.status(200).json(secureEmployee);
    } else {
      throw new EmployeeNotFoundError(employee_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Register a new non profit employee
employeeRouter.post("/register", async (req, res, next) => {
  [req, res] = checkLogin(req, res);
  if (res.statusCode === 401) return;

  // I believe it does not mater what non profit they are trying to Log Into here for Register as usernames have to be unique anyways.
  const employeeData = req.body.data;
  const username = employeeData.username;
  const nonprofit = req.nonprofit;
  try {
    const exists = await checkEmployeeUsername(username, "", next);
    if (!exists) {
      // Hash the password
      const hash = await hashPassword(employeeData.password);
      employeeData.password = hash;
      employeeData["nonprofit_ID"] = nonprofit.id;

      // Create the employee
      const createEmployee = await prisma.nonprofit_employee.create({
        data: employeeData,
      });

      // Return the employee without the password
      const secureEmployee = secureEmployeeData(createEmployee);
      req.session.employee = secureEmployee; // Added to session
      res.status(201).json(secureEmployee);
    } else {
      throw new EmployeeUsernameTakenError(username);
    }
  } catch (e) {
    return next(e);
  }
});

// Register a new non profit employee
employeeRouter.post("/login", async (req, res, next) => {
  const { username, password: plainPassword } = req.body.data;
  const nonprofit = req.nonprofit;
  try {
    const employeeData = await getEmployeeData(username, nonprofit, next);
    if (employeeData) {
      if (await verifyPassword(plainPassword, employeeData.password)) {
        // Return the employee without the password
        const secureEmployee = secureEmployeeData(employeeData);
        req.session.employee = secureEmployee; // Added to session
        res.status(201).json(secureEmployee);
      } else {
        throw new EmployeeLogInError(username);
      }
    } else {
      throw new EmployeeNotFoundError(username);
    }
  } catch (e) {
    return next(e);
  }
});

// Register a new non profit employee
employeeRouter.get("/login/current", async (req, res, next) => {
  const nonprofit = req.nonprofit;
  try {
    [req, res] = checkLogin(req, res);
    if (res.statusCode === 401) return;

    return res.status(200).json(secureEmployeeData(req.session.employee));
  } catch (e) {
    return next(e);
  }
});

// Logout a user
employeeRouter.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next({ message: "Logout failed" });
    } else {
      res.clearCookie("sessionId");
      res.json({ message: "👋 Logged out" });
    }
  });
});

// Edit a employee by name
employeeRouter.put("/:employee_id/edit", async (req, res, next) => {
  const { employee_id } = req.params;
  const employeeData = req.body.data;
  const nonprofit = req.nonprofit;
  try {
    const exists = await checkEmployeeId(employee_id, nonprofit, next);
    if (exists) {
      // If employee gives a new password, hash it
      if (employeeData.password) {
        const hash = await hashPassword(employeeData.password);
        employeeData.password = hash;
      }

      // Update the employee
      const updateOne = await prisma.nonprofit_employee.update({
        where: {
          id: employee_id,
        },
        data: employeeData,
      });
      return res.status(200).json(updateOne);
    } else {
      throw new EmployeeNotFoundError(employee_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Delete a nonprofit by name
employeeRouter.delete("/:employee_id/delete", async (req, res, next) => {
  const { employee_id } = req.params;
  const nonprofit = req.nonprofit;
  try {
    const exists = await checkEmployeeId(employee_id, nonprofit, next);
    if (exists) {
      await prisma.nonprofit_employee.delete({
        where: {
          id: employee_id,
        },
      });
      res.status(200).send();
    } else {
      throw new EmployeeNotFoundError(employee_id);
    }
  } catch (e) {
    return next(e);
  }
});

// Error handling
employeeRouter.use((err, req, res, next) => {
  if (
    err instanceof EmployeeNotFoundError ||
    err instanceof EmployeeLogInError
  ) {
    return res.status(404).send(createErrorReturn(err));
  } else if (err instanceof EmployeeUsernameTakenError) {
    return res.status(409).send(createErrorReturn(err));
  } else {
    return res.status(500).send(createErrorReturn(err));
  }
});

export default employeeRouter;
