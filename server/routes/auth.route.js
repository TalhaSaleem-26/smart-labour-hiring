import express from "express";
import {
  currentUser,
  googleAuth,
  logIn,
  logout,
  registerUser,
  resendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middleware/isAuth.middleware.js";
import { forgotPassword, resetPassword } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/register", registerUser);
authRoute.post("/login", logIn);
authRoute.post("/verify-otp",  verifyOtp); 
authRoute.get("/currentUser",   isAuth, currentUser);
authRoute.post("/logout",logout);     
authRoute.post("/google",googleAuth);
authRoute.post("/resend-otp", resendOtp); 

authRoute.post("/forgot-password",        forgotPassword);
authRoute.post("/reset-password/:token",  resetPassword);

export default authRoute;