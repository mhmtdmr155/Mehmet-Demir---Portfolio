"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import { HiMail, HiExternalLink, HiUser, HiBriefcase } from "react-icons/hi";
import { FaLinkedin } from "react-icons/fa";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsClient } from "../hooks/useIsClient";

const references = [
  {
    name: "Yasin Çelik",
    title: "Staff Software Engineer at LinkedIn",
    institution: "Microsoft",
    department: null,
    expertise: null,
    email: "yasincelikk16@gmail.com",
    type: "Profesyonel Referans",
    gradient: "from-blue-500 to-cyan-500",
    linkedin: "https://linkedin.com/in/yasin-celik-30933a31/"
  },
];

export default function References() {
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
      id="referanslar"
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden"
    >
      {/* Optimized Background */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]"></div>
      {!shouldReduceMotion && isInView && (
        <div className="hidden md:block pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-96 h-96 bg-blue-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiUser}
          title="Referanslar"
          subtitle="Akademik ve profesyonel referanslarım"
        />

        <div className="max-w-4xl mx-auto space-y-8">
          {references.map((ref, index) => (
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

              <div className="relative rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <motion.div
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${ref.gradient} flex items-center justify-center shadow-lg will-change-transform`}
                  >
                    <HiUser className="text-white text-2xl sm:text-3xl" />
                  </motion.div>

                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                        {ref.name}
                      </h3>
                      <span className={`inline-flex w-fit px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold ${ref.type === "Akademik Referans"
                        ? "bg-white/5 text-[var(--accent-primary)] border border-[var(--border-color)]"
                        : "bg-white/5 text-[var(--accent-secondary)] border border-[var(--border-color)]"
                        }`}>
                        {ref.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <HiBriefcase className="text-[var(--text-secondary)]" size={18} />
                      <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium break-words">{ref.title}</p>
                    </div>

                    <p className="text-base sm:text-lg text-[var(--text-primary)] font-semibold mb-2 break-words">
                      {ref.institution}
                    </p>

                    {ref.department && (
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-2 break-words">{ref.department}</p>
                    )}

                    {ref.expertise && (
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-4">{ref.expertise}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
                      <motion.a
                        href={`mailto:${ref.email}`}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 text-[var(--accent-primary)] rounded-lg hover:bg-white/8 transition-all font-semibold border border-[var(--border-color)] text-sm break-all will-change-transform"
                        whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                        whileTap={{ scale: 0.98 }}
                      >
                        <HiMail size={16} className="flex-shrink-0" />
                        <span className="break-all">{ref.email}</span>
                      </motion.a>

                      {ref.linkedin && (
                        <motion.a
                          href={ref.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 text-[var(--accent-secondary)] rounded-lg hover:bg-white/8 transition-all font-semibold border border-[var(--border-color)] text-sm break-all will-change-transform"
                          whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FaLinkedin size={16} className="flex-shrink-0" />
                          <span className="break-all">LinkedIn Profili</span>
                        </motion.a>
                      )}

                      {ref.type === "Staj Referansı" && (
                        <motion.a
                          href="#"
                          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 text-[var(--text-secondary)] rounded-lg hover:bg-white/8 transition-all font-semibold border border-[var(--border-color)] text-sm will-change-transform"
                          whileHover={!shouldReduceMotion ? { scale: 1.05 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          <HiExternalLink size={16} />
                          <span>Referans Mektubunu Görüntüle</span>
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
