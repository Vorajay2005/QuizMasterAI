import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Brain,
  Settings,
  Plus,
  X,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";

import useQuizStore from "../store/quizStore";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";

const CreateQuiz = () => {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const { generateQuiz } = useQuizStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      subject: "",
      difficulty: "medium",
      questionCount: 10,
      questionTypes: ["mcq", "short"],
      timeLimit: 30,
      title: "",
    },
  });

  const watchedQuestionTypes = watch("questionTypes");

  // File upload with react-dropzone
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check if it's a simple text file
      if (file.type === "text/plain" || file.type === "text/markdown") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target.result);
          setStep(2);
        };
        reader.readAsText(file);
      } else {
        // For PDF, DOC, DOCX files, upload to server for parsing
        setIsGenerating(true);
        try {
          const formData = new FormData();
          formData.append("document", file);

          // Use fetch with proper error handling
          const response = await fetch("/api/quiz/upload-document", {
            method: "POST",
            body: formData,
            headers: {
              // Don't set Content-Type for FormData, let browser set it with boundary
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = "Failed to upload document";
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorMessage;
            } catch {
              errorMessage = `Server error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
          }

          const result = await response.json();

          if (result.success) {
            setContent(result.data.content);
            // Auto-fill subject if detected
            if (
              result.data.detectedTopic &&
              result.data.detectedTopic !== "General"
            ) {
              setValue("subject", result.data.detectedTopic);
            }
            // Auto-set difficulty if detected
            if (result.data.analysis?.difficulty) {
              setValue("difficulty", result.data.analysis.difficulty);
            }
            toast.success(
              `Document parsed successfully! Detected topic: ${result.data.detectedTopic}`
            );
            setStep(2);
          } else {
            throw new Error(result.error || "Failed to parse document");
          }
        } catch (error) {
          console.error("Document upload error:", error);

          // Provide more specific error messages
          let errorMessage = "Failed to upload document. Please try again.";

          if (
            error.message.includes("NetworkError") ||
            error.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again.";
          } else if (error.message.includes("timeout")) {
            errorMessage = "Upload timed out. Please try with a smaller file.";
          } else if (
            error.message.includes("413") ||
            error.message.includes("too large")
          ) {
            errorMessage = "File is too large. Maximum size is 10MB.";
          } else if (
            error.message.includes("415") ||
            error.message.includes("Unsupported")
          ) {
            errorMessage =
              "Unsupported file type. Please use .txt, .md, .pdf, .doc, or .docx files.";
          } else if (error.message.includes("400")) {
            // For 400 errors, show the specific error message from the server
            if (error.message.includes("PDF")) {
              errorMessage =
                error.message +
                "\n\n💡 Try converting your PDF to a .txt or .docx file for better compatibility.";
            } else {
              errorMessage =
                error.message ||
                "Invalid file format. Please check your file and try again.";
            }
          } else if (error.message.includes("500")) {
            errorMessage = "Server error. Please try again in a few moments.";
          } else if (error.message) {
            errorMessage = error.message;
          }

          toast.error(errorMessage);
        } finally {
          setIsGenerating(false);
        }
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleTextSubmit = () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }
    setStep(2);
  };

  const onSubmit = async (data) => {
    if (!content.trim()) {
      toast.error("Please provide content for the quiz");
      return;
    }

    setIsGenerating(true);

    try {
      const quizData = {
        title: data.title,
        subject: data.subject,
        content: content,
        difficulty: data.difficulty,
        questionCount: parseInt(data.questionCount),
        questionTypes: data.questionTypes,
        timeLimit: data.timeLimit ? parseInt(data.timeLimit) : null,
      };

      const result = await generateQuiz(quizData);

      if (result.success) {
        toast.success("Quiz generated successfully! 🎉");
        navigate(`/quiz/${result.data.quiz._id}`);
      } else {
        toast.error(result.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQuestionType = (type) => {
    const current = watchedQuestionTypes || [];
    let updated;

    if (current.includes(type)) {
      updated = current.filter((t) => t !== type);
    } else {
      updated = [...current, type];
    }

    if (updated.length === 0) {
      toast.error("At least one question type must be selected");
      return;
    }

    setValue("questionTypes", updated);
  };

  const questionTypeOptions = [
    {
      value: "mcq",
      label: "Multiple Choice",
      description: "Questions with 4 options",
    },
    {
      value: "short",
      label: "Short Answer",
      description: "Brief text responses",
    },
    {
      value: "fillblank",
      label: "Fill in the Blank",
      description: "Complete the sentence",
    },
  ];

  const sampleContents = {
    biology: `Biology Chapter 12: Photosynthesis

Photosynthesis is the process by which plants convert light energy into chemical energy.

Key Components:
- Chloroplasts: Organelles where photosynthesis occurs
- Chlorophyll: Green pigment that captures light energy
- Carbon dioxide: Gas absorbed from the atmosphere
- Water: Absorbed through roots

The Process:
1. Light Dependent Reactions: Occur in the thylakoids
2. Light Independent Reactions (Calvin Cycle): Occur in the stroma

Equation: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2

Factors affecting photosynthesis:`,

    calculus: `Calculus Chapter 3: Derivatives

The derivative of a function represents the rate of change at any given point.

Definition:
f'(x) = lim[h→0] (f(x+h) - f(x))/h

Basic Derivative Rules:
- Power Rule: d/dx[x^n] = nx^(n-1)
- Product Rule: d/dx[uv] = u'v + uv'
- Chain Rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)
- Quotient Rule: d/dx[u/v] = (u'v - uv')/v²

Applications:
- Finding critical points
- Determining concavity
- Optimization problems
- Related rates`,

    chemistry: `Chemistry Chapter 4: Chemical Bonding

Chemical bonds are the forces that hold atoms together in molecules and compounds.

Types of Bonds:
- Ionic Bonds: Transfer of electrons between metal and non-metal
- Covalent Bonds: Sharing of electrons between non-metals
- Metallic Bonds: Sea of electrons in metals

Lewis Structures:
- Represent valence electrons as dots
- Show bonding and lone pairs
- Follow octet rule

VSEPR Theory:
- Valence Shell Electron Pair Repulsion
- Predicts molecular geometry
- Electron pairs repel each other`,
  };

  const [selectedSample, setSelectedSample] = useState("biology");

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" text="" />
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
            {step === 1
              ? "Processing Your Document... 📄"
              : "Creating Your Quiz... 🧠"}
          </h2>
          <p className="text-gray-600 mb-4">
            {step === 1
              ? "Extracting text from your document and analyzing content"
              : "Our AI is analyzing your content and generating personalized questions"}
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader className="animate-spin" size={16} />
            <span>
              {step === 1
                ? "This usually takes 5-15 seconds"
                : "This usually takes 10-30 seconds"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-display mb-2">
            Create Your Quiz
          </h1>
          <p className="text-gray-600">
            Transform your notes into an intelligent quiz in minutes
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center ${
                step >= 1 ? "text-primary-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-primary-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Add Content</span>
            </div>
            <div
              className={`flex-1 h-1 mx-4 ${
                step >= 2 ? "bg-primary-600" : "bg-gray-200"
              } rounded`}
            />
            <div
              className={`flex items-center ${
                step >= 2 ? "text-primary-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-primary-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Configure Quiz</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Upload File */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Upload className="mr-2" size={24} />
                  Upload File
                </h3>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-2">
                    Drag & drop your notes here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: .txt, .md, .pdf, .doc, .docx (max 10MB)
                  </p>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <strong>📄 Enhanced PDF Support:</strong> Multiple parsing
                      methods ensure compatibility with most PDF formats. If a
                      PDF doesn't work, try copying the text and pasting it
                      below.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paste Text */}
              <div className="card">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2" size={24} />
                  Paste Content
                </h3>

                <textarea
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Paste your notes, syllabus, or study material here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                {/* Topic Detection Preview */}
                {content.trim() && content.length > 50 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-sm">
                      <span className="text-blue-600 font-medium">
                        🤖 AI Detected Topic:
                      </span>
                      <span className="ml-2 text-gray-700">
                        AI will auto-detect the specific topic from your content
                        (like "Calculus", "Biology", "World War 2", etc.)
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <select
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                      value={selectedSample}
                      onChange={(e) => setSelectedSample(e.target.value)}
                    >
                      <option value="biology">🧬 Biology Sample</option>
                      <option value="calculus">📐 Calculus Sample</option>
                      <option value="chemistry">⚗️ Chemistry Sample</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setContent(sampleContents[selectedSample])}
                    >
                      Use Sample
                    </Button>
                  </div>
                  <Button onClick={handleTextSubmit} disabled={!content.trim()}>
                    Continue
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="mr-2" size={24} />
                  Quiz Configuration
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                  Back to Content
                </Button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Quiz Title (Optional)"
                    placeholder="e.g., Biology Chapter 12 Quiz"
                    error={errors.title?.message}
                    {...register("title")}
                  />

                  <Input
                    label="Subject"
                    placeholder="e.g., Biology, Math, History"
                    error={errors.subject?.message}
                    {...register("subject", {
                      required: "Subject is required",
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Difficulty Level
                    </label>
                    <select
                      className="input bg-white"
                      {...register("difficulty")}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="adaptive">Adaptive</option>
                    </select>
                  </div>

                  <Input
                    label="Number of Questions"
                    type="number"
                    min="5"
                    max="20"
                    error={errors.questionCount?.message}
                    {...register("questionCount", {
                      required: "Number of questions is required",
                      min: { value: 5, message: "Minimum 5 questions" },
                      max: { value: 20, message: "Maximum 20 questions" },
                    })}
                  />
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Question Types
                  </label>
                  <div className="space-y-3">
                    {questionTypeOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => toggleQuestionType(option.value)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          (watchedQuestionTypes || []).includes(option.value)
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {option.label}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {option.description}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              (watchedQuestionTypes || []).includes(
                                option.value
                              )
                                ? "border-primary-500 bg-primary-500"
                                : "border-gray-300"
                            }`}
                          >
                            {(watchedQuestionTypes || []).includes(
                              option.value
                            ) && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Input
                  label="Time Limit (Optional)"
                  type="number"
                  placeholder="30"
                  min="5"
                  max="120"
                  {...register("timeLimit")}
                />

                <div className="flex items-center justify-between pt-6">
                  <p className="text-sm text-gray-600">
                    Ready to generate your personalized quiz?
                  </p>
                  <Button type="submit" size="lg" isLoading={isGenerating}>
                    Generate Quiz 🚀
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
