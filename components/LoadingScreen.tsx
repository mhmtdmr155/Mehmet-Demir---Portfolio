"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Sistem Başlatılıyor...");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof document === 'undefined') return;

    const hasVisited = localStorage.getItem("md_hasVisited") === "true";
    if (hasVisited) {
      setIsLoading(false);
      return;
    }

    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.setAttribute('data-loading-screen', 'true');

    // Animation Logic
    const startTime = Date.now();
    const duration = 900; // ~0.9 seconds total duration

    // Text changing intervals
    const textTimeouts = [
      setTimeout(() => setLoadingText("Varlıklar Yükleniyor..."), 800),
      setTimeout(() => setLoadingText("Arayüz Hazırlanıyor..."), 1600),
      setTimeout(() => setLoadingText("Hazır!"), 2100),
    ];

    const animateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 100);

      const easedProgress = 100 * (1 - Math.pow(1 - rawProgress / 100, 3));

      setProgress(Math.round(easedProgress));

      if (elapsed < duration) {
        requestAnimationFrame(animateProgress);
      } else {
        // Animation complete
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          document.body.style.overflow = '';
          document.documentElement.removeAttribute('data-loading-screen');
          localStorage.setItem("md_hasVisited", "true");
        }, 200); // Short delay at 100% before fade out
      }
    };

    const animationFrame = requestAnimationFrame(animateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
      textTimeouts.forEach(clearTimeout);
      document.body.style.overflow = '';
      document.documentElement.removeAttribute('data-loading-screen');
    };
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0d1a] overflow-hidden"
        >
          {/* Background Ambient Effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[50px]" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
            {/* Profile/Logo Area */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-12 relative"
            >
              <div className="w-32 h-32 relative">
                {/* Glowing Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin transition-all duration-1000"
                  style={{ animationDuration: '1.5s', boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)' }}
                />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-indigo-500 border-l-pink-500 animate-spin-reverse"
                  style={{ animationDirection: 'reverse', animationDuration: '2s' }}
                />

                {/* Center Content */}
                <div className="absolute inset-4 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-white/5">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">MD</span>
                </div>
              </div>
            </motion.div>

            {/* Main Text */}
            <motion.h1
              className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              MEHMET DEMİR
            </motion.h1>

            <motion.div
              className="flex items-center gap-3 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-blue-500/50"></span>
              <span className="text-sm font-medium text-blue-300/60 tracking-[0.2em] uppercase">Portföy Yükleniyor</span>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-blue-500/50"></span>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-full relative h-1 bg-slate-800/50 rounded-full overflow-hidden mb-4">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"
                style={{ width: `${progress}%` }}
                layoutId="progressbox"
              />

              {/* Leading Spark */}
              <motion.div
                className="absolute top-0 h-full w-[100px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{ left: `${progress - 15}%` }}
              />
            </div>

            {/* Footer Info */}
            <div className="w-full flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500 transition-all duration-300 min-w-[150px]">{loadingText}</span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
