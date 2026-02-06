"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import Image from "next/image";
import { HiBookOpen } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";

const courses = [
  {
    title: "Sıfırdan Web Developer Olma",
    platform: "Udemy",
    icon: "🚀",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "React Native - The Practical Guide",
    platform: "Udemy",
    icon: "📱",
    gradient: "from-cyan-500 to-purple-500",
    imageUrl: "/course-covers/react-native-mobile.svg",
  },
  {
    title: "React - The Complete Guide 2025",
    platform: "Udemy",
    icon: "⚛️",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "The Web Developer Bootcamp 2025",
    platform: "Udemy",
    icon: "💻",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Git & GitHub Tutorial",
    platform: "Udemy",
    icon: "🔀",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "SQL & MySQL",
    platform: "Udemy",
    icon: "🗄️",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export default function Courses() {
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
      transition: { staggerChildren: 0.05, delayChildren: 0.08 }
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
      id="kurslar"
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden"
    >
      {/* Optimized Background */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]"></div>
      {!shouldReduceMotion && isInView && (
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-purple-500/8 rounded-full mix-blend-screen filter blur-[30px]"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiBookOpen}
          title="Kurslar"
          subtitle="Tamamladığım ve devam ettiğim online kurslar"
        />

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              variants={shouldAnimate ? itemVariants : undefined}
              initial={shouldAnimate ? "hidden" : undefined}
              animate={shouldAnimate && isInView ? "visible" : undefined}
              style={shouldAnimate ? undefined : { opacity: 1, transform: 'none' }}
              className="group relative"
            >
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-3xl from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                />
              )}

              <motion.div
                className="relative rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {course.imageUrl ? (
                    <motion.div
                      className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg"
                      whileHover={!shouldReduceMotion ? { scale: 1.15, rotate: 5 } : {}}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        sizes="(max-width: 640px) 64px, 80px"
                        className="object-cover"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-r ${course.gradient} flex items-center justify-center text-3xl sm:text-4xl shadow-lg`}
                      whileHover={!shouldReduceMotion ? { scale: 1.15, rotate: 5 } : {}}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {course.icon}
                    </motion.div>
                  )}

                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <HiBookOpen className="text-[var(--accent-primary)]" size={18} />
                      <span className="text-xs sm:text-sm font-semibold text-[var(--accent-primary)]">{course.platform}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] break-words">
                      {course.title}
                    </h3>
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
