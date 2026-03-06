"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Upload, Camera, Sparkles, Loader2, Radio, FileText, Shield, BarChart3, Lightbulb, X } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";

interface Message { role: "user" | "ai"; content: string; image?: string; }

export default function AICenterPage() {
    const { t, lang } = useApp();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [pondsContext, setPondsContext] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<{ base64: string; mime: string } | null>(null);
    const [visionResult, setVisionResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
    const [chatImageFile, setChatImageFile] = useState<{ base64: string; mime: string } | null>(null);
    const msgEnd = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const chatFileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCtx = async () => {
            try {
                const snap = await get(ref(database, "ponds"));
                if (snap.exists()) {
                    const data = snap.val();
                    const ctx: Record<string, any> = {};
                    Object.keys(data).forEach((k) => {
                        ctx[k] = { current: data[k].current, ai_status: data[k].ai_result?.current?.Status };
                    });
                    setPondsContext(ctx);
                }
            } catch { }
        };
        fetchCtx();
    }, []);

    useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSend = async (text?: string) => {
        const userMsg = (text || input).trim();
        if (!userMsg && !chatImageFile) return;

        const newMsg: Message = { role: "user", content: userMsg };
        if (chatImagePreview) newMsg.image = chatImagePreview;

        setMessages((p) => [...p, newMsg]);
        setInput("");
        setIsLoading(true);

        const currentImgBase64 = chatImageFile?.base64;
        const currentImgMime = chatImageFile?.mime;

        // Clear immediately so user can type next msg
        setChatImagePreview(null);
        setChatImageFile(null);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    context: pondsContext,
                    imageBase64: currentImgBase64,
                    mimeType: currentImgMime
                }),
            });
            const data = await res.json();
            setMessages((p) => [...p, { role: "ai", content: data.reply || t("عذراً، حدث خطأ.", "Sorry, an error occurred.") }]);
        } catch {
            setMessages((p) => [...p, { role: "ai", content: t("حدث خطأ في الاتصال.", "Connection error.") }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const full = ev.target?.result as string;
            setChatImagePreview(full);
            setChatImageFile({ base64: full.split(",")[1], mime: file.type });
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const full = ev.target?.result as string;
            setSelectedImage(full);
            setImageFile({ base64: full.split(",")[1], mime: file.type });
            setVisionResult(null);
        };
        reader.readAsDataURL(file);
    };

    const analyzeImage = async () => {
        if (!imageFile) return;
        setIsAnalyzing(true);
        setVisionResult(null);
        try {
            const res = await fetch("/api/vision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageBase64: imageFile.base64, mimeType: imageFile.mime }),
            });
            const data = await res.json();
            setVisionResult(data.reply || t("تعذّر التحليل.", "Analysis failed."));
        } catch {
            setVisionResult(t("خطأ في الاتصال.", "Connection error."));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const suggestions = [
        { text: t("كيف حال الحوض رقم ٣؟", "How is Pond #3?"), emoji: "🐟" },
        { text: t("جدول التغذية المثالي", "Optimal feeding schedule"), emoji: "📋" },
        { text: t("إزاي أحسّن جودة المياه؟", "How to improve water quality?"), emoji: "💧" },
        { text: t("أمراض السمك وعلاجها", "Fish diseases & treatment"), emoji: "🏥" },
    ];

    const features = [
        { icon: Radio, text: t("مراقبة ذكية بالبيانات الحية من المستشعرات", "Smart monitoring with live sensor data") },
        { icon: Camera, text: t("تشخيص أعراض الأسماك بالصور فوراً", "Instant fish symptom diagnosis with images") },
        { icon: Sparkles, text: t("حلول عملية فورية مبنية على بيانات حقيقية", "Real-time solutions based on real data") },
        { icon: BarChart3, text: t("تقارير AI تلقائية عن حالة المزرعة", "Automatic AI farm status reports") },
    ];

    const renderContent = (text: string) => {
        const lines = text.split("\n");
        return lines.map((line, i) => {
            if (line.startsWith("### ")) return <h4 key={i} className="font-bold text-sm mt-3 mb-1">{line.replace("### ", "")}</h4>;
            if (line.startsWith("## ")) return <h3 key={i} className="font-bold text-base mt-3 mb-1">{line.replace("## ", "")}</h3>;
            if (line.startsWith("> ")) return <div key={i} className="border-s-2 border-[var(--color-cyan)] ps-3 text-xs mt-2 text-[var(--color-cyan)]">{line.replace("> ", "")}</div>;
            if (line.startsWith("- ")) {
                const content = line.replace("- ", "");
                const parts = content.split(/\*\*(.*?)\*\*/g);
                return <p key={i} className="text-xs ps-2 py-0.5">• {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
            }
            if (/^\d+\.\s/.test(line)) return <p key={i} className="text-xs ps-2 py-0.5">{line}</p>;
            if (line.includes("**")) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return <p key={i} className="text-xs py-0.5">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
            }
            if (!line.trim()) return <div key={i} className="h-2" />;
            return <p key={i} className="text-xs py-0.5">{line}</p>;
        });
    };

    return (
        <PageTransition>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-[calc(100vh-7rem)]">

                {/* ===== LEFT SIDE: AI Info + Image Diagnosis ===== */}
                <div className="xl:col-span-5 flex flex-col gap-4 overflow-y-auto order-2 xl:order-1">

                    {/* Hero */}
                    <div className="card bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-cyan)]/5 border-[var(--color-cyan)]/20 flex flex-col items-center text-center p-6 md:p-8 hover:border-[var(--color-cyan)]/40">
                        <p className="text-xs text-[var(--color-cyan)] font-semibold mb-2 tracking-wider">
                            {t("الذكاء الاصطناعي", "ARTIFICIAL INTELLIGENCE")}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)] mb-1">
                            {t("مساعدك الذكي", "Your Smart Assistant")}
                        </h1>
                        <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-l from-[var(--color-cyan)] to-[var(--color-teal)] bg-clip-text text-transparent mb-3">
                            AquaAI
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-md">
                            {t(
                                "مدعوم بنموذج Google Gemini المتقدم. اسأله عن حالة أي حوض، أرسل له صورة لسمكة مريضة للتشخيص الفوري، أو اطلب منه توصيات لتحسين الإنتاج وتقليل الخسائر.",
                                "Powered by Google Gemini. Ask about any pond, send a fish image for diagnosis, or get recommendations to improve production."
                            )}
                        </p>
                        <div className="mt-5 space-y-2 w-full max-w-sm">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 text-start">
                                    <f.icon className="w-4 h-4 text-[var(--color-cyan)] flex-shrink-0" />
                                    <p className="text-[11px] text-[var(--color-text-secondary)]">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Diagnosis */}
                    <div className="card">
                        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-3 justify-end">
                            {t("تشخيص الأمراض بالصور", "Image Disease Diagnosis")}
                            <Camera className="w-4 h-4 text-[var(--color-cyan)]" />
                        </h3>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-5 text-center cursor-pointer hover:border-[var(--color-cyan)]/50 transition-colors bg-[var(--color-bg-input)]"
                        >
                            {selectedImage ? (
                                <div className="relative">
                                    <img src={selectedImage} alt="upload" className="max-h-32 mx-auto rounded-lg" />
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setImageFile(null); setVisionResult(null); }}
                                        className="absolute top-1 right-1 w-6 h-6 bg-[#ef4444] rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-7 h-7 text-[var(--color-cyan)] mx-auto mb-2" />
                                    <p className="text-xs text-[var(--color-text-secondary)]">{t("ارفع صورة السمكة للتحليل", "Upload a fish image for analysis")}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{t("يدعم JPG, PNG (حتى 10MB)", "Supports JPG, PNG (up to 10MB)")}</p>
                                </>
                            )}
                            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        <button onClick={analyzeImage} disabled={!imageFile || isAnalyzing}
                            className="btn-primary w-full mt-3 flex items-center justify-center gap-2 disabled:opacity-50">
                            {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />{t("جاري التحليل...", "Analyzing...")}</> : <><Sparkles className="w-4 h-4" />{t("بدء التحليل الذكي", "Start AI Analysis")}</>}
                        </button>
                        {visionResult && (
                            <div className="mt-3 p-3 bg-[var(--color-bg-input)] rounded-lg border border-[var(--color-border)]">
                                <p className="font-semibold text-xs text-[var(--color-cyan)] mb-2">{t("نتائج التحليل:", "Analysis Results:")}</p>
                                <div className="text-[var(--color-text-secondary)]">{renderContent(visionResult)}</div>
                            </div>
                        )}
                    </div>

                    {/* Pond Status */}
                    {pondsContext && (
                        <div className="card p-4">
                            <h3 className="text-xs font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2 justify-end">
                                {t("حالة الأحواض الحية", "Live Pond Status")}
                                <Radio className="w-3.5 h-3.5 text-[var(--color-cyan)]" />
                            </h3>
                            <div className="space-y-2">
                                {Object.entries(pondsContext as Record<string, any>).map(([k, v]: [string, any]) => {
                                    const status = v.ai_status || "Safe";
                                    const isDanger = status.includes("Danger");
                                    const isWarning = status.includes("Warning");
                                    return (
                                        <div key={k} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${isDanger ? "bg-[#ef4444]/10 border-[#ef4444]/30" : isWarning ? "bg-[#f59e0b]/10 border-[#f59e0b]/30" : "bg-[#10b981]/10 border-[#10b981]/30"}`}>
                                            <span className="text-[10px] text-[var(--color-text-muted)]">
                                                🌡 {v.current?.Temperature?.toFixed(1) || "--"} • Power of hydrogen (PH) {v.current?.PH?.toFixed(1) || "--"} • Dissolved Oxygen (DO) {v.current?.DO?.toFixed(1) || "--"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[var(--color-text-primary)] font-semibold">{k.replace("_", " ")}</span>
                                                <span className={`font-bold ${isDanger ? "text-[#ef4444]" : isWarning ? "text-[#f59e0b]" : "text-[#10b981]"}`}>
                                                    {isDanger ? "🔴" : isWarning ? "🟡" : "🟢"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== RIGHT SIDE: Chat ===== */}
                <div className="xl:col-span-7 card flex flex-col p-0 overflow-hidden order-1 xl:order-2">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-bg-input)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                            {pondsContext ? t("متصل بالمستشعرات", "Connected") : t("جاري الاتصال...", "Connecting...")}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-end">
                                <h2 className="text-sm font-bold text-[var(--color-text-primary)]">{t("المساعد الذكي AquaAI", "AquaAI Assistant")}</h2>
                                <p className="text-[10px] text-[var(--color-text-muted)]">{t("متاح الآن", "Available now")}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                                <Bot className="w-14 h-14 text-[var(--color-cyan)] mb-3" />
                                <p className="text-sm text-[var(--color-text-secondary)]">{t("اسألني أي سؤال عن مزرعتك!", "Ask me anything about your farm!")}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{t("أجاوب على أي سؤال يخص الاستزراع السمكي 🐟", "I answer anything about aquaculture 🐟")}</p>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-[var(--color-cyan)]" : "bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)]"}`}>
                                    {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                    ? "bg-[var(--color-cyan)] text-white"
                                    : "bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"}`}>
                                    {msg.role === "user" ? (
                                        <div className="flex flex-col gap-2 items-end">
                                            {msg.image && <img src={msg.image} alt="attached" className="max-w-[150px] md:max-w-[200px] rounded-lg border border-white/20" />}
                                            {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                                        </div>
                                    ) : (
                                        <div>{renderContent(msg.content)}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-[var(--color-cyan)] animate-spin" />
                                    <span className="text-xs text-[var(--color-text-muted)]">{t("جاري التفكير...", "Thinking...")}</span>
                                </div>
                            </div>
                        )}
                        <div ref={msgEnd} />
                    </div>

                    {/* Suggestions */}
                    {messages.length === 0 && (
                        <div className="px-4 pb-2 flex gap-2 flex-wrap justify-center">
                            {suggestions.map((s) => (
                                <button key={s.text} onClick={() => handleSend(s.text)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/30 text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors">
                                    {s.emoji} {s.text}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-[var(--color-border)] flex flex-col gap-2">
                        {chatImagePreview && (
                            <div className="relative w-fit">
                                <img src={chatImagePreview} alt="attachment" className="h-14 md:h-20 rounded-lg border border-[var(--color-border)] object-cover" />
                                <button onClick={() => { setChatImagePreview(null); setChatImageFile(null); }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#ef4444] rounded-full flex items-center justify-center hover:bg-[#dc2626] transition-colors">
                                    <X className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <button onClick={() => chatFileRef.current?.click()}
                                className="w-10 h-10 rounded-full bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-cyan)]/10 hover:text-[var(--color-cyan)] transition-colors flex-shrink-0">
                                <Camera className="w-4 h-4" />
                            </button>
                            <input type="file" ref={chatFileRef} className="hidden" accept="image/*" onChange={handleChatImageUpload} />

                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder={t("اسأل أي سؤال أو ارفع صورة...", "Ask anything or upload an image...")}
                                className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[var(--color-cyan)] transition-colors"
                                disabled={isLoading}
                            />

                            <button onClick={() => handleSend()} disabled={isLoading || (!input.trim() && !chatImageFile)}
                                className="w-10 h-10 rounded-full bg-[var(--color-cyan)] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0">
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
