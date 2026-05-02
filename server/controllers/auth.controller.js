import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { registerValidation } from "../validations/register.Validation.js";
import { generateOtp, hashedOtp } from "../utils/otp.handling.js";
import { hashedPassword } from "../utils/password.handling.js";
import { sendEmail } from "../utils/email.send.js";
import bcrypt from "bcryptjs";
import admin from "../config/firebase.js";
import crypto from "crypto";

import { genToken } from "../utils/cookies.token.js";

export const registerUser = async (req, res) => {
  try {
    
    const { error, value } = registerValidation(req.body);

    if (error) {
      return res.status(422).json({
        success: false,
        message: error.details?.[0]?.message,
      });
    }

    const { name, email, password, role, phone } = value;

    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    
    const hashedPass = await hashedPassword(password);

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.create({
      name,
      email:normalizedEmail,
      password: hashedPass,
      role,
      phone,
      isVerified: false,
    });

    
    const otp = generateOtp();

    
    const otpHash = await hashedOtp(otp);

    
    user.otp = otpHash;
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);; 

    await user.save();

    
    try {
      await sendEmail({
        to: email,
        subject: "Account Verification OTP",
        otp,
      });
    } catch (emailError) {
      
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Try again.",
      });
    }

    
    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    
    const normalizedEmail = email.toLowerCase().trim();

    
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account Not found",
      });
    }

    
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify your email.",
      });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

  
    const token = genToken({
      id: user._id,
      role: user.role,
    });

   
    res.cookie("token", token, {
  httpOnly: true,
  secure: false,           
  sameSite: "lax",         
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    
    const userData = user.toObject();
    delete userData.password;

    
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    
    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    
    const isMatch = await bcrypt.compare(otp.toString(), user.otp);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

  res.status(200).json({ success: true,
     user: { id: user._id, name: user.name, email: user.email, role: user.role }
    
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const currentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("-password -otp -otpExpire"); // 🔥 hide sensitive data

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", token, {
  httpOnly: true,
  secure: false,           // development mein false
  sameSite: "lax",         // ← yeh fix hai
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};



export const googleAuth = async (req, res) => {
  try {
    const { firebaseToken, role } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase token is required",
      });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);
    const { name, email, picture } = decoded;

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name,
        email: normalizedEmail,
        profileImage: picture,
        role:         role || "employer",
        authType:     "google",
        isVerified:   true,
      });
    }

    // utils Used
    const token = genToken({
      id: user._id,
      role: user.role,
    });

    
   res.cookie("token", token, {
  httpOnly: true,
  secure: false,           // development mein false
  sameSite: "lax",         // ← yeh fix hai
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    return res.status(200).json({
      success: true,
      message: "Google auth successful",
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        profileImage: user.profileImage,
        isVerified:   user.isVerified,
      },
    });

  } catch (err) {
      console.error("Google Auth FULL Error:", err); 
    console.error("Google Auth Error:", err.message);

    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please sign in again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Google authentication failed. Try again.",
    });
  }
};



export const resendOtp = async (req, res) => {
    console.log("🔥 Resend hit:", req.body); // ← add karo
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required." 
      });
    }

    
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found." 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "User already verified." 
      });
    }

    const otp       = generateOtp();
    const otpHashed = await hashedOtp(otp);

    user.otp       = otpHashed;
   
    user.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendEmail({ 
        to: normalizedEmail, 
        subject: "Your New OTP - Smart Labour", 
        otp 
      });
    } catch (emailError) {
      console.error("Resend Email Error:", emailError.message);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send OTP. Try again." 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "New OTP sent successfully." 
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong." 
    });
  }
};




// ── Forgot Password 
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const resetToken  = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Password Reset Request - Smart Labour",
        html: `
          <div style="font-family:sans-serif;max-width:420px;margin:auto;
          padding:32px;border:1px solid #e5e7eb;border-radius:16px;">
            <h2 style="color:#4f46e5;">Reset Your Password</h2>
            <p style="color:#374151;">You requested a password reset. Click below:</p>
            <a href="${resetUrl}"
              style="display:inline-block;margin:20px 0;padding:12px 28px;
              background:linear-gradient(135deg,#7c3aed,#4f46e5);
              color:#fff;border-radius:10px;text-decoration:none;font-weight:500;">
              Reset Password
            </a>
            <p style="color:#6b7280;font-size:13px;">
              Link expires in <strong>15 minutes</strong>.
            </p>
            <p style="color:#6b7280;font-size:12px;">
              If you didn't request this, ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "If this email exists, a reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link.",
      });
    }

    const hashedPass     = await hashedPassword(password);
    user.password        = hashedPass;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now login.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};