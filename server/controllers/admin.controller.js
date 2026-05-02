import User from "../models/user.model.js";
import Worker from "../models/worker.model.js";


export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password -otp -otpExpire")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      users,
    });

  } catch (err) {
    console.error("Get All Users Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get Single User ───────────────────────────────────────────────────────
export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -otp -otpExpire");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    console.error("Get Single User Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Delete User ───────────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Admin khud ko delete nahi kar sakta
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    // Agar worker hai toh worker profile bhi delete karo
    await Worker.findOneAndDelete({ user: req.params.id });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });

  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Get All Workers — Admin ───────────────────────────────────────────────
export const getAllWorkersAdmin = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title:    { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Worker.countDocuments(filter);

    const workers = await Worker.find(filter)
      .populate("user", "name email phone profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      workers,
    });

  } catch (err) {
    console.error("Get All Workers Admin Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Approve Worker ────────────────────────────────────────────────────────
export const approveWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate("user", "name email");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    worker.status = "approved";
    await worker.save();

    return res.status(200).json({
      success: true,
      message: `${worker.user.name}'s profile approved successfully.`,
      worker,
    });

  } catch (err) {
    console.error("Approve Worker Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Reject Worker ─────────────────────────────────────────────────────────
export const rejectWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate("user", "name email");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found.",
      });
    }

    worker.status = "rejected";
    await worker.save();

    return res.status(200).json({
      success: true,
      message: `${worker.user.name}'s profile rejected.`,
      worker,
    });

  } catch (err) {
    console.error("Reject Worker Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

// ── Analytics ─────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments();
    const totalWorkers   = await User.countDocuments({ role: "worker" });
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalAdmins    = await User.countDocuments({ role: "admin" });

    const pendingWorkers  = await Worker.countDocuments({ status: "pending" });
    const approvedWorkers = await Worker.countDocuments({ status: "approved" });
    const rejectedWorkers = await Worker.countDocuments({ status: "rejected" });

    // Last 7 days users
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers     = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    return res.status(200).json({
      success: true,
      analytics: {
        users: {
          total:     totalUsers,
          workers:   totalWorkers,
          employers: totalEmployers,
          admins:    totalAdmins,
          newThisWeek: newUsers,
        },
        workers: {
          pending:  pendingWorkers,
          approved: approvedWorkers,
          rejected: rejectedWorkers,
        },
      },
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};