const OpenAI = require("openai");

let openai;
try {
  if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your-openai-api-key-here"
  ) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.log("OpenAI not configured, using demo mode");
}

class OpenAIService {
  async detectTopic(content) {
    // Demo mode: simple keyword-based topic detection
    if (!openai) {
      return this.detectTopicDemo(content);
    }

    const prompt = `Analyze this academic content and identify the specific topic/subject area. Return ONLY a concise topic name (e.g., "Calculus", "Biology", "Chemistry", "World War 2", "Linear Algebra", etc.).

Content to analyze:
${content.substring(0, 1000)}...

Topic:`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert academic content analyzer. Return only the specific topic name, nothing else.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Topic Detection Error:", error.message);
      throw error; // Let the calling function handle it
    }
  }

  detectTopicDemo(content) {
    const text = content.toLowerCase();

    // Math topics
    if (
      text.includes("derivative") ||
      text.includes("integral") ||
      text.includes("calculus") ||
      text.includes("limit")
    )
      return "Calculus";
    if (
      text.includes("algebra") ||
      text.includes("polynomial") ||
      text.includes("equation")
    )
      return "Algebra";
    if (
      text.includes("geometry") ||
      text.includes("triangle") ||
      text.includes("circle")
    )
      return "Geometry";
    if (
      text.includes("statistics") ||
      text.includes("probability") ||
      text.includes("data")
    )
      return "Statistics";
    if (
      text.includes("trigonometry") ||
      text.includes("sine") ||
      text.includes("cosine")
    )
      return "Trigonometry";

    // Sciences
    if (
      text.includes("photosynthesis") ||
      text.includes("cell") ||
      text.includes("dna") ||
      text.includes("biology") ||
      text.includes("organism")
    )
      return "Biology";
    if (
      text.includes("chemistry") ||
      text.includes("molecule") ||
      text.includes("atom") ||
      text.includes("bond") ||
      text.includes("reaction")
    )
      return "Chemistry";
    if (
      text.includes("physics") ||
      text.includes("force") ||
      text.includes("energy") ||
      text.includes("motion")
    )
      return "Physics";

    // Humanities
    if (
      text.includes("history") ||
      text.includes("war") ||
      text.includes("revolution") ||
      text.includes("empire")
    )
      return "History";
    if (
      text.includes("literature") ||
      text.includes("novel") ||
      text.includes("poem") ||
      text.includes("shakespeare")
    )
      return "Literature";
    if (
      text.includes("geography") ||
      text.includes("climate") ||
      text.includes("continent")
    )
      return "Geography";
    if (
      text.includes("psychology") ||
      text.includes("behavior") ||
      text.includes("mind")
    )
      return "Psychology";
    if (
      text.includes("economics") ||
      text.includes("market") ||
      text.includes("supply") ||
      text.includes("demand")
    )
      return "Economics";

    return "General Studies";
  }

  async generateQuiz(content, options = {}) {
    const {
      difficulty = "medium",
      questionCount = 10,
      questionTypes = ["mcq", "short"],
      subject = "General",
    } = options;

    // Demo mode: generate sample quiz
    if (!openai) {
      return this.generateDemoQuiz(
        subject,
        questionCount,
        questionTypes,
        difficulty
      );
    }

    const prompt = this.buildQuizPrompt(
      content,
      difficulty,
      questionCount,
      questionTypes,
      subject
    );

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert educator who creates engaging and accurate quiz questions for high school students. Always respond with valid JSON only, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      });

      const quizData = JSON.parse(response.choices[0].message.content);
      return this.validateAndFormatQuiz(quizData);
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw new Error("Failed to generate quiz questions. Please try again.");
    }
  }

  generateDemoQuiz(subject, questionCount, questionTypes, difficulty) {
    // Sample questions by subject
    const questionBanks = {
      Biology: {
        mcq: [
          {
            question:
              "What is the primary function of chlorophyll in photosynthesis?",
            options: [
              "To absorb carbon dioxide",
              "To capture light energy",
              "To release oxygen",
              "To produce glucose",
            ],
            correctAnswer: "To capture light energy",
            explanation:
              "Chlorophyll is the green pigment that captures light energy for photosynthesis.",
            difficulty: "medium",
          },
          {
            question: "Which organelle is known as the powerhouse of the cell?",
            options: [
              "Nucleus",
              "Mitochondria",
              "Ribosome",
              "Endoplasmic reticulum",
            ],
            correctAnswer: "Mitochondria",
            explanation:
              "Mitochondria produce ATP, the energy currency of cells.",
            difficulty: "easy",
          },
        ],
        short: [
          {
            question:
              "Explain the process of cellular respiration in one sentence.",
            correctAnswer:
              "Cellular respiration is the process by which cells break down glucose to produce ATP energy.",
            explanation:
              "This process occurs in the mitochondria and is essential for cellular energy.",
            difficulty: "medium",
          },
        ],
      },
      Calculus: {
        mcq: [
          {
            question: "What is the derivative of x²?",
            options: ["x", "2x", "x²", "2x²"],
            correctAnswer: "2x",
            explanation:
              "Using the power rule: d/dx[x^n] = nx^(n-1), so d/dx[x²] = 2x^(2-1) = 2x.",
            difficulty: "easy",
          },
          {
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
          },
        ],
        short: [
          {
            question: "What does the derivative of a function represent?",
            correctAnswer:
              "The rate of change or slope of the function at any given point.",
            explanation:
              "The derivative gives us the instantaneous rate of change.",
            difficulty: "medium",
          },
        ],
      },
      Chemistry: {
        mcq: [
          {
            question:
              "What type of bond forms between a metal and a non-metal?",
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
          },
          {
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
          },
        ],
        short: [
          {
            question: "What is the octet rule?",
            correctAnswer:
              "Atoms tend to gain, lose, or share electrons to achieve a full outer shell of 8 electrons.",
            explanation:
              "This rule helps predict how atoms will bond with each other.",
            difficulty: "medium",
          },
        ],
      },
      Mathematics: {
        mcq: [
          {
            question: "What is the value of x in the equation 2x + 5 = 11?",
            options: ["x = 2", "x = 3", "x = 4", "x = 6"],
            correctAnswer: "x = 3",
            explanation:
              "Subtract 5 from both sides: 2x = 6, then divide by 2: x = 3.",
            difficulty: "easy",
          },
          {
            question: "Which of the following represents a quadratic equation?",
            options: ["y = mx + b", "y = ax² + bx + c", "y = a/x", "y = a^x"],
            correctAnswer: "y = ax² + bx + c",
            explanation:
              "A quadratic equation has the highest power of the variable as 2.",
            difficulty: "medium",
          },
          {
            question:
              "What is the slope of the line passing through (2,3) and (4,7)?",
            options: ["1", "2", "3", "4"],
            correctAnswer: "2",
            explanation: "Slope = (y₂-y₁)/(x₂-x₁) = (7-3)/(4-2) = 4/2 = 2.",
            difficulty: "medium",
          },
        ],
        short: [
          {
            question: "Solve for x: 3x - 7 = 14",
            correctAnswer: "x = 7",
            explanation:
              "Add 7 to both sides: 3x = 21, then divide by 3: x = 7.",
            difficulty: "easy",
          },
        ],
      },
      Algebra: {
        mcq: [
          {
            question: "What is the value of x in the equation 2x + 5 = 11?",
            options: ["x = 2", "x = 3", "x = 4", "x = 6"],
            correctAnswer: "x = 3",
            explanation:
              "Subtract 5 from both sides: 2x = 6, then divide by 2: x = 3.",
            difficulty: "easy",
          },
          {
            question: "Which property allows us to write a(b + c) = ab + ac?",
            options: ["Commutative", "Associative", "Distributive", "Identity"],
            correctAnswer: "Distributive",
            explanation:
              "The distributive property allows multiplication over addition/subtraction.",
            difficulty: "medium",
          },
        ],
        short: [
          {
            question: "Simplify: 3x + 2x - 5x",
            correctAnswer: "0x or 0",
            explanation: "Combine like terms: (3 + 2 - 5)x = 0x = 0.",
            difficulty: "easy",
          },
        ],
      },
      Physics: {
        mcq: [
          {
            question: "What is the unit of force in the SI system?",
            options: ["Joule", "Newton", "Watt", "Pascal"],
            correctAnswer: "Newton",
            explanation:
              "Force is measured in Newtons (N), named after Isaac Newton.",
            difficulty: "easy",
          },
          {
            question: "According to Newton's second law, F = ?",
            options: ["mv", "ma", "mg", "mgh"],
            correctAnswer: "ma",
            explanation:
              "Newton's second law states that Force = mass × acceleration.",
            difficulty: "medium",
          },
        ],
        short: [
          {
            question: "State Newton's first law of motion.",
            correctAnswer:
              "An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.",
            explanation: "This is also known as the law of inertia.",
            difficulty: "medium",
          },
        ],
      },
    };

    // Get questions for the subject, fallback to similar subject or general questions
    let subjectQuestions = questionBanks[subject];

    // If subject not found, try to find a similar one
    if (!subjectQuestions) {
      const subjectLower = subject.toLowerCase();
      if (
        subjectLower.includes("math") ||
        subjectLower.includes("algebra") ||
        subjectLower.includes("calculus")
      ) {
        subjectQuestions =
          questionBanks["Mathematics"] ||
          questionBanks["Algebra"] ||
          questionBanks["Calculus"];
      } else if (
        subjectLower.includes("bio") ||
        subjectLower.includes("life")
      ) {
        subjectQuestions = questionBanks["Biology"];
      } else if (subjectLower.includes("chem")) {
        subjectQuestions = questionBanks["Chemistry"];
      } else if (subjectLower.includes("phys")) {
        subjectQuestions = questionBanks["Physics"];
      } else {
        subjectQuestions = questionBanks["Mathematics"]; // Default fallback
      }
    }
    const questions = [];

    // Generate requested number of questions
    for (let i = 0; i < Math.min(questionCount, 10); i++) {
      const questionType = questionTypes[i % questionTypes.length];
      const typeQuestions =
        subjectQuestions[questionType] || subjectQuestions.mcq;
      const selectedQuestion = typeQuestions[i % typeQuestions.length];

      questions.push({
        ...selectedQuestion,
        type: questionType,
        topic: subject,
        keywords: selectedQuestion.correctAnswer.split(" ").slice(0, 3),
      });
    }

    return {
      title: `${subject} Quiz`,
      difficulty: difficulty,
      questions: questions,
    };
  }

  buildQuizPrompt(content, difficulty, questionCount, questionTypes, subject) {
    return `
Create a ${difficulty} level quiz with ${questionCount} questions based on the following content for ${subject}.

Content to analyze:
"""
${content}
"""

Requirements:
- Generate ${questionCount} questions
- Include these question types: ${questionTypes.join(", ")}
- Difficulty level: ${difficulty}
- Questions should be appropriate for high school students
- Cover different topics from the content evenly

Question Types:
- mcq: Multiple choice with 4 options (A, B, C, D)
- short: Short answer questions (1-3 sentences)
- fillblank: Fill in the blank questions

Return ONLY a JSON object in this exact format:
{
  "title": "Generated Quiz Title",
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "type": "mcq",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of the correct answer",
      "topic": "Main topic this question covers",
      "difficulty": "${difficulty}",
      "keywords": ["key", "words", "for", "grading"]
    },
    {
      "type": "short",
      "question": "Short answer question?",
      "correctAnswer": "Expected answer",
      "explanation": "What makes a good answer",
      "topic": "Topic name",
      "difficulty": "${difficulty}",
      "keywords": ["important", "keywords", "to", "look", "for"]
    },
    {
      "type": "fillblank",
      "question": "Complete this sentence: The _____ is important because _____",
      "correctAnswer": "concept, it explains the relationship",
      "explanation": "Explanation of the concept",
      "topic": "Topic name",
      "difficulty": "${difficulty}",
      "keywords": ["concept", "relationship"]
    }
  ]
}

Make sure all questions are directly related to the provided content and test understanding rather than memorization.`;
  }

  async evaluateAnswers(questions, userAnswers) {
    const evaluationPrompt = this.buildEvaluationPrompt(questions, userAnswers);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert teacher who provides fair and constructive evaluation of student answers. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: evaluationPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("OpenAI Evaluation Error:", error);
      throw new Error("Failed to evaluate answers. Please try again.");
    }
  }

  buildEvaluationPrompt(questions, userAnswers) {
    const evaluationData = questions.map((q, index) => ({
      questionId: q._id,
      type: q.type,
      question: q.question,
      correctAnswer: q.correctAnswer,
      keywords: q.keywords,
      userAnswer: userAnswers[index]?.answer || "",
      topic: q.topic,
    }));

    return `
Evaluate these student answers and provide detailed feedback:

${JSON.stringify(evaluationData, null, 2)}

For each answer, determine:
1. Is it correct? (for MCQ: exact match, for others: semantic similarity and keyword presence)
2. Give it a score from 0-100
3. Provide specific feedback

Return ONLY this JSON format:
{
  "results": [
    {
      "questionId": "question_id_here",
      "isCorrect": true/false,
      "score": 85,
      "feedback": "Specific feedback for this answer",
      "topic": "topic_name"
    }
  ],
  "overallFeedback": {
    "strengths": ["Areas where student did well"],
    "weaknesses": ["Areas needing improvement"],
    "weakTopics": ["Topics that need more study"],
    "recommendations": ["Specific study recommendations"],
    "nextSteps": "Suggested next steps for improvement"
  },
  "totalScore": 85,
  "percentage": 85
}

Be encouraging but honest in your feedback. Focus on learning and improvement.`;
  }

  async generatePersonalizedFeedback(userHistory, currentQuizResult) {
    const prompt = `
Based on this student's quiz history and current performance, generate personalized study recommendations:

Current Quiz Result:
- Score: ${currentQuizResult.percentage}%
- Weak Topics: ${currentQuizResult.weakTopics.join(", ")}
- Subject: ${currentQuizResult.subject}

Previous Performance:
- Average Score: ${userHistory.averageScore}%
- Total Quizzes: ${userHistory.totalQuizzes}
- Study Streak: ${userHistory.studyStreak}

Generate personalized recommendations in JSON format:
{
  "motivationalMessage": "Encouraging message based on performance",
  "studyPlan": [
    {
      "topic": "Topic to focus on",
      "priority": "high/medium/low",
      "recommendations": ["Specific study actions"],
      "estimatedTime": "30 minutes"
    }
  ],
  "strengthsToMaintain": ["Topics they're doing well in"],
  "nextMilestone": "Next achievement to work towards",
  "studyTips": ["General study tips based on their learning pattern"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a supportive study coach who provides personalized learning guidance for high school students.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("Feedback Generation Error:", error);
      return this.getDefaultFeedback();
    }
  }

  validateAndFormatQuiz(quizData) {
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz format: missing questions array");
    }

    quizData.questions.forEach((q, index) => {
      if (!q.type || !q.question || !q.correctAnswer) {
        throw new Error(`Invalid question format at index ${index}`);
      }

      if (q.type === "mcq" && (!q.options || q.options.length !== 4)) {
        throw new Error(
          `MCQ question at index ${index} must have exactly 4 options`
        );
      }

      // Ensure keywords is an array
      q.keywords = q.keywords || [];
      if (typeof q.keywords === "string") {
        q.keywords = q.keywords.split(",").map((k) => k.trim());
      }
    });

    return quizData;
  }

  getDefaultFeedback() {
    return {
      motivationalMessage:
        "Keep up the great work! Every quiz helps you learn something new.",
      studyPlan: [
        {
          topic: "Review incorrect answers",
          priority: "high",
          recommendations: [
            "Go through each incorrect answer and understand why it was wrong",
          ],
          estimatedTime: "20 minutes",
        },
      ],
      strengthsToMaintain: ["Continue practicing regularly"],
      nextMilestone: "Try another quiz to improve your score",
      studyTips: [
        "Take notes while studying",
        "Practice regularly",
        "Don't be afraid to ask questions",
      ],
    };
  }
}

module.exports = new OpenAIService();
