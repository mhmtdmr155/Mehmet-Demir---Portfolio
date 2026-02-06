"use client";

import type React from "react";
import { motion } from "framer-motion";

type IconType = React.ComponentType<{ className?: string }>;

export default function SectionHeader({
  Icon,
  title,
  subtitle,
  align = "center",
}: {
  Icon: IconType;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className={`${isCenter ? "text-center" : "text-left"} mb-10 sm:mb-12 lg:mb-6 xl:mb-8`}
    >
      <motion.div
        initial={{ scale: 0.8, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 20, duration: 0.3 }}
        className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 ${
          isCenter ? "mx-auto" : ""
        } mb-4`}
      >
        <Icon className="text-[var(--accent-primary)] text-3xl sm:text-4xl drop-shadow-[0_0_16px_rgba(139,92,246,0.35)]" />
      </motion.div>

      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3 sm:mb-4 tracking-tight">
        <span className="gradient-text">{title}</span>
      </h2>

      {subtitle ? (
        <p
          className={`text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl ${
            isCenter ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}




