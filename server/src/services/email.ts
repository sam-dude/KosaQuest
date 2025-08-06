import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
  reset: boolean = false
) => {
  const subject = reset ? "Reset Your Password" : "Verify Your Email Address";
  const heading = reset ? "Reset Your Password" : "Verify Your Email Address";
  const instruction = reset
    ? "Use the code below to reset your password:"
    : "Your verification code is:";

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL as string,
    subject,
    text: `${instruction} ${verificationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2>${heading}</h2>
        <p>${instruction}</p>
        <h1 style="color:#007bff;">${verificationCode}</h1>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};
