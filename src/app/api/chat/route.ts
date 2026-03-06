import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { message, context, imageBase64, mimeType } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY || "";

        if (!apiKey || apiKey.length < 10) {
            console.error("DEBUG: GEMINI_API_KEY is missing or too short.");
            return NextResponse.json({
                reply: "⚠️ مفتاح الـ API غير متصل. يرجى مراجعة الإعدادات لتفعيل الذكاء الاصطناعي."
            });
        }

        console.log("DEBUG: Using API Key starting with:", apiKey.substring(0, 8));

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.5-flash based on API key permissions - excellent for multimodal
        const modelName = "gemini-2.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log("DEBUG: Using model:", modelName);

        const systemPrompt = `
You are "AquaAI", the highly advanced, witty, and perfectly integrated intelligent assistant for the "AquaSmart AI" platform in Egypt.
Your tone is professional, extremely knowledgeable, conversational, and welcoming. You speak in a natural Egyptian Arabic dialect mixed with professional scientific terms when needed.

System Architecture & Project Knowledge (Crucial for you to know):
- You represent the entire "AquaSmart AI" platform.
- You pull real-time sensor data (IoT) directly from "Firebase Realtime Database". 
- The platform contains several pages: Dashboard (وحة القيادة), Ponds (الأحواض), Sensors (المستشعرات), AI Center (مركز الذكاء الاصطناعي - where you live), Smart Control (التحكم الذكي), Reports (التقارير), Alerts (التنبيهات), Market (السوق - for fish prices and trading), and Settings (الإعدادات).
- If the user asks where you get data from, proudly state it's from Firebase IoT sensors connected to the ponds.

Context Provided:
- Current Pond Data from Firebase: ${context ? JSON.stringify(context) : "No live pond data available currently."}

Guidelines:
1. Greet the user back warmly if they say "Good morning", "How are you", "Hello", etc. Act like a true digital companion.
2. Answer absolutely ANY question. If it's about fish farming, diseases, fish types, or sensors, be an expert encyclopedia.
3. If asked about fish prices, market trends, or buying/selling, answer proactively! You know about the "Market (السوق)" page on AquaSmart, so encourage the user to check it for live trading, and give general advice on current Egyptian fish market trends (e.g., Tilapia/Bulti prices, Mullet, etc.).
4. Do NOT say "I cannot answer this" or "this is outside my scope" regarding anything related to the website, fish, markets, or development. You are the ultimate AquaSmart AI.
5. If the user asks about adding a new fish type, explain compatibility, temperature needs, and risks.
6. Use Markdown heavily:
   - ## for main headers
   - **bold** for metrics or important words
   - Emojis for an engaging, premium UX (e.g., 🐟, 📈, 💧, 🤖)
7. If the user uploads an image to the chat, analyze exactly what they asked. If it's a sensor (like a pH meter or temperature sensor), identify it. If it's a fish, identify the breed. If it's a chart or data, interpret it properly.
8. If pond data is provided and looks dangerous (e.g., high Ammonia or Temperature), warn the user immediately.

Goal: Be a 100% complete, flawless AI assistant ("على سنجة عشرة") that knows the website inside-out, chats naturally, intelligently analyzes uploaded images, and impresses any academic evaluating the project. Keep responses relatively concise and fast where appropriate, but detailed when asked technical questions.
        `;

        try {
            console.log("DEBUG: Calling generateContent...");

            const promptParts: any[] = [
                systemPrompt,
                "User Question: " + (message || "قم بتحليل هذه الصورة")
            ];

            // Attach image if provided in the chat payload
            if (imageBase64 && mimeType) {
                promptParts.push({
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType
                    }
                });
                console.log("DEBUG: Interacting with uploaded chat image attached.");
            }

            const result = await model.generateContent(promptParts);
            const response = await result.response;
            const text = response.text();
            console.log("DEBUG: Success! Response length:", text.length);
            return NextResponse.json({ reply: text });
        } catch (genError: any) {
            console.error("DEBUG: generateContent FAILED:", genError);
            throw genError;
        }

    } catch (error: any) {
        console.error("Chat API Error detail:", error);
        return NextResponse.json({
            reply: `عذراً، حدث خطأ أثناء معالجة طلبك: ${error.message || "Unknown error"}`
        });
    }
}
