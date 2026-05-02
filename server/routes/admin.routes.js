import express from "express";
import {
  getAllUsers,
  getSingleUser,
  deleteUser,
  getAllWorkersAdmin,
  approveWorker,
  rejectWorker,
  getAnalytics,
} from "../controllers/admin.controller.js";
import { isAuth }         from "../middleware/isAuth.middleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware.js";

const adminRoute = express.Router();


adminRoute.use(isAuth, authorizeRoles("admin"));

// Users
adminRoute.get("/users",          getAllUsers);
adminRoute.get("/users/:id",      getSingleUser);
adminRoute.delete("/users/:id",   deleteUser);

// Workers
adminRoute.get("/workers",           getAllWorkersAdmin);
adminRoute.patch("/workers/:id/approve", approveWorker);
adminRoute.patch("/workers/:id/reject",  rejectWorker);

// Analytics
adminRoute.get("/analytics", getAnalytics);

export default adminRoute;