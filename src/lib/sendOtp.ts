import nodemailer from 'nodemailer';
 
export async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Tuitioned Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your One-Time Password for TuitionEd",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Your One-Time Password</h2>
        <p>Please use the following One-Time Password (OTP) for your TuitionEd account.</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; background: #f2f2f2; padding: 10px; border-radius: 5px;">${otp}</p>
        <p>This code is valid for a short period. If you did not request this code, please disregard this email.</p>
        <p>Best regards,<br><strong>The TuitionEd Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
