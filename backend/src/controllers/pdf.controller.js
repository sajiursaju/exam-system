// backend/src/controllers/pdf.controller.js
const pdf = require("pdf-parse");
const asyncHandler = require("../lib/asyncHandler");

exports.parsePdf = asyncHandler(async(req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No PDF file uploaded" });
    }

    try {
        // Extract text from the uploaded PDF buffer
        const pdfData = await pdf(req.file.buffer);
        const text = pdfData.text;

        // Basic parsing logic: Split by question numbers (e.g., "1.", "2.")
        // This is a heuristic and works best if the PDF is formatted cleanly.
        const rawQuestions = text.split(/\n(?=\d+[\.\)])/);

        const parsedQuestions = [];

        rawQuestions.forEach((block) => {
            if (!block.trim()) return;

            const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.length < 2) return;

            // The first line is usually "1. What is the capital of Bangladesh?"
            const questionLine = lines[0].replace(/^\d+[\.\)]\s*/, "");

            const options = [];
            let correctAnswer = "";

            // Look for options (A, B, C, D or a, b, c, d)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];

                // Match lines like "A) Dhaka", "a. Dhaka", or "A. Dhaka"
                const optionMatch = line.match(/^[a-dA-D][\.\)]\s*(.+)/);

                if (optionMatch) {
                    options.push(optionMatch[1].trim());
                }
                // Look for an answer key line like "Answer: A" or "Ans: Dhaka"
                else if (line.toLowerCase().includes("answer") || line.toLowerCase().includes("ans")) {
                    correctAnswer = line.replace(/.*[aA]ns(wer)?:\s*/i, "").trim();
                }
            }

            // If we found a question and at least 2 options, add it to the draft
            if (questionLine && options.length >= 2) {
                parsedQuestions.push({
                    questionText: questionLine,
                    options: options,
                    correctAnswer: correctAnswer || "", // Admin will fix if it's empty
                    marks: 1,
                    questionType: "MCQ",
                });
            }
        });

        res.json({
            totalFound: parsedQuestions.length,
            questions: parsedQuestions
        });

    } catch (error) {
        console.error("PDF Parse Error:", error);
        res.status(500).json({ message: "Failed to parse PDF. Ensure it is a valid text-based PDF." });
    }
});