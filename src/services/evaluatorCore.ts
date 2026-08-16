import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationReport } from "../types";

export interface DocumentInput {
  data?: string;
  pages?: string[];
  mimeType?: string;
  name?: string;
}

export interface EvaluateRequestPayload {
  questionPaper: DocumentInput;
  answerSheet: DocumentInput;
  answerKey: DocumentInput;
  isDemo?: boolean;
  customSubject?: string;
  customTestName?: string;
}

export function normalizeMime(mime?: string, filename?: string): string {
  let m = (mime || "").toLowerCase().trim();
  if (m === "image/jpg" || m === "image/pjpeg") return "image/jpeg";
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
    if (ext === "png") return "image/png";
    if (ext === "webp") return "image/webp";
    if (ext === "pdf") return "application/pdf";
  }
  if (!m || m === "application/octet-stream") {
    return "application/pdf";
  }
  return m;
}

export function cleanBase64(str: string): string {
  if (!str) return "";
  const parts = str.split(",");
  return parts.length > 1 ? parts[1] : parts[0];
}

export function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export async function processEvaluation(
  payload: EvaluateRequestPayload
): Promise<{ success: boolean; report?: EvaluationReport; isSimulated?: boolean; message?: string }> {
  const {
    questionPaper,
    answerSheet,
    answerKey,
    isDemo,
    customSubject,
    customTestName,
  } = payload;

  if (isDemo) {
    return {
      success: true,
      isSimulated: true,
      message: "Demo evaluated successfully",
    };
  }

  const hasQP = Boolean(questionPaper?.data || (questionPaper?.pages && questionPaper.pages.length > 0));
  const hasAS = Boolean(answerSheet?.data || (answerSheet?.pages && answerSheet.pages.length > 0));
  const hasAK = Boolean(answerKey?.data || (answerKey?.pages && answerKey.pages.length > 0));

  if (!hasQP || !hasAS || !hasAK) {
    throw new Error("All three files (Question Paper, Answer Sheet, Answer Key) are required.");
  }

  const ai = getGenAIClient();

  if (!ai) {
    return {
      success: true,
      isSimulated: true,
      message: "Evaluated using standard evaluation engine (GEMINI_API_KEY not configured in environment)",
    };
  }

  function buildDocParts(doc: DocumentInput, defaultLabel: string): any[] {
    const parts: any[] = [];
    if (doc.pages && doc.pages.length > 0) {
      doc.pages.forEach((pageData, index) => {
        parts.push({ text: `[${defaultLabel} - Page ${index + 1} of ${doc.pages!.length}]` });
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64(pageData),
          },
        });
      });
    } else if (doc.data) {
      const mime = normalizeMime(doc.mimeType, doc.name);
      parts.push({ text: `[${defaultLabel}]` });
      parts.push({
        inlineData: {
          mimeType: mime,
          data: cleanBase64(doc.data),
        },
      });
    }
    return parts;
  }

  const qpParts = buildDocParts(questionPaper, "Document 1: Question Paper");
  const akParts = buildDocParts(answerKey, "Document 2: Answer Key & Model Marking Scheme");
  const asParts = buildDocParts(answerSheet, "Document 3: Student Answer Sheet");

  const systemPrompt = `You are an expert, meticulous Coaching Institute Examination Evaluator and Academic Assessor.
You have been provided with 3 documents:
1. Question Paper (containing questions, numbering, and allocated marks)
2. Answer Key (official model solutions and step-marking scheme)
3. Student Answer Sheet (the student's submitted handwritten or typed answers)

YOUR TASK:
1. Carefully extract and correlate every question from the Question Paper.
2. Read the student's answers (handle handwritten text, diagrams, mathematical formulas, and step calculations with high optical comprehension).
3. Compare each student answer against the Answer Key. For subjective/descriptive questions, evaluate semantic accuracy, conceptual completeness, and logical reasoning rather than requiring verbatim word matching.
4. Detect the student's name, roll number (if present), test name, and subject. If student name is not detected, set is_name_detected to false and student_name to "Student name not detected".
5. Assign fair marks (ai_marks) for each question according to max_marks and step marking.
6. For each question, decide status:
   - "correct": Full marks earned
   - "partial": Partially correct, some marks deducted with explanation
   - "incorrect": Major conceptual mistake or wrong answer (0 marks)
   - "unanswered": Student left the question blank or did not attempt
   - "review_needed": Handwriting is ambiguous, diagram unclear, or boundary case requiring teacher attention
7. Mark confidence level ("high", "medium", "low") and flag is_ambiguous if handwriting/scan quality is unclear.
8. Identify topics and difficulty ("Easy", "Medium", "Hard") for each question.
9. Provide comprehensive diagnostics:
   - overall_performance
   - strengths (3-5 bullet points)
   - weak_areas (2-4 bullet points)
   - topic_analysis
   - difficulty_analysis
   - mistake_analysis (categorized: Conceptual, Calculation, Careless, Misreading, Incomplete, Formula, Unattempted)
   - improvement_recommendations (specific actionable study/practice advice)

CRITICAL REQUIREMENT: In all diagnostic text, reasons, overall_performance, strengths, and recommendations, write in a direct and authoritative academic faculty voice. NEVER include words like "AI", "Artificial Intelligence", "OCR", "model", "algorithm", or "automated". The final report must read completely as a faculty-graded student performance assessment.

Return your response strictly in the JSON format defined by the schema.`;

  const userTextPrompt = `Please evaluate the student's test by analyzing:
- Document 1: Question Paper
- Document 2: Answer Key
- Document 3: Student Answer Sheet

Additional details (if provided by teacher):
- Subject override: ${customSubject || "Auto-detect from documents"}
- Test name override: ${customTestName || "Auto-detect from documents"}

Extract every question systematically and generate the complete assessment.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: [
      ...qpParts,
      ...akParts,
      ...asParts,
      { text: userTextPrompt },
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          student_name: { type: Type.STRING },
          is_name_detected: { type: Type.BOOLEAN },
          roll_number: { type: Type.STRING },
          test_name: { type: Type.STRING },
          subject: { type: Type.STRING },
          institution_name: { type: Type.STRING },
          total_marks: { type: Type.NUMBER },
          marks_obtained: { type: Type.NUMBER },
          percentage: { type: Type.NUMBER },
          accuracy: { type: Type.NUMBER },
          attempted_count: { type: Type.INTEGER },
          total_questions: { type: Type.INTEGER },
          correct_count: { type: Type.INTEGER },
          incorrect_count: { type: Type.INTEGER },
          partial_count: { type: Type.INTEGER },
          unanswered_count: { type: Type.INTEGER },
          review_required_count: { type: Type.INTEGER },
          overall_performance: { type: Type.STRING },
          strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          weak_areas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          improvement_recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question_number: { type: Type.STRING },
                question_text: { type: Type.STRING },
                student_answer: { type: Type.STRING },
                correct_answer: { type: Type.STRING },
                max_marks: { type: Type.NUMBER },
                ai_marks: { type: Type.NUMBER },
                final_marks: { type: Type.NUMBER },
                status: {
                  type: Type.STRING,
                  description: "One of: correct, incorrect, partial, unanswered, review_needed",
                },
                reason: { type: Type.STRING },
                confidence: {
                  type: Type.STRING,
                  description: "One of: high, medium, low",
                },
                is_ambiguous: { type: Type.BOOLEAN },
                topic: { type: Type.STRING },
                difficulty: {
                  type: Type.STRING,
                  description: "One of: Easy, Medium, Hard",
                },
              },
              required: [
                "question_number",
                "question_text",
                "student_answer",
                "correct_answer",
                "max_marks",
                "ai_marks",
                "status",
                "reason",
                "confidence",
              ],
            },
          },
          topic_analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                total_questions: { type: Type.INTEGER },
                correct_questions: { type: Type.INTEGER },
                max_marks: { type: Type.NUMBER },
                obtained_marks: { type: Type.NUMBER },
                accuracy: { type: Type.NUMBER },
              },
              required: ["topic", "total_questions", "correct_questions", "max_marks", "obtained_marks", "accuracy"],
            },
          },
          difficulty_analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                difficulty: { type: Type.STRING },
                total_questions: { type: Type.INTEGER },
                correct_questions: { type: Type.INTEGER },
                max_marks: { type: Type.NUMBER },
                obtained_marks: { type: Type.NUMBER },
                accuracy: { type: Type.NUMBER },
              },
              required: ["difficulty", "total_questions", "correct_questions", "max_marks", "obtained_marks", "accuracy"],
            },
          },
          mistake_analysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                count: { type: Type.INTEGER },
                description: { type: Type.STRING },
                affected_questions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["type", "count", "description", "affected_questions"],
            },
          },
        },
        required: [
          "student_name",
          "is_name_detected",
          "total_marks",
          "marks_obtained",
          "percentage",
          "questions",
          "overall_performance",
          "strengths",
          "weak_areas",
        ],
      },
    },
  });

  let rawJson = (response.text || "").trim();
  if (!rawJson) {
    throw new Error("Empty response from AI model.");
  }

  if (rawJson.startsWith("```")) {
    rawJson = rawJson.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "").trim();
  }

  let parsedData: any;
  try {
    parsedData = JSON.parse(rawJson);
  } catch (parseErr) {
    console.error("Failed to parse AI response JSON:", rawJson.slice(0, 300));
    throw new Error("AI returned malformed assessment data. Please retry evaluation.");
  }

  const formattedQuestions = (parsedData.questions || []).map(
    (q: any, idx: number) => ({
      ...q,
      id: q.id || `q-${idx + 1}`,
      final_marks: typeof q.final_marks === "number" ? q.final_marks : q.ai_marks,
      manually_edited: false,
    })
  );

  const totalMarks = formattedQuestions.reduce(
    (acc: number, q: any) => acc + (q.max_marks || 0),
    0
  ) || parsedData.total_marks || 100;

  const marksObtained = formattedQuestions.reduce(
    (acc: number, q: any) => acc + (q.final_marks || 0),
    0
  );

  const resultReport: EvaluationReport = {
    id: `EVAL-${Date.now().toString(36).toUpperCase()}`,
    student_name: parsedData.student_name || "Student name not detected",
    is_name_detected: Boolean(parsedData.is_name_detected),
    roll_number: parsedData.roll_number || "N/A",
    test_name: customTestName || parsedData.test_name || "Evaluation Assessment",
    subject: customSubject || parsedData.subject || "General Science",
    institution_name: parsedData.institution_name || "Coaching Institute Assessment Center",
    evaluation_date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    total_marks: totalMarks,
    marks_obtained: marksObtained,
    percentage: Math.round((marksObtained / (totalMarks || 1)) * 100 * 10) / 10,
    accuracy: parsedData.accuracy || Math.round((parsedData.correct_count / (formattedQuestions.length || 1)) * 100),
    attempted_count: formattedQuestions.filter((q: any) => q.status !== "unanswered").length,
    total_questions: formattedQuestions.length,
    correct_count: formattedQuestions.filter((q: any) => q.status === "correct").length,
    incorrect_count: formattedQuestions.filter((q: any) => q.status === "incorrect").length,
    partial_count: formattedQuestions.filter((q: any) => q.status === "partial").length,
    unanswered_count: formattedQuestions.filter((q: any) => q.status === "unanswered").length,
    review_required_count: formattedQuestions.filter((q: any) => q.confidence === "low" || q.status === "review_needed").length,
    manually_adjusted_count: 0,
    questions: formattedQuestions,
    overall_performance: parsedData.overall_performance || "Evaluation completed successfully.",
    strengths: parsedData.strengths || [],
    weak_areas: parsedData.weak_areas || [],
    topic_analysis: parsedData.topic_analysis || [],
    difficulty_analysis: parsedData.difficulty_analysis || [],
    mistake_analysis: parsedData.mistake_analysis || [],
    improvement_recommendations: parsedData.improvement_recommendations || [],
    is_approved: false,
  };

  return {
    success: true,
    report: resultReport,
  };
}
