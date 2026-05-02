import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    title: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    skills: [{
      type: String,
      trim: true,
    }],

    category: {
      type: String,
      enum: [
        "plumber", "electrician", "painter",
        "cleaner", "carpenter", "welder",
        "mason", "driver", "gardener", "other",
      ],
      required: true,
    },

    experience: {
      type: Number,
      default: 0,
    },

    location: {
      city:    { type: String, trim: true },
      area:    { type: String, trim: true },
      address: { type: String, trim: true },
    },

    availability: {
      days: [{
        type: String,
        enum: ["monday","tuesday","wednesday",
               "thursday","friday","saturday","sunday"],
      }],
      startTime: { type: String },
      endTime:   { type: String },
    },

    hourlyRate: {
      type: Number,
      default: 0,
    },

    cnic: {
      type: String,
      default: "",
    },

    documents: [{
      name: { type: String },
      url:  { type: String },
    }],

    profileImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Worker = mongoose.model("Worker", workerSchema);
export default Worker;