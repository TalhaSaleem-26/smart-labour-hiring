import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  worker:       { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
  coverLetter:  { type: String, trim: true, maxlength: 500 },  
  appliedAt:    { type: Date, default: Date.now },
  status:       { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
});

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title 100 characters se zyada nahi hona chahiye"],  
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [2000, "Description 2000 characters se zyada nahi"],   
    },
    category: {
      type: String,
      enum: ["plumber","electrician","painter","cleaner","carpenter",
             "welder","mason","driver","gardener","other"],
      required: true,
    },
    skillsRequired: [{ type: String, trim: true }],
    location: {
      city:    { type: String, required: true },
      area:    { type: String },
      address: { type: String },
      
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    budget: {
      type: Number,
      required: true,
      min: [1, "Budget 0 se zyada hona chahiye"],  
    },
    paymentType: {
      type: String,
      enum: ["hourly", "fixed", "daily"],
      default: "hourly",
    },
    duration:  { type: String, trim: true },
    deadline:  { type: Date },  
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "one-time"],
      default: "one-time",
    },
    status: {
      type: String,
      enum: ["open", "closed", "hired"],
      default: "open",
    },
    experienceRequired: { type: Number, default: 0, min: 0 },
    applications: [applicationSchema],  
    hiredWorker: {                      
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", "location.city": 1, category: 1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;