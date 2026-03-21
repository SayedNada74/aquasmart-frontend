"use client";

import { motion } from "framer-motion";
import { Waves, Home, Search } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { SiteBackground } from "@/components/backgrounds/SiteBackground";

export default function NotFound() {
  const { t, dir } = useApp();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden" dir={dir}>
      <SiteBackground />
      
      <PageTransition>
        <div className="text-center space-y-8 max-w-md relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-32 h-32 bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-teal)] rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-[var(--color-cyan)]/20"
          >
            <Waves className="w-16 h-16 text-white" />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-text-muted)] opacity-20">
              404
            </h1>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] -mt-12">
              {t("أوه! لقد ضللت الطريق", "Oops! You've drifted away")}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
              {t(
                "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يبدو أنك في مياه مجهولة!",
                "The page you're looking for doesn't exist or has been moved. It seems you're in uncharted waters!"
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard" className="btn-primary flex items-center gap-2 px-8 py-3 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              {t("العودة للرئيسية", "Back to Home")}
            </Link>
            <Link href="/ai-center" className="btn-secondary flex items-center gap-2 px-8 py-3 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              {t("اسأل AquaAI", "Ask AquaAI")}
            </Link>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -left-20 w-64 h-64 bg-[var(--color-cyan)]/5 rounded-full blur-3xl -z-10"
          />
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--color-teal)]/5 rounded-full blur-3xl -z-10"
          />
        </div>
      </PageTransition>
    </div>
  );
}
