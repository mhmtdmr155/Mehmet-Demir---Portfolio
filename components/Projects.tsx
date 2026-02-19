"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, useReducedMotion, useInView, Variants } from "framer-motion";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { HiExternalLink, HiFolder } from "react-icons/hi";
import { FaGithub } from "react-icons/fa";
import SectionHeader from "./SectionHeader";
import { useIsMobile } from "../hooks/useIsMobile";
import { useIsClient } from "../hooks/useIsClient";

const projects = [
  {
    title: "YouTube Video Success Predictor",
    description: "Teknoloji kategorisindeki 80+ özellik kullanarak YouTube video performansını tahmin eden makine öğrenimi projesi. Flask web arayüzü ile tahminler ve optimizasyon önerileri sunmaktadır.",
    image: "🤖",
    imageUrl: "/project-covers/youtube-video-success-predictor.svg",
    technologies: ["Python", "Flask", "Machine Learning", "HTML", "CSS", "JavaScript"],
    link: "https://github.com/mhmtdmr155/github_success_predictor",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Product Manager",
    description: "Modern ve kullanıcı dostu ürün yönetim dashboard'u. Ürün yönetimi, Kategori yönetimi, Kullanıcı yönetimi ve detaylı raporlama özellikleri sunan React tabanlı admin paneli.",
    image: "📊",
    imageUrl: null,
    technologies: ["React", "HTML", "CSS", "JavaScript"],
    link: "https://github.com/mhmtdmr155/product_manager",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    title: "Mayın Tarlası Oyunu",
    description: "Kullanıcı, mayınların gizli olduğu dinamik bir haritada, deneme-yanılma ile güvenli yolu bularak çıkışa ulaşmaya çalışır. Oyun, strateji ve hafızaya dayalıdır.",
    image: "💣",
    imageUrl: null,
    technologies: ["C"],
    link: "https://github.com/mhmtdmr155/Mayin-tarlasi-donem-projesi-MD-ZA",
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Restaurant Order Tracking System",
    description: "Restoranda garson ihtiyacını azaltmak için yapılan bir proje. Sipariş takibi ve yönetimi için geliştirilmiş full-stack uygulama.",
    image: "🍽️",
    imageUrl: null,
    technologies: ["HTML", "CSS", "JavaScript"],
    link: "https://github.com/mhmtdmr155/Restaurant-Order-Tracking-System",
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function Projects() {
  const isClient = useIsClient();
  const [showAll, setShowAll] = useState(false);
  const [activeTech, setActiveTech] = useState<string>("Tümü");
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[number] | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const shouldAnimate = isClient && !shouldReduceMotion && !isMobile;

  // Memoize allTechs to avoid recalculation
  const allTechs = useMemo(() =>
    Array.from(new Set(projects.flatMap((p) => p.technologies))).sort((a, b) => a.localeCompare(b, "tr"))
    , []);

  // Memoize filtered projects
  const filteredProjects = useMemo(() =>
    activeTech === "Tümü"
      ? projects
      : projects.filter((p) => p.technologies.includes(activeTech))
    , [activeTech]);

  const displayedProjects = useMemo(() =>
    showAll ? filteredProjects : filteredProjects.slice(0, 4)
    , [showAll, filteredProjects]);

  const hasMore = filteredProjects.length > displayedProjects.length;

  // Keyboard handler with useCallback
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelectedProject(null);
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    window.addEventListener("keydown", handleKeyDown, { passive: true });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject, handleKeyDown]);

  const itemVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" }
    }
  }), []);

  return (
    <section
      id="projeler"
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden"
    >
      {/* Optimized Background - Reduced blur */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]"></div>
      {!shouldReduceMotion && isInView && (
        <div className="hidden md:block pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-purple-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/8 rounded-full mix-blend-screen filter blur-[30px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </div>
      )}

      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiFolder}
          title="Projelerim"
          subtitle="Geliştirdiğim projeler ve kullandığım teknolojiler"
        />

        {/* Filters - Optimized */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTech("Tümü");
              setShowAll(false);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${activeTech === "Tümü"
                ? "bg-[var(--accent-primary)]/20 text-[var(--text-primary)] border-[var(--accent-primary)]/30"
                : "bg-white/5 text-[var(--text-secondary)] border-white/10 hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/30"
              }`}
          >
            Tümü
          </button>
          {allTechs.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => {
                setActiveTech(tech);
                setShowAll(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${activeTech === tech
                  ? "bg-[var(--accent-primary)]/20 text-[var(--text-primary)] border-[var(--accent-primary)]/30"
                  : "bg-white/5 text-[var(--text-secondary)] border-white/10 hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/30"
                }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Projects Grid - Balanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {displayedProjects.map((project, index) => (
            <motion.div
              key={`${project.title}-${index}`}
              variants={shouldAnimate ? itemVariants : undefined}
              initial={shouldAnimate ? "hidden" : undefined}
              animate={shouldAnimate && isInView ? "visible" : undefined}
              style={shouldAnimate ? undefined : { opacity: 1, transform: 'none' }}
              className="group relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-500 flex flex-col h-[400px]"
            >
              {/* Image Area - Restored */}
              <div className="relative h-48 w-full overflow-hidden shrink-0">
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${project.gradient} flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-500`}>
                    <span className="text-6xl drop-shadow-lg">{project.image}</span>
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent opacity-90" />

                {/* Floating Icon Badge */}
                <div className="absolute top-4 right-4 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-2xl">
                  {project.image}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                  {project.title}
                </h3>

                <p className="text-[var(--text-secondary)] line-clamp-2 text-sm mb-6 flex-1">
                  {project.description}
                </p>

                <div className="flex items-center justify-between mt-auto gap-3">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {project.technologies.slice(0, 3).map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-[var(--text-tertiary)] font-medium">
                        {t}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-[var(--text-tertiary)] font-medium">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  <motion.a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-black hover:border-[var(--accent-primary)] transition-all duration-300 font-semibold text-sm whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaGithub size={18} />
                    GitHub
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show more button */}
        {(hasMore || (showAll && filteredProjects.length > 4)) && (
          <div className="mt-10 flex justify-center">
            <motion.button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className={`px-7 py-3 rounded-2xl font-semibold ${hasMore
                  ? "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-[0_10px_40px_rgba(139,92,246,0.25)]"
                  : "bg-white/5 border border-white/10 text-[var(--text-primary)]"
                }`}
            >
              {hasMore ? "Daha fazla göster" : "Daha az göster"}
            </motion.button>
          </div>
        )}

        {/* Modal - Optimized */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Proje detayları"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
              <motion.div
                className="relative w-full max-w-3xl rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[0_30px_120px_rgba(0,0,0,0.8)]"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-64 sm:h-80">
                  {selectedProject.imageUrl ? (
                    <Image
                      src={selectedProject.imageUrl}
                      alt={selectedProject.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 70vw"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-r ${selectedProject.gradient} flex items-center justify-center`}>
                      <span className="text-8xl">{selectedProject.image}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-secondary)] via-transparent to-transparent" />

                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <HiExternalLink className="rotate-45" size={24} />
                  </button>
                </div>

                <div className="p-8 sm:p-10">
                  <h3 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4">
                    {selectedProject.title}
                  </h3>

                  <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                    {selectedProject.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-10">
                    {selectedProject.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary)] text-sm font-bold border border-[var(--border-color)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <motion.a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaGithub size={28} />
                    GitHub
                  </motion.a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
