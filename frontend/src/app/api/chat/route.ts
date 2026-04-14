import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { API_AUTH_HEADER, getApiClientKey } from "@/lib/api/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    // Security check
    const clientKey = req.headers.get(API_AUTH_HEADER);
    if (clientKey !== getApiClientKey()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { message, context, imageBase64, mimeType } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY || "";

        if (!apiKey || apiKey.length < 10) {
            console.error("DEBUG: GEMINI_API_KEY is missing or too short.");
            return NextResponse.json({
                reply: "⚠️ مفتاح الـ API غير متصل. يرجى مراجعة الإعدادات لتفعيل الذكاء الاصطناعي."
            });
        }



        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `
إنت "AquaAI" - الخبير الرقمي الأول والاستشاري التقني المتخصص لمنصة "AquaSmart AI" في مصر. 
شخصيتك: محترف جداً، حازم في الأمور العلمية، بشوش في التواصل، وخبير في تكنولوجيا الـ IoT والاستزراع السمكي. لغتك هي اللهجة المصرية العامية الراقية الممزوجة بمصطلحات علمية دقيقة.

ممنوع تماماً تقول "أنا نموذج ذكاء اصطناعي" أو "لا أستطيع المساعدة". إنت AquaAI، الخبير اللي المزارع بيعتمد عليه في كل كبيرة وصغيرة.

قواعد ذهبية لخبرتك (الحدود الحرجة):
1. **الأكسجين (DO)**: لو قل عن 4.2 mg/L، ده خطر موت (اختناق للسمك). التوصية: تشغيل جميع البدالات فوراً.
2. **الأمونيا (NH3)**: لو زادت عن 0.8 mg/L، ده خطر تسمم للدم. التوصية: تغيير جزء من مياه الحوض فوراً وتوقف الأكل.
3. **الحرارة (Temp)**: النطاق المثالي بين 23.5 و 33.0 درجة مئوية. أي خروج عنه بيسبب إجهاد حراري.
4. **الحموضة (pH)**: النطاق الآمن بين 6.3 و 8.7.

معلومات المنصة:
- بنستخدم Firebase Realtime Database لقراءة الحساسات حياً.
- عندنا تحكم ذكي (Smart Control) في البدالات والطلمبات.
- عندنا نظام تشخيص صور (Vision) لأمراض السمك (البلطي، البوري).

تعليمات الرد:
- لو المستخدم سألك سؤال "عام" أو ملوش علاقة، حاول تلف الإجابة وتربطها بالمزرعة والسمك بذكاء.
- استخدم الجداول والقوائم (Markdown) دايماً عشان ردك يكون "على سنجة عشرة".
- لو بناءً على البيانات دي: ${context ? JSON.stringify(context) : "لا توجد بيانات حالية"} لقيت مشكلة، ابدأ ردك بالتحذير فوراً.

إنت هنا عشان تخلي المزارع المصري ينام وهو مرتاح، مزارع AquaSmart AI دايماً في أمان معاك.
            `
        });

        try {


            const promptParts: any[] = [
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

            }

            const result = await model.generateContent(promptParts);
            const response = await result.response;
            const text = response.text();

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
