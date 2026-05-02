import Worker from "../models/worker.model.js";
import {
  workerRegisterValidation,
  workerUpdateValidation,
} from "../validations/worker.validation.js";

// ── Register Worker Profile
export const registerWorker = async (req, res) => {
  try {
    const { error, value } = workerRegisterValidation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details?.[0]?.message,
      });
    }

    const userId = req.user.id;

    const existing = await Worker.findOne({ user: userId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Worker profile already exists.",
      });
    }

    const {
      title, bio, skills, category,
      experience, location, availability,
      hourlyRate, cnic,
    } = value;

    const worker = await Worker.create({
      user:       userId,
      title,
      bio,
      skills,
      category,
      experience: experience || 0,
      location,
      availability,
      hourlyRate,
      cnic:       cnic || "",
    });

    return res.status(201).json({
      success: true,
      message: "Worker profile created. Pending admin approval.",
      worker,
    });

  } catch (err) {
    console.error("Register Worker Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get My Worker Profile 
export const getMyWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id })
      .populate("user", "name email phone profileImage");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      worker,
    });

  } catch (err) {
    console.error("Get Worker Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Update Worker Profile 
export const updateWorkerProfile = async (req, res) => {
  try {
    const { error, value } = workerUpdateValidation(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details?.[0]?.message,
      });
    }

    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    const {
      title, bio, skills, category,
      experience, location, availability,
      hourlyRate, cnic,
    } = value;

    if (title)                    worker.title        = title;
    if (bio)                      worker.bio          = bio;
    if (skills)                   worker.skills       = skills;
    if (category)                 worker.category     = category;
    if (experience !== undefined) worker.experience   = experience;
    if (location)                 worker.location     = location;
    if (availability)             worker.availability = availability;
    if (hourlyRate)               worker.hourlyRate   = hourlyRate;
    if (cnic !== undefined)       worker.cnic         = cnic;

    await worker.save();

    return res.status(200).json({
      success: true,
      message: "Worker profile updated successfully.",
      worker,
    });

  } catch (err) {
    console.error("Update Worker Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get All Workers — Public with filters
export const getAllWorkers = async (req, res) => {
  try {
    const { category, city, minRate, maxRate, search } = req.query;

    const filter = { status: "approved" };

    if (category) filter.category = category;

    if (city) filter["location.city"] = city;

    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    if (search) {
      filter.$or = [
        { title:  { $regex: search, $options: "i" } },
        { skills: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const workers = await Worker.find(filter)
      .populate("user", "name email phone profileImage")
      .sort({ rating: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count:   workers.length,
      workers,
    });

  } catch (err) {
    console.error("Get All Workers Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};