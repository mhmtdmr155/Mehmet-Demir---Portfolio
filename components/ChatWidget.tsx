"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiX, HiPaperAirplane, HiSparkles, HiTrash } from "react-icons/hi";
import { RiRobot2Fill } from "react-icons/ri";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function getInitialMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("md_chat_history");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-50) as Message[];
  } catch {
    return [];
  }
}

// Türkçe karakter normalize
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c');
}

type Language = "tr" | "en";

type LocalizedAnswer = string | string[];

interface KnowledgeEntry {
  id: string;
  keywords: string[];
  variations?: string[];
  answer: {
    tr: LocalizedAnswer;
    en: LocalizedAnswer;
  };
}

const FALLBACK_ANSWERS: Record<Language, LocalizedAnswer> = {
  tr: [
    "Bunu netleştirebilir misin? Eğitim/deneyim/proje/teknoloji/iletişim/konum/CV sorabilirsin. Günlük sorular da olur.",
    "Tam anlayamadım. Eğitim, deneyim, projeler, teknoloji, iletişim, konum veya CV sorabilirsin.",
    "Kısa ipucu: eğitim, deneyim, projeler, teknoloji, iletişim, konum, CV. Günlük sorular da sorabilirsin.",
  ],
  en: [
    "Could you clarify? Ask about education, experience, projects, tech, contact, location or CV. Daily questions are fine too.",
    "I’m not sure I got that. You can ask about education, experience, projects, tech stack, contact, location or CV.",
    "Quick tip: ask about education, experience, projects, tech, contact, location, or CV. Daily questions work too.",
  ],
};

function pickAnswer(answer: LocalizedAnswer): string {
  if (Array.isArray(answer)) {
    return answer[Math.floor(Math.random() * answer.length)];
  }
  return answer;
}

function getAnswer(entry: KnowledgeEntry, language: Language): string {
  return pickAnswer(entry.answer[language]);
}

function getPreferredLanguage(): Language {
  if (typeof navigator === "undefined") return "tr";
  const lang = (navigator.language || "").toLowerCase();
  return lang.startsWith("en") ? "en" : "tr";
}

function detectLanguage(message: string): Language {
  const raw = message.toLowerCase();
  if (raw.startsWith("en:") || raw.startsWith("english:")) return "en";
  if (raw.startsWith("tr:") || raw.startsWith("turkce:") || raw.startsWith("türkçe:")) return "tr";
  if (/[çğıöşü]/i.test(message)) return "tr";

  const trHints = [
    "merhaba", "selam", "nasil", "nedir", "nerede", "hangi", "hakkinda",
    "egitim", "deneyim", "projeler", "iletisim", "telefon", "mail", "cv",
    "hava", "saat", "tarih", "gun", "gunaydin", "espri", "saka", "motivasyon",
  ];
  const enHints = [
    "hello", "hi", "who", "what", "where", "education", "experience",
    "projects", "skills", "contact", "phone", "email", "resume", "cv",
    "weather", "time", "date", "joke", "motivation",
  ];

  const trScore = trHints.reduce((s, w) => (raw.includes(w) ? s + 1 : s), 0);
  const enScore = enHints.reduce((s, w) => (raw.includes(w) ? s + 1 : s), 0);

  if (enScore > trScore) return "en";
  if (trScore > 0) return "tr";
  return "en";
}

// Kural tabanlı, iki dilli bilgi veritabanı (kısa ve öz)
const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "greeting",
    keywords: ["merhaba", "selam", "hello", "hi", "hey", "good morning", "good evening", "gunaydin", "iyi gunler", "selamlar"],
    variations: ["naber", "nasilsin", "sa", "slm"],
    answer: {
      tr: [
        "Merhaba! Ben Demir AI. Mehmet hakkında kısa ve net cevaplar veririm. Ne öğrenmek istersin?",
        "Selam! Demir AI buradayım. Mehmet’le ilgili kısa bilgi verebilirim.",
        "Merhaba! Kısa ve öz cevaplarla yardımcı olayım. Ne soracaksın?",
      ],
      en: [
        "Hi! I'm Demir AI. I give short, precise answers about Mehmet. What would you like to know?",
        "Hello! Demir AI here. Ask me anything about Mehmet.",
        "Hey! I can help with concise info about Mehmet.",
      ],
    },
  },
  {
    id: "help",
    keywords: ["yardim", "help", "komut", "ne sorabilirim", "what can i ask", "commands", "how can you help"],
    answer: {
      tr: [
        "Şunları sorabilirsin: eğitim, deneyim, projeler, teknoloji, iletişim, konum, CV. Günlük sorular da olur.",
        "Eğitim/deneyim/proje/teknoloji/iletişim/konum/CV sorabilirsin. İstersen günlük sorular da sor.",
        "Kısa menü: eğitim, deneyim, projeler, teknoloji, iletişim, konum, CV.",
      ],
      en: [
        "Ask about: education, experience, projects, tech, contact, location or CV. Daily questions are fine too.",
        "You can ask about education, experience, projects, tech stack, contact, location or CV.",
        "Quick menu: education, experience, projects, tech, contact, location, CV.",
      ],
    },
  },
  {
    id: "assistant",
    keywords: ["sen kimsin", "sen nesin", "demir ai", "assistant", "bot", "who are you", "your name", "ismin ne", "adin ne"],
    variations: ["adın ne", "ismin ne", "beni duyuyor musun"],
    answer: {
      tr: [
        "Ben Demir AI, Mehmet’in dijital asistanıyım.",
        "Mehmet için hazırlanmış dijital asistanım.",
      ],
      en: [
        "I'm Demir AI, Mehmet's digital assistant.",
        "I'm a rule‑based assistant built for Mehmet.",
      ],
    },
  },
  {
    id: "howAreYou",
    keywords: ["nasilsin", "naber", "iyi misin", "how are you", "how's it going", "how are you doing"],
    answer: {
      tr: [
        "İyiyim, teşekkürler. Sana nasıl yardımcı olabilirim?",
        "Gayet iyi. Ne öğrenmek istersin?",
        "İyiyim. Kısa bir sorunun var mı?",
      ],
      en: [
        "I'm good, thanks. How can I help?",
        "Doing well. What would you like to know?",
        "All good. Got a quick question?",
      ],
    },
  },
  {
    id: "whatDoing",
    keywords: ["ne yapiyorsun", "ne yapıyorsun", "ne yaparsin", "what are you doing", "what do you do"],
    answer: {
      tr: [
        "Mehmet hakkında hızlı ve net bilgi veriyorum.",
        "Buradayım; Mehmet’le ilgili kısa bilgi sağlıyorum.",
      ],
      en: [
        "I provide quick, clear info about Mehmet.",
        "I'm here to answer short questions about Mehmet.",
      ],
    },
  },
  {
    id: "timeDate",
    keywords: ["saat kac", "saat kaç", "tarih", "bugun", "today", "date", "time"],
    answer: {
      tr: [
        "Canlı saat/tarihe erişimim yok. Cihazından kontrol edebilirsin.",
        "Şu an canlı saat/tarih veremiyorum. Telefona bakabilirsin.",
      ],
      en: [
        "I don't have live time/date. Please check your device.",
        "I can’t access live time/date right now. Please check your phone.",
      ],
    },
  },
  {
    id: "weather",
    keywords: ["hava", "weather", "sicaklik", "sıcaklık", "forecast"],
    answer: {
      tr: [
        "Canlı hava durumuna erişemiyorum. Telefonundan bakabilirsin.",
        "Hava durumunu canlı çekemiyorum. Lütfen hava uygulamasına bak.",
      ],
      en: [
        "I can't access live weather. Please check your weather app.",
        "I don’t have live weather data. Please check your phone.",
      ],
    },
  },
  {
    id: "joke",
    keywords: ["saka", "şaka", "espri", "fıkra", "joke", "funny"],
    answer: {
      tr: [
        "Minik bir şaka: “Kod yazınca bozulmayan tek şey… yorum satırları.” 🙂",
        "Kısa espri: “404: Şaka bulunamadı.” 🙂",
        "Programcı şakası: “Karanlık modu severiz çünkü ışık bug çeker.” 🙂",
      ],
      en: [
        "Quick joke: Why do programmers love dark mode? Because light attracts bugs. 🙂",
        "Tiny joke: 404 — joke not found. 🙂",
        "Programmer joke: I would tell you a UDP joke, but you might not get it. 🙂",
      ],
    },
  },
  {
    id: "motivation",
    keywords: ["motivasyon", "moral", "tavsiye", "ilham", "advice", "motivate", "encourage"],
    answer: {
      tr: [
        "Kısa motivasyon: küçük adım + düzenli pratik = büyük gelişim.",
        "Bugün 1 küçük adım at, yarın 10 adım kazanırsın.",
        "İstikrar her şeyi çözer. Devam et!",
      ],
      en: [
        "Small steps + consistency = big growth.",
        "One small step today becomes momentum tomorrow.",
        "Consistency beats intensity. Keep going!",
      ],
    },
  },
  {
    id: "goodbye",
    keywords: ["gorusuruz", "görüşürüz", "bye", "see you", "goodbye", "hosca kal", "hoşça kal"],
    answer: {
      tr: [
        "Görüşürüz! Başka bir şey gerekirse buradayım.",
        "Hoşça kal! İstediğin zaman yazabilirsin.",
      ],
      en: [
        "See you! I'm here if you need anything else.",
        "Goodbye! Feel free to ask anytime.",
      ],
    },
  },
  {
    id: "hobbies",
    keywords: ["hobi", "hobbies", "favori", "favorite", "free time"],
    answer: {
      tr: [
        "Hobi bilgisi paylaşılmadı. İstersen ekleyebilirim.",
        "Hobilerle ilgili bilgi yok. Dilersen güncelleyeyim.",
      ],
      en: [
        "No hobby info shared yet. I can add it if you'd like.",
        "Hobby info isn't available. I can update it if you want.",
      ],
    },
  },
  {
    id: "age",
    keywords: ["kac yas", "kaç yaş", "how old", "dogum", "birth"],
    answer: {
      tr: [
        "Yaş bilgisi paylaşılmadı.",
        "Bu bilgi paylaşılmıyor.",
      ],
      en: [
        "Age info isn't shared.",
        "That info isn't available.",
      ],
    },
  },
  {
    id: "navigation",
    keywords: ["site", "sayfa", "menu", "menü", "navigate", "navigation", "where can i find", "bolum", "bölüm"],
    answer: {
      tr: [
        "Site tek sayfa. Menüden bölümlere atlayabilirsin (Hakkımda, Deneyim, Projeler...).",
        "Menü üzerinden istediğin bölüme hızlıca gidebilirsin.",
      ],
      en: [
        "It's a single‑page site. Use the menu to jump to sections.",
        "Use the navigation menu to jump to any section.",
      ],
    },
  },
  {
    id: "summary",
    keywords: ["kendini tanit", "hakkinda", "mehmet kim", "about", "who is", "bio", "profile"],
    variations: ["kim bu mehmet", "mehmet hakkinda"],
    answer: {
      tr: [
        "Mehmet Demir — yazılım geliştirici adayı. KSÜ Bilgisayar Müh. 3. sınıf (GNO 2.84). React/React Native ve Python/AI odaklı.",
        "Kısaca: Mehmet Demir, KSÜ Bilgisayar Müh. 3. sınıf. React/React Native ve Python/AI projeleri geliştiriyor.",
      ],
      en: [
        "Mehmet Demir is a software developer candidate. BSc CS at KSÜ (3rd year, GPA 2.84). Focus on React/React Native and Python/AI.",
        "Short bio: Mehmet Demir, 3rd‑year CS student at KSÜ. Focused on React/React Native and Python/AI.",
      ],
    },
  },
  {
    id: "education",
    keywords: ["egitim", "education", "universite", "university", "gno", "gpa", "lise", "high school", "hazirlik", "prep"],
    answer: {
      tr: [
        "Eğitim: KSÜ Bilgisayar Müh. 3. sınıf (GNO 2.84). İngilizce hazırlık B2.",
        "KSÜ Bilgisayar Müh. 3. sınıf, GNO 2.84. İngilizce B2.",
      ],
      en: [
        "Education: BSc CS at KSÜ, 3rd year (GPA 2.84). English prep B2.",
        "KSÜ CS (3rd year, GPA 2.84). English level B2.",
      ],
    },
  },
  {
    id: "experience",
    keywords: ["deneyim", "experience", "is", "work", "kariyer", "career", "staj", "intern"],
    answer: {
      tr: [
        "Deneyim: Prep ShipHub, Helikanon staj, Freelance; ayrıca Teknofest SİHA ve Work & Travel.",
        "Kısaca: Web & Mobile Dev (Prep ShipHub), staj (Helikanon), freelance + Teknofest.",
      ],
      en: [
        "Experience: Prep ShipHub, Helikanon intern, Freelance; plus Teknofest SİHA and Work & Travel.",
        "In short: Web & Mobile Dev, intern, freelance, and Teknofest experience.",
      ],
    },
  },
  {
    id: "prepShipHub",
    keywords: ["prep shiphub", "shiphub", "lojistik", "logistics"],
    answer: {
      tr: [
        "Prep ShipHub: Web & Mobile Developer (Haz–Kas 2025). React/React Native.",
        "Prep ShipHub’da React ve React Native ile web/mobil arayüzler geliştirdi.",
      ],
      en: [
        "Prep ShipHub: Web & Mobile Developer (Jun–Nov 2025). React/React Native.",
        "At Prep ShipHub, he built web/mobile UIs with React and React Native.",
      ],
    },
  },
  {
    id: "helikanon",
    keywords: ["helikanon"],
    answer: {
      tr: [
        "Helikanon: Stajyer Yazılım Geliştirici (Ağu–Eyl 2025).",
        "Helikanon’da staj yaptı (Ağu–Eyl 2025).",
      ],
      en: [
        "Helikanon: Software Dev Intern (Aug–Sep 2025).",
        "Interned at Helikanon (Aug–Sep 2025).",
      ],
    },
  },
  {
    id: "freelance",
    keywords: ["freelance", "serbest", "bagimsiz"],
    answer: {
      tr: [
        "Freelance: 2023–devam. Web/mobil projeler, müşteri yönetimi.",
        "2023’ten beri freelance; web/mobil çözümler geliştiriyor.",
      ],
      en: [
        "Freelance since 2023: web/mobile solutions and client work.",
        "Freelance developer since 2023 (web & mobile projects).",
      ],
    },
  },
  {
    id: "teknofest",
    keywords: ["teknofest", "siha", "uav", "iha", "istiklal", "drone"],
    answer: {
      tr: [
        "Teknofest İstiklal SİHA: Yazılım ekip üyesi (Ara 2023–Eyl 2024).",
        "İstiklal SİHA projesinde yazılım ekip üyesiydi.",
      ],
      en: [
        "Teknofest İstiklal SİHA: software team member (Dec 2023–Sep 2024).",
        "Worked on the İstiklal SİHA project as a software team member.",
      ],
    },
  },
  {
    id: "workTravel",
    keywords: ["work and travel", "abd", "usa", "amerika"],
    answer: {
      tr: [
        "Work and Travel USA (Yaz 2024): global iletişim ve kültürlerarası deneyim.",
        "ABD Work and Travel (2024 yazı): global deneyim.",
      ],
      en: [
        "Work and Travel USA (Summer 2024): global communication & cultural experience.",
        "Work and Travel USA, Summer 2024.",
      ],
    },
  },
  {
    id: "projects",
    keywords: ["projeler", "projects", "github", "portfolio"],
    answer: {
      tr: [
        "Projeler: YouTube Success Predictor, Product Manager, Mayın Tarlası, Restaurant Order Tracking.",
        "Öne çıkanlar: YouTube Predictor, Product Manager, Minesweeper, Restaurant Order Tracking.",
      ],
      en: [
        "Projects: YouTube Success Predictor, Product Manager, Minesweeper, Restaurant Order Tracking.",
        "Highlights: YouTube Predictor, Product Manager, Minesweeper, Restaurant Order Tracking.",
      ],
    },
  },
  {
    id: "youtubePredictor",
    keywords: ["youtube", "success predictor", "tahmin", "prediction"],
    answer: {
      tr: [
        "YouTube Success Predictor: 2600+ video, 80+ özellik, ML; Flask arayüz.",
        "YouTube Predictor: ML tabanlı başarı tahmini, Flask arayüz.",
      ],
      en: [
        "YouTube Success Predictor: 2,600+ videos, 80+ features, ML; Flask app.",
        "YouTube Predictor: ML‑based success prediction with a Flask UI.",
      ],
    },
  },
  {
    id: "skills",
    keywords: ["yetenek", "skills", "tech stack", "teknoloji", "stack", "teknik"],
    answer: {
      tr: [
        "Stack: React/Next.js, React Native, TS/JS, Python/Flask, ML, SQL/MySQL, Tailwind.",
        "Teknoloji: React, Next.js, React Native, Python, ML, SQL/MySQL, Tailwind.",
      ],
      en: [
        "Stack: React/Next.js, React Native, TS/JS, Python/Flask, ML, SQL/MySQL, Tailwind.",
        "Tech: React, Next.js, React Native, Python, ML, SQL/MySQL, Tailwind.",
      ],
    },
  },
  {
    id: "softSkills",
    keywords: ["kisisel", "soft skill", "strengths", "problem cozum", "takim", "teamwork"],
    answer: {
      tr: [
        "Güçlü yönler: problem çözme, takım çalışması, hızlı öğrenme, global iletişim.",
        "Öne çıkanlar: problem çözme, iletişim, ekip çalışması.",
      ],
      en: [
        "Strengths: problem‑solving, teamwork, fast learning, global communication.",
        "Highlights: problem‑solving, communication, teamwork.",
      ],
    },
  },
  {
    id: "courses",
    keywords: ["kurs", "courses", "udemy", "sertifika", "certificates"],
    answer: {
      tr: [
        "Kurslar: Web Dev Bootcamp, React Complete Guide, React Native Guide, Git/GitHub, SQL/MySQL.",
        "Udemy: Web Dev Bootcamp, React, React Native, Git/GitHub, SQL/MySQL.",
      ],
      en: [
        "Courses: Web Dev Bootcamp, React Complete Guide, React Native Guide, Git/GitHub, SQL/MySQL.",
        "Udemy: Web Dev Bootcamp, React, React Native, Git/GitHub, SQL/MySQL.",
      ],
    },
  },
  {
    id: "contact",
    keywords: ["iletisim", "contact", "email", "mail", "telefon", "phone", "linkedin", "github", "instagram"],
    answer: {
      tr: [
        "İletişim: mhmtdmr1552@gmail.com | +90 543 232 3167. LinkedIn: mehmet-demir-35b720207.",
        "Mail: mhmtdmr1552@gmail.com • Tel: +90 543 232 3167 • GitHub: mhmtdmr155.",
      ],
      en: [
        "Contact: mhmtdmr1552@gmail.com | +90 543 232 3167. LinkedIn: mehmet-demir-35b720207.",
        "Email: mhmtdmr1552@gmail.com • Phone: +90 543 232 3167 • GitHub: mhmtdmr155.",
      ],
    },
  },
  {
    id: "cv",
    keywords: ["cv", "resume", "ozgecmis", "pdf"],
    answer: {
      tr: [
        "CV: /MEHMET DEMİR CV.pdf (Hero bölümündeki “CV İndir”).",
        "CV dosyası: /MEHMET DEMİR CV.pdf.",
      ],
      en: [
        "CV: /MEHMET DEMİR CV.pdf (use the “CV Download” button).",
        "CV file: /MEHMET DEMİR CV.pdf.",
      ],
    },
  },
  {
    id: "location",
    keywords: ["konum", "location", "nerede", "where", "gaziantep", "kahramanmaras"],
    answer: {
      tr: [
        "Lokasyon: Gaziantep & Kahramanmaraş. Remote çalışmaya açık.",
        "Gaziantep/Kahramanmaraş. Remote çalışmaya uygun.",
      ],
      en: [
        "Location: Gaziantep & Kahramanmaraş. Open to remote.",
        "Based in Gaziantep/Kahramanmaraş, open to remote work.",
      ],
    },
  },
  {
    id: "languages",
    keywords: ["dil", "languages", "ingilizce", "english", "turkce", "turkish"],
    answer: {
      tr: [
        "Diller: Türkçe (ana dil), İngilizce B2.",
        "Türkçe ana dil, İngilizce B2.",
      ],
      en: [
        "Languages: Turkish (native), English B2.",
        "Turkish (native), English B2.",
      ],
    },
  },
  {
    id: "license",
    keywords: ["ehliyet", "license", "driving"],
    answer: {
      tr: [
        "Ehliyet: M, B, B1, F.",
        "Sürücü belgeleri: M, B, B1, F.",
      ],
      en: [
        "Driving license: M, B, B1, F.",
        "Licenses: M, B, B1, F.",
      ],
    },
  },
  {
    id: "reference",
    keywords: ["referans", "reference", "yasin", "celik"],
    answer: {
      tr: [
        "Referans: Yasin Çelik — Staff Software Engineer at LinkedIn. Kurum: Microsoft. LinkedIn: yasin-celik-30933a31.",
        "Yasin Çelik: Staff Software Engineer at LinkedIn. Kurum: Microsoft. E-posta: yasincelikk16@gmail.com.",
      ],
      en: [
        "Reference: Yasin Çelik — Staff Software Engineer at LinkedIn. Organization: Microsoft. LinkedIn: yasin-celik-30933a31.",
        "Yasin Çelik — Staff Software Engineer at LinkedIn. Organization: Microsoft. Email: yasincelikk16@gmail.com.",
      ],
    },
  },
  {
    id: "openToWork",
    keywords: ["open to work", "is ariyor", "available", "hire", "pozisyon", "job"],
    answer: {
      tr: [
        "Open to Work: full‑time/part‑time/freelance. Odak: React/React Native/Full‑Stack.",
        "Çalışmaya açık: full‑time, part‑time, freelance (React/React Native/Full‑Stack).",
      ],
      en: [
        "Open to work: full‑time/part‑time/freelance. Focus on React/React Native/Full‑Stack.",
        "Available for full‑time, part‑time, and freelance roles.",
      ],
    },
  },
  {
    id: "thanks",
    keywords: ["tesekkur", "teşekkür", "tesekkurler", "sagol", "sağol", "eyv", "thanks", "thank you", "great", "awesome", "super", "süpersin"],
    answer: {
      tr: [
        "Rica ederim! Başka ne öğrenmek istersin?",
        "Ne demek! Başka sorunuz var mı?",
      ],
      en: [
        "You're welcome! What else would you like to know?",
        "Anytime! Anything else you want to ask?",
      ],
    },
  },
];

const QUICK_PROMPTS = [
  { label: { tr: "Deneyim", en: "Experience" }, prompt: { tr: "Deneyimini özetle", en: "Summarize your experience" } },
  { label: { tr: "Projeler", en: "Projects" }, prompt: { tr: "Projelerini listele", en: "List your projects" } },
  { label: { tr: "Teknoloji", en: "Tech Stack" }, prompt: { tr: "Teknoloji stack'in nedir?", en: "What's your tech stack?" } },
  { label: { tr: "İletişim", en: "Contact" }, prompt: { tr: "İletişim bilgilerini ver", en: "Share your contact info" } },
  { label: { tr: "Saat", en: "Time" }, prompt: { tr: "Saat kaç?", en: "What time is it?" } },
  { label: { tr: "Hava", en: "Weather" }, prompt: { tr: "Hava durumu?", en: "What's the weather?" } },
];

function findBestMatch(userMessage: string): string {
  const normalized = normalizeText(userMessage);
  const words = normalized.split(/\s+/).filter(Boolean);
  const language = detectLanguage(userMessage);

  let maxScore = 0;
  let bestEntry: KnowledgeEntry | null = null;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;
      if (normalized.includes(normalizedKeyword)) score += Math.max(2, normalizedKeyword.length);
      if (words.includes(normalizedKeyword)) score += 4;
    }

    if (entry.variations) {
      for (const variation of entry.variations) {
        const normalizedVariation = normalizeText(variation);
        if (!normalizedVariation) continue;
        if (normalized.includes(normalizedVariation)) score += Math.max(1, normalizedVariation.length / 2);
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || maxScore < 3) {
    return pickAnswer(FALLBACK_ANSWERS[language]);
  }

  return getAnswer(bestEntry, language);
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const uiLanguage = useMemo(() => getPreferredLanguage(), []);
  const isEnglish = uiLanguage === "en";

  // Mesajları localStorage'a kaydet
  useEffect(() => {
    if (messages.length === 0) return;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("md_chat_history", JSON.stringify(messages));
    } catch (error) {
      console.warn("Chat history save failed:", error);
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const typingDelay = 250 + Math.random() * 350;

    setTimeout(() => {
      const aiResponse = findBestMatch(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, typingDelay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearHistory = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("md_chat_history");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Professional Messages Window - Mobile Optimized */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[94vw] sm:w-[420px] max-w-[420px] h-[82dvh] sm:h-[700px] sm:max-h-[88vh] backdrop-blur-2xl bg-gradient-to-br from-[#0a0a0a]/95 via-[#111111]/95 to-[#0a0a0a]/95 border border-emerald-500/20 rounded-2xl sm:rounded-3xl shadow-[0_18px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden ring-1 ring-emerald-500/20"
          >
            {/* AI-Themed Header - Mobile Optimized */}
            <div className="relative p-3 sm:p-5 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 via-green-950/40 to-emerald-950/50 backdrop-blur-xl">
              {/* Animated Circuit Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.3),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(5,150,105,0.3),transparent_40%)]" />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 p-[2px] shadow-lg shadow-emerald-500/30">
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden p-0.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/profile.jpg" alt="Demir AI" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    </div>
                    {/* AI Status Indicator */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.7, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full border-2 border-black shadow-lg shadow-emerald-500/60"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5 sm:gap-2">
                      Demir AI
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <HiSparkles className="text-emerald-400 w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                      </motion.div>
                    </h3>
                    <p className="text-[10px] sm:text-xs text-emerald-300/70 font-semibold tracking-wide mt-0.5 flex items-center gap-1 sm:gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      {isEnglish ? "AI Assistant • Online" : "AI Asistan • Aktif"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {messages.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearHistory}
                      className="p-2 sm:p-2.5 rounded-xl hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all duration-200 backdrop-blur active:bg-red-500/30"
                      title={isEnglish ? "Clear chat" : "Konuşmayı temizle"}
                    >
                      <HiTrash size={16} className="sm:w-[17px] sm:h-[17px]" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 sm:p-2.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-all duration-200 active:bg-white/20"
                  >
                    <HiX size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* AI Chat Area - Extra Spacing */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-7 space-y-3 sm:space-y-4 bg-[#0a0a0a]/50 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent hover:scrollbar-thumb-emerald-500/50">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4 px-6 sm:px-8"
                >
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 rounded-full blur-2xl opacity-40"
                    />
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <RiRobot2Fill className="relative text-emerald-400 w-14 h-14 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[14px] sm:text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
                      {uiLanguage === "en" ? "Welcome to Demir AI!" : "Demir AI&apos;ya Hoş Geldiniz!"}
                      <motion.div
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <span className="text-xl sm:text-2xl">👋</span>
                      </motion.div>
                    </h4>
                    <p className="text-[12px] sm:text-sm text-emerald-200/70 leading-relaxed max-w-xs px-2">
                      {uiLanguage === "en"
                        ? "I'm Mehmet's digital assistant. Ask about education, experience, projects, tech, or contact."
                        : "Ben Mehmet&apos;in dijital asistanıyım. Eğitim, deneyim, projeler, teknoloji ve iletişim sorabilirsiniz."}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-3 sm:mt-4">
                      {QUICK_PROMPTS.map((item) => (
                        <button
                          key={item.label.en}
                          type="button"
                          onClick={() => sendMessage(item.prompt[uiLanguage])}
                          className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs text-emerald-300/90 backdrop-blur hover:bg-emerald-500/20 transition-colors"
                        >
                          {item.label[uiLanguage]}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] sm:max-w-[72%] rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-[14.5px] leading-relaxed shadow-lg ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white font-semibold rounded-br-md shadow-emerald-500/40"
                        : "bg-[#1a1a1a]/80 backdrop-blur-xl text-white/90 border border-emerald-500/20 rounded-bl-md whitespace-pre-line"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-emerald-500/20 px-5 py-3.5 rounded-2xl rounded-bl-md flex gap-2 items-center shadow-lg shadow-emerald-500/10">
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    />
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="w-2.5 h-2.5 bg-emerald-600 rounded-full shadow-[0_0_8px_rgba(5,150,105,0.6)]"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Input Area - Super Large */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-gradient-to-t from-[#0a0a0a] via-emerald-950/10 to-transparent backdrop-blur-xl border-t border-emerald-500/20">
              <div className="flex gap-2.5 sm:gap-4">
                <input
                  className="flex-1 bg-[#1a1a1a]/80 backdrop-blur-xl border-2 border-emerald-500/20 rounded-2xl sm:rounded-3xl px-4 py-3 sm:px-6 sm:py-4 text-[15px] sm:text-[17px] text-white placeholder:text-emerald-300/50 focus:outline-none focus:border-emerald-500/70 focus:ring-4 focus:ring-emerald-500/30 transition-all shadow-inner font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isEnglish ? "Ask a question..." : "Bir soru sorun..."}
                  maxLength={250}
                />
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white rounded-2xl sm:rounded-3xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 active:shadow-emerald-500/80 border-2 border-emerald-400/40"
                >
                  <HiPaperAirplane className="rotate-90 w-6 h-6 sm:w-7 sm:h-7" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI-Themed Floating Toggle Button - Mobile Optimized */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group relative flex items-center justify-center w-14 h-14 sm:w-[70px] sm:h-[70px] rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.6)] active:shadow-[0_20px_60px_rgba(16,185,129,0.7)] transition-all z-[10000] border-2 border-emerald-400/30"
      >
        {/* Animated Glow Ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 blur-md"
        />
        
        {/* AI Brain Pattern Background */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(5,150,105,0.3),transparent_50%)]" />
        </div>
        
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 0.9 : 1
          }}
          transition={{ duration: 0.3, type: "spring" }}
          className="relative z-10"
        >
          {isOpen ? (
            <HiX size={24} className="sm:w-8 sm:h-8 drop-shadow-lg" />
          ) : (
            <div className="relative">
              {/* AI Robot Face with Smile */}
              <RiRobot2Fill size={30} className="sm:w-[38px] sm:h-[38px] drop-shadow-2xl" />
              {/* Animated Sparkle */}
              <motion.div
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <HiSparkles size={12} className="sm:w-[14px] sm:h-[14px] text-yellow-300" />
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* AI-Themed Tooltip - Desktop Only */}
        {!isOpen && (
          <div className="hidden sm:block absolute right-full mr-4 px-4 py-2 bg-gradient-to-r from-emerald-600/95 to-green-700/95 backdrop-blur-xl text-white text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-emerald-400/30 shadow-xl shadow-emerald-500/20">
            <span className="flex items-center gap-2">
              <RiRobot2Fill className="text-yellow-300" />
              {isEnglish ? "Chat with Demir AI" : "Demir AI ile konuş!"}
            </span>
          </div>
        )}

        {/* AI Active Badge */}
        {messages.length === 0 && !isOpen && (
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-black text-base font-black border-2 border-emerald-600 shadow-lg shadow-yellow-500/50"
          >
            <HiSparkles size={14} className="sm:w-4 sm:h-4" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
