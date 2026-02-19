"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { HiMail, HiPaperAirplane, HiChat, HiCheckCircle, HiXCircle } from "react-icons/hi";
import emailjs from "@emailjs/browser";
import SectionHeader from "./SectionHeader";

const socialLinks = [
  { icon: FaGithub, href: "https://github.com/mhmtdmr155", label: "GitHub" },
  { icon: FaLinkedin, href: "https://www.linkedin.com/in/mehmet-demir-35b720207/", label: "LinkedIn" },
  { icon: FaInstagram, href: "https://instagram.com/mhmtdmir01", label: "Instagram" },
];

const feelings = [
  { emoji: "💼", text: "İş Birliği", description: "Proje teklifleri" },
  { emoji: "🤝", text: "Soru", description: "Yardım ve destek" },
  { emoji: "💡", text: "Fikir", description: "Yenilikçi projeler" },
  { emoji: "📧", text: "Genel", description: "Diğer konular" },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    feeling: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const lastSubmitTime = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // EmailJS initialization
  useEffect(() => {
    try {
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      if (publicKey && publicKey !== "your_public_key") {
        emailjs.init(publicKey);
      }
    } catch (error) {
      console.warn("EmailJS initialization failed:", error);
    }
  }, []);

  // Rate limit countdown timer
  useEffect(() => {
    if (remainingSeconds > 0) {
      countdownInterval.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (countdownInterval.current) {
              clearInterval(countdownInterval.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    }

    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [remainingSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting: 10 saniyede bir gönderim
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    const RATE_LIMIT_MS = 10000; // 10 saniye
    
    if (timeSinceLastSubmit < RATE_LIMIT_MS && lastSubmitTime.current > 0) {
      const remaining = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
      setRemainingSeconds(remaining);
      setStatus("error");
      setErrorMessage(`Lütfen ${remaining} saniye bekleyip tekrar deneyin.`);
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 3000);
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      setStatus("error");
      setErrorMessage("Lütfen adınızı girin.");
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 3000);
      return;
    }

    setStatus("loading");
    lastSubmitTime.current = now;

    try {
      // EmailJS configuration - Environment variables kullanılacak
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      // Environment variables kontrolü
      if (!serviceId || !templateId || !publicKey) {
        throw new Error("EmailJS yapılandırması eksik. Lütfen .env.local dosyasını kontrol edin.");
      }

      // Debug: Service ID kontrolü (sadece development'ta)
      if (process.env.NODE_ENV === 'development') {
        console.log('EmailJS Config:', {
          serviceId: serviceId ? `${serviceId.substring(0, 10)}...` : 'MISSING',
          templateId: templateId ? `${templateId.substring(0, 10)}...` : 'MISSING',
          publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING'
        });
      }

      // EmailJS gönderimi (init ile publicKey zaten ayarlandı)
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email || "Belirtilmemiş",
          message: formData.message || "Mesaj yok",
          feeling: formData.feeling || "Seçilmemiş",
          to_email: "mhmtdmr1552@gmail.com",
        }
      );

      setStatus("success");
      setFormData({ name: "", email: "", message: "", feeling: "" });
      
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch (error: unknown) {
      console.error("EmailJS Error:", error);
      
      // Daha detaylı hata mesajı
      let errorMsg = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
      const errorObj = typeof error === "object" && error !== null ? (error as Record<string, unknown>) : null;
      const errorText = errorObj && typeof errorObj.text === "string" ? errorObj.text : "";
      const errorMessage = errorObj && typeof errorObj.message === "string" ? errorObj.message : "";
      const errorStatus = errorObj && typeof errorObj.status === "number" ? errorObj.status : null;

      if (errorText) {
        errorMsg = `EmailJS Hatası: ${errorText}`;
      } else if (errorMessage) {
        errorMsg = errorMessage;
      } else if (errorStatus !== null) {
        errorMsg = `EmailJS Hatası (${errorStatus}): ${errorText || "Bilinmeyen hata"}`;
      }
      
      setStatus("error");
      setErrorMessage(errorMsg);
      
      setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  };

  return (
    <section id="iletisim" className="relative w-full py-12 sm:py-16 lg:py-10 xl:py-12 overflow-hidden">
      {/* Optimized Background - Reduced blur from 120px to 60px */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-secondary)]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/8 rounded-full mix-blend-screen filter blur-[30px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/8 rounded-full mix-blend-screen filter blur-[30px]"></div>
      
      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <SectionHeader
          Icon={HiChat}
          title="İletişim"
          subtitle="Benimle iletişime geçmek için aşağıdaki formu kullanabilirsiniz"
        />

        {/* Social Links - Premium Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="flex flex-col items-center gap-6 mb-16"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl hover:from-white/15 hover:to-white/10 transition-all duration-500"
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
                <social.icon size={24} className="relative z-10 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-300" />
              </motion.a>
            ))}
          </div>
          
          {/* Email Button - Premium */}
          <motion.a
            href="mailto:mhmtdmr1552@gmail.com"
            className="group relative px-8 py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-2xl font-semibold overflow-hidden"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(139,92,246,0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="relative z-10 flex items-center gap-3">
              <HiMail size={24} />
              <span className="text-sm sm:text-base">mhmtdmr1552@gmail.com</span>
            </div>
          </motion.a>
        </motion.div>

        {/* Contact Purpose - Premium Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="max-w-3xl mx-auto mb-12 rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 relative overflow-hidden"
        >
          {/* Decorative gradient overlay - Removed continuous animation for performance */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5 opacity-5" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, rotate: -90 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.3, duration: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] mb-6 mx-auto"
            >
              <HiChat className="text-white text-2xl" />
            </motion.div>
            
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-3 text-center leading-tight">
              İletişim nedeniniz nedir?
            </h3>
            <p className="text-center text-[var(--text-secondary)] mb-8 text-sm sm:text-base">
              Lütfen iletişim nedeninizi seçin ve mesajınızı gönderin
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {feelings.map((feeling, index) => (
                <motion.button
                  key={index}
                  onClick={() => setFormData({ ...formData, feeling: feeling.text })}
                  className={`relative p-4 sm:p-5 rounded-2xl transition-all duration-300 overflow-hidden border ${
                    formData.feeling === feeling.text
                      ? "bg-gradient-to-br from-[var(--accent-primary)]/40 to-[var(--accent-secondary)]/30 border-[var(--accent-primary)]/50 scale-105 shadow-lg shadow-[var(--accent-primary)]/20"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-[var(--accent-primary)]/30"
                  }`}
                  whileHover={{ scale: formData.feeling === feeling.text ? 1.05 : 1.08, y: -6 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + index * 0.04, type: "spring", stiffness: 250 }}
                >
                  {/* Selected indicator */}
                  {formData.feeling === feeling.text && (
                    <motion.div
                      className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[var(--accent-primary)]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 opacity-0 group-hover:opacity-100 rounded-2xl blur-xl"
                    whileHover={{ opacity: 0.3 }}
                  />
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                      className="text-3xl sm:text-4xl mb-2"
                      animate={formData.feeling === feeling.text ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {feeling.emoji}
                    </motion.div>
                    <div className={`font-bold text-sm sm:text-base mb-1 ${
                      formData.feeling === feeling.text 
                        ? "text-white" 
                        : "text-[var(--text-primary)]"
                    }`}>
                      {feeling.text}
                    </div>
                    <div className={`text-xs ${
                      formData.feeling === feeling.text 
                        ? "text-white/80" 
                        : "text-[var(--text-secondary)]"
                    }`}>
                      {feeling.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form - Ultra Premium - NO LAYOUT SHIFTS */}
        <motion.form
          ref={formRef}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.35 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-primary)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-secondary)]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
          <div className="space-y-6">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.25 }}
            >
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></span>
                Ad - Soyad <span className="text-[var(--accent-primary)]">*</span>
              </label>
              <motion.input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 rounded-2xl transition-all duration-300 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none border border-white/10 focus:bg-white/8 focus:border-[var(--accent-primary)]/50 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
                placeholder="Adınız ve soyadınız"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.25 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]"></span>
                Email <span className="text-[var(--text-secondary)] text-xs font-normal">(Opsiyonel)</span>
              </label>
              <motion.input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 rounded-2xl transition-all duration-300 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none border border-white/10 focus:bg-white/8 focus:border-[var(--accent-primary)]/50 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
                placeholder="email@example.com"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Message Field */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.25 }}
            >
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-[var(--text-primary)] mb-2.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-tertiary)]"></span>
                Mesajınız <span className="text-[var(--text-secondary)] text-xs font-normal">(Opsiyonel)</span>
              </label>
              <motion.textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-5 py-4 bg-white/5 rounded-2xl transition-all duration-300 resize-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none border border-white/10 focus:bg-white/8 focus:border-[var(--accent-primary)]/50 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)]"
                placeholder="Mesajınızı buraya yazabilirsiniz..."
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Submit Button - Premium */}
            <motion.button
              type="submit"
              disabled={status === "loading"}
              className="group relative w-full px-6 py-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-2xl font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(139,92,246,0.3)]"
              whileHover={status !== "loading" ? { scale: 1.02, boxShadow: "0 20px 60px rgba(139,92,246,0.5)", y: -2 } : {}}
              whileTap={status !== "loading" ? { scale: 0.98 } : {}}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <motion.div
                className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={status === "loading" ? { x: ["-100%", "100%"] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <div className="relative z-10 flex items-center justify-center gap-2">
                {status === "loading" ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <HiPaperAirplane size={20} />
                    <span>Gönder</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl text-green-400 rounded-2xl text-center font-semibold border border-green-500/30 flex items-center justify-center gap-2"
              >
                <HiCheckCircle size={24} />
                <span>✨ Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağım.</span>
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="mt-6 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl text-red-400 rounded-2xl text-center font-semibold border border-red-500/30 flex flex-col items-center justify-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <HiXCircle size={24} />
                  <span>{errorMessage || "Bir hata oluştu. Lütfen tekrar deneyin."}</span>
                </div>
                {remainingSeconds > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-300/80 mt-2"
                  >
                    ⏱️ Kalan süre: <span className="font-bold">{remainingSeconds}</span> saniye
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
