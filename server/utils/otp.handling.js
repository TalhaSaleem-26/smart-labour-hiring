import bcrypt from "bcryptjs";
import crypto from "crypto";

export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashedOtp = async (otp) => {
  return await bcrypt.hash(otp.toString(), 10);
};