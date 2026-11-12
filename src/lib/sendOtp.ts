import nodemailer from 'nodemailer';

export async function sendOtpEmail(email: string, otp: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
    console.log(`[DEV OTP BACKUP] OTP for ${email} is: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"Tuitioned Team" <${emailUser}>`,
    to: email,
    subject: "Your One-Time Password for Tuitioned",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Your One-Time Password</h2>
        <p>Please use the following One-Time Password (OTP) for your Tuitioned account.</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; background: #f2f2f2; padding: 10px; border-radius: 5px;">${otp}</p>
        <p>This code is valid for a short period. If you did not request this code, please disregard this email.</p>
        <p>Best regards,<br><strong>The Tuitioned Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error("Failed to send OTP email:", err.message);
    // Helpful log in terminal so dev/testing can proceed even if SMTP fails
    console.log(`[DEV OTP BACKUP] OTP for ${email} is: ${otp}`);
    throw err;
  }
}
