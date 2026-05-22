import Job from "../models/job.model.js";
import Worker from "../models/worker.model.js";
import {
  jobCreateValidation,
  jobUpdateValidation,
  jobApplyValidation,
} from "../validations/job.validation.js";

// ── Create Job ────────────────────────────────────────────────────────────
export const createJob = async (req, res) => {
  try {
    const { error, value } = jobCreateValidation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details?.[0]?.message,
      });
    }

    const job = await Job.create({
      ...value,
      employer: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      job,
    });

  } catch (err) {
    console.error("Create Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get All Jobs — Public with filters ───────────────────────────────────
export const getAllJobs = async (req, res) => {
  try {
    const {
      category, city, jobType, paymentType,
      minBudget, maxBudget, experience,
      search, status = "open",
      page = 1, limit = 10,
      sortBy = "createdAt", order = "desc",
    } = req.query;

    const filter = { status };

    if (category)    filter.category       = category;
    if (city)        filter["location.city"] = { $regex: city, $options: "i" };
    if (jobType)     filter.jobType         = jobType;
    if (paymentType) filter.paymentType     = paymentType;

    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    if (experience) filter.experienceRequired = { $lte: Number(experience) };

    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skillsRequired: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);
    const sort  = { [sortBy]: order === "asc" ? 1 : -1 };

    const jobs = await Job.find(filter)
      .populate("employer", "name email phone profileImage")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      count:   jobs.length,
      jobs,
    });

  } catch (err) {
    console.error("Get All Jobs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get Single Job ────────────────────────────────────────────────────────
export const getSingleJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("employer", "name email phone profileImage")
      .populate("applications.worker");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Increment views
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    return res.status(200).json({
      success: true,
      job,
    });

  } catch (err) {
    console.error("Get Single Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get My Jobs — Employer ────────────────────────────────────────────────
export const getMyJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { employer: req.user.id };
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      jobs,
    });

  } catch (err) {
    console.error("Get My Jobs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Update Job ────────────────────────────────────────────────────────────
export const updateJob = async (req, res) => {
  try {
    const { error, value } = jobUpdateValidation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details?.[0]?.message,
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Sirf employer khud update kar sakta hai
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job.",
      });
    }

    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate("employer", "name email");

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      job: updated,
    });

  } catch (err) {
    console.error("Update Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Delete Job ────────────────────────────────────────────────────────────
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Sirf employer ya admin delete kar sakta hai
    if (
      job.employer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job.",
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });

  } catch (err) {
    console.error("Delete Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Apply for Job — Worker ────────────────────────────────────────────────
export const applyJob = async (req, res) => {
  try {
    const { error, value } = jobApplyValidation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details?.[0]?.message,
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Job open hai?
    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications.",
      });
    }

    // Worker profile check karo
    const workerProfile = await Worker.findOne({ user: req.user.id });

    if (!workerProfile) {
      return res.status(404).json({
        success: false,
        message: "Please complete your worker profile first.",
      });
    }

    // Worker approved hai?
    if (workerProfile.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your profile must be approved before applying.",
      });
    }

    // Pehle se apply kiya hua?
    const alreadyApplied = job.applications.some(
      app => app.worker.toString() === workerProfile._id.toString()
    );

    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    // Apply karo
    job.applications.push({
      worker:      workerProfile._id,
      coverLetter: value.coverLetter || "",
    });

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully!",
    });

  } catch (err) {
    console.error("Apply Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get Job Applications — Employer ──────────────────────────────────────
export const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate({
        path: "applications.worker",
        populate: { path: "user", select: "name email phone profileImage" },
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Sirf employer dekh sakta hai
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    return res.status(200).json({
      success: true,
      total:        job.applications.length,
      applications: job.applications,
    });

  } catch (err) {
    console.error("Get Applications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Update Application Status — Employer ─────────────────────────────────
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or rejected.",
      });
    }

    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized.",
      });
    }

    const application = job.applications.id(req.params.appId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    application.status = status;

    // Agar accept kiya toh hired worker set karo
    if (status === "accepted") {
      job.status      = "hired";
      job.hiredWorker = application.worker;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: `Application ${status} successfully.`,
    });

  } catch (err) {
    console.error("Update Application Status Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get My Applications — Worker ──────────────────────────────────────────
export const getMyApplications = async (req, res) => {
  try {
    const workerProfile = await Worker.findOne({ user: req.user.id });

    if (!workerProfile) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    const jobs = await Job.find({
      "applications.worker": workerProfile._id,
    })
      .populate("employer", "name email phone profileImage")
      .sort({ createdAt: -1 })
      .lean();

    // Sirf apni application nikalo
    const myApplications = jobs.map(job => {
      const myApp = job.applications.find(
        app => app.worker.toString() === workerProfile._id.toString()
      );
      return {
        job: {
          _id:         job._id,
          title:       job.title,
          category:    job.category,
          location:    job.location,
          budget:      job.budget,
          paymentType: job.paymentType,
          status:      job.status,
          employer:    job.employer,
        },
        application: myApp,
      };
    });

    return res.status(200).json({
      success: true,
      total:          myApplications.length,
      myApplications,
    });

  } catch (err) {
    console.error("Get My Applications Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Search Workers for Job — Location Based ───────────────────────────────
export const searchWorkersByLocation = async (req, res) => {
  try {
    const { city, category, minRate, maxRate, experience } = req.query;

    const filter = { status: "approved" };

    if (city)     filter["location.city"] = { $regex: city, $options: "i" };
    if (category) filter.category         = category;
    if (experience) filter.experience     = { $gte: Number(experience) };

    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    const workers = await Worker.find(filter)
      .populate("user", "name email phone profileImage")
      .sort({ rating: -1, experience: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count:   workers.length,
      workers,
    });

  } catch (err) {
    console.error("Search Workers Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Admin — Get All Jobs ──────────────────────────────────────────────────
export const adminGetAllJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate("employer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      jobs,
    });

  } catch (err) {
    console.error("Admin Get Jobs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Admin — Delete Job ────────────────────────────────────────────────────
export const adminDeleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted by admin.",
    });

  } catch (err) {
    console.error("Admin Delete Job Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};