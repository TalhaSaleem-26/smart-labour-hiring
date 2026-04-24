import User from "../models/user.model.js";
import { registerValidation } from "../validations/register.Validation.js";
import { generateOtp, hashedOtp } from "../utils/otp.handling.js";
import { hashedPassword } from "../utils/password.handling.js";
import { sendEmail } from "../utils/email.send.js";

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

    
    const user = await User.create({
      name,
      email,
      password: hashedPass,
      role,
      phone,
      isVerified: false,
    });

    
    const otp = generateOtp();

    
    const otpHash = await hashedOtp(otp);

    
    user.otp = otpHash;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000); 

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