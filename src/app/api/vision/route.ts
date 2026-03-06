import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { imageBase64, mimeType } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY || "";

        if (!imageBase64 || !mimeType) {
            return NextResponse.json({ error: "Missing image data" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json({
                reply: "⚠️ مفتاح الـ API للرؤية البصرية غير متصل. يرجى تفعيل الإعدادات للبدء في تحليل الصور."
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `
أنت خبير في أمراض الأسماك والاستزراع السمكي (AquaSmart AI Expert).
قم بتحليل الصورة المرفقة لسمكة أو بيئة استزراع سمكي.
حدد أي أمراض ظاهرة (مثل بقع بيضاء، تعفن زعانف، طفيليات) أو أي مشاكل في جودة المياه تظهر في الصورة.
قدم تشخيصاً مفصلاً وتوصيات فورية للعلاج باللغة العربية.
استخدم Markdown للتنسيق (## للعناوين، **للنص المهم**).
        `;

        const imageParts = [
            {
                inlineData: {
                    data: imageBase64,
                    mimeType
                }
            }
        ];

        const result = await model.generateContent([systemPrompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        console.error("Gemini Vision API Error:", error);

        const errorMessage = error.message || "";

        // Handle 429 Rate Limit / Quota Exceeded gracefully
        if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("rate-limits")) {
            return NextResponse.json({
                reply: "⚠️ أهلاً بك! نظراً للضغط الحالي على خوادم الذكاء الاصطناعي (Gemini)، يتوفر التحليل الأساسي فقط في الوقت الحالي. بناءً على المؤشرات العامة لمنصة AquaSmart، يرجى الاستمرار في مراقبة جودة المياه. يرجى الانتظار دقيقة والمحاولة مرة أخرى لتحليل الصورة بدقة."
            }, { status: 200 }); // Return 200 so the frontend displays the message gracefully
        }

        // Handle 403 API Key issues gracefully
        if (errorMessage.includes("403") || errorMessage.includes("API key not valid")) {
            return NextResponse.json({
                reply: "⚠️ عذراً، هناك مشكلة في المصادقة مع خوادم الذكاء الاصطناعي الخاص بالرؤية. يرجى التحقق من صحة مفتاح GEMINI_API_KEY."
            }, { status: 200 });
        }

        return NextResponse.json(
            { reply: "عذراً، حدث إجهاد مؤقت في الشبكة أثناء تحليل الصورة. يرجى المحاولة مرة أخرى بعد قليل." },
            { status: 200 }
        );
    }
}
