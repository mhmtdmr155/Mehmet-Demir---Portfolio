"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import { HiBriefcase, HiGlobeAlt, HiChip, HiLightningBolt } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsClient } from "../hooks/useIsClient";

const experiences = [
    {
        company: "Freelance",
        role: "Software Developer",
        period: "Haziran 2023 - Devam Ediyor",
        description: "Küresel müşteriler için butik web ve mobil çözümler üretiyorum. Proje yönetimi ve doğrudan müşteri ilişkileri süreçlerini yönetiyorum.",
        icon: HiBriefcase,
        color: "text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20",
        border: "border-green-500/30"
    },
    {
        company: "Teknofest - KSÜ ALYA UAV",
        role: "Yazılım Ekip Üyesi",
        period: "Aralık 2023 - Eylül 2024",
        description: "İstiklal SİHA projesinde yazılım mimarisi ve sistem entegrasyonu üzerine çalıştım. İnsansız hava aracı teknolojileri geliştirdim.",
        icon: HiChip,
        color: "text-purple-400",
        gradient: "from-purple-500/20 to-indigo-500/20",
        border: "border-purple-500/30"
    },
    {
        company: "Work and Travel USA",
        role: "Katılımcı & Kültürel Değişim",
        period: "Yaz 2024",
        description: "ABD'de yaşadığım bu deneyim sayesinde global iletişim becerilerimi geliştirdim ve farklı kültürlerle çalışma yetkinliği kazandım.",
        icon: HiGlobeAlt,
        color: "text-red-400",
        gradient: "from-red-500/20 to-pink-500/20",
        border: "border-red-500/30"
    },
    {
        company: "Helikanon Yazılım",
        role: "Stajyer Yazılım Geliştirici",
        period: "Ağustos 2025 - Eylül 2025",
        description: "Kurumsal projelerde Web ve Mobil uygulama geliştirme süreçlerine aktif katılım sağladım.",
        icon: HiLightningBolt,
        color: "text-yellow-400",
        gradient: "from-yellow-500/20 to-orange-500/20",
        border: "border-yellow-500/30"
    },
    {
        company: "Prep ShipHub",
        role: "Web & Mobile Developer",
        period: "Haziran 2025 - Kasım 2025",
        description: "Amerika merkezli lojistik firmasında React ve React Native ile kullanıcı odaklı, yüksek performanslı web ve mobil arayüzler geliştiriyorum.",
        icon: HiGlobeAlt,
        color: "text-blue-400",
        gradient: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/30"
    }
];

export default function Experience() {
    const isClient = useIsClient();
    const shouldReduceMotion = useReducedMotion();
    const isMobile = useIsMobile();
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
    const shouldAnimate = isClient && !shouldReduceMotion && !isMobile;

    const itemVariants: Variants = useMemo(() => ({
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    }), []);

    return (
        <section
            id="deneyim"
            ref={sectionRef}
            className="relative w-full py-20 lg:py-24 overflow-hidden"
        >
            <div className="container relative max-w-5xl mx-auto px-4 sm:px-6 z-10">
                <SectionHeader
                    Icon={HiBriefcase}
                    title="Deneyim"
                    subtitle="Profesyonel kariyerim ve projelerim"
                />

                <div className="relative mt-12 space-y-0">
                    {/* Timeline Line (Desktop Only) */}
                    <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[var(--accent-primary)] via-[var(--accent-secondary)] to-transparent opacity-20 hidden md:block" />

                    {experiences.map((exp, index) => (
                        <div key={index}>
                            <motion.div
                                variants={shouldAnimate ? itemVariants : undefined}
                                initial={shouldAnimate ? "hidden" : undefined}
                                animate={shouldAnimate && isInView ? "visible" : undefined}
                                style={shouldAnimate ? undefined : { opacity: 1, transform: 'none' }}
                                className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Timeline Point (Desktop Only) */}
                                <div className="absolute left-1/2 w-4 h-4 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--accent-primary)] translate-x-[-50%] z-10 hidden md:block mt-8 shadow-[0_0_10px_var(--accent-primary)]" />

                                {/* Content Card */}
                                <div className={`flex-1 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                                    <div className={`p-6 rounded-2xl bg-[var(--bg-secondary)] border ${exp.border} relative group hover:bg-[var(--bg-tertiary)] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
                                        {/* Hover Gradient */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${exp.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300 pointer-events-none`} />

                                        <div className="relative flex items-start gap-3 mb-4">
                                            <div className={`p-2.5 rounded-xl bg-white/5 ${exp.color} backdrop-blur-sm flex-shrink-0`}>
                                                <exp.icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] mb-1">{exp.role}</h3>
                                                <p className={`font-semibold text-sm md:text-base ${exp.color}`}>{exp.company}</p>
                                            </div>
                                        </div>

                                        <p className="relative text-[var(--text-secondary)] leading-relaxed mb-4 text-sm md:text-base">
                                            {exp.description}
                                        </p>

                                        <span className="relative inline-block px-3 py-1.5 rounded-full bg-white/5 text-xs font-mono text-[var(--text-tertiary)] border border-white/10">
                                            📅 {exp.period}
                                        </span>
                                    </div>
                                </div>

                                {/* Empty Space for Grid - Desktop Only */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>

                            {/* Arrow Between Cards - Mobile Only */}
                            {index < experiences.length - 1 && (
                                <div className="flex justify-center py-4 md:hidden">
                                    <div className="text-3xl text-[var(--accent-primary)] opacity-60">
                                        ↓
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
