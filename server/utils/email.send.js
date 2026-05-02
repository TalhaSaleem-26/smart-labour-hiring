import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendEmail = async ({ to, subject, otp, html }) => {
  const transporter = createTransporter();

  // Agar otp hai to OTP wala html use karo, warna jo html aaya wo use karo
  const emailHtml = otp ? `
    <div style="font-family:sans-serif;max-width:420px;margin:auto;
    padding:32px;border:1px solid #e5e7eb;border-radius:16px;">
      <h2 style="color:#4f46e5;margin-bottom:8px;">Smart Labour</h2>
      <p style="color:#374151;font-size:15px;">Your verification OTP is:</p>
      <div style="background:#f5f3ff;border-radius:12px;padding:20px;
      text-align:center;margin:20px 0;">
        <h1 style="color:#7c3aed;font-size:48px;letter-spacing:12px;
        margin:0;">${otp}</h1>
      </div>
      <p style="color:#6b7280;font-size:13px;">
        This OTP expires in <strong>5 minutes</strong>.
      </p>
      <p style="color:#6b7280;font-size:12px;margin-top:16px;">
        If you didn't request this, ignore this email.
      </p>
    </div>
  ` : html;

  try {
    const info = await transporter.sendMail({
      from: `"Smart Labour" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHtml,
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    throw new Error("Failed to send email: " + error.message);
  }
};