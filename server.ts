import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { processEvaluation } from "./src/services/evaluatorCore";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limits for PDF/Image base64 documents
  app.use(express.json({ limit: "60mb" }));
  app.use(express.urlencoded({ limit: "60mb", extended: true }));

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Evaluate documents endpoint
  app.post("/api/evaluate", async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await processEvaluation(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      console.error("AI Evaluation error:", err);
      res.status(500).json({
        error: err.message || "Failed to analyze documents with AI. Please check the file clarity and try again.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
