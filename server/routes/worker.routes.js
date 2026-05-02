import express from "express";
import {
  registerWorker,
  getMyWorkerProfile,
  updateWorkerProfile,
  getAllWorkers,
} from "../controllers/worker.controller.js";
import { isAuth } from "../middleware/isAuth.middleware.js";
import {authorizeRoles} from "../middleware/authorizeRoles.middleware.js"

const workerRoute = express.Router();

// Public
workerRoute.get("/all", getAllWorkers);


workerRoute.post("/register",  isAuth,authorizeRoles("worker"), registerWorker);
workerRoute.get("/me",         isAuth,authorizeRoles("worker"), getMyWorkerProfile);
workerRoute.put("/update",     isAuth,authorizeRoles("worker"), updateWorkerProfile);

export default workerRoute;