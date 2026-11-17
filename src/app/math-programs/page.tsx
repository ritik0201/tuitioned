'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Globe,
  Award,
  BookOpen,
  Users,
  FileText,
  Calendar,
  RotateCcw,
  Zap,
  Star,
  Layers,
  GraduationCap
} from 'lucide-react';

type CurrencyKey = 'INR' | 'USD' | 'GBP' | 'AUD';
type GradeKey = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
type GradeBand = 'a' | 'b' | 'c';

const CURRENCIES: Record<CurrencyKey, { s: string; r: number; label: string }> = {
  INR: { s: '₹', r: 1, label: '🇮🇳 India (₹)' },
  USD: { s: '$', r: 95, label: '🇺🇸 United States ($)' },
  GBP: { s: '£', r: 127, label: '🇬🇧 United Kingdom (£)' },
  AUD: { s: 'A$', r: 67, label: '🇦🇺 Australia (A$)' },
};

const LIST_RATES: Record<GradeBand, number> = {
  a: 999,
  b: 1049,
  c: 1199,
};

const SESSION_RATES: Record<GradeBand, [number, number, number]> = {
  a: [849, 779, 699],
  b: [899, 829, 749],
  c: [1019, 939, 839],
};

const PACKAGES = [
  {
    n: 30,
    name: 'Starter',
    val: '4 months',
    sub: 'Build confidence and fix the basics',
    tag: '',
    f: [
      '30 live 1-on-1 sessions',
      'Modules 1–2: core curriculum',
      'Homework help in every session',
      'School syllabus alignment',
      'Diagnostic + 2 progress reports',
    ],
  },
  {
    n: 50,
    name: 'Achiever',
    val: '6 months',
    sub: 'Cover a full school term with practice',
    tag: 'Most Popular',
    f: [
      '50 live 1-on-1 sessions',
      'Modules 1–3: core + extended',
      'Homework help in every session',
      'Board / country customization',
      'Unit-test & exam worksheets',
      'Quarterly diagnostic reports',
    ],
  },
  {
    n: 90,
    name: 'Master',
    val: '10 months',
    sub: 'Complete mastery, lowest price per session',
    tag: 'Best Value',
    f: [
      '90 live 1-on-1 sessions',
      'All 4 modules + revision & mock tests',
      'Homework help in every session',
      'Full board / country customization',
      'Past papers & olympiad practice',
      'Priority tutor & preferred time slots',
      'Mental math & speed modules',
    ],
  },
];

const CURRICULUM: Record<GradeKey, [string, string][]> = {
  K: [
    ['Number Explorers', 'Counting 1–20; number names & writing; one-to-one correspondence; more, less, equal'],
    ['Shapes & Patterns', '2D shapes; sorting by colour & size; AB/ABC patterns; position words'],
    ['Add & Take Away', 'Joining & separating with objects; addition within 10; subtraction within 10; number bonds'],
    ['Measure & Money', 'Comparing length, weight, capacity; days & months; coins; counting to 100'],
  ],
  '1': [
    ['Numbers to 100', 'Tens & ones; number line; comparing numbers; skip counting by 2, 5, 10'],
    ['Add & Subtract within 20', 'Fact families; doubles; make-ten strategy; word problems'],
    ['Shapes & Measure', '2D & 3D shapes; length; time to the hour & half hour; days & months'],
    ['Data & Reasoning', 'Pictographs; patterns; money; mental math games'],
  ],
  '2': [
    ['Numbers to 1000', 'Hundreds, tens, ones; comparing & ordering; rounding to 10'],
    ['Regrouping', '2- and 3-digit addition & subtraction with carrying and borrowing; word problems'],
    ['Multiply & Divide', 'Equal groups; arrays; tables of 2, 3, 4, 5, 10; sharing equally'],
    ['Measure & Fractions', 'cm & m; time to 5 minutes; money; halves, thirds, quarters; bar graphs'],
  ],
  '3': [
    ['Multiplication Mastery', 'Tables to 10; properties; multiplying 2-digit by 1-digit; word problems'],
    ['Division & Fractions', 'Division facts; unit fractions; equivalent fractions; comparing fractions'],
    ['Measurement', 'Perimeter; area by counting squares; mass & capacity; time elapsed'],
    ['Geometry & Data', 'Lines & angles intro; symmetry; bar graphs; multi-step problems'],
  ],
  '4': [
    ['Big Numbers', 'Numbers to lakhs / millions; rounding; multi-digit multiplication; estimation'],
    ['Division, Factors & Multiples', 'Long division; factors & multiples; primes; divisibility tests'],
    ['Fractions & Decimals', 'Add & subtract fractions; mixed numbers; tenths & hundredths; money as decimals'],
    ['Geometry & Measure', 'Angle types; area & perimeter formulas; symmetry; unit conversion'],
  ],
  '5': [
    ['Number Operations', 'Order of operations; large-number operations; estimation; negative numbers intro'],
    ['Fractions & Decimals', 'Unlike fractions; multiplying fractions; decimal operations; fraction ↔ decimal'],
    ['Percent, Ratio & Volume', 'Percentages; ratios; averages; volume of cuboids'],
    ['Geometry & Data', 'Angle sums & triangles; coordinate plane; line graphs; problem-solving strategies'],
  ],
  '6': [
    ['Integers & Number Theory', 'Integers on the number line; HCF & LCM; divisibility; prime factorisation'],
    ['Fractions, Ratio & Percent', 'Fraction & decimal operations; ratio & proportion; unitary method; percentages'],
    ['Algebra Beginnings', 'Variables; algebraic expressions; simple equations; number patterns'],
    ['Geometry & Data', 'Lines & angles; triangles; perimeter & area; mean, median, bar graphs'],
  ],
  '7': [
    ['Rational Numbers & Exponents', 'Operations on rational numbers; laws of exponents; standard form'],
    ['Algebra', 'Expressions; linear equations in one variable; word problems'],
    ['Commercial Math', 'Ratio & proportion; profit, loss & discount; simple interest'],
    ['Geometry & Data', 'Triangle properties; congruence; Pythagoras theorem; circles; mean, median, mode; probability'],
  ],
  '8': [
    ['Powers & Roots', 'Squares, cubes & their roots; exponents; rational numbers'],
    ['Algebra', 'Algebraic identities; factorisation; linear equations; word problems'],
    ['Quadrilaterals & Mensuration', 'Quadrilateral properties; surface area; volume; area of polygons'],
    ['Data & Finance', 'Direct & inverse proportion; compound interest; probability; data handling & graphs'],
  ],
  '9': [
    ['Number Systems & Polynomials', 'Irrational & real numbers; laws of exponents; polynomials; factor & remainder theorem'],
    ['Coordinate Geometry & Linear Equations', 'Cartesian plane; linear equations in two variables; graphing'],
    ['Geometry', 'Euclid’s axioms; lines & angles; triangles; quadrilaterals; circles'],
    ['Mensuration & Statistics', 'Heron’s formula; surface area & volume; statistics; probability'],
  ],
  '10': [
    ['Real Numbers & Polynomials', 'Euclid’s division lemma; irrationality; zeros of polynomials'],
    ['Equations & Progressions', 'Pair of linear equations; quadratic equations; arithmetic progressions'],
    ['Geometry & Trigonometry', 'Similar triangles; coordinate geometry; trigonometric ratios; heights & distances; circles'],
    ['Mensuration, Probability & Board Prep', 'Surface area & volume; statistics; probability; board-pattern practice papers'],
  ],
  '11': [
    ['Sets, Relations & Functions', 'Sets & Venn diagrams; relations; functions; domain & range'],
    ['Trigonometry & Algebra', 'Trigonometric functions & identities; complex numbers; quadratics; inequalities'],
    ['Counting & Coordinate Geometry', 'Permutations & combinations; binomial theorem; sequences & series; straight lines; conic sections'],
    ['Calculus & Statistics Intro', 'Limits & derivatives; 3D geometry intro; statistics; probability'],
  ],
  '12': [
    ['Functions & Inverse Trig', 'Relations & functions; inverse trigonometric functions'],
    ['Matrices & Differentiation', 'Matrices & determinants; continuity & differentiability'],
    ['Applications of Calculus', 'Applications of derivatives; integrals; area under curves'],
    ['Vectors, 3D & Probability', 'Differential equations; vectors; 3D geometry; linear programming; probability; board-pattern practice'],
  ],
};

const OUTCOMES: Record<GradeBand, string> = {
  a: 'Counts, adds, subtracts and measures with confidence; understands the "why" behind each step; loves math instead of fearing it.',
  b: 'Strong in tables, fractions and word problems; solves school homework independently; scores better in unit tests and term exams.',
  c: 'Builds exam-ready concepts, speed and accuracy; practices board-pattern papers; solves multi-step problems without panic.',
};

const GRADES: GradeKey[] = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const STEPS = [
  {
    num: 1,
    title: 'Free trial & diagnostic',
    desc: 'A 1-on-1 trial class finds strengths, gaps and learning style.',
  },
  {
    num: 2,
    title: 'School & board mapping',
    desc: "We align modules to your school's syllabus and term calendar: CBSE, ICSE, State Boards, IB, Cambridge, Common Core, UK or Australian curriculum.",
  },
  {
    num: 3,
    title: 'Weekly sessions + homework help',
    desc: 'Your child brings school homework to class. The tutor teaches the concept behind each problem.',
  },
  {
    num: 4,
    title: 'Progress reports for parents',
    desc: 'Regular updates and diagnostics, so you always see where your child stands.',
  },
];

const FEATURES = [
  {
    title: 'Dedicated tutor',
    desc: 'One background-verified tutor who knows your child, with a free tutor change if needed.',
    icon: Users,
  },
  {
    title: 'Homework & assignment help',
    desc: 'Daily school work supported inside every package, at no extra charge.',
    icon: BookOpen,
  },
  {
    title: 'Exam preparation',
    desc: 'Unit tests, term exams, board exams and olympiad-style practice.',
    icon: Award,
  },
  {
    title: 'Practice worksheets',
    desc: 'All learning material and portal features included. No hidden fees.',
    icon: FileText,
  },
  {
    title: 'Pause & reschedule',
    desc: 'Pause during exams or holidays. Reschedule with 24 hours’ notice.',
    icon: Calendar,
  },
  {
    title: '30-day guarantee',
    desc: 'Not satisfied in the first 30 days? Get a refund for unused sessions.',
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    q: 'Why pay upfront instead of monthly?',
    a: 'You get a lower price per session, no monthly payment reminders, and a plan that runs to the end of the syllabus without gaps. Unused sessions stay protected by our refund guarantee.',
  },
  {
    q: 'Which package should I choose?',
    a: 'Choose 30 sessions to build confidence or fix a specific weak area. Choose 50 to cover a full school term with practice. Choose 90 for complete mastery, exam readiness and the lowest price per session.',
  },
  {
    q: 'Will it match my child’s school?',
    a: 'Yes. We map every module to your child’s school syllabus and board or country curriculum, and reorder topics to match what is being taught in class.',
  },
  {
    q: 'Do you help with school homework?',
    a: 'Yes, in every session. Your child can bring homework or assignments, and the tutor works through them with the concept explained.',
  },
  {
    q: 'What if my child doesn’t click with the tutor?',
    a: 'We change the tutor for free, and the 30-day money-back guarantee applies to unused sessions.',
  },
];

export default function MathProgramsPage() {
  const [grade, setGrade] = useState<GradeKey>('5');
  const [cur, setCur] = useState<CurrencyKey>('INR');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getBand = (g: GradeKey): GradeBand => {
    if (g === 'K' || g === '1' || g === '2' || g === '3') return 'a';
    if (Number(g) <= 8) return 'b';
    return 'c';
  };

  const getGradeLabel = (g: GradeKey): string => {
    return g === 'K' ? 'Kindergarten' : `Grade ${g}`;
  };

  const cv = (v: number): number => {
    const r = CURRENCIES[cur].r;
    return r === 1 ? v : Math.ceil((v / r) * 2) / 2 - 0.01;
  };

  const fmt = (v: number): string => {
    const s = CURRENCIES[cur].s;
    if (cur === 'INR') {
      return `${s}${Math.round(v).toLocaleString('en-IN')}`;
    }
    return `${s}${v.toLocaleString('en-US', {
      minimumFractionDigits: Math.round(v * 100) % 100 ? 2 : 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const currentBand = getBand(grade);
  const bandRates = SESSION_RATES[currentBand].map(cv);
  const bandListRate = cv(LIST_RATES[currentBand]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Header Hero */}
        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pay once · Zero monthly follow-ups</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-4">
            One-on-One Math Programs, <br className="hidden sm:block" />
            Kindergarten to Grade 12
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            A structured, school-aligned math program with a dedicated tutor, homework help in every session, and a refund guarantee. Choose a package, then see exactly what your child will learn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 mt-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              Live 1-on-1 classes
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              Verified expert tutors
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              30-day money-back guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              School homework help included
            </span>
          </div>
        </header>

        {/* Currency Selector Bar */}
        <div className="flex justify-center items-center gap-3 mb-6">
          <label htmlFor="country-select" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Country:
          </label>
          <select
            id="country-select"
            value={cur}
            onChange={(e) => setCur(e.target.value as CurrencyKey)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-lg px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.entries(CURRENCIES).map(([code, info]) => (
              <option key={code} value={code}>
                {info.label}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Selection Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
          {GRADES.map((g) => {
            const isSelected = g === grade;
            return (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`px-3.5 py-1.5 text-sm font-bold transition-all rounded-full cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {g === 'K' ? 'K' : `Grade ${g}`}
              </button>
            );
          })}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch mb-4">
          {PACKAGES.map((pkg, i) => {
            const isPop = pkg.tag === 'Most Popular';
            const perSession = bandRates[i];
            const totalPrice = perSession * pkg.n;
            const listTotalPrice = bandListRate * pkg.n;
            const savingsPercent = Math.round((1 - perSession / bandListRate) * 100);
            const totalSaved = listTotalPrice - totalPrice;

            return (
              <div
                key={pkg.name}
                className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl transition-all ${
                  isPop
                    ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-xl shadow-indigo-500/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Floating Tag */}
                {pkg.tag && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black tracking-wider uppercase px-4 py-1 rounded-full shadow-sm">
                    {pkg.tag}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {pkg.name} · {pkg.n} sessions
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 font-medium">
                    {pkg.sub}
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {fmt(perSession)}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      / session
                    </span>
                    <span className="text-sm font-medium text-slate-400 line-through ml-1">
                      {fmt(bandListRate)}
                    </span>
                  </div>

                  {/* Save Tag */}
                  <div className="mt-2 mb-3">
                    <span className="inline-block bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-black px-2.5 py-0.5 rounded-full">
                      Save {savingsPercent}%
                    </span>
                  </div>

                  {/* Total & Validity */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                    Total <strong className="text-slate-900 dark:text-slate-100">{fmt(totalPrice)}</strong>{' '}
                    (you save {fmt(totalSaved)}) · valid {pkg.val}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 my-6 text-sm text-slate-700 dark:text-slate-300">
                    {pkg.f.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Link
                  href="/get-a-free-trial"
                  className={`block w-full text-center py-3 px-4 font-extrabold text-sm rounded-xl transition-all shadow-sm ${
                    isPop
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white shadow-indigo-600/20'
                  }`}
                >
                  Book Free Trial
                </Link>
              </div>
            );
          })}
        </div>

        {/* Note under plans */}
        <div className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-16">
          One-time payment · free trial first · 30-day money-back guarantee on unused sessions
        </div>

        {/* Curriculum Section */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              What your child will learn in {getGradeLabel(grade)}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Every program is built from four modules. The 30-session package covers Modules 1–2, the 50-session package adds Module 3, and the 90-session package completes Module 4 plus revision and mock tests.
            </p>

            {/* Path indicators */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-5">
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                30 sessions → Modules 1–2
              </span>
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                50 sessions → + Module 3
              </span>
              <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                90 sessions → + Module 4, revision &amp; tests
              </span>
            </div>
          </div>

          {/* 4 Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            {CURRICULUM[grade].map((mod, i) => {
              const sessionLabels = ['Sessions 1–15', 'Sessions 16–30', 'Sessions 31–50', 'Sessions 51–70'];
              const borderColors = [
                'border-t-indigo-600 dark:border-t-indigo-500',
                'border-t-indigo-600 dark:border-t-indigo-500',
                'border-t-amber-500',
                'border-t-purple-600 dark:border-t-purple-500',
              ];

              return (
                <div
                  key={i}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-t-4 ${borderColors[i]} p-5 rounded-xl shadow-sm`}
                >
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Module {i + 1} · {sessionLabels[i]}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mb-2.5">
                    {mod[0]}
                  </h4>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                    {mod[1].split('; ').map((item, itemIdx) => (
                      <li key={itemIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Outcomes callout */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-5 text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <strong className="text-indigo-900 dark:text-indigo-300 font-extrabold">By the end: </strong>
            {OUTCOMES[currentBand]}
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Sessions 71–90 also include revision, mock tests and enrichment. Topics are reordered to match your child’s school, board or country.
            </div>
          </div>
        </section>

        {/* How we personalize */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              How we personalize it for your child
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              No two children, schools or countries are the same, so the plan is never generic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-black text-sm mb-3">
                  {s.num}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1.5">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Every package includes */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Every package includes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-start"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {f.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="mb-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 dark:from-indigo-900 dark:via-slate-900 dark:to-indigo-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Start with a free trial class
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base">
              No credit card required. Get a personalized plan for your child’s school and grade.
            </p>
            <div className="pt-2">
              <Link
                href="/get-a-free-trial"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
              >
                <span>Book Free Trial</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
