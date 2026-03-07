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
إنت "AquaAI" - الخبير الرقمي المتخصص في تشخيص أمراض الأسماك وتحليل بيئات المزارع السمكية.
مهمتك: تحليل الصورة المرفقة (سمكة، حوض، جهاز قياس، أو حتى رسم بياني) وتقديم تقرير "على سنجة عشرة" باللهجة المصرية العامية الراقية.

الخطوات المطلوبة منك:
1. **التشخيص**: حدد بدقة أي أعراض ظاهرة (زي بقع بيضاء، تآكل زعانف، جحوظ عين، أو خمول).
2. **التحليل**: لو الصورة لجهاز قياس، اقرأ الرقم وقولنا ده معناه إيه بالنسبة للسمك (مثلاً لو الأكسجين قليل، حذر المستخدم).
3. **التوصيات**: قدم حلول فورية وعملية (زي تغيير نسبة المية، إضافة مضاد حيوي معين، أو تشغيل البدالات).
4. **التنسيق**: استخدم الـ Markdown بشكل احترافي عشان التقرير يكون سهل وواضح.

خليك دايماً إيجابي وداعم للمزارع المصري، وفكره إن AquaSmart AI دايماً في ضهره!
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
