"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { CountryDropdown } from 'react-country-region-selector';
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
  Rocket
} from "lucide-react";
import ReactConfetti from "react-confetti";
import ReCAPTCHA from "react-google-recaptcha";

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
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
  { title: "Details", icon: User },
  { title: "Academic", icon: BookOpen },
  { title: "Schedule", icon: Calendar }
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
  { id: "maths", name: "Maths" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" },
  { id: "physics", name: "Physics" },
  { id: "chemistry", name: "Chemistry" },
  { id: "biology", name: "Biology" },
  { id: "history", name: "History" },
  { id: "coding", name: "Coding" },
  { id: "other", name: "Other" }
];

export default function FreeTrialPage() {
  const { data: session, status, update: updateSession } = useSession();
  const { width, height } = useWindowSize();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const phoneInputRef = React.useRef<HTMLInputElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const [countryCode, setCountryCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const emailInputRef = React.useRef<HTMLInputElement>(null);
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

  const isUserAuthenticated = status === "authenticated" && session?.user?.role === 'student';

  useEffect(() => {
    if (isUserAuthenticated && activeStep === 0) {
      setActiveStep(1);
    }
  }, [isUserAuthenticated, activeStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
    setFormData(prev => ({ ...prev, mobile: code + mobileNumber }));
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, ""); // Keep only digits
    setMobileNumber(newNumber);
    setFormData(prev => ({ ...prev, mobile: countryCode + newNumber }));
  };

  const filteredCountryCodes = countryCodes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.includes(searchQuery)
  );

  const isSubjectSelected = (subjectId: string) => {
    if (!formData.subject) return false;
    return formData.subject.split(",").map(s => s.trim()).includes(subjectId);
  };

  const handleSubjectToggle = (subjectId: string) => {
    const currentSubjects = formData.subject ? formData.subject.split(",").map(s => s.trim()).filter(Boolean) : [];
    let newSubjects: string[];
    if (currentSubjects.includes(subjectId)) {
      newSubjects = currentSubjects.filter(s => s !== subjectId);
    } else {
      newSubjects = [...currentSubjects, subjectId];
    }
    setFormData(prev => ({ ...prev, subject: newSubjects.join(",") }));
  };

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        fullName: session.user.fullName || "",
        email: session.user.email || "",
        mobile: session.user.mobile || "",
      }));

      const userMobile = session.user.mobile;
      if (userMobile) {
        const sortedCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);
        const matched = sortedCodes.find(c => userMobile.startsWith(c.code));
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
    // Basic validations
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
        toast.error("Please enter a valid mobile number (8-14 digits including country code)");
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
        const roleCheckRes = await fetch('/api/auth/check-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        if (roleCheckRes.ok) {
          const { role } = await roleCheckRes.json();
          if (role === 'teacher' || role === 'admin') {
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
        role: 'student'
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
    // Step-wise validation
    if (activeStep === 1) {
      if (!formData.grade || formData.grade.trim() === "") {
        toast.error("Please enter your grade/class");
        return;
      }
      if (!formData.subject || formData.subject.trim() === "") {
        toast.error("Please select a subject");
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
        toast.error("Please select a booking date");
        return;
      }
    }

    setError("");
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

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
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {!session && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.fullName || ""}
                    onChange={handleChange}
                    onBlur={() => {
                      if (formData.fullName && formData.fullName.trim().length < 3) {
                        toast.error("Please complete your full name");
                        setTimeout(() => nameInputRef.current?.focus(), 0);
                      }
                    }}
                    ref={nameInputRef}
                    className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:ring-0 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    disabled={otpSent}
                  />
                </div>
                <div className="flex gap-2.5">
                  <div ref={dropdownRef} className="relative w-1/3 group">
                    <button
                      type="button"
                      disabled={otpSent}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 px-3 focus:border-indigo-500 outline-none transition-all cursor-pointer text-sm font-semibold flex items-center justify-between h-[52px]"
                    >
                      <span>
                        {countryCode ? (
                          <>
                            {countryCodes.find(c => c.code === countryCode)?.flag} {countryCode}
                          </>
                        ) : (
                          <span className="text-slate-500 font-semibold text-[13px]">🌐 Code</span>
                        )}
                      </span>
                      <div className="text-slate-500 group-hover:text-indigo-400 transition-colors">
                        <svg className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-800 rounded-xl shadow-2xl z-50 p-2 overflow-hidden w-[240px]"
                        >
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-lg py-1.5 px-3 text-xs focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 mb-2"
                          />
                          <div className="max-h-[160px] overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-800 pr-1">
                            {filteredCountryCodes.length > 0 ? (
                              filteredCountryCodes.map((c) => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => handleCountryCodeSelect(c.code)}
                                  className={`flex items-center gap-2.5 w-full text-left py-2 px-2.5 rounded-lg text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer ${
                                    countryCode === c.code ? 'bg-indigo-600/30 text-indigo-200' : 'text-slate-300'
                                  }`}
                                >
                                  <span className="text-sm">{c.flag}</span>
                                  <span>{c.code}</span>
                                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-200 truncate max-w-[120px]">{c.name}</span>
                                </button>
                              ))
                            ) : (
                              <div className="text-[11px] text-slate-600 text-center py-3 font-semibold">
                                No countries found
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex-1 group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      placeholder="Mobile No."
                      required
                      value={mobileNumber}
                      onChange={handleMobileNumberChange}
                      onBlur={() => {
                        const mobile = formData.mobile || "";
                        if (mobile.length < 8 || mobile.length > 14) {
                          toast.error("Please enter a valid mobile number");
                          setTimeout(() => phoneInputRef.current?.focus(), 10);
                        }
                      }}
                      disabled={otpSent}
                      className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 font-semibold h-[52px]"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                value={formData.email || ""}
                onChange={handleChange}
                onBlur={() => {
                  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    toast.error("Please enter a valid email address");
                    setTimeout(() => emailInputRef.current?.focus(), 0);
                  }
                }}
                ref={emailInputRef}
                className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:ring-0 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 disabled:opacity-60"
                disabled={otpSent || !!session}
              />
            </div>
            {otpSent && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-1">
                <input
                  name="otp"
                  type="text"
                  placeholder="6-digit OTP"
                  required
                  maxLength={6}
                  value={formData.otp || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 text-center text-2xl font-bold tracking-[0.5rem] focus:border-indigo-500 outline-none transition-all"
                />
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={timer > 0 || loading}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors"
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </button>
                </div>
              </motion.div>
            )}
            {!otpSent && (
              <div className="flex justify-center py-6">
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
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative group">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="grade"
                type="text"
                placeholder="Grade / Class (e.g., 10th Standard)"
                required
                value={formData.grade || ""}
                onChange={handleChange}
                className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 flex items-center gap-2 tracking-wider">
                  <Sparkles className="w-3 h-3 text-yellow-500" /> SELECT SUBJECT
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {subjects.map((sub) => {
                  const selected = isSubjectSelected(sub.id);
                  return (
                    <button
                      key={sub.name}
                      type="button"
                      onClick={() => handleSubjectToggle(sub.id)}
                      className={`py-2 px-1 text-[10px] font-bold rounded-xl border-2 transition-all ${selected
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-[0_3px_0_rgba(67,56,202,1)]"
                          : "bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300 shadow-[0_3px_0_rgba(30,41,59,1)]"
                        }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {isSubjectSelected("other") && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <input
                    name="otherSubject"
                    type="text"
                    placeholder="Specify subject"
                    value={formData.otherSubject || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 px-4 focus:border-indigo-500 outline-none transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="topic"
                type="text"
                placeholder="Specific Topic (Optional)"
                value={formData.topic || ""}
                onChange={handleChange}
                className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="fatherName"
                type="text"
                placeholder="Parent's Name"
                required
                value={formData.fatherName || ""}
                onChange={handleChange}
                className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  required
                  value={formData.city || ""}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
                <div className="relative">
                  <CountryDropdown
                    value={formData.country || ""}
                    onChange={(val) => setFormData({ ...formData, country: val })}
                    className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 outline-none transition-all appearance-none text-sm"
                    defaultOptionLabel="Country"
                  />
                </div>
              </div>
            </div>

            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                name="bookingDateAndTime"
                type="date"
                required
                value={formData.bookingDateAndTime || ""}
                onChange={handleChange}
                className="w-full bg-slate-950 border-2 border-slate-800 text-slate-100 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    const nextBtnClass = "w-full flex-[2] py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold border-2 border-indigo-400 shadow-[0_5px_0_rgba(67,56,202,1)] hover:shadow-[0_2px_0_rgba(67,56,202,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none";
    const backBtnClass = "flex-1 py-4 rounded-xl font-bold border-2 border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 shadow-[0_5px_0_rgba(30,41,59,1)] hover:shadow-[0_2px_0_rgba(30,41,59,1)] hover:translate-y-1 transition-all active:shadow-none active:translate-y-2 flex items-center justify-center gap-2";

    if (activeStep === 0) {
      return (
        <div className="mt-6">
          {!otpSent ? (
            <button onClick={handleSendOtp} disabled={loading} className={nextBtnClass}>
              {loading ? "Sending..." : "SEND OTP & PROCEED"}
            </button>
          ) : (
            <button onClick={handleVerifyOtp} disabled={isVerifying} className={nextBtnClass}>
              {isVerifying ? "Verifying..." : "VERIFY & CONTINUE"}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="flex gap-4 mt-6">
        <button onClick={handleBack} className={backBtnClass}>
          BACK
        </button>
        <button onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext} disabled={loading} className={nextBtnClass}>
          {loading ? "Working..." : activeStep === steps.length - 1 ? "FINISH BOOKING" : "NEXT STEP"}
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500/30 font-sans overflow-x-hidden relative">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-cyan-500/5 rounded-full -ml-30 -mb-30 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {showConfetti && <ReactConfetti width={width} height={height} numberOfPieces={150} recycle={false} />}

        <AnimatePresence mode="wait">
          {activeStep === steps.length ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900/50 p-6 sm:p-10 rounded-[2.5rem] border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center space-y-6"
            >
              <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto border-4 border-indigo-500/30">
                <CheckCircle2 className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">CONFIRMED!</h2>
                <p className="text-slate-400 font-medium">Your trial for {new Date(formData.bookingDateAndTime + 'T00:00').toDateString()} is set.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-[0_8px_0_rgba(67,56,202,1)] hover:translate-y-1 hover:shadow-[0_4px_0_rgba(67,56,202,1)] transition-all">
                  GO TO DASHBOARD
                </Link>
                <button onClick={handleReset} className="w-full py-4 text-slate-500 font-bold hover:text-slate-300 transition-colors">
                  Book Another
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Tightened Header */}
              <div className="text-center">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="inline-flex items-center gap-2 py-1 px-3 bg-indigo-500/10 border-2 border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    <Rocket className="w-3 h-3" /> Start Your Journey
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                    BOOK FREE TRIAL
                  </h1>
                </motion.div>
              </div>

              {/* Compact Stepper */}
              <div className="relative max-w-xs mx-auto py-2">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2" />
                <motion.div
                  className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2"
                  animate={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {steps.map((step, idx) => (
                    <div key={idx} className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${idx <= activeStep ? "bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]" : "bg-slate-900 border-slate-800 text-slate-700"
                      }`}>
                      {idx < activeStep ? <CheckCircle2 className="w-4 h-4 text-white" /> : <step.icon className={`w-3.5 h-3.5 ${idx === activeStep ? "text-white" : ""}`} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Card - Compacted */}
              <motion.div layout className="bg-slate-900 border-4 border-slate-800 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none" />

                {error && (
                  <div className="mb-4 p-2 bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-500 text-[11px] font-black tracking-wide text-center">
                    {error}
                  </div>
                )}

                <div className="min-h-[180px] flex flex-col justify-center">
                  {renderStep(activeStep)}
                </div>

                {renderButtons()}
              </motion.div>

              <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                <span>Safe</span>
                <div className="w-1 h-1 bg-slate-800 rounded-full" />
                <span>Secure</span>
                <div className="w-1 h-1 bg-slate-800 rounded-full" />
                <span>Private</span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}