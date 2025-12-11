"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './phone-input.css';
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";

const steps = ["Your Details", "Academic Details", "Schedule Demo"];

export default function FreeTrialPage() {
  const { data: session, status, update: updateSession } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isUserAuthenticated = status === "authenticated" && session?.user?.role === 'student';

  useEffect(() => { if (isUserAuthenticated) { setActiveStep(1); } }, [isUserAuthenticated]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, mobile: value || '' }));
  };

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        studentName: session.user.fullName || "",
        email: session.user.email || "",
        mobile: session.user.mobile || "",
      }));
    }
  }, [session]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      // If user is not logged in, check their email and role before sending OTP
      if (!session) {
        const roleCheckRes = await fetch('/api/auth/check-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        if (roleCheckRes.ok) {
          const { role } = await roleCheckRes.json();
          if (role === 'teacher' || role === 'admin') {
            throw new Error(`This email is registered as a ${role}. Please use a student account to book a demo.`);
          }
        } else if (roleCheckRes.status !== 404) { // 404 is OK (user not found), but other errors are not
          const errorData = await roleCheckRes.json();
          throw new Error(errorData.message || 'Failed to verify user role.');
        }
        // If 404, it's a new user, so we can proceed.
      }


      const apiEndpoint = session ? "/api/auth/login" : "/api/auth/signup";
      const payload = session 
        ? { email: formData.email } 
        : { fullName: formData.fullName, email: formData.email, mobile: formData.mobile };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP.");
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        otp: formData.otp,
        role: 'student'
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        await updateSession(); // Refresh session data
        handleNext();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    setError("");
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleReset = () => {
    setActiveStep(0);
    setFormData({});
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/demoClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong.");
      handleNext();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col gap-4 mt-4">
            {!session && (
              <>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full Name"
                  required
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  disabled={otpSent}
                />
                <PhoneInput
                  placeholder="Mobile Number"
                  required
                  value={formData.mobile}
                  onChange={handlePhoneChange}
                  international
                  disabled={otpSent}
                  className="phone-input-container"
                />
              </>
            )}
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              value={formData.email || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={otpSent || !!session}
            />
            {otpSent && (
              <input
                name="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                value={formData.otp || ""}
                onChange={handleChange}
                className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition text-center tracking-[0.5rem]"
              />
            )}
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col gap-4 mt-4">
            <input
              name="grade"
              type="text"
              placeholder="Grade / Class"
              required
              value={formData.grade || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject / Course
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  "Maths",
                  "Science",
                  "English",
                  "Physics",
                  "Chemistry",
                  "Biology",
                  "History",
                  "Coding",
                  "Other",
                ].map((subject) => (
                  <label key={subject} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="subject"
                      value={subject.toLowerCase()}
                      checked={formData.subject === subject.toLowerCase()}
                      onChange={handleChange}
                      className="accent-blue-600"
                    />
                    <span>{subject}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.subject === "other" && (
              <input
                name="otherSubject"
                type="text"
                placeholder="Please specify subject"
                value={formData.otherSubject || ""}
                onChange={handleChange}
                className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            )}

            <input
              name="topic"
              type="text"
              placeholder="Specific Demo Topic (Optional)"
              value={formData.topic || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-4 mt-4">
            <input
              name="fatherName"
              type="text"
              placeholder="Parent's Name"
              required
              value={formData.fatherName || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <input
              name="city"
              type="text"
              placeholder="City"
              required
              value={formData.city || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <input
              name="country"
              type="text"
              placeholder="Country"
              required
              value={formData.country || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <input
              name="date"
              type="datetime-local"
              required
              value={formData.date || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <textarea
              name="comment"
              rows={4}
              placeholder="Additional Comments"
              value={formData.comment || ""}
              onChange={handleChange}
              className="bg-gray-700 border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (activeStep === 0) {
      return (
        <div className="flex justify-center mt-6">
          {!otpSent ? (
            <button onClick={handleSendOtp} disabled={loading} className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-blue-500/50">
              {loading ? "Sending OTP..." : "Send OTP & Proceed"}
            </button>
          ) : (
            <button onClick={handleVerifyOtp} disabled={isVerifying} className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-blue-500/50">
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </button>
          )}
        </div>
      );
    }

    // Buttons for other steps remain the same
    return (
      <div className="flex justify-between mt-6">
        <button onClick={handleBack} disabled={activeStep <= 1} className={`px-4 py-2 rounded-lg border transition ${activeStep <= 1 ? "opacity-50 cursor-not-allowed border-gray-600 text-gray-500" : "border-gray-600 hover:bg-gray-700"}`}>
          Back
        </button>
        <button onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} disabled={loading} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-blue-500/50">
          {loading ? "Submitting..." : activeStep === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gray-800 rounded-2xl border-2 border-blue-500 shadow-2xl shadow-blue-500/20 overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-stretch">
          {/* Left side */}
          <div className="hidden lg:flex flex-col justify-center items-center text-center p-8 bg-gray-900/50">
            <Image src="/home2.png" alt="Demo class illustration" width={300} height={300} className="mb-4" />
            <h1 className="text-3xl font-bold mb-3 text-blue-400">Unlock Your Potential</h1>
            <p className="max-w-md text-gray-300">
              Experience our interactive teaching methods firsthand. Our free demo class helps
              you understand our curriculum, meet expert tutors, and see how we make learning
              engaging and effective.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Just a few details and you'll be on your way to a brighter academic future!
            </p>
          </div>

          {/* Right side */}
          <div className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-center text-white">
              Book Your Free Demo Class
            </h2>

            {/* Stepper */}
            <div className="flex justify-center mt-6 mb-8">
              <div className="flex space-x-8">
                {steps.map((label, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors
                        ${index <= activeStep ? "border-blue-500 bg-blue-500 text-white" : "border-gray-600 text-gray-400"}`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`text-sm mt-2 ${
                        index <= activeStep ? "text-blue-400" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success */}
            {activeStep === steps.length ? (
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">🎉 Demo Class Confirmed!</h3>
                <p className="text-gray-300 mb-1">
                  Your demo class for{" "}
                  <strong>{new Date(formData.date).toLocaleString()}</strong> has been booked.
                </p>
                <p className="text-gray-400 mb-4">
                  A confirmation email has been sent to <strong>{formData.email}</strong>.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Book Another Demo
                  </button>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && <p className="text-red-600 text-center mt-2">{error}</p>}
                {renderStep(activeStep)}
                {renderButtons()}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
