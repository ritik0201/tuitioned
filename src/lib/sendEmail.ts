import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("SMTP credentials are not set in environment variables.");
    // In a real app, you might want to throw an error or handle this more gracefully
    return { success: false, message: "SMTP credentials not configured." };
  }

  const transport = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  try {
    // Verify connection configuration
    await transport.verify();
  } catch (error) {
    console.error("Error verifying email transport:", error);
    return { success: false, message: "Failed to verify email transport." };
  }

  try {
    const mailOptions = {
      from: EMAIL_USER,
      to,
      subject,
      html,
    };

    await transport.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email." };
  }
}