"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import Image from "next/image";
import { HiCode, HiLightBulb, HiAcademicCap, HiSparkles } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsClient } from "../hooks/useIsClient";

const skills = [
  { icon: HiCode, text: "Web Geliştirme", description: "Modern web teknolojileri", gradient: "from-blue-500 to-cyan-500" },
  { icon: HiLightBulb, text: "Problem Çözme", description: "Yaratıcı çözümler", gradient: "from-purple-500 to-pink-500" },
  { icon: HiAcademicCap, text: "Sürekli Öğrenme", description: "Yeni teknolojiler", gradient: "from-green-500 to-emerald-500" },
  { text: "Mobil Uygulama Geliştirme", description: "React Native & Cross-platform", gradient: "from-cyan-500 to-blue-500", imageUrl: "/skill-icons/mobile-development.svg" },
  { text: "Yapay Zeka", description: "Etkin AI kullanımı", gradient: "from-indigo-500 to-purple-500", imageUrl: "/skill-icons/ai-usage.svg" },
];

export default function About() {
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
      id="hakkimda"
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden"
    >
      {/* Optimized Background - Reduced blur from 120px to 60px */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]"></div>

      {!shouldReduceMotion && isInView && (
        <div className="hidden md:block pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.12, 0.08] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </div>
      )}

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiSparkles}
          title="Hakkımda"
          subtitle="Kısaca ben ve öne çıkan yetkinliklerim"
        />

        <div className="max-w-5xl mx-auto">
          {/* Bio Card - Modern & Clean */}
          <motion.div
            variants={shouldAnimate ? itemVariants : undefined}
            initial={shouldAnimate ? "hidden" : undefined}
            animate={shouldAnimate && isInView ? "visible" : undefined}
            style={shouldAnimate ? undefined : { opacity: 1, transform: 'none' }}
            className="group relative rounded-3xl p-8 sm:p-10 lg:p-12 mb-10 sm:mb-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            whileHover={!shouldReduceMotion ? { y: -5, scale: 1.005 } : {}}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--accent-primary)]/8 to-[var(--accent-secondary)]/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            {!shouldReduceMotion && (
              <motion.div
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
              />
            )}
            
            <div className="relative space-y-8">
              {/* Eğitim Bilgisi */}
              <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 flex items-center justify-center border border-[var(--accent-primary)]/30">
                  <HiAcademicCap className="text-[var(--accent-primary)] text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2">
                    Bilgisayar Mühendisliği Öğrencisi
                  </h3>
                  <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                    <span className="font-semibold text-[var(--text-primary)]">Kahramanmaraş Sütçü İmam Üniversitesi</span> - <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-sm font-semibold">3. Sınıf</span>
                  </p>
                  <p className="text-sm sm:text-base text-[var(--text-tertiary)] mt-2 italic">
                    Web, Mobil ve Yapay Zeka teknolojilerine odaklanarak teknolojinin geleceğini şekillendiriyorum.
                  </p>
                </div>
              </div>

              {/* Deneyim Özeti */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--accent-primary)] mt-2" />
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                      Profesyonel Deneyim
                    </h4>
                    <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                      <span className="font-semibold text-[var(--accent-primary)]">Helikanon Yazılım</span> ve <span className="font-semibold text-[var(--accent-primary)]">Prep ShipHub</span> bünyesinde teorik bilgilerimi gerçek dünya projelerine aktarma fırsatı buldum.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--accent-secondary)] mt-2" />
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                      Teknik Uzmanlık
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-semibold">
                        Python
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 text-sm font-semibold">
                        JavaScript
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-semibold">
                        Machine Learning
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-300 text-sm font-semibold">
                        React
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold">
                        React Native
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 text-sm font-semibold">
                        Vue.js
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold">
                        SQL
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--text-tertiary)]">
                      Cross-platform mobil uygulamalar ve AI destekli web çözümleri geliştirme konusunda yetkinlik sahibiyim.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--accent-tertiary)] mt-2" />
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">
                      Global Deneyim
                    </h4>
                    <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                      ABD&apos;de katıldığım <span className="font-bold text-[var(--accent-primary)]">Work and Travel</span> programı sayesinde global iletişim yeteneklerimi geliştirdim ve kültürlerarası çalışma deneyimi kazandım.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--accent-primary)]/20">
                  <span className="text-3xl">💡</span>
                  <p className="text-base sm:text-lg text-[var(--text-primary)] font-semibold leading-relaxed">
                    Yenilikçi projeler, iş birlikleri, staj veya kariyer fırsatları için benimle iletişime geçmekten çekinmeyin!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Grid - Optimized */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-4 xl:gap-5">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div
                  className="relative rounded-3xl p-5 bg-gradient-to-br from-white/8 to-white/4 backdrop-blur-xl border border-white/10 text-center"
                >
                  <div
                    className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${skill.gradient} mb-3 shadow-lg overflow-hidden mx-auto`}
                  >
                    {skill.imageUrl ? (
                      <Image
                        src={skill.imageUrl}
                        alt={skill.text}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    ) : skill.icon ? (
                      <skill.icon className="text-white text-2xl" />
                    ) : null}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1.5">
                    {skill.text}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{skill.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
