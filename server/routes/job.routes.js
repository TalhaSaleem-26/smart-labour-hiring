import express from "express";
import {
  createJob,
  getAllJobs,
  getSingleJob,
  getMyJobs,
  updateJob,
  deleteJob,
  applyJob,
  getJobApplications,
  updateApplicationStatus,
  getMyApplications,
  searchWorkersByLocation,
  adminGetAllJobs,
  adminDeleteJob,
} from "../controllers/job.controller.js";
import { isAuth }         from "../middleware/isAuth.middleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.middleware.js";

const jobRoute = express.Router();

// ── Public Routes ─────────────────────────────────────────────────────────
jobRoute.get("/all",               getAllJobs);
jobRoute.get("/single/:id",        getSingleJob);
jobRoute.get("/search/workers",    searchWorkersByLocation);

// ── Employer Routes ───────────────────────────────────────────────────────
jobRoute.post(
  "/create",
  isAuth, authorizeRoles("employer"),
  createJob
);
jobRoute.get(
  "/my-jobs",
  isAuth, authorizeRoles("employer"),
  getMyJobs
);
jobRoute.put(
  "/update/:id",
  isAuth, authorizeRoles("employer"),
  updateJob
);
jobRoute.delete(
  "/delete/:id",
  isAuth, authorizeRoles("employer", "admin"),
  deleteJob
);
jobRoute.get(
  "/applications/:id",
  isAuth, authorizeRoles("employer"),
  getJobApplications
);
jobRoute.patch(
  "/applications/:jobId/:appId/status",
  isAuth, authorizeRoles("employer"),
  updateApplicationStatus
);

// ── Worker Routes ─────────────────────────────────────────────────────────
jobRoute.post(
  "/apply/:id",
  isAuth, authorizeRoles("worker"),
  applyJob
);
jobRoute.get(
  "/my-applications",
  isAuth, authorizeRoles("worker"),
  getMyApplications
);

// ── Admin Routes ──────────────────────────────────────────────────────────
jobRoute.get(
  "/admin/all",
  isAuth, authorizeRoles("admin"),
  adminGetAllJobs
);
jobRoute.delete(
  "/admin/delete/:id",
  isAuth, authorizeRoles("admin"),
  adminDeleteJob
);


jobRoute.get(
  "/:id",
  isAuth, authorizeRoles("employer"),
  getSingleJob
);

jobRoute.put(
  "/:jobId/application/:appId",
  isAuth, authorizeRoles("employer"),
  updateApplicationStatus
);
export default jobRoute;