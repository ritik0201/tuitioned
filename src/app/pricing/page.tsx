'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import {
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Zap,
  Star,
  Award,
  BookOpen,
  Users,
  ChevronDown,
  Globe,
  GraduationCap,
  Calendar,
  PhoneCall,
  Heart,
  ArrowRight,
  Gift,
  Clock,
  RotateCcw,
  Check,
  Lock,
  MessageSquare,
  ZapOff,
  Sliders,
  Code2,
  Cpu,
  BookMarked
} from 'lucide-react';

export type GradeKey = 'K-G2' | 'G3-G8' | 'G9-G12';
export type CountryKey = 'IN' | 'US' | 'GB' | 'AU' | 'AE';
export type PlanType = 'long-term' | 'short-term';

interface PricingTier {
  perClass: string;
  totalPackage: string;
  savings?: string;
}

interface PlanData {
  sixMonths: PricingTier;
  twelveMonths: PricingTier;
}

// Complete Pricing Data Matrix based on official rates
const PRICING_DATA: Record<CountryKey, Record<GradeKey, PlanData>> = {
  IN: {
    'K-G2': {
      sixMonths: { perClass: '₹664', totalPackage: '₹34,508' },
      twelveMonths: { perClass: '₹569', totalPackage: '₹59,156', savings: 'SAVE 14%' }
    },
    'G3-G8': {
      sixMonths: { perClass: '₹759', totalPackage: '₹39,437' },
      twelveMonths: { perClass: '₹664', totalPackage: '₹69,015', savings: 'SAVE 13%' }
    },
    'G9-G12': {
      sixMonths: { perClass: '₹854', totalPackage: '₹44,367' },
      twelveMonths: { perClass: '₹759', totalPackage: '₹78,874', savings: 'SAVE 11%' }
    }
  },
  US: {
    'K-G2': {
      sixMonths: { perClass: '$7', totalPackage: '$364' },
      twelveMonths: { perClass: '$6', totalPackage: '$624', savings: 'SAVE 14%' }
    },
    'G3-G8': {
      sixMonths: { perClass: '$8', totalPackage: '$416' },
      twelveMonths: { perClass: '$7', totalPackage: '$728', savings: 'SAVE 13%' }
    },
    'G9-G12': {
      sixMonths: { perClass: '$9', totalPackage: '$468' },
      twelveMonths: { perClass: '$8', totalPackage: '$832', savings: 'SAVE 11%' }
    }
  },
  GB: {
    'K-G2': {
      sixMonths: { perClass: '£5', totalPackage: '£260' },
      twelveMonths: { perClass: '£5', totalPackage: '£520', savings: 'BEST VALUE' }
    },
    'G3-G8': {
      sixMonths: { perClass: '£6', totalPackage: '£312' },
      twelveMonths: { perClass: '£5', totalPackage: '£520', savings: 'SAVE 17%' }
    },
    'G9-G12': {
      sixMonths: { perClass: '£7', totalPackage: '£364' },
      twelveMonths: { perClass: '£6', totalPackage: '£624', savings: 'SAVE 14%' }
    }
  },
  AU: {
    'K-G2': {
      sixMonths: { perClass: 'A$9', totalPackage: 'A$468' },
      twelveMonths: { perClass: 'A$9', totalPackage: 'A$936', savings: 'BEST VALUE' }
    },
    'G3-G8': {
      sixMonths: { perClass: 'A$11', totalPackage: 'A$572' },
      twelveMonths: { perClass: 'A$9', totalPackage: 'A$936', savings: 'SAVE 18%' }
    },
    'G9-G12': {
      sixMonths: { perClass: 'A$12', totalPackage: 'A$624' },
      twelveMonths: { perClass: 'A$11', totalPackage: 'A$1,144', savings: 'SAVE 8%' }
    }
  },
  AE: {
    'K-G2': {
      sixMonths: { perClass: '$7', totalPackage: '$364' },
      twelveMonths: { perClass: '$6', totalPackage: '$624', savings: 'SAVE 14%' }
    },
    'G3-G8': {
      sixMonths: { perClass: '$8', totalPackage: '$416' },
      twelveMonths: { perClass: '$7', totalPackage: '$728', savings: 'SAVE 13%' }
    },
    'G9-G12': {
      sixMonths: { perClass: '$9', totalPackage: '$468' },
      twelveMonths: { perClass: '$8', totalPackage: '$832', savings: 'SAVE 11%' }
    }
  }
};

const COUNTRIES: Array<{ code: CountryKey; name: string; flag: string; currencyLabel: string }> = [
  { code: 'IN', name: 'India', flag: '🇮🇳', currencyLabel: 'INR (₹)' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currencyLabel: 'USD ($)' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currencyLabel: 'GBP (£)' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currencyLabel: 'AUD (A$)' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', currencyLabel: 'USD ($)' }
];

const GRADES: Array<{ key: GradeKey; label: string; sub: string }> = [
  { key: 'K-G2', label: 'K – Grade 2', sub: 'Ages 4–7' },
  { key: 'G3-G8', label: 'Grade 3 – 8', sub: 'Ages 8–13' },
  { key: 'G9-G12', label: 'Grade 9 – 12', sub: 'Ages 14–18' }
];

// Official Short-Term Hourly Pricing Matrix
interface ShortTermItem {
  id: string;
  category: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  rates: Array<{
    frequency: string;
    usd: string;
    inr: string;
    discountNote?: string;
  }>;
}

const SHORT_TERM_DATA: ShortTermItem[] = [
  {
    id: 'k8',
    category: 'K-8 (All Subjects)',
    badge: 'Elementary & Middle',
    description: 'Math, Science, English, & Social Studies for Grades K through 8.',
    icon: <BookOpen className="w-5 h-5 text-blue-400" />,
    rates: [
      { frequency: '0 – 3 Classes / week', usd: '$9 / hr', inr: '₹828 / hr' },
      { frequency: '3+ Classes / week', usd: '$8 / hr', inr: '₹736 / hr', discountNote: 'SAVE 11%' }
    ]
  },
  {
    id: 'g912',
    category: '9-12 (All Subjects)',
    badge: 'High School & Prep',
    description: 'Algebra, Calculus, Physics, Chemistry, Biology, SAT/ACT test prep.',
    icon: <GraduationCap className="w-5 h-5 text-indigo-400" />,
    rates: [
      { frequency: '0 – 3 Classes / week', usd: '$10 / hr', inr: '₹920 / hr' },
      { frequency: '3+ Classes / week', usd: '$9 / hr', inr: '₹828 / hr', discountNote: 'SAVE 10%' }
    ]
  },
  {
    id: 'skills',
    category: 'Coding, Instruments & Languages',
    badge: 'Skill Building',
    description: 'Python, Scratch, Music/Instruments, Spanish, French, German & more.',
    icon: <Code2 className="w-5 h-5 text-purple-400" />,
    rates: [
      { frequency: '0 – 3 Classes / week', usd: '$12 / hr', inr: '₹1,104 / hr' },
      { frequency: '3+ Classes / week', usd: '$11 / hr', inr: '₹1,012 / hr', discountNote: 'SAVE 8%' }
    ]
  },
  {
    id: 'advtech',
    category: 'Advanced Tech (AI, ML, Web Dev)',
    badge: 'Specialized Tech',
    description: 'Artificial Intelligence, Machine Learning, Full-Stack Web Dev, Data Science.',
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    rates: [
      { frequency: 'Flex Schedule', usd: '$15 – $20 / hr', inr: '₹1,380 – ₹1,840 / hr' }
    ]
  }
];

const FAQS = [
  {
    q: 'How do the short-term hourly plans work vs long-term packages?',
    a: 'Short-term plans offer pay-as-you-go hourly flexibility without committing to a 6 or 12-month semester. You pay per class based on weekly frequency, with discounted rates when taking 3+ classes per week.'
  },
  {
    q: 'How do the 1-on-1 live classes work?',
    a: 'Each student is paired with a dedicated expert tutor matched to their individual learning pace. Classes take place in our interactive online classroom featuring HD video, digital whiteboard, and real-time guidance.'
  },
  {
    q: 'What is included in the 6-month vs 12-month packages?',
    a: 'The 6-month package includes 52 live 1-on-1 classes (2 classes/week). The 12-month package includes 104 classes with higher savings, priority tutor selection, unlimited worksheets, and full AI tool access.'
  },
  {
    q: 'Can I pause or reschedule my classes during holidays or exams?',
    a: 'Yes, absolutely! You can pause your subscription or reschedule classes anytime with 24 hours notice with zero penalties or lost credits.'
  },
  {
    q: 'What if my child needs a tutor change?',
    a: 'Your satisfaction is guaranteed. If you ever feel the tutor isn’t the right fit, our academic team will re-match your child with a new specialist immediately.'
  },
  {
    q: 'How does the 30-Day Money-Back Guarantee work?',
    a: 'If you are not 100% satisfied within the first 30 days of starting your program, simply contact us for a full refund of all unused classes.'
  }
];

export default function PricingPage() {
  const [activePlanType, setActivePlanType] = useState<PlanType>('long-term');
  const [selectedGrade, setSelectedGrade] = useState<GradeKey>('G3-G8');
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>('IN');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const activePricing = PRICING_DATA[selectedCountry][selectedGrade];
  const activeCountryObj = COUNTRIES.find(c => c.code === selectedCountry)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* Hero Header Section */}
      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold tracking-wide mb-6">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Simple, Transparent Pricing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Invest in Your Child’s Academic Success
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          1-on-1 live personalized tutoring tailored to your child’s grade and learning pace. Choose long-term packages or flexible hourly plans.
        </p>

        {/* Plan Type Selector Toggle (Long Term vs Short Term) */}
        <div className="mt-8 inline-flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setActivePlanType('long-term')}
            className={`py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activePlanType === 'long-term'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Long-Term Packages</span>
            <span className="text-[10px] bg-blue-950/80 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full">
              Save up to 18%
            </span>
          </button>

          <button
            onClick={() => setActivePlanType('short-term')}
            className={`py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activePlanType === 'short-term'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Short-Term Hourly Plans</span>
            <span className="text-[10px] bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full">
              Pay-As-You-Go
            </span>
          </button>
        </div>

        {/* Filter Bar Controls (Grade & Country) */}
        <div className="mt-8 max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Grade Selector */}
          <div className="w-full md:w-3/5 text-left">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2.5">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Select Student Grade</span>
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {GRADES.map(g => {
                const isActive = selectedGrade === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setSelectedGrade(g.key)}
                    className={`py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center ${isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      }`}
                  >
                    <span className="text-xs font-bold">{g.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{g.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country Currency Selector */}
          <div className="w-full md:w-2/5 text-left">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2.5">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Country & Currency</span>
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value as CountryKey)}
                className="w-full py-2.5 px-4 pl-11 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-sm font-semibold text-white appearance-none cursor-pointer outline-none transition"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-slate-950 text-white font-medium py-2">
                    {c.flag} {c.name} ({c.currencyLabel})
                  </option>
                ))}
              </select>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                {activeCountryObj.flag}
              </span>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* LONG-TERM PACKAGES SECTION */}
      {activePlanType === 'long-term' && (
        <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* 6 MONTHS PLAN */}
            <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg transition duration-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-md">
                    Semester Plan
                  </span>
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> 52 Live Classes
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">6 Months</h3>
                <p className="text-xs text-slate-400 mb-6">2 1-on-1 sessions per week</p>

                {/* Price display */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {activePricing.sixMonths.perClass}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">/ class</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    Total package: <span className="text-slate-200 font-bold">{activePricing.sixMonths.totalPackage}</span>
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">Includes:</p>
                  {[
                    '52 Live 1-on-1 Tutoring Classes',
                    'Customized School Curriculum Alignment',
                    'Homework & Assignment Assistance',
                    'Dedicated Academic Mentor',
                    'Flexible Class Rescheduling & Rollover',
                    'Quarterly Progress Diagnostic Reports'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-300 font-normal">
                      <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div>
                <Link
                  href="/get-a-free-trial"
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer border border-slate-700"
                >
                  Book Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-white" />
                </Link>
                <p className="text-[11px] text-center text-slate-500 mt-2.5">No credit card required for trial</p>
              </div>
            </div>

            {/* 12 MONTHS PLAN (RECOMMENDED) */}
            <div className="relative bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border-2 border-blue-500/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-blue-500/5 transition duration-200">
              {/* Top Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-bold text-[11px] uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white fill-white" />
                Most Popular • {activePricing.twelveMonths.savings || 'Best Value'}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-900/50 px-3 py-1 rounded-md border border-blue-700/40">
                    Academic Year
                  </span>
                  <span className="text-xs font-medium text-blue-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> 104 Live Classes
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-1">12 Months</h3>
                <p className="text-xs text-blue-200/80 mb-6">2-3 1-on-1 sessions per week</p>

                {/* Price display */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {activePricing.twelveMonths.perClass}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">/ class</span>
                    {activePricing.twelveMonths.savings && (
                      <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        {activePricing.twelveMonths.savings}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    Total package: <span className="text-white font-bold">{activePricing.twelveMonths.totalPackage}</span>
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-semibold uppercase text-blue-400 tracking-wider mb-3">Everything in 6-Months, Plus:</p>
                  {[
                    '104 Live 1-on-1 Tutoring Classes',
                    'Priority Tutor Selection & Preferred Time Slots',
                    'Comprehensive Exam Prep & Past Papers',
                    'Unlimited Practice Worksheets & AI Assistance',
                    'Mental Math & Problem-Solving Modules',
                    '30-Day Money-Back Guarantee'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-200 font-normal">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div>
                <Link
                  href="/get-a-free-trial"
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Get Started Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <p className="text-[11px] text-center text-slate-400 mt-2.5">Risk-free trial • 30-day refund policy</p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* SHORT-TERM HOURLY PLANS SECTION */}
      {activePlanType === 'short-term' && (
        <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Short-Term Hourly Rates
                  <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold px-2.5 py-0.5 rounded-full">
                    Pay-As-You-Go
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Flexible per-hour pricing tailored to your weekly schedule. Zero long-term commitment required.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 shrink-0">
                <span>Displaying rates in:</span>
                <span className="text-blue-400 font-bold">{selectedCountry === 'IN' ? 'INR (₹)' : 'USD ($)'}</span>
              </div>
            </div>

            {/* Short-Term Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SHORT_TERM_DATA.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800/90 hover:border-slate-700 rounded-xl p-6 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          {item.icon}
                        </div>
                        <h4 className="text-base font-bold text-white">{item.category}</h4>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-md">
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mb-5 font-normal leading-relaxed">
                      {item.description}
                    </p>

                    {/* Rates List */}
                    <div className="space-y-2.5 mb-6">
                      {item.rates.map((rate, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-300">{rate.frequency}</span>
                            {rate.discountNote && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                                {rate.discountNote}
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-extrabold text-white">
                              {selectedCountry === 'IN' ? rate.inr : rate.usd}
                            </span>
                            {selectedCountry !== 'IN' && (
                              <span className="text-[10px] text-slate-500 block">
                                ({rate.inr})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/get-a-free-trial"
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 group cursor-pointer border border-slate-700"
                  >
                    <span>Book Short-Term Trial</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400 group-hover:text-white" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Standalone Short-Term Section for users scrolling long-term view */}
      {activePlanType === 'long-term' && (
        <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/60">
                  Flexible Option
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">
                  Looking for Short-Term or Hourly Classes?
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pay per hour with zero long-term commitment. Discounted rates available for 3+ classes per week.
                </p>
              </div>

              <button
                onClick={() => setActivePlanType('short-term')}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700 shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <span>View Short-Term Rates</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Quick Short-Term Summary Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Classes / Week</th>
                    <th className="py-3 px-4">Rate (USD)</th>
                    <th className="py-3 px-4">Rate (INR)*</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">K-8 (All Subjects)</td>
                    <td className="py-3 px-4">0–3 Classes</td>
                    <td className="py-3 px-4 font-bold text-slate-200">$9 / hr</td>
                    <td className="py-3 px-4 font-bold text-slate-200">₹828 / hr</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">K-8 (All Subjects)</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">3+ Classes (Save 11%)</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">$8 / hr</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">₹736 / hr</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">9-12 (All Subjects)</td>
                    <td className="py-3 px-4">0–3 Classes</td>
                    <td className="py-3 px-4 font-bold text-slate-200">$10 / hr</td>
                    <td className="py-3 px-4 font-bold text-slate-200">₹920 / hr</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">9-12 (All Subjects)</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">3+ Classes (Save 10%)</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">$9 / hr</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">₹828 / hr</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">Coding, Instruments & Languages</td>
                    <td className="py-3 px-4">0–3 Classes</td>
                    <td className="py-3 px-4 font-bold text-slate-200">$12 / hr</td>
                    <td className="py-3 px-4 font-bold text-slate-200">₹1,104 / hr</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">Coding, Instruments & Languages</td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">3+ Classes (Save 8%)</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">$11 / hr</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">₹1,012 / hr</td>
                  </tr>
                  <tr className="hover:bg-slate-950/50 transition">
                    <td className="py-3 px-4 text-white font-semibold">Advanced Tech (AI, ML, Web Dev)</td>
                    <td className="py-3 px-4 font-semibold text-purple-400">Flex Schedule</td>
                    <td className="py-3 px-4 font-bold text-purple-300">$15 – $20 / hr</td>
                    <td className="py-3 px-4 font-bold text-purple-300">₹1,380 – ₹1,840 / hr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Guarantee Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Parents Trust Us</h2>
          <p className="text-sm text-slate-400 mt-1">Peace of mind guaranteed with every subscription</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">30-Day Guarantee</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Not satisfied within the first 30 days? Get a full refund for unused sessions.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Pause & Resume</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Pause your plan anytime during school exams or holidays with zero penalty.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Flexible Schedule</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Reschedule classes effortlessly with 24 hours advance notice via portal.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No Hidden Fees</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              All learning materials, practice tests, and portal features are 100% included.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-sm font-bold text-white ml-1.5">4.9 / 5.0 Rating</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Loved by Parents & Students Worldwide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Aarav M.',
              sub: 'Grade 6 Student',
              quote: 'My math score went from 68% to 94% in just 3 months! My tutor makes difficult topics so easy.'
            },
            {
              name: 'Sarah Jenkins',
              sub: 'Parent of Grade 4 Student',
              quote: 'The ability to pause classes during vacations is fantastic. Excellent tutors and very transparent pricing.'
            },
            {
              name: 'Rohan Sharma',
              sub: 'Grade 10 Student',
              quote: 'Exam preparation worksheets helped me clear my board exams with confidence. Highly recommended!'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
              <p className="text-xs text-slate-300 leading-relaxed font-normal italic mb-4">
                "{item.quote}"
              </p>
              <div>
                <p className="text-sm font-bold text-white">{item.name}</p>
                <p className="text-xs text-slate-400">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400 mt-1">Have questions before getting started? We have answers.</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-blue-400 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed font-normal border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-24">
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-blue-900/60 border border-blue-700/40 rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Give Your Child the Advantage They Deserve
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-lg mx-auto font-normal">
            Book a free 1-on-1 live trial session today and experience personalized tutoring firsthand.
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href="/get-a-free-trial"
              className="py-3.5 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition active:scale-[0.99] flex items-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              Book Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
