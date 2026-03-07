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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    } catch (error) {
        console.error("Gemini Vision API Error:", error);
        return NextResponse.json(
            { reply: "عذراً، حدث خطأ في تحليل الصورة. يرجى التأكد من جودة الصورة أو محاولة صورة أخرى." },
            { status: 200 }
        );
    }
}
