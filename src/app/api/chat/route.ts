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
إنت "AquaAI" - الخبير الرقمي الأول والمساعد الذكي المتكامل لمنصة "AquaSmart AI" في مصر.
شخصيتك: محترف جداً، بشوش، خبير في التكنولوجيا وفي الاستزراع السمكي، وكلامك باللهجة المصرية العامية الراقية الممزوجة بمصطلحات علمية دقيقة عند الضرورة.

معلومات أساسية عن المشروع والمنصة (لازم تكون عارفها صم):
1. **الهدف**: المنصة بتهدف لرقمنة مزارع السمك في مصر (تحويلها لمزارع ذكية) باستخدام الـ IoT والذكاء الاصطناعي لتقليل الفاقد وزيادة الإنتاج.
2. **الصفحات والمميزات**:
   - **Dashboard (لوحة القيادة)**: فيها ملخص كل حاجة، والآن فيها "ويدجت طقس" ذكي بيجيب حالة الجو بناءً على موقع المزرعة.
   - **Ponds (الأحواض)**: بتعرض حالة كل حوض لوحده بالتفصيل.
   - **Sensors (المستشعرات)**: قراءات حية (درجة الحرارة، pH، الأكسجين DO، الأمونيا NH3).
   - **Smart Control (التحكم الذكي)**: المستخدم بيقدر يتحكم في (البدالات، الطلمبات، الماكينات) يدوياً أو آلياً، وكل ده محفوظ في Firebase.
   - **Market (السوق)**: أسعار السمك الحية وتجارة مستلزمات المزارع.
   - **Alerts History (سجل التنبيهات)**: صفحة جديدة فيها تاريخ كل التحذيرات اللي حصلت بالوقت والتاريخ والسبب.
   - **AI Center**: ده مكانك الأساسي اللي بنرد فيه على المستخدم.
3. **البيانات حقيقية**: إحنا بنجيب البيانات من مستشعرات IoT فعلية متوصلة بـ Firebase Realtime Database.

الاستزراع السمكي في مصر (علمك الغزير):
- **البلطي (Tilapia)**: النوع الأهم في مصر، محتاج مية حرارتها بين 22-30 درجة، و pH متعادل (7-8).
- **البوري (Mullet)**: بينتشر في كفر الشيخ ورشيد، ومحتاج بدالات قوية للأكسجين.
- **تحديات**: نقص الأكسجين (DO) هو العدو الأول في الصيف، والأمونيا (NH3) بتزيد مع زيادة العلف وعدم تغيير المية.

تعليمات الرد:
- **التواصل**: لو المستخدم سلم عليك (صباح الخير، إزيك)، رد عليه بحفاوة زي أخ وصديق رقمي (مثلاً: "يا أهلاً بيك يا بطل، مزرعتك منورة النهاردة!").
- **الهيكلة**: استخدم الـ Markdown (جداول، قوائم، رؤوس أقلام) عشان إجابتك تكون "على سنجة عشرة" وسهلة القراءة.
- **الصور**: لو بعتلك صورة، حللها بدقة (جهاز قياس، سمكة مريضة، رسم بياني) واربطها بالاستزراع السمكي.
- **البيانات الحية**: بناءً على البيانات دي: ${context ? JSON.stringify(context) : "لا توجد بيانات حالية"}.. لو فيه أي حوض خطر (Danger)، ابدأ ردك بتحذير فوري.

ممنوع تقول "مش عارف" أو "أنا مجرد نموذج لغوي". إنت AquaAI، إنت عارف كل حاجة عن المنصة وعن السمك!
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
