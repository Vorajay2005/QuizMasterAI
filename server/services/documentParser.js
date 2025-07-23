const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const PDFParser = require("pdf2json");
const pdfPoppler = require("pdf-poppler");
const pdfTextExtract = require("pdf-text-extract");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

class DocumentParser {
  constructor() {
    // Configure multer for file uploads
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        console.log(
          `📁 File upload attempt: ${file.originalname} (${file.mimetype})`
        );

        const allowedTypes = [
          "text/plain",
          "text/markdown",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        // Additional MIME type variations that might be encountered
        const additionalAllowedTypes = [
          "application/vnd.ms-word",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/x-markdown",
        ];

        const allAllowedTypes = [...allowedTypes, ...additionalAllowedTypes];

        if (allAllowedTypes.includes(file.mimetype)) {
          console.log(`✅ File type accepted: ${file.mimetype}`);
          cb(null, true);
        } else {
          console.log(`❌ File type rejected: ${file.mimetype}`);
          cb(
            new Error(
              `Unsupported file type: ${file.mimetype}. Please upload .txt, .md, .pdf, .doc, or .docx files.`
            )
          );
        }
      },
    });
  }

  async parseDocument(file) {
    try {
      console.log(
        `📄 Parsing document: ${file.originalname} (${file.mimetype}) - Size: ${file.size} bytes`
      );

      // Validate file size
      if (!file.buffer || file.buffer.length === 0) {
        throw new Error("File appears to be empty");
      }

      let extractedText = "";

      switch (file.mimetype) {
        case "text/plain":
        case "text/markdown":
        case "text/x-markdown":
          try {
            extractedText = file.buffer.toString("utf-8");
            if (!extractedText.trim()) {
              throw new Error("Text file is empty");
            }
          } catch (encodingError) {
            // Try different encodings if UTF-8 fails
            try {
              extractedText = file.buffer.toString("latin1");
            } catch {
              throw new Error(
                "Unable to read text file - unsupported encoding"
              );
            }
          }
          break;

        case "application/pdf":
          extractedText = await this.parsePDF(file.buffer);
          break;

        case "application/msword":
        case "application/vnd.ms-word":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          extractedText = await this.parseWord(file.buffer);
          break;

        default:
          throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Clean and validate extracted text
      const cleanedText = this.cleanExtractedText(extractedText);

      if (!cleanedText || cleanedText.trim().length === 0) {
        throw new Error(
          "No readable text found in document. The file may be corrupted or contain only images."
        );
      }

      if (cleanedText.length < 50) {
        throw new Error(
          `Document content is too short (${cleanedText.length} characters). Please provide at least 50 characters of meaningful content.`
        );
      }

      const wordCount = cleanedText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      if (wordCount < 10) {
        throw new Error(
          `Document contains too few words (${wordCount}). Please provide at least 10 words of content.`
        );
      }

      console.log(
        `✅ Successfully extracted ${cleanedText.length} characters (${wordCount} words) from ${file.originalname}`
      );

      return {
        success: true,
        content: cleanedText,
        originalName: file.originalname,
        fileType: file.mimetype,
        wordCount: wordCount,
        characterCount: cleanedText.length,
      };
    } catch (error) {
      console.error(
        `❌ Error parsing document ${file?.originalname || "unknown"}:`,
        error.message
      );

      // Provide more specific error messages
      let userFriendlyError = error.message;

      if (error.message.includes("Invalid PDF")) {
        userFriendlyError =
          "The PDF file appears to be corrupted or invalid. Please try a different file.";
      } else if (error.message.includes("Password")) {
        userFriendlyError =
          "Password-protected files are not supported. Please remove the password and try again.";
      } else if (error.message.includes("not a valid zip file")) {
        userFriendlyError =
          "The Word document appears to be corrupted. Please try saving it again or use a different format.";
      } else if (error.message.includes("empty")) {
        userFriendlyError =
          "The document appears to be empty. Please check the file and try again.";
      } else if (error.message.includes("encoding")) {
        userFriendlyError =
          "Unable to read the text file. Please ensure it's saved in UTF-8 encoding.";
      }

      return {
        success: false,
        error: userFriendlyError,
        originalName: file?.originalname || "unknown",
        fileType: file?.mimetype || "unknown",
      };
    }
  }

  async parsePDF(buffer) {
    try {
      console.log(
        `📄 Starting enhanced PDF parsing, buffer size: ${buffer.length} bytes`
      );

      // Method 1: Try pdf-parse with multiple configurations
      const pdfParseResult = await this.tryPdfParse(buffer);
      if (pdfParseResult) {
        console.log(`✅ PDF parsed successfully with pdf-parse`);
        return pdfParseResult;
      }

      // Method 2: Try pdf2json
      const pdf2jsonResult = await this.tryPdf2json(buffer);
      if (pdf2jsonResult) {
        console.log(`✅ PDF parsed successfully with pdf2json`);
        return pdf2jsonResult;
      }

      // Method 3: Try pdf-text-extract
      const textExtractResult = await this.tryPdfTextExtract(buffer);
      if (textExtractResult) {
        console.log(`✅ PDF parsed successfully with pdf-text-extract`);
        return textExtractResult;
      }

      // Method 4: Try pdf-poppler (requires poppler-utils)
      const popplerResult = await this.tryPdfPoppler(buffer);
      if (popplerResult) {
        console.log(`✅ PDF parsed successfully with pdf-poppler`);
        return popplerResult;
      }

      throw new Error("All PDF parsing methods failed");
    } catch (error) {
      console.error(`❌ PDF parsing error:`, error.message);

      // More specific error messages
      if (
        error.message.includes("Invalid PDF") ||
        error.message.includes("Invalid number") ||
        error.message.includes("corrupted")
      ) {
        throw new Error(
          "The PDF file appears to be corrupted or uses an unsupported format. Please try saving the PDF again or converting it to a different format."
        );
      }
      if (
        error.message.includes("Password") ||
        error.message.includes("encrypted")
      ) {
        throw new Error(
          "Password-protected or encrypted PDFs are not supported. Please remove the password protection and try again."
        );
      }
      if (
        error.message.includes("stream") ||
        error.message.includes("decode")
      ) {
        throw new Error(
          "The PDF file has encoding issues. Please try re-saving the PDF or converting it to text format."
        );
      }

      throw new Error(
        `Unable to read the PDF file. This might be due to the PDF being image-based, corrupted, or in an unsupported format. Please try converting to a text file or Word document instead.`
      );
    }
  }

  // Method 1: Enhanced pdf-parse with multiple attempts
  async tryPdfParse(buffer) {
    const attempts = [
      { normalizeWhitespace: false, disableCombineTextItems: false },
      { normalizeWhitespace: true, disableCombineTextItems: true, max: 0 },
      { normalizeWhitespace: true, disableCombineTextItems: false },
      {}, // Default options
    ];

    for (let i = 0; i < attempts.length; i++) {
      try {
        console.log(`📄 pdf-parse attempt ${i + 1}/${attempts.length}`);
        const data = await pdf(buffer, attempts[i]);
        if (data.text && data.text.trim().length > 0) {
          return data.text;
        }
      } catch (error) {
        console.log(`📄 pdf-parse attempt ${i + 1} failed: ${error.message}`);
      }
    }
    return null;
  }

  // Method 2: pdf2json fallback
  async tryPdf2json(buffer) {
    try {
      console.log(`📄 Trying pdf2json...`);
      const text = await this.parsePDFWithPdf2json(buffer);
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (error) {
      console.log(`📄 pdf2json failed: ${error.message}`);
    }
    return null;
  }

  // Method 3: pdf-text-extract
  async tryPdfTextExtract(buffer) {
    return new Promise((resolve) => {
      try {
        console.log(`📄 Trying pdf-text-extract...`);

        // Write buffer to temporary file
        const tempPath = path.join(os.tmpdir(), `temp_pdf_${Date.now()}.pdf`);
        fs.writeFileSync(tempPath, buffer);

        pdfTextExtract(tempPath, (err, pages) => {
          // Clean up temp file
          try {
            fs.unlinkSync(tempPath);
          } catch (cleanupError) {
            console.log(
              `Warning: Could not clean up temp file: ${cleanupError.message}`
            );
          }

          if (err) {
            console.log(`📄 pdf-text-extract failed: ${err.message}`);
            resolve(null);
            return;
          }

          if (pages && pages.length > 0) {
            const text = pages.join("\n").trim();
            if (text.length > 0) {
              resolve(text);
              return;
            }
          }
          resolve(null);
        });
      } catch (error) {
        console.log(`📄 pdf-text-extract setup failed: ${error.message}`);
        resolve(null);
      }
    });
  }

  // Method 4: pdf-poppler (requires poppler-utils to be installed)
  async tryPdfPoppler(buffer) {
    try {
      console.log(`📄 Trying pdf-poppler...`);

      // Write buffer to temporary file
      const tempPath = path.join(os.tmpdir(), `temp_pdf_${Date.now()}.pdf`);
      fs.writeFileSync(tempPath, buffer);

      const options = {
        format: "text",
        out_dir: os.tmpdir(),
        out_prefix: `pdf_text_${Date.now()}`,
        page: null, // Convert all pages
      };

      const result = await pdfPoppler.convert(tempPath, options);

      // Clean up temp PDF file
      try {
        fs.unlinkSync(tempPath);
      } catch (cleanupError) {
        console.log(
          `Warning: Could not clean up temp PDF: ${cleanupError.message}`
        );
      }

      if (result && result.length > 0) {
        // Read the generated text files
        let allText = "";
        for (const textFile of result) {
          try {
            const textContent = fs.readFileSync(textFile, "utf8");
            allText += textContent + "\n";
            // Clean up text file
            fs.unlinkSync(textFile);
          } catch (readError) {
            console.log(
              `Warning: Could not read text file: ${readError.message}`
            );
          }
        }

        if (allText.trim().length > 0) {
          return allText.trim();
        }
      }
    } catch (error) {
      console.log(`📄 pdf-poppler failed: ${error.message}`);
    }
    return null;
  }

  // Fallback PDF parsing method using pdf2json
  async parsePDFWithPdf2json(buffer) {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(`pdf2json error: ${errData.parserError}`));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        try {
          // Extract text from pdf2json data structure
          let text = "";

          if (pdfData.Pages && pdfData.Pages.length > 0) {
            pdfData.Pages.forEach((page) => {
              if (page.Texts && page.Texts.length > 0) {
                page.Texts.forEach((textItem) => {
                  if (textItem.R && textItem.R.length > 0) {
                    textItem.R.forEach((run) => {
                      if (run.T) {
                        // Decode URI component and add to text
                        text += decodeURIComponent(run.T) + " ";
                      }
                    });
                  }
                });
                text += "\n"; // Add line break after each page
              }
            });
          }

          if (text.trim().length === 0) {
            reject(new Error("No text found in PDF"));
          } else {
            resolve(text.trim());
          }
        } catch (error) {
          reject(new Error(`Error processing pdf2json data: ${error.message}`));
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });
  }

  async parseWord(buffer) {
    try {
      // Try to extract with better formatting preservation
      const result = await mammoth.extractRawText({
        buffer,
        options: {
          // Preserve some structure
          includeDefaultStyleMap: true,
        },
      });

      if (result.messages && result.messages.length > 0) {
        const errors = result.messages.filter((m) => m.type === "error");
        const warnings = result.messages.filter((m) => m.type === "warning");

        if (errors.length > 0) {
          console.error("Word parsing errors:", errors);
        }
        if (warnings.length > 0) {
          console.log("Word parsing warnings:", warnings);
        }
      }

      if (!result.value || result.value.trim().length === 0) {
        throw new Error(
          "Word document appears to be empty or contains only images"
        );
      }

      return result.value;
    } catch (error) {
      if (error.message.includes("not a valid zip file")) {
        throw new Error(
          "Invalid Word document. Please ensure the file is not corrupted."
        );
      }
      throw new Error(`Failed to parse Word document: ${error.message}`);
    }
  }

  cleanExtractedText(text) {
    if (!text || typeof text !== "string") {
      return "";
    }

    return (
      text
        // Normalize line breaks first
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Remove control characters except newlines
        .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "")
        // Fix sentences that got split across lines (preserve word boundaries)
        .replace(/([a-z,])\n([a-z])/g, "$1 $2")
        // Remove excessive line breaks but preserve paragraph structure
        .replace(/\n\s*\n\s*\n+/g, "\n\n")
        // Ensure proper spacing after periods
        .replace(/\.([A-Z])/g, ". $1")
        // Fix spacing around colons and other punctuation
        .replace(/:([A-Z])/g, ": $1")
        // Remove excessive whitespace but preserve single spaces
        .replace(/[ \t]+/g, " ")
        // Remove trailing spaces from lines
        .replace(/[ \t]+\n/g, "\n")
        // Remove leading/trailing whitespace from each line
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        // Trim overall whitespace
        .trim()
    );
  }

  // Analyze document structure and extract key information
  analyzeDocumentStructure(content) {
    const analysis = {
      totalWords: 0,
      totalSentences: 0,
      paragraphs: 0,
      headings: [],
      keyTerms: [],
      topics: [],
      difficulty: "medium",
    };

    if (!content || content.length < 10) {
      return analysis;
    }

    // Basic statistics
    const words = content.split(/\s+/).filter((word) => word.length > 0);
    analysis.totalWords = words.length;

    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    analysis.totalSentences = sentences.length;

    const paragraphs = content
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 20);
    analysis.paragraphs = paragraphs.length;

    // Extract potential headings (lines that are short and don't end with punctuation)
    const lines = content.split("\n");
    analysis.headings = lines
      .filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed.length > 5 &&
          trimmed.length < 100 &&
          !trimmed.match(/[.!?]$/) &&
          trimmed.match(/^[A-Z]/)
        );
      })
      .slice(0, 10); // Limit to 10 headings

    // Extract key terms (words that appear frequently and are longer than 4 characters)
    const wordFreq = {};
    const stopWords = new Set([
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
    ]);

    words.forEach((word) => {
      const cleaned = word.toLowerCase().replace(/[^\w]/g, "");
      if (cleaned.length > 4 && !stopWords.has(cleaned)) {
        wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
      }
    });

    analysis.keyTerms = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word, freq]) => ({ word, frequency: freq }));

    // Estimate difficulty based on word length and sentence complexity
    const avgWordLength =
      words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const avgSentenceLength = analysis.totalWords / analysis.totalSentences;

    if (avgWordLength > 6 || avgSentenceLength > 20) {
      analysis.difficulty = "hard";
    } else if (avgWordLength < 4.5 && avgSentenceLength < 12) {
      analysis.difficulty = "easy";
    }

    console.log("📊 Document analysis:", {
      words: analysis.totalWords,
      sentences: analysis.totalSentences,
      paragraphs: analysis.paragraphs,
      headings: analysis.headings.length,
      keyTerms: analysis.keyTerms.length,
      difficulty: analysis.difficulty,
    });

    return analysis;
  }

  // Extract the most important content sections for quiz generation
  extractKeyContent(content, maxLength = 3000) {
    if (!content || content.length <= maxLength) {
      return content;
    }

    // Split into paragraphs
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 50);

    if (paragraphs.length === 0) {
      return content.substring(0, maxLength);
    }

    // Score paragraphs based on content richness
    const scoredParagraphs = paragraphs.map((paragraph) => {
      let score = 0;

      // Prefer paragraphs with definitions
      if (paragraph.match(/\b(is|are|means|defined as|refers to)\b/i)) {
        score += 3;
      }

      // Prefer paragraphs with numbers or data
      if (paragraph.match(/\d+/)) {
        score += 2;
      }

      // Prefer paragraphs with key academic terms
      if (
        paragraph.match(
          /\b(process|method|theory|principle|concept|formula|equation)\b/i
        )
      ) {
        score += 2;
      }

      // Prefer longer paragraphs (more content)
      score += Math.min(paragraph.length / 200, 3);

      return { paragraph, score };
    });

    // Sort by score and take the best paragraphs
    scoredParagraphs.sort((a, b) => b.score - a.score);

    let selectedContent = "";
    for (const { paragraph } of scoredParagraphs) {
      if (selectedContent.length + paragraph.length <= maxLength) {
        selectedContent += paragraph + "\n\n";
      } else {
        break;
      }
    }

    return selectedContent.trim() || content.substring(0, maxLength);
  }
}

module.exports = new DocumentParser();
