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
    const topicScores = {};

    // Define topic keywords with weights
    const topicKeywords = {
      Biology: [
        { words: ["photosynthesis", "chloroplast", "chlorophyll"], weight: 5 },
        {
          words: ["cell", "cellular", "organism", "dna", "rna", "protein"],
          weight: 4,
        },
        {
          words: ["biology", "biological", "enzyme", "genetics", "evolution"],
          weight: 3,
        },
        { words: ["plant", "animal", "species", "tissue", "organ"], weight: 2 },
      ],
      Chemistry: [
        { words: ["molecule", "molecular", "atom", "atomic"], weight: 5 },
        { words: ["bond", "reaction", "chemical", "compound"], weight: 4 },
        { words: ["chemistry", "element", "ion", "electron"], weight: 3 },
        { words: ["acid", "base", "solution", "catalyst"], weight: 2 },
      ],
      Physics: [
        { words: ["force", "motion", "velocity", "acceleration"], weight: 5 },
        { words: ["energy", "power", "work", "momentum"], weight: 4 },
        { words: ["physics", "wave", "particle", "field"], weight: 3 },
        { words: ["mass", "gravity", "electric", "magnetic"], weight: 2 },
      ],
      Calculus: [
        { words: ["derivative", "integral", "limit", "calculus"], weight: 5 },
        { words: ["function", "differentiation", "integration"], weight: 4 },
        { words: ["slope", "rate", "change", "continuous"], weight: 3 },
      ],
      Algebra: [
        { words: ["polynomial", "quadratic", "linear"], weight: 5 },
        { words: ["equation", "variable", "coefficient"], weight: 3 },
        { words: ["algebra", "algebraic", "solve"], weight: 2 },
      ],
      History: [
        { words: ["war", "battle", "empire", "dynasty"], weight: 5 },
        { words: ["history", "historical", "revolution", "treaty"], weight: 4 },
        {
          words: ["civilization", "culture", "ancient", "medieval"],
          weight: 3,
        },
      ],
      Literature: [
        { words: ["novel", "poem", "poetry", "shakespeare"], weight: 5 },
        { words: ["literature", "literary", "author", "character"], weight: 4 },
        { words: ["theme", "plot", "narrative", "metaphor"], weight: 3 },
      ],
    };

    // Calculate scores for each topic
    Object.entries(topicKeywords).forEach(([topic, keywordGroups]) => {
      let score = 0;
      keywordGroups.forEach(({ words, weight }) => {
        words.forEach((word) => {
          const regex = new RegExp(`\\b${word}\\b`, "gi");
          const matches = text.match(regex);
          if (matches) {
            score += matches.length * weight;
          }
        });
      });
      topicScores[topic] = score;
    });

    // Find the topic with the highest score
    const maxScore = Math.max(...Object.values(topicScores));
    if (maxScore > 0) {
      const detectedTopic = Object.entries(topicScores).find(
        ([topic, score]) => score === maxScore
      )[0];

      console.log(`🎯 Topic detection scores:`, topicScores);
      console.log(`🏆 Detected topic: ${detectedTopic} (score: ${maxScore})`);

      return detectedTopic;
    }

    return "General Studies";
  }

  generateQuestionsFromContent(
    content,
    subject,
    questionCount,
    questionTypes,
    difficulty
  ) {
    console.log("🔍 Analyzing content to generate questions...");
    console.log(
      `📊 Content stats: ${content.length} characters, ${
        content.split(/\s+/).length
      } words`
    );

    // Enhanced content preprocessing
    const preprocessedContent = this.preprocessContent(content);

    // Split content into sentences for analysis
    const sentences = preprocessedContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 15)
      .map((s) => s.trim());

    const words = preprocessedContent.toLowerCase().split(/\s+/);

    console.log(`📝 Found ${sentences.length} sentences for analysis`);

    // Extract key concepts and facts from the content with improved algorithm
    const keyFacts = this.extractKeyFactsEnhanced(
      sentences,
      subject,
      content,
      questionCount
    );
    const questions = [];

    console.log(`📝 Extracted ${keyFacts.length} key facts from content`);

    // Generate questions based on the content
    let questionIndex = 0;
    const typeDistribution = this.distributeQuestionTypes(
      questionTypes,
      questionCount
    );

    console.log("📋 Question type distribution:", typeDistribution);

    for (const [type, count] of Object.entries(typeDistribution)) {
      console.log(`🎯 Generating ${count} questions of type: ${type}`);

      for (let i = 0; i < count && questionIndex < questionCount; i++) {
        const fact = keyFacts[questionIndex % keyFacts.length];
        if (fact) {
          const question = this.createQuestionFromFactEnhanced(
            fact,
            type,
            difficulty,
            subject,
            content
          );
          if (question) {
            questions.push({
              ...question,
              _id: new (require("mongoose").Types.ObjectId)(),
            });
            questionIndex++;
            console.log(
              `✅ Generated question ${questionIndex}: ${question.question.substring(
                0,
                50
              )}...`
            );
          }
        }
      }
    }

    // If we don't have enough questions, fill with enhanced generic ones
    while (questions.length < questionCount) {
      const genericQuestion = this.createEnhancedGenericQuestion(
        content,
        subject,
        difficulty,
        questions.length + 1
      );
      if (genericQuestion) {
        questions.push({
          ...genericQuestion,
          _id: new (require("mongoose").Types.ObjectId)(),
        });
        console.log(
          `✅ Generated generic question ${
            questions.length
          }: ${genericQuestion.question.substring(0, 50)}...`
        );
      } else {
        break;
      }
    }

    console.log(
      `✅ Successfully generated ${questions.length} questions from content`
    );

    return {
      title: `${subject} Quiz`,
      difficulty: difficulty,
      questions: questions.slice(0, questionCount),
    };
  }

  preprocessContent(content) {
    return (
      content
        // Normalize whitespace
        .replace(/\s+/g, " ")
        // Fix common OCR/parsing issues
        .replace(/([a-z])([A-Z])/g, "$1. $2")
        // Ensure proper sentence endings
        .replace(/([a-z])\s*\n\s*([A-Z])/g, "$1. $2")
        .trim()
    );
  }

  extractKeyFactsEnhanced(sentences, subject, fullContent, questionCount = 10) {
    const facts = [];
    const subjectKeywords = this.getSubjectKeywords(subject);

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length < 20) return;

      let score = 0;
      let factType = "general";

      // Score based on content patterns
      if (trimmed.match(/\b(is|are|means|defined as|refers to|known as)\b/i)) {
        score += 5;
        factType = "definition";
      }

      if (
        trimmed.match(/\b(process|method|procedure|steps|stages|phases)\b/i)
      ) {
        score += 4;
        factType = "process";
      }

      if (trimmed.match(/\d+/)) {
        score += 3;
        factType = "numerical";
      }

      if (
        trimmed.match(/\b(because|since|due to|results in|causes|leads to)\b/i)
      ) {
        score += 3;
        factType = "causal";
      }

      if (trimmed.match(/\b(formula|equation|theorem|law|principle)\b/i)) {
        score += 4;
        factType = "formula";
      }

      // Boost score for subject-relevant content
      subjectKeywords.forEach((keyword) => {
        if (trimmed.toLowerCase().includes(keyword.toLowerCase())) {
          score += 2;
        }
      });

      // Prefer longer, more informative sentences
      if (trimmed.length > 80) score += 2;
      if (trimmed.length > 120) score += 1;

      if (score > 2) {
        facts.push({
          text: trimmed,
          index: index,
          type: factType,
          score: score,
          keywords: this.extractKeywords(trimmed),
        });
      }
    });

    // Sort by score and return top facts
    return facts
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(20, questionCount * 2));
  }

  getSubjectKeywords(subject) {
    const keywordMap = {
      Biology: [
        "cell",
        "organism",
        "DNA",
        "protein",
        "enzyme",
        "photosynthesis",
        "evolution",
        "genetics",
      ],
      Chemistry: [
        "atom",
        "molecule",
        "bond",
        "reaction",
        "element",
        "compound",
        "ion",
        "electron",
      ],
      Physics: [
        "force",
        "energy",
        "motion",
        "wave",
        "particle",
        "field",
        "mass",
        "velocity",
      ],
      Mathematics: [
        "equation",
        "function",
        "variable",
        "theorem",
        "proof",
        "formula",
        "graph",
      ],
      History: [
        "war",
        "empire",
        "revolution",
        "treaty",
        "dynasty",
        "civilization",
        "culture",
      ],
      Literature: [
        "character",
        "theme",
        "plot",
        "metaphor",
        "symbolism",
        "narrative",
        "author",
      ],
    };

    return keywordMap[subject] || keywordMap.Biology;
  }

  extractKeyFacts(sentences, subject) {
    const facts = [];

    sentences.forEach((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 20) {
        // Look for sentences that contain definitions, explanations, or important facts
        if (
          trimmed.includes(" is ") ||
          trimmed.includes(" are ") ||
          trimmed.includes(" means ") ||
          trimmed.includes(" defined as ") ||
          trimmed.includes(" refers to ") ||
          trimmed.includes(" occurs when ") ||
          trimmed.includes(" happens when ") ||
          trimmed.includes(" results in ") ||
          trimmed.includes(" causes ") ||
          trimmed.includes(" leads to ")
        ) {
          facts.push({
            text: trimmed,
            index: index,
            type: "definition",
          });
        }
        // Look for numerical facts or measurements
        else if (/\d+/.test(trimmed)) {
          facts.push({
            text: trimmed,
            index: index,
            type: "numerical",
          });
        }
        // Look for process descriptions
        else if (
          trimmed.includes(" process ") ||
          trimmed.includes(" method ") ||
          trimmed.includes(" procedure ") ||
          trimmed.includes(" steps ")
        ) {
          facts.push({
            text: trimmed,
            index: index,
            type: "process",
          });
        }
        // General important statements
        else if (trimmed.length > 30) {
          facts.push({
            text: trimmed,
            index: index,
            type: "general",
          });
        }
      }
    });

    return facts.slice(0, 20); // Limit to 20 key facts
  }

  createQuestionFromFact(fact, questionType, difficulty, subject) {
    const text = fact.text;

    if (questionType === "mcq") {
      return this.createMCQFromFact(fact, difficulty, subject);
    } else if (questionType === "short") {
      return this.createShortAnswerFromFact(fact, difficulty, subject);
    } else if (questionType === "fillblank") {
      return this.createFillBlankFromFact(fact, difficulty, subject);
    }

    return null;
  }

  createQuestionFromFactEnhanced(
    fact,
    questionType,
    difficulty,
    subject,
    fullContent
  ) {
    if (questionType === "mcq") {
      return this.createMCQFromFactEnhanced(
        fact,
        difficulty,
        subject,
        fullContent
      );
    } else if (questionType === "short") {
      return this.createShortAnswerFromFactEnhanced(
        fact,
        difficulty,
        subject,
        fullContent
      );
    } else if (questionType === "fillblank") {
      return this.createFillBlankFromFactEnhanced(
        fact,
        difficulty,
        subject,
        fullContent
      );
    }

    return null;
  }

  createMCQFromFactEnhanced(fact, difficulty, subject, fullContent) {
    const text = fact.text;

    // Enhanced MCQ generation based on fact type
    if (fact.type === "definition" && text.includes(" is ")) {
      const parts = text.split(" is ");
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts[1].trim().replace(/[.!?]*$/, "");

        const options = [
          definition,
          this.generateContextualDistractor(definition, subject, fullContent),
          this.generateContextualDistractor(definition, subject, fullContent),
          this.generateContextualDistractor(definition, subject, fullContent),
        ];

        // Shuffle options
        const shuffledOptions = this.shuffleArray(options);

        return {
          type: "mcq",
          question: `According to the content, what is ${term}?`,
          options: shuffledOptions,
          correctAnswer: definition,
          explanation: `Based on the provided content: "${text}"`,
          difficulty: difficulty,
          topic: subject,
          keywords: this.extractKeywords(text),
        };
      }
    }

    if (fact.type === "numerical") {
      // Extract numbers and create questions about them
      const numbers = text.match(/\d+(?:\.\d+)?/g);
      if (numbers && numbers.length > 0) {
        const number = numbers[0];
        const context = text.replace(number, "______");

        const wrongNumbers = this.generateNumericalDistractors(number);
        const options = [number, ...wrongNumbers];
        const shuffledOptions = this.shuffleArray(options);

        return {
          type: "mcq",
          question: `According to the content, what number completes this statement: "${context}"?`,
          options: shuffledOptions,
          correctAnswer: number,
          explanation: `The correct number is found in: "${text}"`,
          difficulty: difficulty,
          topic: subject,
          keywords: this.extractKeywords(text),
        };
      }
    }

    // Generic enhanced MCQ
    const keywords = this.extractKeywords(text);
    const mainKeyword = keywords[0] || "concept";

    const options = [
      text.length > 100 ? text.substring(0, 100) + "..." : text,
      this.generateContextualDistractor(text, subject, fullContent),
      this.generateContextualDistractor(text, subject, fullContent),
      this.generateContextualDistractor(text, subject, fullContent),
    ];

    return {
      type: "mcq",
      question: `Which statement about ${mainKeyword} is correct according to the content?`,
      options: this.shuffleArray(options),
      correctAnswer: text.length > 100 ? text.substring(0, 100) + "..." : text,
      explanation: `This information is directly stated in the provided content.`,
      difficulty: difficulty,
      topic: subject,
      keywords: keywords,
    };
  }

  createShortAnswerFromFactEnhanced(fact, difficulty, subject, fullContent) {
    const text = fact.text;

    if (fact.type === "definition" && text.includes(" is ")) {
      const parts = text.split(" is ");
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts[1].trim();

        return {
          type: "short",
          question: `Based on the content, define or explain ${term}.`,
          correctAnswer: definition,
          explanation: `This definition is found in the content: "${text}"`,
          difficulty: difficulty,
          topic: subject,
          keywords: this.extractKeywords(text),
        };
      }
    }

    if (fact.type === "process") {
      const keywords = this.extractKeywords(text);
      const processKeyword =
        keywords.find((k) =>
          ["process", "method", "procedure", "steps"].some((p) =>
            text.toLowerCase().includes(p)
          )
        ) || keywords[0];

      return {
        type: "short",
        question: `Describe the ${processKeyword} mentioned in the content.`,
        correctAnswer:
          text.length > 200 ? text.substring(0, 200) + "..." : text,
        explanation: `This process is described in the content.`,
        difficulty: difficulty,
        topic: subject,
        keywords: keywords,
      };
    }

    if (fact.type === "causal") {
      return {
        type: "short",
        question: `Explain the cause and effect relationship described in the content.`,
        correctAnswer:
          text.length > 200 ? text.substring(0, 200) + "..." : text,
        explanation: `This relationship is explained in the content.`,
        difficulty: difficulty,
        topic: subject,
        keywords: this.extractKeywords(text),
      };
    }

    // Generic enhanced short answer
    const keywords = this.extractKeywords(text);
    const mainKeyword = keywords[0] || "concept";

    return {
      type: "short",
      question: `Explain ${mainKeyword} based on the provided content.`,
      correctAnswer: text.length > 200 ? text.substring(0, 200) + "..." : text,
      explanation: `This explanation is based on the provided content.`,
      difficulty: difficulty,
      topic: subject,
      keywords: keywords,
    };
  }

  createFillBlankFromFactEnhanced(fact, difficulty, subject, fullContent) {
    const text = fact.text;
    const words = text.split(" ");

    if (words.length < 6) return null;

    // Find the most important word to blank out
    const keywords = fact.keywords || this.extractKeywords(text);
    const subjectKeywords = this.getSubjectKeywords(subject);

    // Prioritize subject-specific keywords
    let wordToBlank = null;
    for (const keyword of keywords) {
      if (
        subjectKeywords.some((sk) =>
          sk.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        const regex = new RegExp(`\\b${keyword}\\b`, "i");
        if (text.match(regex)) {
          wordToBlank = text.match(regex)[0];
          break;
        }
      }
    }

    // Fallback to any important word
    if (!wordToBlank) {
      const importantWords = words.filter(
        (word) =>
          word.length > 4 &&
          ![
            "that",
            "this",
            "with",
            "from",
            "they",
            "have",
            "been",
            "were",
            "will",
            "when",
            "where",
            "what",
            "which",
            "also",
            "such",
            "more",
            "most",
            "some",
            "many",
            "much",
            "very",
            "than",
            "then",
            "them",
            "these",
            "those",
            "there",
            "their",
            "would",
            "could",
            "should",
          ].includes(word.toLowerCase())
      );

      if (importantWords.length === 0) return null;
      wordToBlank =
        importantWords[Math.floor(Math.random() * importantWords.length)];
    }

    const questionText = text.replace(
      new RegExp(`\\b${wordToBlank}\\b`, "i"),
      "______"
    );

    return {
      type: "fillblank",
      question: `Fill in the blank: ${questionText}`,
      correctAnswer: wordToBlank,
      explanation: `The complete sentence is: "${text}"`,
      difficulty: difficulty,
      topic: subject,
      keywords: this.extractKeywords(text),
    };
  }

  createEnhancedGenericQuestion(content, subject, difficulty, questionNumber) {
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 30);

    if (sentences.length === 0) return null;

    // Select a sentence that hasn't been used yet (based on question number)
    const sentenceIndex = (questionNumber - 1) % sentences.length;
    const selectedSentence = sentences[sentenceIndex].trim();
    const keywords = this.extractKeywords(selectedSentence);

    const questionTemplates = [
      {
        type: "short",
        question: `Based on the content, explain the main concept discussed in this statement: "${selectedSentence.substring(
          0,
          80
        )}..."`,
        answer:
          selectedSentence.length > 150
            ? selectedSentence.substring(0, 150) + "..."
            : selectedSentence,
      },
      {
        type: "short",
        question: `What is the significance of ${
          keywords[0] || "the concept"
        } mentioned in the content?`,
        answer:
          selectedSentence.length > 150
            ? selectedSentence.substring(0, 150) + "..."
            : selectedSentence,
      },
      {
        type: "short",
        question: `Summarize the key information about ${
          keywords[0] || "the topic"
        } from the provided content.`,
        answer:
          selectedSentence.length > 150
            ? selectedSentence.substring(0, 150) + "..."
            : selectedSentence,
      },
    ];

    const template =
      questionTemplates[questionNumber % questionTemplates.length];

    return {
      type: template.type,
      question: template.question,
      correctAnswer: template.answer,
      explanation: "This answer is based on the provided content.",
      difficulty: difficulty,
      topic: subject,
      keywords: keywords,
    };
  }

  generateContextualDistractor(correctAnswer, subject, fullContent) {
    // Generate more contextual distractors based on the full content
    const sentences = fullContent
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    const randomSentence =
      sentences[Math.floor(Math.random() * sentences.length)];

    if (randomSentence && randomSentence.trim() !== correctAnswer.trim()) {
      return randomSentence.trim().length > 100
        ? randomSentence.trim().substring(0, 100) + "..."
        : randomSentence.trim();
    }

    // Fallback to subject-specific distractors
    return this.generateDistractor(correctAnswer, subject);
  }

  generateNumericalDistractors(correctNumber) {
    const num = parseFloat(correctNumber);
    const distractors = [];

    // Generate plausible wrong numbers
    distractors.push((num * 2).toString());
    distractors.push((num / 2).toString());
    distractors.push((num + 10).toString());

    return distractors.slice(0, 3);
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  createMCQFromFact(fact, difficulty, subject) {
    const text = fact.text;

    // Try to create a question based on the fact type
    if (fact.type === "definition" && text.includes(" is ")) {
      const parts = text.split(" is ");
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts[1].trim();

        return {
          type: "mcq",
          question: `What is ${term}?`,
          options: [
            definition,
            this.generateDistractor(definition, subject),
            this.generateDistractor(definition, subject),
            this.generateDistractor(definition, subject),
          ].sort(() => Math.random() - 0.5),
          correctAnswer: definition,
          explanation: `Based on the provided content: ${text}`,
          difficulty: difficulty,
          topic: subject,
          keywords: this.extractKeywords(text),
        };
      }
    }

    // Generic question from any fact
    const keywords = this.extractKeywords(text);
    const mainKeyword = keywords[0] || "concept";

    return {
      type: "mcq",
      question: `According to the content, what is true about ${mainKeyword}?`,
      options: [
        text.length > 80 ? text.substring(0, 80) + "..." : text,
        this.generateDistractor(text, subject),
        this.generateDistractor(text, subject),
        this.generateDistractor(text, subject),
      ].sort(() => Math.random() - 0.5),
      correctAnswer: text.length > 80 ? text.substring(0, 80) + "..." : text,
      explanation: `This information is directly stated in the provided content.`,
      difficulty: difficulty,
      topic: subject,
      keywords: keywords,
    };
  }

  createShortAnswerFromFact(fact, difficulty, subject) {
    const text = fact.text;

    if (fact.type === "definition" && text.includes(" is ")) {
      const parts = text.split(" is ");
      if (parts.length >= 2) {
        const term = parts[0].trim();
        const definition = parts[1].trim();

        return {
          type: "short",
          question: `Define ${term} based on the provided content.`,
          correctAnswer: definition,
          explanation: `Based on the content: ${text}`,
          difficulty: difficulty,
          topic: subject,
          keywords: this.extractKeywords(text),
        };
      }
    }

    // Generic short answer question
    const keywords = this.extractKeywords(text);
    const mainKeyword = keywords[0] || "concept";

    return {
      type: "short",
      question: `Explain ${mainKeyword} based on the provided content.`,
      correctAnswer: text.length > 150 ? text.substring(0, 150) + "..." : text,
      explanation: `This explanation is based on the provided content.`,
      difficulty: difficulty,
      topic: subject,
      keywords: keywords,
    };
  }

  createFillBlankFromFact(fact, difficulty, subject) {
    const text = fact.text;
    const words = text.split(" ");

    if (words.length < 5) return null;

    // Find a good word to blank out (avoid common words)
    const importantWords = words.filter(
      (word) =>
        word.length > 4 &&
        ![
          "that",
          "this",
          "with",
          "from",
          "they",
          "have",
          "been",
          "were",
          "will",
        ].includes(word.toLowerCase())
    );

    if (importantWords.length === 0) return null;

    const wordToBlank =
      importantWords[Math.floor(Math.random() * importantWords.length)];
    const questionText = text.replace(
      new RegExp(`\\b${wordToBlank}\\b`, "i"),
      "______"
    );

    return {
      type: "fillblank",
      question: `Fill in the blank: ${questionText}`,
      correctAnswer: wordToBlank,
      explanation: `The complete sentence is: ${text}`,
      difficulty: difficulty,
      topic: subject,
      keywords: this.extractKeywords(text),
    };
  }

  generateDistractor(correctAnswer, subject) {
    // Generate plausible but incorrect answers
    const distractors = {
      Biology: [
        "cellular metabolism process",
        "genetic transcription mechanism",
        "enzymatic reaction pathway",
        "molecular binding process",
      ],
      Physics: [
        "electromagnetic field interaction",
        "quantum mechanical effect",
        "thermodynamic equilibrium state",
        "gravitational force influence",
      ],
      Chemistry: [
        "chemical bonding mechanism",
        "molecular orbital theory",
        "catalytic reaction process",
        "ionic compound formation",
      ],
      Mathematics: [
        "algebraic equation solution",
        "geometric transformation",
        "statistical distribution",
        "calculus optimization",
      ],
    };

    const subjectDistractors = distractors[subject] || distractors.Biology;
    return subjectDistractors[
      Math.floor(Math.random() * subjectDistractors.length)
    ];
  }

  createGenericQuestion(content, subject, difficulty) {
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    if (sentences.length === 0) return null;

    const randomSentence =
      sentences[Math.floor(Math.random() * sentences.length)].trim();
    const keywords = this.extractKeywords(randomSentence);

    return {
      type: "short",
      question: `Based on the content, explain the main concept discussed.`,
      correctAnswer:
        randomSentence.length > 150
          ? randomSentence.substring(0, 150) + "..."
          : randomSentence,
      explanation: "This answer is based on the provided content.",
      difficulty: difficulty,
      topic: subject,
      keywords: keywords,
    };
  }

  distributeQuestionTypes(questionTypes, totalCount) {
    const distribution = {};
    const typesCount = questionTypes.length;
    const baseCount = Math.floor(totalCount / typesCount);
    const remainder = totalCount % typesCount;

    questionTypes.forEach((type, index) => {
      distribution[type] = baseCount + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  extractKeywords(text) {
    // Simple keyword extraction - get important words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 3 &&
          ![
            "this",
            "that",
            "with",
            "from",
            "they",
            "have",
            "been",
            "were",
            "will",
            "when",
            "where",
            "what",
            "which",
            "also",
            "such",
            "more",
            "most",
            "some",
            "many",
            "much",
            "very",
            "than",
            "then",
            "them",
            "these",
            "those",
          ].includes(word)
      );

    // Return first 5 unique keywords
    return [...new Set(words)].slice(0, 5);
  }

  async generateQuiz(content, options = {}) {
    console.log("🤖 generateQuiz called with:", {
      content: content?.substring(0, 50),
      options,
    });

    const {
      difficulty = "medium",
      questionCount = 10,
      questionTypes = ["mcq", "short"],
      subject = "General",
    } = options;

    // Demo mode: generate sample quiz
    if (!openai) {
      console.log("🎯 OpenAI not configured, using demo mode");
      try {
        const result = this.generateDemoQuiz(
          subject,
          questionCount,
          questionTypes,
          difficulty,
          content
        );
        console.log(
          "✅ Demo quiz generated successfully:",
          result ? "has data" : "no data"
        );
        return result;
      } catch (error) {
        console.error("❌ Error in generateDemoQuiz:", error);
        throw error;
      }
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

  generateDemoQuiz(
    subject,
    questionCount,
    questionTypes,
    difficulty,
    content = null
  ) {
    const mongoose = require("mongoose");

    console.log("🎯 generateDemoQuiz called with:", {
      subject,
      questionCount,
      questionTypes,
      difficulty,
      hasContent: !!content,
      contentPreview: content
        ? content.substring(0, 100) + "..."
        : "No content",
    });

    // If content is provided, try to generate questions from the content
    if (content && content.trim().length > 50) {
      console.log("📄 Generating questions from provided content...");
      return this.generateQuestionsFromContent(
        content,
        subject,
        questionCount,
        questionTypes,
        difficulty
      );
    }

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
        subjectQuestions = questionBanks["Biology"]; // Default fallback to Biology
      }
    }

    // Final safety check - if still no questions, use Biology
    if (!subjectQuestions) {
      console.warn(
        `No questions found for subject ${subject}, using Biology as fallback`
      );
      subjectQuestions = questionBanks["Biology"];
    }
    const questions = [];

    // Generate requested number of questions
    console.log("Starting question generation loop:", {
      questionCount,
      questionTypes,
      subjectQuestionsKeys: Object.keys(subjectQuestions),
    });

    for (let i = 0; i < Math.min(questionCount, 10); i++) {
      console.log(`Generating question ${i + 1}/${questionCount}`);

      const questionType = questionTypes[i % questionTypes.length];
      console.log(`Question type: ${questionType}`);

      const typeQuestions =
        subjectQuestions[questionType] || subjectQuestions.mcq || [];
      console.log(`Type questions length: ${typeQuestions?.length}`);

      // If no questions available for this type, skip
      if (!typeQuestions || typeQuestions.length === 0) {
        console.warn(
          `No questions available for type ${questionType} in subject ${subject}`
        );
        continue;
      }

      const selectedQuestion = typeQuestions[i % typeQuestions.length];
      console.log(
        `Selected question: ${selectedQuestion?.question?.substring(0, 50)}...`
      );

      // Ensure proper structure for MongoDB
      const question = {
        type: questionType,
        question: selectedQuestion.question,
        correctAnswer: selectedQuestion.correctAnswer,
        explanation: selectedQuestion.explanation || "",
        difficulty: selectedQuestion.difficulty || difficulty,
        topic: subject,
        keywords: selectedQuestion.correctAnswer
          ? selectedQuestion.correctAnswer.split(" ").slice(0, 3)
          : [],
      };

      // Add options only for MCQ questions
      if (questionType === "mcq" && selectedQuestion.options) {
        question.options = selectedQuestion.options;
      }

      questions.push(question);
    }

    const result = {
      title: `${subject} Quiz`,
      difficulty: difficulty,
      questions: questions,
    };

    console.log("generateDemoQuiz returning:", {
      title: result.title,
      difficulty: result.difficulty,
      questionsCount: result.questions?.length,
      firstQuestion: result.questions?.[0],
    });

    return result;
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
    // Demo mode: use local evaluation when OpenAI is not configured
    if (!openai) {
      console.log("🧪 Using demo evaluation (OpenAI not configured)");
      return this.evaluateAnswersDemo(questions, userAnswers);
    }

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
      console.log("🔄 Falling back to demo evaluation");
      return this.evaluateAnswersDemo(questions, userAnswers);
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

  // Demo evaluation method for when OpenAI is not configured
  evaluateAnswersDemo(questions, userAnswers) {
    console.log("🧪 Running demo evaluation for quiz submission");

    // Create a map of user answers by question ID
    const answerMap = {};
    userAnswers.forEach((ans) => {
      answerMap[ans.questionId] = ans.answer;
    });

    let correctCount = 0;
    const results = [];

    // Evaluate each question using the same logic as demo quizzes
    questions.forEach((question) => {
      const userAnswer = answerMap[question._id.toString()] || "";
      const correctAnswer = question.correctAnswer;

      // Use the evaluateAnswer helper function from the route
      const isCorrect = this.evaluateAnswerDemo(
        userAnswer,
        correctAnswer,
        question.type
      );

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: question._id.toString(),
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
        feedback: isCorrect
          ? "Correct! Well done."
          : `Incorrect. The correct answer is: ${correctAnswer}`,
      });
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Generate basic feedback based on score
    let overallFeedback;
    let strengths = [];
    let weaknesses = [];
    let recommendations = [];

    if (percentage >= 80) {
      overallFeedback =
        "Excellent work! You have a strong understanding of the material.";
      strengths = ["Strong grasp of key concepts", "Consistent performance"];
      recommendations = [
        "Continue practicing to maintain your level",
        "Try more challenging topics",
      ];
    } else if (percentage >= 60) {
      overallFeedback = "Good job! Keep practicing to improve further.";
      strengths = ["Shows understanding of basic concepts"];
      weaknesses = ["Some areas need more practice"];
      recommendations = [
        "Review incorrect answers carefully",
        "Focus on weak areas",
      ];
    } else {
      overallFeedback = "Keep studying! Review the material and try again.";
      weaknesses = ["Needs more practice with the material"];
      recommendations = [
        "Review the study material thoroughly",
        "Take more practice quizzes",
      ];
    }

    return {
      totalScore: correctCount,
      overallFeedback,
      strengths,
      weaknesses,
      recommendations,
      results,
    };
  }

  // Helper method to evaluate individual answers (same logic as in quiz route)
  evaluateAnswerDemo(userAnswer, correctAnswer, questionType) {
    const userNormalized = userAnswer.trim().toLowerCase();
    const correctNormalized = correctAnswer.trim().toLowerCase();

    if (questionType === "mcq") {
      // Exact match for multiple choice
      return userNormalized === correctNormalized;
    } else if (questionType === "short" || questionType === "fillblank") {
      // Empty answers are always wrong
      if (userNormalized === "") {
        return false;
      }

      // For short answers, check if the user answer contains the key concepts
      // This is a simplified version - in production you'd want more sophisticated matching
      if (userNormalized === correctNormalized) {
        return true;
      }

      // Check if user answer contains the correct answer as a substring
      if (
        userNormalized.includes(correctNormalized) ||
        correctNormalized.includes(userNormalized)
      ) {
        return true;
      }

      return false;
    }

    return false;
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
