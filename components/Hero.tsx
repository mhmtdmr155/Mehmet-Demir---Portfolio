"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HiDownload, HiMail } from "react-icons/hi";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/mhmtdmr155", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/mehmet-demir-35b720207/", label: "LinkedIn" },
  { icon: FaInstagram, href: "https://instagram.com/mhmtdmir01", label: "Instagram" },
];

const roles = ["Yazılım Geliştirici", "Full-Stack Developer", "Problem Çözücü"];

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [currentRole, setCurrentRole] = useState(0);
  const [hasProfileImage, setHasProfileImage] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[75vh] lg:min-h-[80vh] overflow-hidden bg-[var(--bg-primary)] py-8 sm:py-10 lg:py-12 flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,243,255,0.05)] via-transparent to-[rgba(112,0,255,0.1)]" />
      <div className="absolute -left-10 -top-20 w-[500px] h-[500px] rounded-full bg-[rgba(0,243,255,0.08)] blur-3xl" />
      <div className="absolute right-0 bottom-[-120px] w-[600px] h-[600px] rounded-full bg-[rgba(112,0,255,0.09)] blur-3xl" />

      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative container max-w-7xl mx-auto px-4 sm:px-5 lg:px-8 z-10"
      >
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.3)] mx-auto">
          <div className="flex flex-col items-center justify-center gap-8 lg:gap-12 xl:gap-14 text-center max-w-5xl mx-auto">
            
            {/* Profile Image - Top on all screens */}
            <div className="relative flex justify-center flex-shrink-0">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full border-[3px] border-[var(--accent-primary)]/30 p-2 bg-gradient-to-br from-white/8 to-white/0 shadow-[0_20px_60px_rgba(0,243,255,0.25)]">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {hasProfileImage ? (
                    <Image
                      src="/profile.jpg"
                      alt="Mehmet Demir"
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                      className="object-cover"
                      priority
                      onError={() => setHasProfileImage(false)}
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center">
                      <span className="text-6xl lg:text-7xl font-black text-[var(--accent-primary)]">MD</span>
                    </div>
                  )}
                </div>
                <div className="absolute -inset-3 border-2 border-[var(--accent-primary)]/20 rounded-full animate-[spin_14s_linear_infinite]" />
              </div>
            </div>

            {/* Content - All centered */}
            <div className="space-y-10 lg:space-y-12 w-full">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[var(--accent-primary)]/10 rounded-full border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-sm sm:text-base font-semibold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                Open to Work
              </div>

              <div className="space-y-6 text-white">
                <h2 className="text-sm sm:text-base font-bold text-[var(--accent-primary)] tracking-[0.2em] uppercase">
                  Yazılım Geliştirici
                </h2>
                <h1 className="text-[40px] sm:text-[50px] md:text-[60px] lg:text-[70px] xl:text-[80px] font-black leading-[1.05] tracking-tight text-white">
                  MEHMET{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--accent-primary)] to-[var(--accent-secondary)]">
                    DEMİR
                  </span>
                </h1>
              </div>

              <div className="space-y-7">
                <div className="flex flex-wrap items-center justify-center gap-2 text-lg sm:text-xl lg:text-2xl font-bold">
                  <span className="text-[var(--text-secondary)]">Ben bir</span>
                  <span className="gradient-text relative pb-3">
                    {roles[currentRole]}
                    <span className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] rounded-full opacity-80" />
                  </span>
                </div>
                <p className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] max-w-3xl leading-relaxed mx-auto">
                  Modern teknolojilerle web ve mobil çözümler üreten, yapay zeka destekli projelere tutkulu bir mühendis adayıyım.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-10">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl bg-white/6 border border-white/12 hover:border-[var(--accent-primary)]/60 hover:bg-white/10 transition-all shadow-lg"
                  >
                    <social.icon size={24} />
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-10">
                <a
                  href="#iletisim"
                  className="px-8 py-4 bg-[var(--accent-primary)] text-black rounded-xl font-bold text-base sm:text-lg border border-[var(--accent-primary)]/30 transition-all hover:bg-[var(--accent-primary)]/90 hover:scale-105 shadow-[0_10px_40px_rgba(0,243,255,0.3)]"
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <HiMail size={22} />
                    <span>İletişime Geç</span>
                  </div>
                </a>
                <button
                  onClick={() => {
                    try {
                      const link = document.createElement("a");
                      link.href = "/MEHMET DEMİR CV.pdf";
                      link.download = "MEHMET DEMİR CV.pdf";
                      link.click();
                    } catch {
                      window.open("/MEHMET DEMİR CV.pdf", "_blank");
                    }
                  }}
                  className="px-8 py-4 bg-transparent border-2 border-[var(--accent-primary)]/50 rounded-xl font-bold text-base sm:text-lg text-white transition-all hover:bg-white/5 hover:border-[var(--accent-primary)] hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <HiDownload size={22} />
                    <span>CV İndir</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById('hakkimda')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="w-6 h-10 rounded-full border-2 border-[var(--accent-primary)]/60 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full"
            />
          </div>
          <span className="text-xs text-[var(--accent-primary)]/80 font-semibold tracking-wider">SCROLL</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
