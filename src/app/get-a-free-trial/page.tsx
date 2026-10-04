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
  Lock,
  ExternalLink,
  Calculator,
  FlaskConical,
  Zap,
  Atom,
  Dna,
  Landmark,
  Code2
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
  { id: "maths", name: "Maths", icon: Calculator },
  { id: "science", name: "Science", icon: FlaskConical },
  { id: "english", name: "English", icon: BookOpen },
  { id: "physics", name: "Physics", icon: Zap },
  { id: "chemistry", name: "Chemistry", icon: Atom },
  { id: "biology", name: "Biology", icon: Dna },
  { id: "history", name: "History", icon: Landmark },
  { id: "coding", name: "Coding", icon: Code2 },
  { id: "other", name: "Other", icon: Sparkles },
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

  const getGoogleCalendarUrl = () => {
    if (!formData.bookingDateAndTime) return "#";

    const parts = formData.bookingDateAndTime.split("-").map(Number);
    let startDate: Date;
    let endDate: Date;

    if (parts.length === 3 && !parts.some(isNaN)) {
      const [year, month, day] = parts;
      startDate = new Date(year, month - 1, day, 10, 0, 0);
      endDate = new Date(year, month - 1, day, 11, 0, 0);
    } else {
      startDate = new Date(formData.bookingDateAndTime);
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    }

    const formatISO = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const studentName = formData.fullName || session?.user?.fullName || "Student";
    const title = encodeURIComponent(
      `Tuitioned 1-on-1 Demo Class${formData.subject ? ` - ${formData.subject}` : ""}`
    );
    const details = encodeURIComponent(
      `Tuitioned Live 1-on-1 Demo Class Session.\n\n` +
      `Student Name: ${studentName}\n` +
      `Grade/Class: ${formData.grade || "N/A"}\n` +
      `Subject(s): ${formData.subject || "N/A"}\n` +
      (formData.topic ? `Topic: ${formData.topic}\n` : "") +
      (formData.fatherName ? `Parent Name: ${formData.fatherName}\n` : "") +
      `\nWe look forward to having you in class!`
    );
    const location = encodeURIComponent("Tuitioned Online Classroom (https://tuitioned.com)");
    const dates = `${formatISO(startDate)}/${formatISO(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
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
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-indigo-500 dark:text-indigo-400">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      name="fullName"
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      required
                      value={formData.fullName || ""}
                      onChange={handleChange}
                      ref={nameInputRef}
                      disabled={otpSent}
                      className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs font-medium disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Country Code & Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number <span className="text-indigo-500 dark:text-indigo-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div ref={dropdownRef} className="relative w-2/5">
                      <button
                        type="button"
                        disabled={otpSent}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 px-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer text-xs font-semibold flex items-center justify-between h-[36px] hover:border-slate-300 dark:hover:border-slate-700"
                      >
                        <span className="truncate flex items-center gap-1">
                          {countryCode ? (
                            <>
                              <span className="text-xs">{countryCodes.find((c) => c.code === countryCode)?.flag}</span>
                              <span className="text-slate-900 dark:text-slate-200">{countryCode}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              <span>Code</span>
                            </span>
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
                            className="absolute left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-2 overflow-hidden w-[220px]"
                          >
                            <div className="relative mb-1.5">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-1 pl-7 pr-2 text-xs focus:border-indigo-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
                                        ? "bg-indigo-50 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 font-semibold"
                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        placeholder="Mobile Number"
                        required
                        value={mobileNumber}
                        onChange={handleMobileNumberChange}
                        disabled={otpSent}
                        className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs font-medium h-[36px] disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-indigo-500 dark:text-indigo-400">*</span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email || ""}
                  onChange={handleChange}
                  ref={emailInputRef}
                  disabled={otpSent || !!session}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-xs font-medium disabled:opacity-60"
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
                <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-2 flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    OTP sent to your email
                  </span>
                  {timer > 0 ? (
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold transition-colors cursor-pointer"
                    >
                      Resend
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Enter 6-Digit OTP</label>
                  <input
                    name="otp"
                    type="text"
                    placeholder="••••••"
                    required
                    maxLength={6}
                    value={formData.otp || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-indigo-500/40 text-slate-900 dark:text-slate-100 rounded-lg py-2 text-center text-lg font-bold tracking-[0.5rem] focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {!otpSent && (
              <div className="flex justify-center transform scale-[0.78] sm:scale-90 -my-3 sm:-my-1.5 origin-center">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => setRecaptchaToken(token)}
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
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Grade / Class / Standard <span className="text-indigo-500 dark:text-indigo-400">*</span>
              </label>
              <div className="relative group">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name="grade"
                  type="text"
                  placeholder="e.g. Grade 10, High School"
                  required
                  value={formData.grade || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Subject Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Select Subjects <span className="text-indigo-500 dark:text-indigo-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Multiple allowed</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {subjects.map((sub) => {
                  const selected = isSubjectSelected(sub.id);
                  const SubjectIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={`py-1.5 px-1.5 sm:px-2 rounded-lg border text-[10px] sm:text-[11px] font-medium transition-all flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer ${
                        selected
                          ? "bg-indigo-50 dark:bg-indigo-600/25 border-indigo-500 text-indigo-700 dark:text-indigo-200 font-semibold shadow-sm"
                          : "bg-slate-100/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <SubjectIcon className={`w-3.5 h-3.5 shrink-0 ${selected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <span className="truncate flex-1">{sub.name}</span>
                      {selected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
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
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Specify Subject <span className="text-indigo-500 dark:text-indigo-400">*</span>
                  </label>
                  <input
                    name="otherSubject"
                    type="text"
                    placeholder="Enter custom subject"
                    value={formData.otherSubject || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 px-3 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Specific Topic */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Specific Topic <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name="topic"
                  type="text"
                  placeholder="e.g. Algebra, Organic Chemistry"
                  value={formData.topic || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Parent / Guardian Name <span className="text-indigo-500 dark:text-indigo-400">*</span>
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  name="fatherName"
                  type="text"
                  placeholder="e.g. Robert Johnson"
                  required
                  value={formData.fatherName || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  City <span className="text-indigo-500 dark:text-indigo-400">*</span>
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    name="city"
                    type="text"
                    placeholder="Your City"
                    required
                    value={formData.city || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Country <span className="text-indigo-500 dark:text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                  <CountryDropdown
                    value={formData.country || ""}
                    onChange={(val) => setFormData({ ...formData, country: val })}
                    className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-2 pl-9 pr-3 outline-none focus:border-indigo-500 transition-all appearance-none text-xs font-medium cursor-pointer"
                    defaultOptionLabel="Select Country"
                  />
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                Select Preferred Date <span className="text-indigo-500 dark:text-indigo-400">*</span>
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
                          : "bg-slate-100/60 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
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
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                <input
                  name="bookingDateAndTime"
                  type="date"
                  required
                  value={formData.bookingDateAndTime || ""}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg py-1.5 pl-9 pr-3 focus:outline-none focus:border-indigo-500 transition-all text-xs font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
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
        <div className="pt-3">
          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full h-12 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending OTP...
                </span>
              ) : (
                <>
                  <span>Send OTP & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full h-12 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  <span>Verify OTP & Next</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={handleBack}
          className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={loading}
          className="flex-1 h-12 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : activeStep === steps.length - 1 ? (
            <>
              <span>Complete Booking</span>
              <Sparkles className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-y-auto font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Soft Ambient Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[120px] transition-all" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[120px] transition-all" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-blue-500/10 dark:bg-cyan-600/10 rounded-full blur-[100px] transition-all" />
      </div>

      <div className="w-full max-w-6xl relative z-10 my-auto py-4">
        {showConfetti && <ReactConfetti width={width} height={height} numberOfPieces={160} recycle={false} />}

        <AnimatePresence mode="wait">
          {activeStep === steps.length ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl text-center space-y-6 backdrop-blur-2xl"
            >
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Trial Confirmed
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">You're All Set!</h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Your 1-on-1 trial session is scheduled for{" "}
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {formData.bookingDateAndTime ? new Date(formData.bookingDateAndTime + "T00:00").toDateString() : "your chosen date"}
                  </span>
                  .
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Student:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">{formData.fullName || session?.user?.fullName}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Grade:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">{formData.grade}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subjects:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{formData.subject}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Add to Google Calendar</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
                <Link
                  href="/dashboard"
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs shadow-sm transition-all text-center"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={handleReset}
                  className="w-full py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Book Another Free Trial
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Hero Content & Value Propositions */}
              <div className="order-2 lg:order-1 lg:col-span-5 space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    100% Free 1-on-1 Trial Class
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
                    Transform Learning with{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400">
                      Tuitioned
                    </span>
                  </h1>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                    Book a personalized live 1-on-1 demo session with top-certified educators tailored to your child's exact syllabus.
                  </p>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md hover:border-indigo-500/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Certified Expert Tutors</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Handpicked specialists matching your academic grade.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md hover:border-blue-500/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Interactive Digital Classroom</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Live whiteboard & 1-on-1 personalized attention.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md hover:border-emerald-500/40 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">No Commitments Required</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">Zero credit card needed. Purely trial for quality.</p>
                    </div>
                  </div>
                </div>

                {/* Social Proof Footer */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
                  <div className="flex -space-x-2.5 overflow-hidden">
                    {studentAvatars.map((src, i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-950 overflow-hidden relative shadow-sm">
                        <Image src={src} alt="Student avatar" width={32} height={32} className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 ml-1">4.9 / 5.0</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Trusted by 10,000+ students & parents</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Form Card */}
              <div className="order-1 lg:order-2 lg:col-span-7">
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
                  {/* Subtle Accent Glow Header Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

                  {/* Stepper Header */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      {steps.map((s, idx) => {
                        const StepIcon = s.icon;
                        const isCompleted = idx < activeStep;
                        const isCurrent = idx === activeStep;

                        return (
                          <div key={s.id} className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                isCompleted
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : isCurrent
                                  ? "bg-indigo-50 dark:bg-slate-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                  : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {isCompleted ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                            </div>
                            <span
                              className={`text-xs font-bold transition-colors ${
                                isCurrent ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                              }`}
                            >
                              {s.title}
                            </span>
                            {idx < steps.length - 1 && (
                              <div className="w-4 sm:w-10 h-[2px] bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step Title Header */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {steps[activeStep].title} Details
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                        Step {activeStep + 1} of {steps.length}
                      </span>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold text-center">
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
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" /> Encrypted & Private
                    </span>
                    <span>No Credit Card Needed</span>
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