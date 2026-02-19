"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HiMenu, HiX, HiMoon, HiSun } from "react-icons/hi";
import { useTheme } from "./ThemeProvider";
import {
  IconAbout,
  IconContact,
  IconCourses,
  IconEducation,
  IconProjects,
  IconReferences,
  IconExperience,
} from "./NavIcons";

const navItems = [
  { name: "Hakkımda", href: "#hakkimda", Icon: IconAbout },
  { name: "Deneyim", href: "#deneyim", Icon: IconExperience },
  { name: "Eğitim", href: "#egitim", Icon: IconEducation },
  { name: "Projeler", href: "#projeler", Icon: IconProjects },
  { name: "Kurslar", href: "#kurslar", Icon: IconCourses },
  { name: "Referanslar", href: "#referanslar", Icon: IconReferences },
  { name: "İletişim", href: "#iletisim", Icon: IconContact },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hasProfileImage, setHasProfileImage] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Update CSS variable for main padding based on sidebar state
    const width = isCollapsed ? "0rem" : "15rem";
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--sidebar-width", width);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveSection(`#${visible[0].target.id}`);
        }
      },
      {
        rootMargin: "-30% 0px -50% 0px",
        threshold: [0.2, 0.4, 0.6],
      }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.href.substring(1));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop Vertical Sidebar - Left Side */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: isCollapsed ? -320 : 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 24, duration: 0.25 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-60 xl:w-64 transition-all duration-300"
      >
        <motion.div
          className={`h-full w-full flex flex-col py-6 xl:py-8 transition-all duration-500 ${scrolled
            ? "bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-r border-white/10 shadow-[8px_0_24px_rgba(0,0,0,0.15)]"
            : "bg-[var(--bg-primary)]/90 backdrop-blur-2xl border-r border-white/10"
            }`}
        >
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.02, type: "spring", duration: 0.25, stiffness: 180 }}
            className="flex flex-col items-center mb-6 px-4 xl:px-6"
          >
            <div className="relative mb-4">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full blur-lg opacity-40"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative w-28 h-28 xl:w-32 xl:h-32 rounded-full overflow-hidden border-4 border-[var(--accent-primary)]/30 shadow-lg">
                {hasProfileImage ? (
                  <Image
                    src="/profile.jpg"
                    alt="Mehmet Demir"
                    fill
                    sizes="(max-width: 1280px) 112px, 128px"
                    className="object-cover"
                    onError={() => setHasProfileImage(false)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white text-3xl xl:text-4xl font-black">
                    MD
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quote/Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            className="px-4 xl:px-6 mb-6 xl:mb-8"
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 xl:p-5 border border-white/10 shadow-lg">
              <p className="text-center text-[var(--text-primary)] font-semibold text-base xl:text-lg italic leading-relaxed">
                &ldquo;Kodla, öğren, geliştir.&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-2 xl:gap-3 flex-1 px-3 xl:px-4 overflow-y-auto">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3 xl:gap-4 px-4 xl:px-5 py-3.5 xl:py-4 rounded-xl transition-all duration-300 group ${activeSection === item.href
                  ? "bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 text-[var(--text-primary)] border border-[var(--accent-primary)]/25 shadow-md"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent hover:border-white/10"
                  }`}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + index * 0.03, duration: 0.2 }}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeSection === item.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-r-full shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.Icon
                  size={20}
                  className={`relative z-10 flex-shrink-0 ${activeSection === item.href
                    ? "text-white"
                    : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                    }`}
                />
                <span className={`font-semibold text-base xl:text-lg relative z-10 ${activeSection === item.href ? "text-white" : ""
                  }`}>
                  {item.name}
                </span>
              </motion.a>
            ))}
          </div>

          {/* Theme Toggle - Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="px-3 xl:px-4"
          >
            <motion.button
              onClick={toggleTheme}
              className="w-full p-4 xl:p-5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-[var(--accent-primary)]/50 transition-all duration-300 group flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02, rotate: 180 }}
              whileTap={{ scale: 0.98 }}
            >
              {theme === "dark" ? (
                <>
                  <HiSun className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={22} />
                  <span className="text-sm xl:text-base font-semibold text-[var(--text-primary)]">Light Mode</span>
                </>
              ) : (
                <>
                  <HiMoon className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" size={22} />
                  <span className="text-sm xl:text-base font-semibold text-[var(--text-primary)]">Dark Mode</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* Desktop Sidebar Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed((p) => !p)}
        className="hidden lg:flex fixed top-4 left-4 z-[60] w-10 h-10 rounded-full bg-[var(--bg-primary)]/80 border border-white/10 backdrop-blur-md shadow-lg items-center justify-center text-white hover:border-[var(--accent-primary)]/50 transition-colors"
        aria-label={isCollapsed ? "Menüyü aç" : "Menüyü gizle"}
      >
        {isCollapsed ? <HiMenu size={20} /> : <HiX size={20} />}
      </button>

      {/* Mobile/Tablet Horizontal Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 24, duration: 0.25 }}
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[var(--bg-primary)]/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.a
              href="#"
              className="relative text-2xl font-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="gradient-text drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">MD</span>
            </motion.a>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
                whileTap={{ scale: 0.9 }}
              >
                {theme === "dark" ? (
                  <HiSun className="text-yellow-400" size={20} />
                ) : (
                  <HiMoon className="text-blue-400" size={20} />
                )}
              </motion.button>
              <motion.button
                className="p-2 text-[var(--text-primary)] bg-white/5 backdrop-blur-xl border border-white/10 rounded-full"
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Elegant Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white/5 hover:bg-gradient-to-r hover:from-[var(--accent-primary)]/10 hover:to-[var(--accent-secondary)]/10 rounded-xl transition-all font-medium border border-transparent hover:border-[var(--accent-primary)]/20 text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.Icon size={18} className="flex-shrink-0" />
                    {item.name}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
