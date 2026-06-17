import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Prompt & Itinerary generator API route
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
       res.status(400).json({ error: "Message is required." });
       return;
    }

    const systemInstruction = `You are an expert local travel guide and itinerary planner specializing in Karelia, Russia (and neighboring regions like Ladoga, Onega, Ruskeala, Sortavala, etc.).
Your goal is to suggest personalized, high-quality, and realistic 3-day itineraries in Karelia based on user preferences.
A user will provide their preferences (e.g., active kayaking, relaxation/spa, family with kids, winter/summer, budget, romantic, gourmet, etc.).
Provide a beautiful, highly detailed 3-Day itinerary with daily breakdowns:
- Day 1: Main attraction, highlights, and local cafes.
- Day 2: Outdoor adventure or cultural sights, logistics.
- Day 3: Scenic points, souvenirs, departure tips.
Recommend actual genuine Karelia spots, e.g., Sortavala, Ruskeala Mountain Park, Ladoga Skerries, Kizhi Island, Paanajarvi, Kivach Waterfall, Marsial Waters, and local traditional Finnish/Karelian dishes (like Kalitki, Lohikeitto, smoked trout).
Response format: Ensure your response is friendly, professional, structured in clear Markdown, and written in Russian (unless the user asks in English).
Keep descriptions scenic and inspiring !`;

    // Reconstruct the chat context using chat state
    const chatFeed: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        chatFeed.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Append current message
    chatFeed.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatFeed,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "Извините, не удалось сгенерировать ответ. Пожалуйста, попробуйте еще раз.";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error in server.ts:", error);
    res.status(500).json({
      error: "Ошибка генерации расписания через искусственный интеллект.",
      details: error.message || error,
    });
  }
});

// Start server and handle Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
