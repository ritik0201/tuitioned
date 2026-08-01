"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { CountryDropdown } from "react-country-region-selector";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Mail,
  Phone,
  GraduationCap,
  Globe,
  MapPin,
  Star,
  ShieldCheck,
  Award,
  Video,
  ArrowRight,
  Check,
  Search,
  Lock
} from "lucide-react";
import ReactConfetti from "react-confetti";
import ReCAPTCHA from "react-google-recaptcha";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

const steps = [
  { id: 1, title: "Contact", icon: User },
  { id: 2, title: "Academic", icon: BookOpen },
  { id: 3, title: "Schedule", icon: Calendar },
];

const countryCodes = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "United States / Canada", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
];

const subjects = [
  { id: "maths", name: "Maths", icon: "📐" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "english", name: "English", icon: "📚" },
  { id: "physics", name: "Physics", icon: "⚡" },
  { id: "chemistry", name: "Chemistry", icon: "🧪" },
  { id: "biology", name: "Biology", icon: "🧬" },
  { id: "history", name: "History", icon: "🏛️" },
  { id: "coding", name: "Coding", icon: "💻" },
  { id: "other", name: "Other", icon: "✨" },
];

const getNextDays = (count = 6) => {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

const studentAvatars = ["/sa1.png", "/sa2.png", "/sa3.png", "/sa4.png", "/sa5.png"];

export default function FreeTrialPage() {
  const { data: session, status, update: updateSession } = useSession();
  const { width, height } = useWindowSize();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [countryCode, setCountryCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const isUserAuthenticated = status === "authenticated" && session?.user?.role === "student";

  useEffect(() => {
    if (isUserAuthenticated && activeStep === 0) {
      setActiveStep(1);
    }
  }, [isUserAuthenticated, activeStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountryCodeSelect = (code: string) => {
    setCountryCode(code);
    setFormData((prev) => ({ ...prev, mobile: code + mobileNumber }));
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, "");
    setMobileNumber(newNumber);
    setFormData((prev) => ({ ...prev, mobile: countryCode + newNumber }));
  };

  const filteredCountryCodes = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
  );

  const isSubjectSelected = (subjectId: string) => {
    if (!formData.subject) return false;
    return formData.subject.split(",").map((s) => s.trim()).includes(subjectId);
  };

  const handleSubjectToggle = (subjectId: string) => {
    const currentSubjects = formData.subject
      ? formData.subject.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    let newSubjects: string[];
    if (currentSubjects.includes(subjectId)) {
      newSubjects = currentSubjects.filter((s) => s !== subjectId);
    } else {
      newSubjects = [...currentSubjects, subjectId];
    }
    setFormData((prev) => ({ ...prev, subject: newSubjects.join(",") }));
  };

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.fullName || "",
        email: session.user.email || "",
        mobile: session.user.mobile || "",
      }));

      const userMobile = session.user.mobile;
      if (userMobile) {
        const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
        const matched = sortedCodes.find((c) => userMobile.startsWith(c.code));
        if (matched) {
          setCountryCode(matched.code);
          setMobileNumber(userMobile.slice(matched.code.length));
        } else {
          const match = userMobile.match(/^(\+\d{1,4})/);
          if (match) {
            setCountryCode(match[1]);
            setMobileNumber(userMobile.slice(match[1].length));
          } else {
            setMobileNumber(userMobile);
          }
        }
      }
    }
  }, [session]);

  const handleSendOtp = async () => {
    if (!session) {
      if (!formData.fullName || formData.fullName.trim().length < 3) {
        toast.error("Please enter a valid full name (min 3 characters)");
        return;
      }
      if (!countryCode) {
        toast.error("Please select a country code");
        return;
      }
      if (!formData.mobile || formData.mobile.length < 8 || formData.mobile.length > 14) {
        toast.error("Please enter a valid mobile number (8-14 digits)");
        return;
      }
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!session) {
        const roleCheckRes = await fetch("/api/auth/check-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        if (roleCheckRes.ok) {
          const { role } = await roleCheckRes.json();
          if (role === "teacher" || role === "admin") {
            throw new Error(`This email is registered as a ${role}. Please use a student account.`);
          }
        }
      }

      const apiEndpoint = session ? "/api/auth/login" : "/api/auth/signup";
      const payload = session
        ? { email: formData.email, recaptchaToken }
        : { fullName: formData.fullName, email: formData.email, mobile: formData.mobile, recaptchaToken };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP.");
      setOtpSent(true);
      setTimer(30);
      toast.success("OTP sent to " + formData.email);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        otp: formData.otp,
        role: "student",
      });

      if (result?.error) throw new Error(result.error);
      if (result?.ok) {
        await updateSession();
        handleNext();
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      if (!formData.grade || formData.grade.trim() === "") {
        toast.error("Please enter your grade/class");
        return;
      }
      if (!formData.subject || formData.subject.trim() === "") {
        toast.error("Please select at least one subject");
        return;
      }
      if (isSubjectSelected("other") && (!formData.otherSubject || formData.otherSubject.trim() === "")) {
        toast.error("Please specify the subject");
        return;
      }
    }

    if (activeStep === 2) {
      if (!formData.fatherName || formData.fatherName.trim() === "") {
        toast.error("Please enter parent's name");
        return;
      }
      if (!formData.city || formData.city.trim() === "") {
        toast.error("Please enter your city");
        return;
      }
      if (!formData.country || formData.country.trim() === "") {
        toast.error("Please select your country");
        return;
      }
      if (!formData.bookingDateAndTime) {
        toast.error("Please select a preferred date");
        return;
      }
    }

    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleReset = () => {
    setActiveStep(0);
    setFormData({});
    setError("");
    setOtpSent(false);
    setShowConfetti(false);
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
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong.");
      }
      setShowConfetti(true);
      handleNext();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {!session && (
              <div className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Full Name <span className="text-indigo-400">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      name="fullName"
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      required
                      value={formData.fullName || ""}
                      onChange={handleChange}
                      ref={nameInputRef}
                      disabled={otpSent}
                      className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 text-xs font-medium disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Country Code & Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Phone Number <span className="text-indigo-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div ref={dropdownRef} className="relative w-2/5">
                      <button
                        type="button"
                        disabled={otpSent}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 px-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer text-xs font-semibold flex items-center justify-between h-[36px] hover:border-slate-700"
                      >
                        <span className="truncate flex items-center gap-1">
                          {countryCode ? (
                            <>
                              <span className="text-xs">{countryCodes.find((c) => c.code === countryCode)?.flag}</span>
                              <span className="text-slate-200">{countryCode}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-medium">🌐 Code</span>
                          )}
                        </span>
                        <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-90" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="absolute left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 overflow-hidden w-[220px]"
                          >
                            <div className="relative mb-1.5">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                              <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-1 pl-7 pr-2 text-xs focus:border-indigo-500 outline-none placeholder:text-slate-600"
                              />
                            </div>
                            <div className="max-h-[140px] overflow-y-auto space-y-0.5 pr-1 text-xs">
                              {filteredCountryCodes.length > 0 ? (
                                filteredCountryCodes.map((c) => (
                                  <button
                                    key={c.code}
                                    type="button"
                                    onClick={() => handleCountryCodeSelect(c.code)}
                                    className={`flex items-center justify-between w-full text-left py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer ${
                                      countryCode === c.code
                                        ? "bg-indigo-600/30 text-indigo-300 font-semibold"
                                        : "text-slate-300 hover:bg-slate-800"
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span className="text-xs">{c.flag}</span>
                                      <span>{c.code}</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{c.name}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="text-[10px] text-slate-500 text-center py-2">
                                  No countries found
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative flex-1 group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        placeholder="Mobile Number"
                        required
                        value={mobileNumber}
                        onChange={handleMobileNumberChange}
                        disabled={otpSent}
                        className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 text-xs font-medium h-[36px] disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Email Address <span className="text-indigo-400">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email || ""}
                  onChange={handleChange}
                  ref={emailInputRef}
                  disabled={otpSent || !!session}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 text-xs font-medium disabled:opacity-60"
                />
              </div>
            </div>

            {/* OTP Section */}
            {otpSent && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-2 pt-1"
              >
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-2 flex items-center justify-between text-[11px] text-indigo-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    OTP sent to your email
                  </span>
                  {timer > 0 ? (
                    <span className="text-slate-400 font-mono text-[10px]">{timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-indigo-400 hover:text-indigo-200 font-semibold underline transition-colors cursor-pointer"
                    >
                      Resend
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Enter 6-Digit OTP</label>
                  <input
                    name="otp"
                    type="text"
                    placeholder="••••••"
                    required
                    maxLength={6}
                    value={formData.otp || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-indigo-500/40 text-slate-100 rounded-lg py-2 text-center text-lg font-bold tracking-[0.5rem] focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {!otpSent && (
              <div className="flex justify-center transform scale-[0.78] sm:scale-90 -my-3 sm:-my-1.5 origin-center">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setRecaptchaToken(token)}
                  theme="dark"
                />
              </div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Grade / Class */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Grade / Class / Standard <span className="text-indigo-400">*</span>
              </label>
              <div className="relative group">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="grade"
                  type="text"
                  placeholder="e.g. Grade 10, High School"
                  required
                  value={formData.grade || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs font-medium placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300">
                  Select Subjects <span className="text-indigo-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Multiple allowed</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {subjects.map((sub) => {
                  const selected = isSubjectSelected(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={`py-1.5 px-1.5 sm:px-2 rounded-lg border text-[10px] sm:text-[11px] font-medium transition-all flex items-center gap-1 sm:gap-1.5 text-left cursor-pointer ${
                        selected
                          ? "bg-indigo-600/25 border-indigo-500 text-indigo-200 font-semibold shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <span className="text-xs">{sub.icon}</span>
                      <span className="truncate flex-1">{sub.name}</span>
                      {selected && <Check className="w-3 h-3 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Subject Specification */}
            <AnimatePresence>
              {isSubjectSelected("other") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[11px] font-semibold text-slate-300">
                    Specify Subject <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    name="otherSubject"
                    type="text"
                    placeholder="Enter custom subject"
                    value={formData.otherSubject || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Specific Topic */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Specific Topic <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="topic"
                  type="text"
                  placeholder="e.g. Algebra, Organic Chemistry"
                  value={formData.topic || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-600"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Parent Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Parent / Guardian Name <span className="text-indigo-400">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  name="fatherName"
                  type="text"
                  placeholder="e.g. Robert Johnson"
                  required
                  value={formData.fatherName || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  City <span className="text-indigo-400">*</span>
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="city"
                    type="text"
                    placeholder="Your City"
                    required
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Country <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                  <CountryDropdown
                    value={formData.country || ""}
                    onChange={(val) => setFormData({ ...formData, country: val })}
                    className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-2 pl-9 pr-3 outline-none focus:border-indigo-500 transition-all appearance-none text-xs font-medium cursor-pointer"
                    defaultOptionLabel="Select Country"
                  />
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                Select Preferred Date <span className="text-indigo-400">*</span>
              </label>

              {/* Quick Select Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {getNextDays(6).map((date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const isSelected = formData.bookingDateAndTime === dateStr;
                  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                  const dayNum = date.getDate();
                  const monthName = date.toLocaleDateString("en-US", { month: "short" });

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bookingDateAndTime: dateStr }))}
                      className={`py-1.5 px-1 text-center rounded-lg border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-400 text-white shadow-sm ring-1 ring-indigo-400/40"
                          : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <span className="text-[8px] uppercase font-bold tracking-tight opacity-80">{dayName}</span>
                      <span className="text-sm font-bold my-0">{dayNum}</span>
                      <span className="text-[8px] uppercase font-medium opacity-70">{monthName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Input */}
              <div className="relative group pt-0.5">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                <input
                  name="bookingDateAndTime"
                  type="date"
                  required
                  value={formData.bookingDateAndTime || ""}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-lg py-1.5 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-600"
                />
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (activeStep === 0) {
      return (
        <div className="pt-2">
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                <>
                  <span>Send OTP & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <span>Verify OTP & Next</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex gap-2.5 pt-2">
        <button
          type="button"
          onClick={handleBack}
          className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={loading}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : activeStep === steps.length - 1 ? (
            <>
              <span>Complete Booking</span>
              <Sparkles className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-4 lg:p-6 relative overflow-y-auto lg:overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Lighting & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      <div className="w-full max-w-5xl relative z-10 my-auto py-2 lg:py-0">
        {showConfetti && <ReactConfetti width={width} height={height} numberOfPieces={160} recycle={false} />}

        <AnimatePresence mode="wait">
          {activeStep === steps.length ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="max-w-sm mx-auto bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4 backdrop-blur-xl"
            >
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/30 text-indigo-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3" /> Trial Confirmed
                </div>
                <h2 className="text-xl font-bold text-slate-100">You're All Set!</h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your 1-on-1 trial session is scheduled for{" "}
                  <span className="font-semibold text-slate-200">
                    {formData.bookingDateAndTime ? new Date(formData.bookingDateAndTime + "T00:00").toDateString() : "your chosen date"}
                  </span>
                  .
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-left space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Student:</span>
                  <span className="text-slate-200 font-semibold">{formData.fullName || session?.user?.fullName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Grade:</span>
                  <span className="text-slate-200 font-semibold">{formData.grade}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Subjects:</span>
                  <span className="text-indigo-300 font-semibold">{formData.subject}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold text-xs shadow-md transition-all text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleReset}
                  className="w-full py-2 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Book Another Free Trial
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
              {/* Form Card FIRST on Mobile (order-1), SECOND on Desktop (lg:order-2) */}
              <div className="order-1 lg:order-2 lg:col-span-7">
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl relative overflow-hidden">
                  {/* Top glow line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                  {/* Stepper Header */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      {steps.map((s, idx) => {
                        const StepIcon = s.icon;
                        const isCompleted = idx < activeStep;
                        const isCurrent = idx === activeStep;

                        return (
                          <div key={s.id} className="flex items-center gap-1.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                isCompleted
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : isCurrent
                                  ? "bg-slate-800 border border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/10"
                                  : "bg-slate-950 border border-slate-800 text-slate-500"
                              }`}
                            >
                              {isCompleted ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                            </div>
                            <span
                              className={`text-xs transition-colors ${
                                isCurrent ? "text-slate-200 font-semibold" : "text-slate-500"
                              }`}
                            >
                              {s.title}
                            </span>
                            {idx < steps.length - 1 && (
                              <div className="w-4 sm:w-8 h-[1px] bg-slate-800 mx-0.5 sm:mx-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step Title Header */}
                    <div className="border-b border-slate-800/80 pb-2 flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                        {steps[activeStep].title} Details
                      </h3>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Step {activeStep + 1} of {steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[11px] font-medium text-center">
                      {error}
                    </div>
                  )}

                  {/* Step Body */}
                  <div>
                    {renderStep(activeStep)}
                  </div>

                  {/* Navigation Buttons */}
                  {renderButtons()}

                  {/* Security Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Encrypted & Private
                    </span>
                    <span>No Credit Card Needed</span>
                  </div>
                </div>
              </div>

              {/* Text & Value Proposition SECOND on Mobile (order-2), FIRST on Desktop (lg:order-1) */}
              <div className="order-2 lg:order-1 lg:col-span-5 space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3" /> 100% Free 1-on-1 Trial Class
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
                    Transform Learning with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">Tuitioned</span>
                  </h1>

                  <p className="text-slate-400 text-xs leading-relaxed">
                    Book a personalized live 1-on-1 demo session with top-certified educators tailored to your child's syllabus.
                  </p>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Certified Expert Tutors</h4>
                      <p className="text-[10px] text-slate-400 leading-tight">Handpicked specialists matching your academic grade.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Interactive Digital Classroom</h4>
                      <p className="text-[10px] text-slate-400 leading-tight">Live whiteboard & 1-on-1 personalized attention.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">No Commitments Required</h4>
                      <p className="text-[10px] text-slate-400 leading-tight">Zero credit card needed. Purely trial for quality.</p>
                    </div>
                  </div>
                </div>

                {/* Social Proof Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    {studentAvatars.map((src, i) => (
                      <div key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-950 overflow-hidden relative">
                        <Image src={src} alt="Student avatar" width={28} height={28} className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-bold text-slate-200 ml-1">4.9/5</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Trusted by 10,000+ students & parents</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}