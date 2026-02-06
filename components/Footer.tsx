"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative w-full py-12 sm:py-16 overflow-hidden border-t border-[var(--border-color)]">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 to-[var(--accent-secondary)]/5"></div>
      
      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-base sm:text-lg lg:text-xl mb-8 font-medium text-[var(--text-primary)]"
        >
          Teşekkürler! Ziyaret ettiğiniz için memnun oldum. 🙌
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {[
            { icon: FaGithub, href: "https://github.com/mhmtdmr155", label: "GitHub" },
            { icon: FaLinkedin, href: "https://www.linkedin.com/in/mehmet-demir-35b720207/", label: "LinkedIn" },
            { icon: FaInstagram, href: "https://instagram.com/mhmtdmir01", label: "Instagram" },
          ].map((social, index) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[var(--accent-primary)]/50 transition-all duration-300"
              whileHover={{ scale: 1.15, rotate: 5, y: -8 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 + index * 0.04, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              />
              <social.icon size={20} className="relative z-10 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300" />
            </motion.a>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="border-t border-[var(--border-color)] pt-6 sm:pt-8"
        >
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            © {new Date().getFullYear()} <span className="font-semibold gradient-text">Mehmet Demir</span>. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
