export async function verifyRecaptcha(token: string | null) {
  if (!token) {
    return { success: false, message: "reCAPTCHA token is missing" };
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not defined in environment variables.");
    return { success: false, message: "Server configuration error" };
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, message: "reCAPTCHA verification failed" };
    }
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, message: "An error occurred during reCAPTCHA verification" };
  }
}
