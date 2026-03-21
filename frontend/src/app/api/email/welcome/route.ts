import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();

        if (!email || !name) {
            return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            console.error("Email configuration missing in .env.local");
            return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        const htmlContent = `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; padding: 40px; text-align: right;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">AquaSmart AI 🌊</h1>
                    </div>
                    <div style="padding: 40px 30px; color: #333333;">
                        <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">أهلاً بك يا ${name}،</h2>
                        <p style="font-size: 16px; line-height: 1.8; margin-bottom: 20px; color: #4b5563;">
                            يسعدنا انضمامك إلى منصة <strong>AquaSmart AI</strong>، النظام الأذكى لإدارة والتنبؤ بمزارعك السمكية ومراقبة جودة المياه لحظة بلحظة بالاعتماد على الذكاء الاصطناعي.
                        </p>
                        <p style="font-size: 16px; line-height: 1.8; margin-bottom: 30px; color: #4b5563;">
                            حسابك الآن جاهز. يمكنك البدء في استكشاف الميزات المتقدمة وتجربة المساعد الذكي لمضاعفة إنتاجك وتقليل الهدر!
                        </p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0d9488; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.25);">استكشف لوحة التحكم الآن</a>
                        </div>
                        <p style="font-size: 14px; color: #9ca3af; text-align: center; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 30px;">
                            إذا كان لديك أي استفسار، فريق الدعم لدينا دائماً في خدمتك.<br/>
                            <br/>
                            © 2024-2025 AquaSmart AI. جميع الحقوق محفوظة.
                        </p>
                    </div>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"AquaSmart AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "مرحباً بك في منصة AquaSmart AI 🎉",
            html: htmlContent,
        });

        return NextResponse.json({ success: true, message: "Welcome email sent successfully" });
    } catch (error: any) {
        console.error("Error sending welcome email:", error);
        return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
    }
}
