"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import { HiAcademicCap, HiCalendar, HiLocationMarker } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsClient } from "../hooks/useIsClient";

const education = [
  {
    title: "Lise",
    period: "2017 – 2021",
    institution: "Gaziantep Yavuzeli Şehit Ali Çiftçi Çok Programlı Anadolu Lisesi, Gaziantep",
    icon: "🎓",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "İngilizce Hazırlık Eğitimi",
    period: "2022 – 2023",
    institution: "Kahramanmaraş Sütçü İmam Üniversitesi",
    department: "Yabancı Diller Yüksekokulu (Seviye: B2)",
    icon: "🌍",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Lisans",
    period: "2023 – Devam Ediyor",
    institution: "Kahramanmaraş Sütçü İmam Üniversitesi, Onikişubat, Kahramanmaraş",
    department: "Bilgisayar Mühendisliği Bölümü, 3. Sınıf Öğrencisi",
    icon: "🎓",
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function Education() {
  const isClient = useIsClient();
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });
  const shouldAnimate = isClient && !shouldReduceMotion && !isMobile;

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
      id="egitim"
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden"
    >
      {/* Optimized Background - Reduced blur */}
      <div className="absolute inset-0 bg-[var(--bg-secondary)]"></div>
      {!shouldReduceMotion && isInView && (
        <div className="hidden md:block pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-blue-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </div>
      )}

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiAcademicCap}
          title="Eğitim"
          subtitle="Eğitim geçmişim ve akademik yolculuğum"
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {education.map((edu, index) => (
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
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-3xl from-[var(--accent-primary)] to-[var(--accent-secondary)] will-change-transform"
                />
              )}

              <motion.div
                className="relative rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <motion.div
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${edu.gradient} flex items-center justify-center text-3xl sm:text-4xl shadow-lg will-change-transform`}
                    whileHover={!shouldReduceMotion ? { scale: 1.15, rotate: 5 } : {}}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {edu.icon}
                  </motion.div>

                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                        {edu.title}
                      </h3>
                      <span className="inline-flex w-fit px-3 sm:px-4 py-1.5 bg-white/5 text-[var(--accent-primary)] rounded-full text-xs sm:text-sm font-semibold border border-[var(--border-color)] items-center gap-1">
                        <HiCalendar size={14} />
                        {edu.period}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <HiLocationMarker className="text-[var(--text-secondary)] mt-1 flex-shrink-0" size={18} />
                      <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium break-words">
                        {edu.institution}
                      </p>
                    </div>
                    {edu.department && (
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] ml-0 sm:ml-6 mt-1">{edu.department}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
