import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    pool: true,             // Enable SMTP connection pooling
    maxConnections: 5,     // Limit number of concurrent connections
    maxMessages: 100,      // Max messages to send on a single connection before recycling
  });

  return cachedTransporter;
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  const { EMAIL_USER } = process.env;
  const transport = getTransporter();

  if (!transport || !EMAIL_USER) {
    console.error("SMTP credentials are not set in environment variables.");
    return { success: false, message: "SMTP credentials not configured." };
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