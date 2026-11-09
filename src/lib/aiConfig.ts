// Utility for Gemini AI Keys, Grade-level Curriculum, and Academic Guardrails

export const GEMINI_KEYS = {
  // Key 1: Grades 1, 2, 3
  GRADE_1_2_3: process.env.GEMINI_API_KEY_GRADE_1_2_3 || "",
  // Key 2: Grades 4, 5
  GRADE_4_5: process.env.GEMINI_API_KEY_GRADE_4_5 || "",
  // Key 3: Grade 6
  GRADE_6: process.env.GEMINI_API_KEY_GRADE_6 || "",
  // Key 4: Grade 7
  GRADE_7: process.env.GEMINI_API_KEY_GRADE_7 || "",
  // Key 5: Grade 8
  GRADE_8: process.env.GEMINI_API_KEY_GRADE_8 || "",
  // Key 6: Grade 9
  GRADE_9: process.env.GEMINI_API_KEY_GRADE_9 || "",
  // Key 7: Grade 10
  GRADE_10: process.env.GEMINI_API_KEY_GRADE_10 || "",
  // Key 8: Grade 11
  GRADE_11: process.env.GEMINI_API_KEY_GRADE_11 || "",
  // Key 9: Grade 12
  GRADE_12: process.env.GEMINI_API_KEY_GRADE_12 || "",
  // Existing Key: Chatbot Only
  CHATBOT: process.env.GEMINI_CHAT_API_KEY || process.env.GEMINI_API_KEY || "",
};

/**
 * Normalizes grade input (e.g., 'Grade 5', '5', 5) to a number between 1 and 12.
 */
export function parseGrade(gradeInput: any): number {
  if (typeof gradeInput === "number") {
    if (gradeInput >= 1 && gradeInput <= 12) return Math.floor(gradeInput);
  }
  if (typeof gradeInput === "string") {
    const match = gradeInput.match(/\b([1-9]|1[0-2])\b/);
    if (match) return parseInt(match[1], 10);
  }
  return 10; // Default grade fallback
}

/**
 * Returns the exact Gemini API key assigned for a specific grade/class.
 * Key 1 -> Grades 1, 2, 3
 * Key 2 -> Grades 4, 5
 * Key 3 -> Grade 6
 * Key 4 -> Grade 7
 * Key 5 -> Grade 8
 * Key 6 -> Grade 9
 * Key 7 -> Grade 10
 * Key 8 -> Grade 11
 * Key 9 -> Grade 12
 */
export function getGeminiKeyForGrade(gradeInput: any): string {
  const grade = parseGrade(gradeInput);

  switch (grade) {
    case 1:
    case 2:
    case 3:
      return GEMINI_KEYS.GRADE_1_2_3;
    case 4:
    case 5:
      return GEMINI_KEYS.GRADE_4_5;
    case 6:
      return GEMINI_KEYS.GRADE_6;
    case 7:
      return GEMINI_KEYS.GRADE_7;
    case 8:
      return GEMINI_KEYS.GRADE_8;
    case 9:
      return GEMINI_KEYS.GRADE_9;
    case 10:
      return GEMINI_KEYS.GRADE_10;
    case 11:
      return GEMINI_KEYS.GRADE_11;
    case 12:
      return GEMINI_KEYS.GRADE_12;
    default:
      return GEMINI_KEYS.GRADE_10;
  }
}

/**
 * Returns the existing API key reserved exclusively for the chatbot.
 */
export function getChatbotApiKey(): string {
  return GEMINI_KEYS.CHATBOT;
}

export interface CurriculumTopic {
  title: string;
  subject: string;
  description: string;
}

export interface GradeCurriculum {
  grade: number;
  label: string;
  description: string;
  coreSubjects: string[];
  topics: CurriculumTopic[];
}

export const GRADE_CURRICULUM: Record<number, GradeCurriculum> = {
  1: {
    grade: 1,
    label: "Grade 1",
    description: "Foundational numeracy, early literacy, sensory awareness & basic nature exploration.",
    coreSubjects: ["Mathematics", "English & Phonics", "Environmental Studies (EVS)"],
    topics: [
      { title: "Number Sense & Counting (1-50)", subject: "Mathematics", description: "Counting objects, forward & backward counting, comparing numbers." },
      { title: "Simple Addition & Subtraction (within 20)", subject: "Mathematics", description: "Basic addition stories and visual subtraction." },
      { title: "Shapes & Spatial Patterns", subject: "Mathematics", description: "Circles, squares, triangles, rectangles, above/below, inside/outside." },
      { title: "Alphabet, Phonics & Sight Words", subject: "English & Phonics", description: "Letter sounds, short vowels, everyday sight words, simple sentences." },
      { title: "My Body & Five Senses", subject: "Environmental Studies (EVS)", description: "Sight, hearing, smell, taste, touch, and personal hygiene." },
      { title: "Plants, Animals & Nature", subject: "Environmental Studies (EVS)", description: "Common domestic animals, wild animals, leaves, flowers and caring for pets." },
    ],
  },
  2: {
    grade: 2,
    label: "Grade 2",
    description: "Two-digit operations, reading comprehension, living world & community awareness.",
    coreSubjects: ["Mathematics", "English", "Environmental Studies (EVS)"],
    topics: [
      { title: "2-Digit Addition & Subtraction with Regrouping", subject: "Mathematics", description: "Place values (Tens, Ones), word problems, carry-over addition." },
      { title: "Time, Days & Calendar Reading", subject: "Mathematics", description: "Telling time by hour and half-hour, days of the week, months." },
      { title: "Money & Basic Transactions", subject: "Mathematics", description: "Recognizing coins, notes, adding prices and simple change." },
      { title: "Nouns, Verbs & Sentence Building", subject: "English", description: "Identifying naming words, action words, punctuation (caps, periods)." },
      { title: "Living vs Non-Living Things", subject: "Environmental Studies (EVS)", description: "Characteristics of living beings, food, air, water requirements." },
      { title: "Our Neighborhood & Community Helpers", subject: "Environmental Studies (EVS)", description: "Doctors, teachers, firefighters, police, post office, neighborhood care." },
    ],
  },
  3: {
    grade: 3,
    label: "Grade 3",
    description: "Multiplication foundations, fractions concept, earth sciences & reading skills.",
    coreSubjects: ["Mathematics", "Science", "Social Studies", "English"],
    topics: [
      { title: "Multiplication Tables (2 to 10) & Division Basics", subject: "Mathematics", description: "Repeated addition, equal sharing, times tables up to 10." },
      { title: "Fractions Introduction (Halves, Thirds, Quarters)", subject: "Mathematics", description: "Understanding numerators, denominators, pictorial fractions." },
      { title: "Measurement: Length, Weight & Capacity", subject: "Mathematics", description: "Meters/centimeters, grams/kilograms, liters/milliliters." },
      { title: "Parts of Plants & Photosynthesis Basics", subject: "Science", description: "Roots, stems, leaves, flowers, sunlight, water, and making food." },
      { title: "Animal Habitats & Eating Habits", subject: "Science", description: "Herbivores, carnivores, omnivores, land, water, aerial habitats." },
      { title: "Earth, Sun & The Solar System", subject: "Science", description: "The 8 planets, rotation (day and night), revolution (seasons)." },
    ],
  },
  4: {
    grade: 4,
    label: "Grade 4",
    description: "Multi-digit math, introductory decimals, states of matter & bodily systems.",
    coreSubjects: ["Mathematics", "Science", "Social Studies", "English"],
    topics: [
      { title: "Large Numbers, Place Value & Roman Numerals", subject: "Mathematics", description: "Numbers up to 100,000, rounding off, Roman numerals I to C." },
      { title: "Fractions & Decimals Essentials", subject: "Mathematics", description: "Equivalent fractions, adding like fractions, tenths and hundredths." },
      { title: "States of Matter: Solid, Liquid & Gas", subject: "Science", description: "Properties of matter, melting, boiling, condensation, evaporation." },
      { title: "Digestive & Excretory Systems", subject: "Science", description: "Organs of digestion, teeth types, healthy eating, excretion basics." },
      { title: "Force, Gravity & Simple Work", subject: "Science", description: "Pushes and pulls, friction, gravity introduction, simple machines." },
      { title: "Physical Features of Our Country & Maps", subject: "Social Studies", description: "Mountains, plains, plateaus, rivers, oceans, cardinal directions." },
    ],
  },
  5: {
    grade: 5,
    label: "Grade 5",
    description: "Factors & multiples, respiratory & circulatory systems, energy forms & ecosystems.",
    coreSubjects: ["Mathematics", "Science", "Social Studies", "English"],
    topics: [
      { title: "Factors, Multiples, HCF & LCM", subject: "Mathematics", description: "Prime and composite numbers, divisibility rules, finding HCF and LCM." },
      { title: "Decimals, Percentages & Unitary Method", subject: "Mathematics", description: "Decimal multiplication/division, converting to percentages, word problems." },
      { title: "Area & Perimeter of Rectangles and Squares", subject: "Mathematics", description: "Formulas, grid counts, practical real-world area questions." },
      { title: "Skeletal, Muscular & Nervous Systems", subject: "Science", description: "Bones, joints, muscles, brain, spinal cord, sensory nerves." },
      { title: "Air, Atmosphere & Water Purification", subject: "Science", description: "Composition of air, atmospheric pressure, filtration, boiling, water cycle." },
      { title: "Natural Resources, Forest Ecosystems & Conservation", subject: "Science", description: "Renewable vs non-renewable resources, food chains, saving forests." },
    ],
  },
  6: {
    grade: 6,
    label: "Grade 6",
    description: "Negative integers, basic algebra, nutrition, light & shadows, ancient civilizations.",
    coreSubjects: ["Mathematics", "Science", "Social Science", "English"],
    topics: [
      { title: "Integers, Number Line & Negative Numbers", subject: "Mathematics", description: "Adding and subtracting integers, ordering, absolute value." },
      { title: "Introduction to Algebra & Variables", subject: "Mathematics", description: "Variables, algebraic expressions, simple linear patterns." },
      { title: "Ratio, Proportion & Unitary Method", subject: "Mathematics", description: "Simplifying ratios, checking proportions, real-life problem solving." },
      { title: "Components of Food & Balanced Diet", subject: "Science", description: "Carbohydrates, proteins, fats, vitamins, minerals, deficiency diseases." },
      { title: "Light, Shadows & Reflections", subject: "Science", description: "Luminous/non-luminous objects, transparent/opaque, pinhole camera." },
      { title: "Motion & Measurement of Distances", subject: "Science", description: "SI units of measurement, rectilinear, circular and periodic motion." },
    ],
  },
  7: {
    grade: 7,
    label: "Grade 7",
    description: "Rational numbers, simple equations, heat transfer, acids & bases, respiration.",
    coreSubjects: ["Mathematics", "Science", "Social Science", "English"],
    topics: [
      { title: "Rational Numbers & Operations", subject: "Mathematics", description: "Standard form, operations on rational numbers, representation on number line." },
      { title: "Simple Algebraic Equations", subject: "Mathematics", description: "Solving linear equations in one variable, balance method, word problems." },
      { title: "Lines, Angles & Triangle Properties", subject: "Mathematics", description: "Parallel lines, transversals, angle sum property, exterior angle theorem." },
      { title: "Heat, Temperature & Heat Transfer", subject: "Science", description: "Clinical vs laboratory thermometer, conduction, convection, radiation." },
      { title: "Acids, Bases & Salts (Indicators & Neutralization)", subject: "Science", description: "Litmus, phenolphthalein, turmeric indicators, neutralization reaction." },
      { title: "Respiration in Organisms & Transportation", subject: "Science", description: "Aerobic vs anaerobic respiration, human heart, blood vessels, breathing." },
    ],
  },
  8: {
    grade: 8,
    label: "Grade 8",
    description: "Linear equations, squares & cubes, cell biology, force & pressure, combustion.",
    coreSubjects: ["Mathematics", "Science", "Social Science", "English"],
    topics: [
      { title: "Linear Equations in One Variable", subject: "Mathematics", description: "Equations with variables on both sides, age and digit problems." },
      { title: "Squares, Cubes, Square Roots & Cube Roots", subject: "Mathematics", description: "Prime factorization method, division method for square roots." },
      { title: "Exponents, Powers & Factorisation", subject: "Mathematics", description: "Laws of exponents, scientific notation, factorisation by identities." },
      { title: "Cell Structure & Functions", subject: "Science", description: "Plant vs animal cell, cell wall, cell membrane, nucleus, cytoplasm, organelles." },
      { title: "Force, Pressure & Friction", subject: "Science", description: "Contact and non-contact forces, atmospheric pressure, static and sliding friction." },
      { title: "Combustion, Flame & Fossil Fuels", subject: "Science", description: "Conditions for combustion, types of flames, calorific value, coal and petroleum." },
    ],
  },
  9: {
    grade: 9,
    label: "Grade 9",
    description: "Polynomials, coordinate geometry, laws of motion, gravitation, atoms & molecules.",
    coreSubjects: ["Mathematics", "Science (Physics, Chemistry, Biology)", "Social Science"],
    topics: [
      { title: "Number Systems & Polynomials", subject: "Mathematics", description: "Irrational numbers, remainder theorem, factor theorem, algebraic identities." },
      { title: "Coordinate Geometry & Linear Equations in Two Variables", subject: "Mathematics", description: "Cartesian plane, plotting coordinates, graphing linear equations." },
      { title: "Laws of Motion & Gravitation", subject: "Science", description: "Newton's three laws, inertia, momentum, universal law of gravitation, weight." },
      { title: "Atoms and Molecules & Structure of the Atom", subject: "Science", description: "Law of conservation of mass, mole concept, Thomson, Rutherford & Bohr models." },
      { title: "The Fundamental Unit of Life & Tissues", subject: "Science", description: "Plasma membrane, osmosis, plant tissues (meristematic/permanent), animal tissues." },
      { title: "Work, Energy & Sound", subject: "Science", description: "Kinetic and potential energy, law of conservation of energy, sound wave propagation." },
    ],
  },
  10: {
    grade: 10,
    label: "Grade 10",
    description: "Board syllabus: Quadratic equations, trigonometry, chemical reactions, optics, electricity.",
    coreSubjects: ["Mathematics", "Science (Physics, Chemistry, Biology)", "Social Science"],
    topics: [
      { title: "Quadratic Equations & Arithmetic Progressions", subject: "Mathematics", description: "Factoring, quadratic formula, nth term of AP, sum of first n terms." },
      { title: "Introduction to Trigonometry & Applications", subject: "Mathematics", description: "Trigonometric ratios, standard angles (30°, 45°, 60°), heights and distances." },
      { title: "Chemical Reactions, Equations, Acids, Bases & Metals", subject: "Science", description: "Balancing equations, redox reactions, pH scale, metallurgy, reactivity series." },
      { title: "Light: Reflection & Refraction", subject: "Science", description: "Mirror formula, lens formula, magnification, Snell's law, refractive index." },
      { title: "Electricity & Magnetic Effects of Electric Current", subject: "Science", description: "Ohm's law, resistance in series and parallel, Joule's law, Fleming's left hand rule." },
      { title: "Life Processes & Heredity", subject: "Science", description: "Photosynthesis, human digestion, respiration, excretion, Mendel's inheritance laws." },
    ],
  },
  11: {
    grade: 11,
    label: "Grade 11",
    description: "Higher secondary: Trigonometric functions, kinematics, chemical bonding, cell cycle.",
    coreSubjects: ["Mathematics", "Physics", "Chemistry", "Biology / CS"],
    topics: [
      { title: "Sets, Relations, Functions & Trigonometry", subject: "Mathematics", description: "Set operations, domain and range, compound angle trigonometry identities." },
      { title: "Kinematics & Laws of Motion", subject: "Physics", description: "Motion in 1D and 2D, vectors, projectile motion, Newton's laws, friction." },
      { title: "Thermodynamics & Kinetic Theory of Gases", subject: "Physics", description: "First law of thermodynamics, heat engines, ideal gas equation, degrees of freedom." },
      { title: "Structure of Atom & Chemical Bonding", subject: "Chemistry", description: "Quantum numbers, electronic configuration, VSEPR theory, hybridization." },
      { title: "Chemical Thermodynamics & Equilibrium", subject: "Chemistry", description: "Enthalpy, entropy, Gibbs free energy, Le Chatelier's principle, pH and buffer." },
      { title: "Cell Biology & Biomolecules", subject: "Biology / CS", description: "Prokaryotic/eukaryotic cell, cell division (mitosis/meiosis), carbohydrates, proteins, enzymes." },
    ],
  },
  12: {
    grade: 12,
    label: "Grade 12",
    description: "Advanced secondary: Calculus, electromagnetism, optics, organic chemistry, genetics.",
    coreSubjects: ["Mathematics", "Physics", "Chemistry", "Biology / CS"],
    topics: [
      { title: "Calculus: Continuity, Derivatives & Integrals", subject: "Mathematics", description: "Chain rule, maxima/minima, definite integrals, differential equations." },
      { title: "Matrices, Determinants & Vector Algebra", subject: "Mathematics", description: "Matrix multiplication, inverse, determinants, dot and cross products." },
      { title: "Electrostatics, Capacitors & Current Electricity", subject: "Physics", description: "Coulomb's law, Gauss's theorem, capacitance, Kirchhoff's laws, potentiometer." },
      { title: "Electromagnetic Induction, AC & Ray/Wave Optics", subject: "Physics", description: "Faraday's law, Lenz's law, AC circuits, interference, diffraction, lenses/prisms." },
      { title: "Electrochemistry, Kinetics & Coordination Compounds", subject: "Chemistry", description: "Nernst equation, rate laws, crystal field theory, coordination isomerism." },
      { title: "Organic Chemistry: Functional Groups & Reactions", subject: "Chemistry", description: "Haloalkanes, alcohols, phenols, aldehydes, ketones, amines, name reactions." },
    ],
  },
};

/**
 * Guardrail check to verify whether a requested topic or question is appropriate
 * for the selected grade and strictly PREVENTS higher class questions in lower grades.
 */
export function checkHigherClassTopic(
  gradeInput: any,
  topicText: string
): { allowed: boolean; minAllowedGrade?: number; matchedKeyword?: string; reason?: string } {
  const grade = parseGrade(gradeInput);
  if (!topicText || typeof topicText !== "string") {
    return { allowed: true };
  }

  const text = topicText.toLowerCase();

  // Tier 1: Concepts only appropriate for High School Senior / Senior Secondary (Grade 11-12)
  const grade11And12Keywords = [
    { word: "calculus", name: "Calculus" },
    { word: "differentiation", name: "Differentiation" },
    { word: "integration by parts", name: "Integration by Parts" },
    { word: "derivative", name: "Derivatives" },
    { word: "differential equation", name: "Differential Equations" },
    { word: "matrix algebra", name: "Matrices" },
    { word: "determinant", name: "Determinants" },
    { word: "electrostatics", name: "Electrostatics" },
    { word: "gauss theorem", name: "Gauss's Theorem" },
    { word: "wave optics", name: "Wave Optics" },
    { word: "quantum mechanics", name: "Quantum Mechanics" },
    { word: "organic reaction mechanism", name: "Organic Reaction Mechanisms" },
    { word: "electrochemical cell", name: "Electrochemistry" },
    { word: "nernst equation", name: "Nernst Equation" },
    { word: "biotechnology cloning", name: "Biotechnology & Gene Cloning" },
    { word: "recombinant dna", name: "Recombinant DNA Technology" },
    { word: "coordination compound", name: "Coordination Compounds" },
    { word: "thermodynamics enthalpy", name: "Enthalpy & Advanced Thermodynamics" },
  ];

  // Tier 2: Concepts only appropriate for Secondary / Board Level (Grade 9-10+)
  const grade9And10Keywords = [
    { word: "quadratic equation", name: "Quadratic Equations" },
    { word: "trigonometry", name: "Trigonometry" },
    { word: "sin cos tan", name: "Trigonometric Ratios" },
    { word: "pythagoras", name: "Pythagorean Theorem / Advanced Geometry" },
    { word: "refraction index", name: "Refractive Index & Optics" },
    { word: "ohm's law", name: "Ohm's Law & Circuit Analysis" },
    { word: "chemical equation balancing", name: "Chemical Reactions & Balancing" },
    { word: "periodic table trends", name: "Periodic Table Trends" },
    { word: "carbon and its compounds", name: "Carbon Compounds" },
    { word: "heredity and mendel", name: "Mendelian Genetics" },
    { word: "newton's laws of motion", name: "Newton's Laws of Motion" },
    { word: "gravitation formula", name: "Universal Gravitation Formula" },
    { word: "mole concept", name: "Mole Concept & Stoichiometry" },
  ];

  // Tier 3: Concepts only appropriate for Middle School (Grade 6-8+)
  const grade6To8Keywords = [
    { word: "linear equation", name: "Linear Equations" },
    { word: "integers on number line", name: "Integers & Negative Operations" },
    { word: "acids and bases", name: "Acids, Bases & Salts" },
    { word: "cell structure", name: "Cell Biology & Organelles" },
    { word: "photosynthesis reaction", name: "Photosynthesis Mechanisms" },
    { word: "exponents and powers", name: "Exponents & Powers" },
    { word: "square root", name: "Square Roots & Cube Roots" },
    { word: "light reflection", name: "Light Reflection & Shadows" },
    { word: "friction force", name: "Friction & Pressure" },
  ];

  // Check Grade 1-3 (Early Primary): Cannot ask Middle/Secondary/Senior topics
  if (grade <= 3) {
    for (const item of [...grade11And12Keywords, ...grade9And10Keywords, ...grade6To8Keywords]) {
      if (text.includes(item.word)) {
        return {
          allowed: false,
          minAllowedGrade: 6,
          matchedKeyword: item.name,
          reason: `'${item.name}' is taught in Grade 6 and higher. Students in Grade ${grade} cannot ask or take tests on advanced topics from higher classes.`,
        };
      }
    }
  }

  // Check Grade 4-5 (Upper Primary): Cannot ask Secondary/Senior topics
  if (grade <= 5) {
    for (const item of [...grade11And12Keywords, ...grade9And10Keywords]) {
      if (text.includes(item.word)) {
        return {
          allowed: false,
          minAllowedGrade: 9,
          matchedKeyword: item.name,
          reason: `'${item.name}' belongs to higher classes (Grade 9+). Students in Grade ${grade} are restricted from accessing higher-class content.`,
        };
      }
    }
  }

  // Check Grade 6-8 (Middle School): Cannot ask Senior Secondary topics
  if (grade <= 8) {
    for (const item of grade11And12Keywords) {
      if (text.includes(item.word)) {
        return {
          allowed: false,
          minAllowedGrade: 11,
          matchedKeyword: item.name,
          reason: `'${item.name}' is an advanced Grade 11/12 concept. Students in Grade ${grade} cannot take tests or ask questions from higher classes.`,
        };
      }
    }
  }

  // Check Grade 9-10 (Secondary): Cannot ask specialized 11-12 topics like calculus
  if (grade <= 10) {
    const seniorOnly = [
      { word: "calculus", name: "Calculus" },
      { word: "differentiation", name: "Differentiation" },
      { word: "integration by parts", name: "Integration by Parts" },
      { word: "matrix algebra", name: "Matrix Algebra" },
      { word: "wave optics", name: "Wave Optics" },
      { word: "quantum mechanics", name: "Quantum Mechanics" },
    ];
    for (const item of seniorOnly) {
      if (text.includes(item.word)) {
        return {
          allowed: false,
          minAllowedGrade: 11,
          matchedKeyword: item.name,
          reason: `'${item.name}' is an advanced senior curriculum topic (Grade 11/12) and is not permitted in Grade ${grade}.`,
        };
      }
    }
  }

  return { allowed: true };
}

