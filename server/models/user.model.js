import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "worker", "employer"],
      default: "employer",
    },

    phone: {
      type: String,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
    },

    otpExpire: {
      type: Date,
    },

    profileImage: {
      type: String,
      default: "",
    },


    authType: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    resetPasswordToken: {
  type: String,
},
resetPasswordExpire: {
  type: Date,
},
  },

  {
    timestamps: true,
  }
);


const User = mongoose.model("User", userSchema);

export default User;