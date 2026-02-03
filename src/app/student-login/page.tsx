"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { toast } from "sonner";
import SignupModal from "@/components/SignUpModal";
import { GraduationCap } from "lucide-react";

export default function StudentLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const textFieldStyles = {
    "& .MuiInputBase-input": { color: "#fff" },
    "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.23)" },
      "&:hover fieldset": { borderColor: "#fff" },
      "&.Mui-focused fieldset": { borderColor: "#fff" },
    },
  };

  const MuiLinkStyles = {
    color: "primary.light",
    "&:hover": {
      textDecoration: "underline",
    },
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check if the user is a student
      const roleCheckRes = await fetch("/api/auth/check-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const roleData = await roleCheckRes.json();

      if (!roleCheckRes.ok) {
        throw new Error(roleData.message || "Failed to check user status.");
      }
      if (roleData.role !== "student") {
        throw new Error("This login is for students only.");
      }

      // 2. Send OTP
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");

      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        otp,
        role: "student", // Differentiate login role
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success("Login successful!");
        router.push("/student/dashboard"); // Redirect to student dashboard
      }
    } catch (err: any) {
      const message = err.message || "An unknown error occurred.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "details") {
      handleSendOtp();
    } else {
      handleLogin();
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)", // Full height minus navbar
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 6 },
        }}
      >
        <Paper
          elevation={12}
          sx={{
            display: "flex",
            borderRadius: 4,
            overflow: "hidden",
            maxWidth: "900px",
            width: "100%",
            mx: 2,
          }}
        >
          {/* Left Side */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              width: 350,
              p: 5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <GraduationCap size={64} />
            <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: "bold" }}>
              Welcome, Student!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Sign in to access your courses and learning materials.
            </Typography>
          </Box>

          {/* Right Side */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ p: { xs: 4, sm: 6 }, flex: 1, bgcolor: "#1f2937", color: "#fff" }}
          >
            <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Student Login
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {step === "details" ? (
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={textFieldStyles}
              />
            ) : (
              <>
                <Typography variant="body2" align="center" sx={{ mb: 1 }}>
                  An OTP has been sent to <strong>{email}</strong>.
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="otp"
                  label="OTP"
                  type="text"
                  id="otp"
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={textFieldStyles}
                  inputProps={{
                    maxLength: 6,
                    style: { textAlign: "center", letterSpacing: "0.5rem" },
                  }}
                />
              </>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3, mb: 2, py: 1.5, bgcolor: "primary.light",
                "&:hover": { bgcolor: "primary.main" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : step === "details" ? (
                "Send OTP"
              ) : (
                "Sign In"
              )}
            </Button>
            <Typography variant="body2" align="center">
              Don&apos;t have an account?{" "}
              <MuiLink component="button" type="button" variant="body2" onClick={() => setSignupOpen(true)} sx={MuiLinkStyles}>
                Sign Up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
      <SignupModal
        open={isSignupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </>
  );
}