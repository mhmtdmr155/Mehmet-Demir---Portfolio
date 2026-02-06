"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import { HiDocumentText } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";

const certificates = [
  {
    title: "Bilgi Teknolojileri Stajı Katılım Sertifikası",
    description: "Uygulamalı Excel, Photoshop, AutoCAD ve Python eğitimlerini içeren staj programı.",
    icon: "🏆",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "LIFT UP - Katılım Belgesi",
    description: "Sanayi odaklı lisans bitirme projeleri konferansına katılım belgesi.",
    icon: "📜",
    gradient: "from-blue-500 to-indigo-500",
  },
];

export default function Certificates() {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const shouldAnimate = mounted && !shouldReduceMotion && !isMobile;

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.08 }
    }
  }), []);

  const itemVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    }
  }), []);

  return (
    <section
      id="sertifikalar"
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden"
    >
      {/* Optimized Background */}
      <div className="absolute inset-0 bg-[var(--bg-secondary)]"></div>
      {!shouldReduceMotion && isInView && (
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-500/8 rounded-full mix-blend-screen filter blur-[30px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiDocumentText}
          title="Sertifikalar"
          subtitle="Aldığım sertifikalar ve başarılarım"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {certificates.map((cert, index) => (
            <motion.div
              key={index}
              variants={shouldAnimate ? itemVariants : undefined}
              initial={shouldAnimate ? "hidden" : undefined}
              animate={shouldAnimate && isInView ? "visible" : undefined}
              style={shouldAnimate ? undefined : { opacity: 1, transform: 'none' }}
              className="group relative will-change-transform"
            >
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-3xl from-yellow-400 to-orange-500 will-change-transform"
                />
              )}

              <motion.div
                className="relative rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl"
              >
                <motion.div
                  className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${cert.gradient} mb-4 sm:mb-6 shadow-lg will-change-transform`}
                  whileHover={!shouldReduceMotion ? { scale: 1.15, rotate: 5 } : {}}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-3xl sm:text-4xl">{cert.icon}</span>
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-3 break-words">
                  {cert.title}
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{cert.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
