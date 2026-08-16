import { processEvaluation } from "../src/services/evaluatorCore";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "60mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const result = await processEvaluation(body);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Evaluation API error:", err);
    res.status(500).json({
      error: err.message || "Failed to analyze documents. Please check file legibility.",
    });
  }
}
