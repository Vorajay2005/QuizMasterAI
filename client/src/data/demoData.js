// Demo data for hackathon presentation
export const demoQuizzes = [
  {
    _id: "demo-1",
    title: "Biology Chapter 12: Photosynthesis",
    subject: "Biology",
    difficulty: "medium",
    totalQuestions: 10,
    timeLimit: 15,
    description: "Test your knowledge of photosynthesis process and components",
    questions: [
      {
        _id: "q1",
        type: "mcq",
        question: "What is the primary pigment involved in photosynthesis?",
        options: ["Chlorophyll", "Carotene", "Anthocyanin", "Xanthophyll"],
        correctAnswer: "Chlorophyll",
        explanation:
          "Chlorophyll is the green pigment that captures light energy for photosynthesis.",
        difficulty: "easy",
        topic: "Pigments",
      },
      {
        _id: "q2",
        type: "mcq",
        question:
          "Which organelle is responsible for photosynthesis in plant cells?",
        options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctAnswer: "Chloroplast",
        explanation:
          "Chloroplasts contain chlorophyll and are the sites of photosynthesis.",
        difficulty: "easy",
        topic: "Cell Structure",
      },
      {
        _id: "q3",
        type: "mcq",
        question: "What is the chemical equation for photosynthesis?",
        options: [
          "6CO2 + 6H2O + light → C6H12O6 + 6O2",
          "C6H12O6 + 6O2 → 6CO2 + 6H2O + ATP",
          "6CO2 + 6O2 → C6H12O6 + 6H2O",
          "C6H12O6 → 6CO2 + 6H2O",
        ],
        correctAnswer: "6CO2 + 6H2O + light → C6H12O6 + 6O2",
        explanation:
          "This equation shows carbon dioxide and water being converted to glucose and oxygen using light energy.",
        difficulty: "medium",
        topic: "Chemical Process",
      },
      {
        _id: "q4",
        type: "short",
        question: "Name the two main stages of photosynthesis.",
        correctAnswer:
          "Light-dependent reactions and light-independent reactions (Calvin cycle)",
        explanation:
          "Photosynthesis occurs in two stages: light reactions in the thylakoids and the Calvin cycle in the stroma.",
        difficulty: "medium",
        topic: "Process Stages",
      },
      {
        _id: "q5",
        type: "fillblank",
        question:
          "The light-dependent reactions occur in the _______ while the Calvin cycle occurs in the _______.",
        correctAnswer: "thylakoids, stroma",
        explanation:
          "Light reactions happen in thylakoid membranes, while the Calvin cycle occurs in the stroma.",
        difficulty: "medium",
        topic: "Chloroplast Structure",
      },
    ],
    settings: {
      timeLimit: 15,
      randomizeQuestions: false,
      showResults: true,
      allowReview: true,
    },
    createdAt: new Date("2024-01-15"),
    createdBy: { name: "Demo System", email: "demo@system.com" },
  },
  {
    _id: "demo-2",
    title: "Calculus Fundamentals: Derivatives",
    subject: "Mathematics",
    difficulty: "medium",
    totalQuestions: 3,
    timeLimit: 12,
    description: "Master the fundamentals of derivatives and differentiation",
    questions: [
      {
        _id: "calc1",
        type: "mcq",
        question: "What is the derivative of x²?",
        options: ["x", "2x", "x²", "2x²"],
        correctAnswer: "2x",
        explanation:
          "Using the power rule: d/dx[x^n] = nx^(n-1), so d/dx[x²] = 2x^(2-1) = 2x.",
        difficulty: "easy",
        topic: "Power Rule",
      },
      {
        _id: "calc2",
        type: "mcq",
        question:
          "The fundamental theorem of calculus connects which two concepts?",
        options: [
          "Limits and continuity",
          "Derivatives and integrals",
          "Functions and graphs",
          "Sequences and series",
        ],
        correctAnswer: "Derivatives and integrals",
        explanation:
          "The fundamental theorem shows that differentiation and integration are inverse operations.",
        difficulty: "medium",
        topic: "Fundamental Theorem",
      },
      {
        _id: "calc3",
        type: "short",
        question: "What does the derivative of a function represent?",
        correctAnswer:
          "The rate of change or slope of the function at any given point.",
        explanation:
          "The derivative gives us the instantaneous rate of change.",
        difficulty: "medium",
        topic: "Conceptual Understanding",
      },
    ],
    settings: {
      timeLimit: 12,
      randomizeQuestions: false,
      showResults: true,
      allowReview: true,
    },
    createdAt: new Date("2024-01-10"),
    createdBy: { name: "Prof. Mike Johnson", email: "mjohnson@university.edu" },
  },
  {
    _id: "demo-3",
    title: "Chemistry: Chemical Bonds",
    subject: "Chemistry",
    difficulty: "medium",
    totalQuestions: 3,
    timeLimit: 10,
    description: "Explore ionic and covalent bonding in chemistry",
    questions: [
      {
        _id: "chem1",
        type: "mcq",
        question: "What type of bond forms between a metal and a non-metal?",
        options: [
          "Covalent bond",
          "Ionic bond",
          "Metallic bond",
          "Hydrogen bond",
        ],
        correctAnswer: "Ionic bond",
        explanation:
          "Ionic bonds form when electrons are transferred from metals to non-metals.",
        difficulty: "easy",
        topic: "Bond Types",
      },
      {
        _id: "chem2",
        type: "mcq",
        question: "Which theory predicts molecular geometry?",
        options: [
          "Atomic theory",
          "VSEPR theory",
          "Kinetic theory",
          "Quantum theory",
        ],
        correctAnswer: "VSEPR theory",
        explanation:
          "VSEPR (Valence Shell Electron Pair Repulsion) theory predicts 3D molecular shapes.",
        difficulty: "medium",
        topic: "Molecular Geometry",
      },
      {
        _id: "chem3",
        type: "short",
        question: "What is the octet rule?",
        correctAnswer:
          "Atoms tend to gain, lose, or share electrons to achieve a full outer shell of 8 electrons.",
        explanation:
          "This rule helps predict how atoms will bond with each other.",
        difficulty: "medium",
        topic: "Electron Configuration",
      },
    ],
    settings: {
      timeLimit: 10,
      randomizeQuestions: false,
      showResults: true,
      allowReview: true,
    },
    createdAt: new Date("2024-01-20"),
    createdBy: { name: "Dr. Emily Davis", email: "edavis@college.edu" },
  },
  {
    _id: "demo-4",
    title: "General Studies Quiz",
    subject: "General",
    difficulty: "easy",
    totalQuestions: 2,
    timeLimit: 8,
    description: "Test your general knowledge across various subjects",
    questions: [
      {
        _id: "gen1",
        type: "mcq",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: "Paris",
        explanation: "Paris has been the capital of France for centuries.",
        difficulty: "easy",
        topic: "Geography",
      },
      {
        _id: "gen2",
        type: "mcq",
        question: "Who wrote 'Romeo and Juliet'?",
        options: [
          "Charles Dickens",
          "William Shakespeare",
          "Jane Austen",
          "Mark Twain",
        ],
        correctAnswer: "William Shakespeare",
        explanation: "Shakespeare wrote this famous tragedy in the 1590s.",
        difficulty: "easy",
        topic: "Literature",
      },
    ],
    settings: {
      timeLimit: 8,
      randomizeQuestions: false,
      showResults: true,
      allowReview: true,
    },
    createdAt: new Date("2024-01-12"),
    createdBy: { name: "Dr. James Liu", email: "jliu@academy.edu" },
  },
];

export const demoUser = {
  _id: "demo-user",
  name: "Alex Student",
  email: "alex@student.com",
  grade: "11th",
  school: "Demo High School",
  studyStreak: {
    current: 7,
    longest: 15,
  },
  achievements: [
    {
      id: "first-quiz",
      title: "First Steps",
      description: "Completed your first quiz!",
      icon: "🎯",
      unlockedAt: new Date("2024-01-10"),
    },
    {
      id: "study-streak",
      title: "Consistent Learner",
      description: "7-day study streak!",
      icon: "🔥",
      unlockedAt: new Date("2024-01-16"),
    },
    {
      id: "high-score",
      title: "Excellence",
      description: "Scored 90% or higher on a quiz!",
      icon: "⭐",
      unlockedAt: new Date("2024-01-12"),
    },
  ],
  preferences: {
    difficulty: "adaptive",
    questionTypes: ["mcq", "short"],
    studyReminders: true,
  },
};

export const demoAttempts = [
  {
    _id: "attempt-1",
    quizId: "demo-1",
    userId: "demo-user",
    answers: {
      q1: { answer: "Chlorophyll", isCorrect: true },
      q2: { answer: "Chloroplast", isCorrect: true },
      q3: { answer: "6CO2 + 6H2O + light → C6H12O6 + 6O2", isCorrect: true },
      q4: { answer: "Light reactions and Calvin cycle", isCorrect: true },
      q5: { answer: "thylakoids, stroma", isCorrect: true },
    },
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    timeSpent: 420, // 7 minutes
    completedAt: new Date("2024-01-16T14:30:00"),
    feedback: {
      strengths: [
        "Excellent understanding of photosynthesis basics",
        "Strong knowledge of chloroplast structure",
      ],
      weaknesses: [],
      recommendations: [
        "Keep up the great work!",
        "Try some advanced biology topics next",
      ],
    },
  },
  {
    _id: "attempt-2",
    quizId: "demo-2",
    userId: "demo-user",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    timeSpent: 540, // 9 minutes
    completedAt: new Date("2024-01-15T16:45:00"),
    feedback: {
      strengths: ["Good grasp of basic concepts"],
      weaknesses: ["Chemical equations", "Complex processes"],
      recommendations: [
        "Review chemical formulas",
        "Practice more challenging problems",
      ],
    },
  },
];

export const demoStats = {
  totalQuizzes: 15,
  averageScore: 84,
  totalTimeSpent: 8400, // 2 hours 20 minutes
  subjectBreakdown: {
    Biology: { quizzes: 8, averageScore: 88 },
    Chemistry: { quizzes: 4, averageScore: 76 },
    Physics: { quizzes: 3, averageScore: 82 },
  },
  weeklyProgress: [
    { date: "2024-01-10", score: 65, quizzes: 1 },
    { date: "2024-01-11", score: 70, quizzes: 2 },
    { date: "2024-01-12", score: 85, quizzes: 1 },
    { date: "2024-01-13", score: 78, quizzes: 3 },
    { date: "2024-01-14", score: 82, quizzes: 2 },
    { date: "2024-01-15", score: 88, quizzes: 2 },
    { date: "2024-01-16", score: 92, quizzes: 1 },
  ],
  strongTopics: ["Photosynthesis", "Cell Structure", "Basic Chemistry"],
  weakTopics: ["Organic Chemistry", "Genetics", "Physics Laws"],
};

export const demoLeaderboard = [
  {
    rank: 1,
    userId: "user-1",
    name: "Sarah Johnson",
    grade: "12th",
    school: "Lincoln High",
    averageScore: 94,
    totalQuizzes: 45,
    studyStreak: 15,
  },
  {
    rank: 2,
    userId: "user-2",
    name: "Marcus Chen",
    grade: "11th",
    school: "Roosevelt Academy",
    averageScore: 92,
    totalQuizzes: 38,
    studyStreak: 12,
  },
  {
    rank: 3,
    userId: "demo-user",
    name: "Alex Student",
    grade: "11th",
    school: "Demo High School",
    averageScore: 84,
    totalQuizzes: 15,
    studyStreak: 7,
    isCurrentUser: true,
  },
];

export const sampleNotes = {
  biology: `
Biology Chapter 12: Photosynthesis

Photosynthesis is the process by which plants convert light energy into chemical energy.

Key Components:
- Chloroplasts: Organelles where photosynthesis occurs
- Chlorophyll: Green pigment that captures light energy
- Carbon dioxide: Gas absorbed from the atmosphere
- Water: Absorbed through roots

The Process:
1. Light Dependent Reactions: Occur in the thylakoids
   - Water is split (photolysis)
   - Oxygen is released
   - ATP and NADPH are produced

2. Light Independent Reactions (Calvin Cycle): Occur in the stroma
   - CO2 is fixed into organic molecules
   - Uses ATP and NADPH from light reactions
   - Produces glucose

Chemical Equation: 
6CO2 + 6H2O + light energy → C6H12O6 + 6O2

Factors affecting photosynthesis:
- Light intensity
- Temperature  
- Carbon dioxide concentration
- Water availability

Importance:
- Produces oxygen for atmosphere
- Foundation of food chains
- Removes CO2 from atmosphere
`,

  chemistry: `
Chemistry Chapter 4: Chemical Bonding

Types of Chemical Bonds:

1. Ionic Bonds
- Form between metals and non-metals
- Transfer of electrons
- Form crystalline structures
- Example: NaCl (sodium chloride)

2. Covalent Bonds
- Form between non-metals
- Sharing of electrons
- Can be polar or nonpolar
- Example: H2O (water)

3. Metallic Bonds
- Form between metal atoms
- Sea of delocalized electrons
- Explains conductivity and malleability

Bond Properties:
- Bond length: Distance between nuclei
- Bond strength: Energy required to break bond
- Bond polarity: Unequal sharing of electrons

Molecular Geometry:
- VSEPR theory predicts molecular shapes
- Common shapes: linear, bent, tetrahedral, pyramidal

Intermolecular Forces:
- Van der Waals forces
- Hydrogen bonding
- Dipole-dipole interactions
`,

  physics: `
Physics Chapter 2: Motion and Forces

Newton's Laws of Motion:

1. First Law (Law of Inertia)
- An object at rest stays at rest
- An object in motion stays in motion
- Unless acted upon by external force

2. Second Law
- F = ma (Force = mass × acceleration)
- Force is directly proportional to acceleration
- Inversely proportional to mass

3. Third Law
- For every action, there is an equal and opposite reaction
- Forces always occur in pairs

Types of Forces:
- Gravitational force: F = mg
- Friction force: opposes motion
- Normal force: perpendicular to surface
- Applied force: external push or pull

Motion Equations:
- v = u + at (velocity)
- s = ut + ½at² (displacement)
- v² = u² + 2as (velocity-displacement)

Where:
- v = final velocity
- u = initial velocity
- a = acceleration
- t = time
- s = displacement
`,
};
