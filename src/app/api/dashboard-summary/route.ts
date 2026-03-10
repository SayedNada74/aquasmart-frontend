import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    fallback: { ar: string; en: string };
    context: {
      totalPonds: number;
      activeAlerts: number;
      scheduledTasks: number;
      globalAqi: number;
      topIssue?: string;
    };
  };

  const fallback = body.fallback;
  const useGemini = process.env.ENABLE_DASHBOARD_AI_SUMMARY === "true";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!useGemini || !apiKey) {
    return NextResponse.json(fallback);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are generating a very short farm dashboard summary.
Return strict JSON with keys "ar" and "en".
Keep each value to one concise sentence.
Context:
- Total ponds: ${body.context.totalPonds}
- Active alerts: ${body.context.activeAlerts}
- Scheduled tasks: ${body.context.scheduledTasks}
- Farm AQI: ${body.context.globalAqi}
- Top issue: ${body.context.topIssue || "none"}
Fallback:
- Arabic: ${fallback.ar}
- English: ${fallback.en}
If the context is not strong enough, reuse the fallback idea in better wording.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const normalized = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(normalized) as { ar?: string; en?: string };

    if (!parsed.ar || !parsed.en) {
      throw new Error("Invalid summary payload");
    }

    return NextResponse.json({
      ar: parsed.ar,
      en: parsed.en,
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
