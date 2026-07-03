"use client";

import { useState, useRef, useEffect } from "react";
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

type Answer = string | string[];

interface KnowledgeEntry {
  id: string;
  keywords: string[];
  variations?: string[];
  answer: Answer;
  priority?: number;
  requiredTerms?: string[];
}

const INTENT_LABELS: Record<string, string> = {
  greeting: "Selamlama",
  help: "Yardım",
  assistant: "Asistan bilgisi",
  summary: "Genel profil",
  education: "Eğitim",
  experience: "Deneyim",
  projects: "Projeler",
  skills: "Teknoloji stack",
  contact: "İletişim",
  cv: "CV",
  location: "Konum",
  reference: "Referans",
  courses: "Kurslar",
  age: "Yaş bilgisi",
  openToWork: "Open to work",
  license: "Ehliyet",
  languages: "Dil bilgisi",
  frontend: "Frontend",
  mobile: "Mobil geliştirme",
  ai: "AI/ML",
  aiUsage: "AI kullanım yaklaşımı",
  strengths: "Güçlü yönler",
  website: "Site bölümleri",
  collaboration: "İş birliği",
  educationVsExperience: "Eğitim vs deneyim",
  hireability: "İşe alınma yorumu",
  careerDecision: "Kariyer yönü seçimi",
  profileReview: "Profil değerlendirme",
  roadmap30: "30 günlük plan",
  whyHire: "Neden işe/staja alınmalı",
};

const FALLBACK_ANSWERS: Answer = [
  "Bunu biraz daha net yazar mısın? Eğitim, deneyim, projeler, teknoloji, iletişim, konum, CV veya günlük sorular sorabilirsin.",
  "Tam anlayamadım. Kısa bir şekilde tekrar sorar mısın?",
  "Daha iyi yardımcı olayım: neyi öğrenmek istediğini 1 cümleyle yazar mısın?",
];

const OUT_OF_SCOPE_ANSWER =
  "Bu soru için sitede/CV’de doğrulanmış bilgi yok. Uydurma bilgi vermem. İstersen eğitim, deneyim, projeler, teknoloji, iletişim veya CV hakkında sor.";

const SENSITIVE_QUESTION_REGEX =
  /\b(maas|maaş|ucret|ücret|salary|din|siyaset|politik|siyasi|oy|sevgili|iliski|ilişki|boyu|kilo|tc kimlik|adres)\b/;

const MIN_SCORE = 6;
const AMBIGUITY_RATIO = 0.86;
const SAFE_TOPICS = ["egitim", "deneyim", "projeler", "teknoloji", "iletisim", "cv", "konum"];
const GENERIC_INTENTS = new Set(["greeting", "help", "assistant", "thanks", "goodbye", "dailyChat"]);

function pickAnswer(answer: Answer): string {
  if (Array.isArray(answer)) {
    return answer[Math.floor(Math.random() * answer.length)];
  }
  return answer;
}

function isLikelyEnglishMessage(message: string): boolean {
  const raw = message.toLowerCase();
  const enWords = [
    "hello", "hi", "how are you", "what", "where", "who", "why", "when",
    "project", "experience", "education", "contact", "phone", "email",
    "weather", "time", "date", "joke", "motivation", "resume", "how old",
    "old", "years old", "your age", "are you",
  ];
  const trWords = [
    "merhaba", "selam", "nasıl", "nasil", "proje", "deneyim", "eğitim", "egitim",
    "iletişim", "iletisim", "telefon", "mail", "hava", "saat", "tarih", "şaka", "saka",
  ];

  const enScore = enWords.reduce((sum, w) => (raw.includes(w) ? sum + 1 : sum), 0);
  const trScore = trWords.reduce((sum, w) => (raw.includes(w) ? sum + 1 : sum), 0);
  const asciiWords = raw
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const hasCommonEnglishPattern = /\b(what|where|when|how|who|why)\b/.test(raw);
  return enScore > trScore || (hasCommonEnglishPattern && asciiWords.length >= 2);
}

function tokenize(message: string): string[] {
  return normalizeText(message)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeQuery(text: string): string {
  let n = normalizeText(text);
  n = n.replace(/([a-z])\1{2,}/g, "$1$1");
  const replacements: Array<[RegExp, string]> = [
    [/\bcvmi\b/g, "cv mi"],
    [/\bozgecmis\b/g, "ozgecmis"],
    [/\bozgecmisi\b/g, "ozgecmis"],
    [/\btecrube\b/g, "deneyim"],
    [/\bteknik stack\b/g, "tech stack"],
    [/\byasinda\b/g, "yasinda"],
    [/\bwt\b/g, "work and travel"],
    [/\bw\/t\b/g, "work and travel"],
    [/\bslm\b/g, "selam"],
    [/\bsa\b/g, "selam"],
    [/\bmrb\b/g, "merhaba"],
    [/\bnbr\b/g, "naber"],
    [/\bnapiyon\b/g, "ne yapiyorsun"],
    [/\bnapiyosun\b/g, "ne yapiyorsun"],
    [/\bnapiosun\b/g, "ne yapiyorsun"],
    [/\bdeniyim\b/g, "deneyim"],
    [/\bdeniyimler\w*\b/g, "deneyimleri"],
    [/\bnekadr\b/g, "ne kadar"],
    [/\bkiscaa\b/g, "kisaca"],
    [/\banlatt\b/g, "anlat"],
    [/\biyiki\b/g, "iyi ki"],
    [/\byaani\b/g, "yani"],
    [/\bcalisiyorum\b/g, "calisiyor"],
    [/\bcalisiyor mu\b/g, "calisiyor mu"],
    [/\bise\b/g, "ise"],
    [/\bstaja\b/g, "staja"],
    [/\bkac\b/g, "kac"],
  ];
  for (const [pattern, replacement] of replacements) {
    n = n.replace(pattern, replacement);
  }
  return n.replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsTerm(text: string, term: string): boolean {
  const escaped = escapeRegex(term);
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
  return regex.test(text);
}

function hasAnyTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => containsTerm(text, normalizeText(term)));
}

function buildOptionPrompt(options: string[]): string {
  if (options.length === 0) {
    return "Sorunu netleştirir misin? Örn: eğitim, deneyim, proje, teknoloji, iletişim.";
  }
  const mapped = options.map((id) => INTENT_LABELS[id] ?? id).slice(0, 3);
  return `Sorunu daha net cevaplayabilmem için şunlardan birini seçer misin?\n- ${mapped.join("\n- ")}`;
}

function buildGeneralGuidance(normalizedMessage: string): string | null {
  if (/\b(ise alin|is bulur|ise gir|ise girer miyim|ise alinirmiyim|ise alinir miyim)\b/.test(normalizedMessage)) {
    return "Evet, profilin işe alınabilir seviyede. Özellikle React/React Native + gerçek proje deneyimi güçlü tarafın.\n\nDaha hızlı sonuç için:\n1) CV’de ölçülebilir çıktıları öne çıkar (örn. proje etkisi, kullanılan teknoloji).\n2) GitHub’da 2-3 projeyi canlı demo + düzgün README ile vitrine koy.\n3) Başvurularda frontend/mobil odaklı pozisyonları hedefleyip kısa, kişiselleştirilmiş ön yazı kullan.";
  }

  if (/\b(ne yapmaliyim|nasil yaparim|nasil ilerleyeyim|oner|öner|yol haritasi|plan)\b/.test(normalizedMessage)) {
    return "Kısa bir yol haritası önerebilirim. Hedefini netleştir, sonra 2 haftalık sprint mantığıyla ilerle:\n1) Hedef: tek bir rol seç (Frontend / React Native / Full-Stack).\n2) Çıktı: her sprintte 1 somut çıktı (özellik, demo, case study).\n3) Görünürlük: LinkedIn + GitHub + portföyde düzenli paylaşım.\n\nİstersen hedef role göre 30 günlük plan da çıkarabilirim.";
  }

  if (/\b(sence|yorumla|degerlendir|değerlendir|mantikli mi|mantıklı mı)\b/.test(normalizedMessage)) {
    return "Yorumlayabilirim. En iyi sonuç için sorunu şu formatta yaz:\n- Konu\n- Hedefin\n- Kısıtın (zaman/tecrübe)\n\nBuna göre artı-eksi analizi ve net öneri vereyim.";
  }

  if (/\b(hangisi|karsilastir|karşılaştır|mi yoksa|versus|vs)\b/.test(normalizedMessage)) {
    return "Karşılaştırmalı cevap verebilirim. İki seçeneği yaz, sana kısa artı/eksi ve hangi durumda hangisini seçmen gerektiğini net söyleyeyim.";
  }

  return null;
}

function softStem(word: string): string {
  const suffixes = [
    "siniz", "sinizdir", "leriniz", "lariniz", "lerimizi", "larimizi",
    "lerinin", "larinin", "lerine", "larina", "lerden", "lardan",
    "leri", "lari", "ler", "lar", "siniz", "mizin", "muzun", "müzün",
    "niz", "nız", "nuz", "nüz", "nin", "nın", "nun", "nün",
    "imiz", "ımız", "umuz", "ümüz", "imizde", "ımızda", "umuzda", "ümüzde",
    "dan", "den", "tan", "ten", "dir", "dır", "dur", "dür", "tir", "tır", "tur", "tür",
    "si", "sı", "su", "sü", "yi", "yı", "yu", "yü", "ni", "nı", "nu", "nü",
    "in", "ın", "un", "ün", "de", "da", "te", "ta", "e", "a", "i", "ı", "u", "ü",
  ];
  let result = word;
  let changed = true;
  while (changed) {
    changed = false;
    for (const s of suffixes) {
      if (result.length > s.length + 2 && result.endsWith(s)) {
        result = result.slice(0, -s.length);
        changed = true;
        break;
      }
    }
  }
  return result;
}

function closeTokenMatch(word: string, keyword: string): boolean {
  if (word === keyword) return true;
  const a = softStem(word);
  const b = softStem(keyword);
  if (a === b) return true;
  if (a.length >= 5 && b.length >= 5 && (a.startsWith(b) || b.startsWith(a))) {
    return Math.abs(a.length - b.length) <= 2;
  }
  if (isTranspositionAway(a, b)) {
    return true;
  }
  if (a.length >= 4 && b.length >= 4 && Math.abs(a.length - b.length) <= 1 && isEditDistanceAtMostOne(a, b)) {
    return true;
  }
  if (a.length >= 7 && b.length >= 7 && Math.abs(a.length - b.length) <= 2 && isEditDistanceAtMost(a, b, 2)) {
    return true;
  }
  return false;
}

function isEditDistanceAtMostOne(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;

    if (la > lb) {
      i += 1;
    } else if (lb > la) {
      j += 1;
    } else {
      i += 1;
      j += 1;
    }
  }

  if (i < la || j < lb) edits += 1;
  return edits <= 1;
}

function isEditDistanceAtMost(a: string, b: string, maxEdits: number): boolean {
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > maxEdits) return false;
  const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));

  for (let i = 0; i <= la; i += 1) dp[i][0] = i;
  for (let j = 0; j <= lb; j += 1) dp[0][j] = j;

  for (let i = 1; i <= la; i += 1) {
    let rowMin = maxEdits + 1;
    for (let j = 1; j <= lb; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
      if (dp[i][j] < rowMin) rowMin = dp[i][j];
    }
    if (rowMin > maxEdits) return false;
  }

  return dp[la][lb] <= maxEdits;
}

function isTranspositionAway(a: string, b: string): boolean {
  if (a.length !== b.length || a.length < 4) return false;
  let first = -1;
  let second = -1;

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      if (first === -1) {
        first = i;
      } else if (second === -1) {
        second = i;
      } else {
        return false;
      }
    }
  }

  if (first === -1 || second === -1) return false;
  return a[first] === b[second] && a[second] === b[first];
}

function getEntryById(id: string): KnowledgeEntry | null {
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.id === id) return entry;
  }
  return null;
}

function detectIntentByRules(normalizedMessage: string): string | null {
  if (
    /\b(neden\s+(ise\s+)?(staja\s+)?ala?(yim|yim|lim|limiz|liyim|maliyim|maliyiz)?|neden\s+seni\s+(ise\s+)?(staja\s+)?ala?(yim|yim|lim|limiz|liyim)?|neden\s+almaliyiz)\b/.test(normalizedMessage)
  ) {
    return "whyHire";
  }
  if (/\b(mehmet kimdir|mehmeti anlat|mehmet nasil biri?|mehmet nasil)\b/.test(normalizedMessage)) {
    return "summary";
  }
  if (
    /\b(frontend|react native|full stack|fullstack)\b/.test(normalizedMessage) &&
    /\b(mi|yoksa|hangisi|secmeliyim|secsem|daha iyi)\b/.test(normalizedMessage)
  ) {
    return "careerDecision";
  }
  if (/\b(beni degerlendir|profilimi degerlendir|beni yorumla|profil yorumu)\b/.test(normalizedMessage)) {
    return "profileReview";
  }
  if (/\b(1 ay|1 ayda|30 gun|30 gunde|30 günlük|30 gunluk)\b/.test(normalizedMessage) && /\b(plan|yol haritasi)\b/.test(normalizedMessage)) {
    return "roadmap30";
  }
  if (
    /\begitim\b/.test(normalizedMessage) &&
    /\bdeneyim\b/.test(normalizedMessage) &&
    /\b(mi|daha|guc|guclu|iyi)\b/.test(normalizedMessage)
  ) {
    return "educationVsExperience";
  }
  if (/\b(ise alin|is bulur|ise gir|ise girer miyim|ise alinirmiyim|ise alinir miyim)\b/.test(normalizedMessage)) {
    return "hireability";
  }
  if (/\b(nasilsin|naber|ne yapiyorsun|gunun nasil|gunun nasil)\b/.test(normalizedMessage)) {
    return "dailyChat";
  }

  const rules: Array<{ id: string; regex: RegExp }> = [
    { id: "age", regex: /\b(kac yas|yasinda|dogum yili|dogum tarihi)\b/ },
    { id: "cv", regex: /\b(cv|ozgecmis|pdf)\b/ },
    { id: "reference", regex: /\b(referans|yasin|celik)\b/ },
    { id: "contact", regex: /\b(iletisim|mail|email|telefon|github|instagram|linkedin)\b/ },
    { id: "education", regex: /\b(egitim|universite|okul|gno|hazirlik|lise)\b/ },
    { id: "experience", regex: /\b(deneyim|kariyer|staj|calisma|is deneyimi)\b/ },
    { id: "skills", regex: /\b(teknoloji\w*|tech stack|yetenek\w*|beceri\w*|stack|hakim)\b/ },
    { id: "projects", regex: /\b(proje|projeler|portfolio|portfoy)\b/ },
    { id: "website", regex: /\b(site|menu|menü|bolum|bölüm)\b/ },
    { id: "languages", regex: /\b(dil|ingilizce|turkce|türkçe|language)\b/ },
    { id: "frontend", regex: /\b(frontend|react|next|arayuz|arayüz|ui)\b/ },
    { id: "mobile", regex: /\b(mobil|mobile|react native|ios|android)\b/ },
    { id: "aiUsage", regex: /\b(yapay zekayi nasil kullaniyor|yapay zekayi nasil kullaniyorsun|ai kullanimi|ai'i nasil kullaniyor|chatgpt|cursor|copilot|prompt)\b/ },
    { id: "ai", regex: /\b(yapay zeka|ai|ml|makine ogrenmesi|makine öğrenmesi|xgboost|randomforest)\b/ },
    { id: "strengths", regex: /\b(guclu yon|güçlü yön|soft skill|problem cozme|problem çözme|takim calismasi)\b/ },
    { id: "collaboration", regex: /\b(is birligi|iş birliği|is teklifi|iş teklifi|birlikte calis|birlikte çalış)\b/ },
    { id: "location", regex: /\b(konum|nerede|gaziantep|kahramanmaras|remote)\b/ },
    { id: "openToWork", regex: /\b(open to work|is ariyor|musait|müsait|hire|available)\b/ },
    { id: "license", regex: /\b(ehliyet\w*|surucu\w*)\b/ },
  ];

  for (const rule of rules) {
    if (rule.regex.test(normalizedMessage)) {
      return rule.id;
    }
  }
  return null;
}

function buildClarification(best: KnowledgeEntry, second: KnowledgeEntry): string {
  const first = INTENT_LABELS[best.id] ?? "Bu konu";
  const secondLabel = INTENT_LABELS[second.id] ?? "diğer konu";
  return `Sorunu netleştirelim mi?\n- ${first}\n- ${secondLabel}\n\nHangisini kastettiğini yazarsan çok daha net cevap verebilirim.`;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "greeting",
    priority: 2,
    keywords: ["merhaba", "selam", "selamlar", "gunaydin", "iyi gunler", "naber", "nasilsin"],
    variations: ["sa", "slm"],
    answer: [
      "Merhaba! Ben Demir AI. Mehmet hakkında kısa ve net cevaplar veriyorum. Ne öğrenmek istersin?",
      "Selam! Demir AI buradayım. Mehmet hakkında ne sorarsan hızlıca cevaplayabilirim.",
      "Merhaba! Yardımcı olayım. Eğitim, deneyim, projeler veya iletişim hakkında sorabilirsin.",
    ],
  },
  {
    id: "dailyChat",
    priority: 2,
    keywords: ["nasilsin", "naber", "ne yapiyorsun", "gunun nasil", "nasil gidiyor"],
    variations: ["iyisin", "iyimisn", "naptin", "napıyorsun", "napiyorsun"],
    answer: [
      "İyiyim, teşekkürler! Mehmet hakkında ne istersen detaylı konuşabiliriz. İstersen eğitim, deneyim, proje veya kariyer planıyla başlayalım.",
      "Gayet iyiyim. Burada Mehmet’in profiliyle ilgili net ve pratik cevaplar veriyorum. Hangi konuda ilerleyelim?",
      "Harikayım 🙂 Senin için buradayım. İstersen seni işe/staja götürecek güçlü yönlerini birlikte çıkaralım.",
    ],
  },
  {
    id: "help",
    priority: 2,
    keywords: ["yardim", "yardım", "komut", "ne sorabilirim", "neler sorabilirim"],
    answer: [
      "Şunları sorabilirsin: eğitim, deneyim, projeler, teknoloji, iletişim, konum, CV, referans, kurslar.",
      "Kısa menü: eğitim, iş deneyimi, projeler, teknik stack, iletişim, CV ve günlük sorular.",
    ],
  },
  {
    id: "assistant",
    priority: 2,
    keywords: ["sen kimsin", "sen nesin", "demir ai", "ismin ne", "adin ne"],
    variations: ["beni duyuyor musun"],
    answer: [
      "Ben Demir AI, Mehmet’in dijital asistanıyım. Onunla ilgili sorularına kısa ve net cevap veririm.",
      "Demir AI’yım. Mehmet’in CV ve portföy bilgilerini hızlıca aktarırım.",
    ],
  },
  {
    id: "summary",
    keywords: ["mehmet kim", "mehmet nasil bir", "mehmet nasil biri", "hakkinda", "kendini tanit", "kısaca", "kisaca"],
    answer: [
      "Mehmet Demir: KSÜ Bilgisayar Müh. 4. sınıf öğrencisi (GNO 2.84). React/React Native ve Python/AI odaklı yazılım geliştirici adayı.",
      "Kısaca Mehmet: web+mobil geliştirme ve yapay zeka tarafında çalışan, proje odaklı bir bilgisayar mühendisliği öğrencisi.",
    ],
  },
  {
    id: "education",
    keywords: ["egitim", "üniversite", "universite", "okul", "gno", "not ortalamasi", "hazirlik", "lise"],
    answer: [
      "Eğitim: KSÜ Bilgisayar Mühendisliği 4. sınıf (GNO 2.84). İngilizce hazırlık B2. Lise: Gaziantep Yavuzeli Şehit Ali Çiftçi.",
      "KSÜ Bilgisayar Müh. öğrencisi (4. sınıf). GNO 2.84, İngilizce seviyesi B2.",
    ],
  },
  {
    id: "experience",
    keywords: ["deneyim", "is deneyimi", "kariyer", "staj", "calisma", "çalışma", "nerede calisti"],
    answer: [
      "Deneyim: ATN Yazılım ve ElectromTech Stajları, Freelance (2023–devam), Teknofest İstiklal SİHA, Work and Travel USA, Prep ShipHub, Helikanon ve T3 Vakfı'nda mentörlük.",
      "Özet deneyim: Web/mobil geliştirme, donanım, teknik mentörlük ve global iletişim becerilerini birleştiren çok yönlü bir deneyim yapısı var.",
    ],
  },
  {
    id: "prepShipHub",
    keywords: ["prep shiphub", "shiphub", "lojistik", "amerika merkezli"],
    answer: [
      "Prep ShipHub: Web & Mobile Developer (Haz–Kas 2025). React ve React Native ile kullanıcı odaklı arayüzler geliştirdi.",
      "Prep ShipHub’da React/React Native ile web ve mobil ürün geliştirme yaptı.",
    ],
  },
  {
    id: "helikanon",
    keywords: ["helikanon", "stajyer", "staj"],
    answer: [
      "Helikanon Yazılım: Stajyer Yazılım Geliştirici (Ağu–Eyl 2025). Kurumsal web/mobil projelere katkı sağladı.",
      "Helikanon’da staj döneminde proje süreçlerine aktif katıldı.",
    ],
  },
  {
    id: "atnYazilim",
    keywords: ["atn yazilim", "atn yazılım", "atn"],
    answer: [
      "ATN Yazılım: Stajyer Yazılım Geliştirici (Haziran 2026 - Devam Ediyor). Şirkete yönelik web ve app uygulamaları geliştirdi ve vertigo hastalığı hareket grafiği projesinde yer aldı.",
      "ATN Yazılım stajında web/mobil geliştirme ve sağlık teknolojileri (vertigo hareket grafiği) üzerine çalışıyor.",
    ],
  },
  {
    id: "electromTech",
    keywords: ["electromtech", "electrom tech", "donanim staji", "elektrik elektronik staji"],
    answer: [
      "ElectromTech: Donanım Stajyeri (Ağustos 2026 - Devam Ediyor). Elektrik-elektronik ve donanım üzerine staj çalışmalarını yürütüyor.",
      "ElectromTech bünyesinde donanım ve elektrik-elektronik stajı yapıyor.",
    ],
  },
  {
    id: "t3",
    keywords: ["t3", "t3 vakfi", "t3 vakfı", "egitmen", "eğitmen", "mentor", "mentör"],
    answer: [
      "T3 Vakfı: Eğitmen & Mentör (Part-time), Ekim 2025 - Devam Ediyor. Bu rolde ekip liderliği, teknik rehberlik ve iletişim alanlarında aktif gelişim sağlıyor.",
      "T3 Vakfı'nda part-time eğitmen/mentör olarak teknik mentörlük veriyor; ekip yönetimi ve iletişim kaslarını güçlendiriyor.",
    ],
  },
  {
    id: "freelance",
    keywords: ["freelance", "serbest", "bagimsiz", "müşteri", "musteri"],
    answer: [
      "Freelance: 2023’ten beri web/mobil çözümler geliştiriyor, proje yönetimi ve müşteri iletişimi yürütüyor.",
      "Freelance tarafta butik yazılım projeleri ve teknik danışmanlık yapıyor.",
    ],
  },
  {
    id: "teknofest",
    keywords: ["teknofest", "siha", "uav", "iha", "istiklal"],
    answer: [
      "Teknofest İstiklal SİHA projesinde yazılım ekip üyesi olarak görev aldı (Ara 2023–Eyl 2024).",
      "SİHA projesinde sistem entegrasyonu ve yazılım mimarisi tarafında çalıştı.",
    ],
  },
  {
    id: "workTravel",
    keywords: ["work and travel", "abd", "amerika", "usa", "global deneyim"],
    answer: [
      "Work and Travel USA (Yaz 2024): global iletişim ve kültürlerarası çalışma deneyimi kazandı.",
      "ABD deneyimiyle iletişim ve adaptasyon becerilerini güçlendirdi.",
    ],
  },
  {
    id: "projects",
    keywords: ["proje", "projeler", "projelerini", "github", "portfoy", "portfolio", "tek tek say", "listele"],
    answer: [
      "Öne çıkan projeler: Atık Yönetimi Sistemi, Elektronik Raf Sistemi, YouTube Success Predictor, Product Manager, Mayın Tarlası, Restaurant Order Tracking.",
      "Projeler tarafında web, mobil, donanım (IoT) ve makine öğrenimi odaklı gerçek ürün/prototip çalışmaları var.",
    ],
  },
  {
    id: "atikYonetimi",
    keywords: ["atik yonetimi", "atık yönetimi", "belediye", "onikisubat"],
    answer: [
      "Atık Yönetimi Sistemi: Kahramanmaraş Onikişubat Belediyesi için doğrudan kullanılmak üzere uyarlanan atık yönetim projesi.",
    ],
  },
  {
    id: "elektronikRaf",
    keywords: ["elektronik raf", "raf sistemi", "raf etiketi", "esl"],
    answer: [
      "Elektronik Raf Sistemi: Elektronik raf etiketleme (ESL) donanım ve yazılım destekli sistem projesi.",
    ],
  },
  {
    id: "youtubePredictor",
    keywords: ["youtube", "success predictor", "tahmin", "makine ogrenmesi", "ml"],
    answer: [
      "YouTube Success Predictor: 2600+ video, 80+ özellik, ML modelleri (XGBoost/RandomForest) ve Flask arayüz.",
      "Bu proje video başarısını yükleme öncesi tahminleyen AI destekli bir sistem.",
    ],
  },
  {
    id: "skills",
    keywords: ["teknoloji", "teknolojilere", "tech stack", "yetenek", "beceri", "hangi diller", "stack", "hangi teknolojilere hakim", "nelere hakim"],
    answer: [
      "Teknik stack: React/Next.js, React Native, TypeScript/JavaScript, Python/Flask, ML, SQL/MySQL, Tailwind.",
      "Ana odak: modern frontend, cross-platform mobil geliştirme ve AI/ML entegrasyonu.",
    ],
  },
  {
    id: "courses",
    keywords: ["kurs", "kurslar", "kurslari", "udemy", "eğitimler", "egitimler", "sertifika"],
    answer: [
      "Kurslar: Web Dev Bootcamp, React Complete Guide, React Native Guide, Git/GitHub, SQL/MySQL.",
      "Udemy odaklı teknik eğitimlerle web, mobil ve versiyon kontrol tarafını geliştirdi.",
    ],
  },
  {
    id: "educationVsExperience",
    priority: 2,
    keywords: ["egitim mi deneyim mi", "egitim ve deneyim", "daha guclu"],
    answer: [
      "İkisi de güçlü ama profilinde pratik taraf daha baskın: gerçek proje ve iş deneyimi (Prep ShipHub, freelance, staj) öne çıkıyor; eğitim temeli bunu destekliyor.",
      "Kısa yorum: eğitim temeli sağlam, fakat ayırt edici tarafı uygulamalı deneyim ve proje üretimi.",
    ],
  },
  {
    id: "whyHire",
    priority: 2,
    keywords: [
      "neden ise alinmali",
      "neden staja alinmali",
      "neden ise alalim",
      "neden staja alalim",
      "neden almaliyiz",
      "neden seni ise alalim",
      "neden seni staja alalim",
    ],
    answer: [
      "Mehmet’in işe/staja alınması için güçlü nedenler:\n- Gerçek deneyim: Prep ShipHub, freelance ve staj süreçlerinde gerçek ürün geliştirme pratiği var.\n- Teknik uyum: React/Next.js, React Native, TypeScript/JavaScript ve Python/ML altyapısı ile ekibe hızlı adapte olur.\n- Sonuç odak: Sadece kod yazmak değil, teslim edilen çıktıya ve kullanıcı etkisine odaklanır.\n- İletişim ve sorumluluk: Müşteri/ekip iletişimi güçlü, geri bildirime açık ve öğrenme hızı yüksek.",
      "Mehmet’in işe/staja alınması için güçlü nedenler:\n- Gerçek deneyim: Prep ShipHub, freelance, staj ve T3 Vakfı mentörlük süreçlerinde gerçek ürün ve insan odaklı çalışma pratiği var.\n- Teknik uyum: React/Next.js, React Native, TypeScript/JavaScript ve Python/ML altyapısı ile ekibe hızlı adapte olur.\n- Sonuç odak: Sadece kod yazmak değil, teslim edilen çıktıya ve kullanıcı etkisine odaklanır.\n- İletişim ve liderlik: Ekip liderliği, teknik rehberlik ve iletişim tarafında güçlü gelişim gösteriyor.",
      "Kısa cevap: Mehmet güçlü bir junior-mid adayı. Çünkü hem modern web/mobil stack’e hakim hem de gerçek proje deneyimi var. Bu kombinasyon, onboarding süresini kısaltır ve ekibe hızlı değer üretmesini sağlar.",
    ],
  },
  {
    id: "hireability",
    priority: 2,
    keywords: ["ise alinirmiyim", "ise alinir miyim", "is bulur muyum", "ise girer miyim", "ise alinir mi"],
    answer: [
      "Evet, profilin işe alınabilir seviyede. Özellikle React/React Native tecrübesi, freelance geçmişi ve proje çeşitliliği güçlü.",
      "Büyük ölçüde evet. CV + portföy + GitHub üçlüsünü birlikte güçlü tuttuğunda işe dönüş oranı belirgin artar.",
    ],
  },
  {
    id: "careerDecision",
    priority: 2,
    keywords: ["frontend mi", "react native mi", "full stack mi", "hangisini secmeliyim", "hangi role odaklanmaliyim"],
    answer: [
      "Kısa yorum: kısa vadede en hızlı geri dönüş için Frontend + React odak mantıklı. Çünkü portföyde bunu daha hızlı ve görünür şekilde gösterebilirsin.\n\nOrta vadede React Native ekleyip profilini hibrit hale getirmen seni daha değerli yapar.",
      "Senin profilinde en doğru strateji: önce Frontend'i keskinleştir, sonra React Native ile tamamla. Böylece hem iş bulma hızı hem de maaş pazarlığı gücü artar.",
    ],
  },
  {
    id: "profileReview",
    priority: 2,
    keywords: ["beni degerlendir", "profilimi degerlendir", "profil yorumu", "beni yorumla"],
    answer: [
      "Profil değerlendirmesi:\n- Güçlü: React/React Native temeli, gerçek proje çeşitliliği, freelance + staj + T3 mentörlük deneyimi.\n- Geliştirilecek: Projelerde metrik odaklı anlatım (etki/sayı/çıktı), README kalitesi ve vaka anlatımı.\n- Sonuç: Junior-Mid geçiş yolunda güçlü bir aday profili; görünürlüğü artırırsan dönüş oranı belirgin yükselir.",
      "Net yorum: teknik temel ve pratik deneyim iyi seviyede. Seni bir üst seviyeye taşıyacak şey, projeleri daha ölçülebilir ve ürün odaklı sunmak.",
    ],
  },
  {
    id: "roadmap30",
    priority: 2,
    keywords: ["30 gun plan", "1 ay plan", "30 gunluk yol haritasi"],
    answer: [
      "30 günlük hızlandırılmış plan:\n1. Hafta: CV + LinkedIn + GitHub profil temizliği, 1 proje README iyileştirme.\n2. Hafta: Frontend odaklı 1 mini proje (deploy + case study).\n3. Hafta: React Native tarafında 1 özellik/prototip yayınla.\n4. Hafta: 20 hedefli başvuru + 5 networking mesajı + mülakat soru tekrarı.\n\nBu planı uygularsan profilin daha hızlı fark edilir hale gelir.",
      "1 aylık öneri: her hafta 1 somut çıktı üret (deploy edilen proje, teknik yazı, açık kaynak katkı). Süreklilik, iş dönüş oranını en çok artıran faktör.",
    ],
  },
  {
    id: "reference",
    keywords: ["referans", "yasin", "celik", "çelik", "microsoft", "linkedin"],
    requiredTerms: ["referans", "yasin", "celik", "çelik"],
    answer: [
      "Referans: Yasin Çelik — Staff Software Engineer at LinkedIn. Kurum: Microsoft. LinkedIn: yasin-celik-30933a31, E-posta: yasincelikk16@gmail.com.",
      "Profesyonel referans olarak Yasin Çelik bilgisi mevcut (LinkedIn + e-posta paylaşılabilir).",
    ],
  },
  {
    id: "age",
    priority: 2,
    keywords: ["kac yas", "kaç yaş", "yasinda", "yaşında", "dogum yili", "doğum yılı", "dogum tarihi", "doğum tarihi"],
    answer: [
      "Yaş/doğum tarihi bilgisi CV ve sitede açık şekilde paylaşılmıyor.",
      "Bu bilgi herkese açık paylaşılmamış. İstersen eğitim veya deneyim bilgisini anlatabilirim.",
    ],
  },
  {
    id: "contact",
    keywords: ["iletisim", "iletişim", "mail", "email", "telefon", "github", "linkedin", "instagram"],
    requiredTerms: ["iletisim", "iletişim", "mail", "email", "telefon", "github", "instagram", "linkedin"],
    answer: [
      "İletişim: mhmtdmr1552@gmail.com | +90 543 232 3167 | LinkedIn: mehmet-demir-35b720207 | GitHub: mhmtdmr155 | Instagram: @mhmtdmir01",
      "Mail: mhmtdmr1552@gmail.com — Tel: +90 543 232 3167. İstersen iletişim formundan da yazabilirsin.",
    ],
  },
  {
    id: "languages",
    keywords: ["dil", "ingilizce", "turkce", "türkçe", "english", "language"],
    answer: [
      "Dil bilgisi: Türkçe ana dil, İngilizce seviyesi B2.",
      "Türkçe (ana dil) ve İngilizce (B2) seviyesinde iletişim kurabiliyor.",
    ],
  },
  {
    id: "frontend",
    keywords: ["frontend", "front-end", "next", "react", "ui", "arayuz", "arayüz"],
    answer: [
      "Frontend odağı güçlü: React/Next.js, TypeScript ve Tailwind ile modern, performanslı arayüzler geliştiriyor.",
      "Web tarafında React ve Next.js ile component tabanlı, kullanıcı odaklı arayüz geliştirme deneyimi var.",
    ],
  },
  {
    id: "mobile",
    keywords: ["mobil", "mobile", "react native", "ios", "android"],
    answer: [
      "Mobil geliştirme tarafında React Native ile cross-platform uygulamalar geliştiriyor.",
      "React Native deneyimi sayesinde iOS/Android için tek kod tabanlı çözümler üretiyor.",
    ],
  },
  {
    id: "aiUsage",
    priority: 2,
    keywords: [
      "yapay zekayi nasil kullaniyor",
      "yapay zekayi nasil kullaniyorsun",
      "ai kullanimi",
      "ai nasil kullaniyor",
      "chatgpt",
      "cursor",
      "copilot",
      "prompt",
      "yapay zeka ile calisma",
    ],
    answer: [
      "Mehmet yapay zekayı aktif ve üretim odaklı kullanıyor: fikir doğrulama, kod iyileştirme, hata analizi, dokümantasyon ve hızlı prototipleme süreçlerinde düzenli olarak AI araçlarından yararlanıyor.",
      "AI kullanım yaklaşımı güçlü: önce problemi net tanımlıyor, sonra AI ile alternatif çözüm üretiyor, en sonda çıktıyı test ederek doğruluyor. Yani AI'ı sadece cevap almak için değil, geliştirme hızını ve kaliteyi artırmak için kullanıyor.",
      "Yapay zekayı etkin kullanıyor: prompt tasarımı, kod refactor önerileri, test senaryosu üretimi ve içerik/README iyileştirmelerinde sistematik şekilde faydalanıyor.",
    ],
  },
  {
    id: "ai",
    keywords: ["yapay zeka", "ai", "ml", "makine ogrenmesi", "makine öğrenmesi", "model", "xgboost", "randomforest"],
    answer: [
      "AI/ML tarafında YouTube Success Predictor projesiyle veri analizi, özellik çıkarımı ve modelleme deneyimi bulunuyor.",
      "Makine öğrenmesi odaklı projelerde model seçimi, değerlendirme ve Flask ile ürünleştirme pratiği var.",
    ],
  },
  {
    id: "strengths",
    keywords: ["guclu yon", "güçlü yön", "soft skill", "iletisim becerisi", "problem cozme", "problem çözme", "takim calismasi"],
    answer: [
      "Güçlü yönler: problem çözme, hızlı öğrenme, takım çalışması ve müşteri iletişimi.",
      "Hem teknik hem iletişim tarafında dengeli; ekip içinde sorumluluk alıp sonuç odaklı ilerliyor.",
    ],
  },
  {
    id: "website",
    keywords: ["sitede neler var", "site bolumleri", "site bölümleri", "hangi bolumler", "hangi bölümler", "menu", "menü"],
    answer: [
      "Sitede öne çıkan bölümler: Hakkımda, Eğitim, Deneyim, Projeler, Kurslar, Referanslar ve İletişim.",
      "Tek sayfa yapıda; menüden ilgili bölümlere hızlı geçiş yapabilirsin.",
    ],
  },
  {
    id: "collaboration",
    keywords: ["is birligi", "iş birliği", "birlikte calis", "birlikte çalış", "is teklifi", "iş teklifi"],
    answer: [
      "İş birliği için iletişim kanalları açık: mail, telefon ve LinkedIn üzerinden hızlı dönüş sağlayabilir.",
      "Proje bazlı veya uzun dönemli iş birliklerine açık; özellikle React/React Native odaklı işlerde hızlı katkı sağlar.",
    ],
  },
  {
    id: "cv",
    keywords: ["cv", "ozgecmis", "özgeçmiş", "pdf"],
    answer: [
      "CV bağlantısı: /MEHMET DEMİR CV.pdf",
      "CV’yi sayfadaki “CV İndir” butonundan ya da direkt /MEHMET DEMİR CV.pdf linkinden açabilirsin.",
    ],
  },
  {
    id: "location",
    keywords: ["konum", "nerede", "sehir", "şehir", "gaziantep", "kahramanmaras", "kahramanmaraş", "remote"],
    answer: [
      "Konum: Gaziantep & Kahramanmaraş. Remote çalışmaya açık.",
      "Lokasyon esnek: Gaziantep/Kahramanmaraş, uzaktan çalışma uygun.",
    ],
  },
  {
    id: "openToWork",
    keywords: ["is ariyor", "iş arıyor", "open to work", "müsait", "musait", "hire", "available"],
    answer: [
      "Open to Work: full-time, part-time ve freelance fırsatlara açık. Odak: React/React Native/Full-Stack.",
      "Çalışmaya açık ve proje bazlı iş birliklerine uygun.",
    ],
  },
  {
    id: "license",
    keywords: ["ehliyet", "surucu", "sürücü", "license"],
    answer: [
      "Ehliyet: M, B, B1, F.",
      "Sürücü belgeleri: M, B, B1, F sınıfı.",
    ],
  },
  {
    id: "daily_time",
    keywords: ["saat", "tarih", "bugun", "bugün"],
    answer: [
      "Canlı saat/tarih verisine erişemiyorum. Cihazından kontrol edebilirsin.",
      "Anlık saat/tarih veremiyorum ama başka konuda yardımcı olabilirim.",
    ],
  },
  {
    id: "daily_weather",
    keywords: ["hava", "sicaklik", "sıcaklık", "hava durumu", "forecast"],
    answer: [
      "Canlı hava durumuna erişemiyorum. Telefonundaki hava uygulaması en doğru sonucu verir.",
      "Anlık hava verisi çekemiyorum ama Mehmet hakkında her şeyi sorabilirsin.",
    ],
  },
  {
    id: "daily_joke",
    keywords: ["saka", "şaka", "espri", "fıkra"],
    answer: [
      "Mini şaka: “404: Şaka bulunamadı.” 🙂",
      "Programcı esprisi: “Kod bozulduysa önce cache’i suçla.” 🙂",
      "Günün esprisi: “Bug fix yaptım, bug’lar ekipçe geri geldi.” 🙂",
    ],
  },
  {
    id: "daily_motivation",
    keywords: ["motivasyon", "moral", "tavsiye", "ilham"],
    answer: [
      "Kısa motivasyon: Her gün %1 gelişim, uzun vadede büyük fark yaratır.",
      "Bugünkü motivasyon: Küçük adım + istikrar = sonuç.",
      "Unutma: Süreklilik, mükemmellikten daha değerlidir.",
    ],
  },
  {
    id: "thanks",
    priority: 2,
    keywords: ["tesekkur", "teşekkür", "tesekkurler", "sağol", "sagol", "eyv", "super", "süpersin", "harika"],
    answer: [
      "Rica ederim! Başka ne öğrenmek istersin?",
      "Ne demek, her zaman. Devam edelim mi?",
    ],
  },
  {
    id: "goodbye",
    priority: 2,
    keywords: ["gorusuruz", "görüşürüz", "hosca kal", "hoşça kal", "gule gule", "güle güle"],
    answer: [
      "Görüşürüz! Tekrar yazmak istersen buradayım.",
      "Hoşça kal! İhtiyacın olduğunda tekrar sorabilirsin.",
    ],
  },
];

const LEXICON = Array.from(
  new Set(
    KNOWLEDGE_BASE.flatMap((entry) => [
      ...entry.keywords.map((k) => normalizeText(k)),
      ...(entry.variations ?? []).map((v) => normalizeText(v)),
    ])
      .flatMap((phrase) => phrase.split(/\s+/))
      .filter((token) => token.length >= 3)
  )
);

function normalizeTokensForTypos(tokens: string[]): string[] {
  return tokens.map((token) => {
    if (token.length < 4) return token;
    if (LEXICON.includes(token)) return token;

    let best = token;
    let bestDistance = 3;
    for (const candidate of LEXICON) {
      if (Math.abs(candidate.length - token.length) > 2) continue;
      if (candidate[0] !== token[0]) continue;
      const max = token.length >= 7 ? 2 : 1;
      if (!isEditDistanceAtMost(token, candidate, max)) continue;
      const distance = isEditDistanceAtMostOne(token, candidate) ? 1 : 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    return best;
  });
}

function inferIntentFromTypoAwareTokens(tokens: string[], normalized: string): string | null {
  const has = (target: string) => tokens.some((t) => closeTokenMatch(t, target));

  if ((has("teknoloji") || has("yetenek") || has("beceri") || has("stack")) && (has("hakim") || normalized.includes("hakim"))) {
    return "skills";
  }
  if (has("deneyim") || normalized.includes("is deneyimi")) {
    return "experience";
  }
  if (has("mehmet") && (has("nasil") || has("kim") || has("kisaca") || has("anlat"))) {
    return "summary";
  }
  if (has("proje") || has("projeler")) {
    return "projects";
  }

  return null;
}

function scoreEntry(tokens: string[], normalizedMessage: string, entry: KnowledgeEntry): number {
  if (entry.requiredTerms && entry.requiredTerms.length > 0 && !hasAnyTerm(normalizedMessage, entry.requiredTerms)) {
    return 0;
  }

  let score = 0;
  let matchedTerms = 0;
  let matchedVariations = 0;

  for (const phrase of entry.keywords) {
    const k = normalizeText(phrase);
    if (!k) continue;
    if (k.includes(" ")) {
      if (normalizedMessage.includes(k)) {
        score += Math.max(7, k.length / 1.7);
        matchedTerms += 1;
      } else {
        const phraseTokens = k.split(/\s+/).filter(Boolean);
        const fuzzyPhraseMatch = phraseTokens.every((pt) =>
          tokens.some((t) => closeTokenMatch(t, pt))
        );
        if (fuzzyPhraseMatch) {
          score += Math.max(5, k.length / 2.2);
          matchedTerms += 1;
        }
      }
      continue;
    }

    if (containsTerm(normalizedMessage, k)) {
      score += Math.max(5, k.length / 2);
      matchedTerms += 1;
    }

    for (const token of tokens) {
      if (closeTokenMatch(token, k)) {
        score += 2.5;
        matchedTerms += 1;
      }
    }
  }

  if (entry.variations) {
    for (const variation of entry.variations) {
      const v = normalizeText(variation);
      if (v && normalizedMessage.includes(v)) {
        score += Math.max(2, v.length / 3);
        matchedVariations += 1;
      }
    }
  }

  if (matchedTerms >= 2) score += 2;
  if (matchedTerms >= 3) score += 2;
  if (entry.priority && (matchedTerms > 0 || matchedVariations > 0)) score += entry.priority;
  return score;
}

const QUICK_PROMPTS = [
  { label: "Deneyim", prompt: "Deneyimini özetle" },
  { label: "Projeler", prompt: "Projelerini listele" },
  { label: "Teknoloji", prompt: "Teknoloji stack'in nedir?" },
  { label: "İletişim", prompt: "İletişim bilgilerini ver" },
  { label: "CV", prompt: "CV linkini ver" },
  { label: "Motivasyon", prompt: "Kısa bir motivasyon sözü söyle" },
];

type ChatMode = "normal" | "interview";

function shouldUseInterviewFormat(message: string): boolean {
  const normalized = normalizeQuery(message);
  return /\b(neden|ise|staj|degerlendir|değerlendir|mülakat|mulakat|hangisi|plan|yol haritasi|guclu|güçlü|zayif|zayıf|neden alalim)\b/.test(normalized);
}

function formatInterviewResponse(userMessage: string, response: string): string {
  if (!shouldUseInterviewFormat(userMessage)) {
    return response;
  }

  const shortVersion = response
    .split("\n")
    .slice(0, 2)
    .join(" ")
    .trim();

  return `Kısa Mülakat Cevabı:\n${shortVersion}\n\nDetaylı Mülakat Cevabı:\n${response}`;
}

function findBestMatch(userMessage: string): string {
  if (isLikelyEnglishMessage(userMessage)) {
    return "Şu anda sadece Türkçe destekliyorum. Sorunu Türkçe yazarsan memnuniyetle yardımcı olurum.";
  }

  const normalized = normalizeQuery(userMessage);
  if (!normalized || normalized.length < 2) {
    return pickAnswer(FALLBACK_ANSWERS);
  }

  if (SENSITIVE_QUESTION_REGEX.test(normalized)) {
    return OUT_OF_SCOPE_ANSWER;
  }

  const rawWords = tokenize(normalized);
  const words = normalizeTokensForTypos(rawWords);
  const normalizedFromWords = words.join(" ");
  const searchableText = `${normalized} ${normalizedFromWords}`.trim();

  const typoAwareIntent = inferIntentFromTypoAwareTokens(words, searchableText);
  if (typoAwareIntent) {
    const entry = getEntryById(typoAwareIntent);
    if (entry) return pickAnswer(entry.answer);
  }

  const exactIntent = detectIntentByRules(searchableText);
  if (exactIntent) {
    const exactEntry = getEntryById(exactIntent);
    if (exactEntry) return pickAnswer(exactEntry.answer);
  }

  const ranked = KNOWLEDGE_BASE
    .map((entry) => ({ entry, score: scoreEntry(words, searchableText, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const second = ranked[1];

  if (!best || best.score < MIN_SCORE) {
    const guided = buildGeneralGuidance(searchableText);
    if (guided) return guided;
    const suggested = ranked
      .filter((item) => !GENERIC_INTENTS.has(item.entry.id))
      .slice(0, 3)
      .map((item) => item.entry.id);
    if (suggested.length > 0) return buildOptionPrompt(suggested);
    return `Seni doğru anlamak istiyorum. Şu başlıklardan biriyle sorabilir misin: ${SAFE_TOPICS.join(", ")}.`;
  }

  if (
    second &&
    second.entry.id !== best.entry.id &&
    best.score < 10 &&
    second.score >= AMBIGUITY_RATIO * best.score &&
    second.score >= 6
  ) {
    return buildClarification(best.entry, second.entry);
  }

  const connectorQuery = /\b(ve|ile|ayrica|aynı zamanda|hem|,)\b/.test(normalized);
  if (
    connectorQuery &&
    second &&
    second.entry.id !== best.entry.id &&
    second.score >= 0.7 * best.score &&
    second.score >= 6
  ) {
    return `${pickAnswer(best.entry.answer)}\n\n${pickAnswer(second.entry.answer)}`;
  }

  return pickAnswer(best.entry.answer);
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCounterRef = useRef(0);

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

  useEffect(() => {
    const maxTimestamp = messages.reduce((max, message) => Math.max(max, message.timestamp), 0);
    if (maxTimestamp > messageCounterRef.current) {
      messageCounterRef.current = maxTimestamp;
    }
  }, [messages]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;
    messageCounterRef.current += 1;
    const sequence = messageCounterRef.current;

    const userMessage: Message = {
      id: `u-${sequence}`,
      role: "user",
      content: trimmed,
      timestamp: sequence,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const typingDelay = 350;

    setTimeout(() => {
      const rawResponse = findBestMatch(userMessage.content);
      const aiResponse =
        chatMode === "interview"
          ? formatInterviewResponse(userMessage.content, rawResponse)
          : rawResponse;
      const assistantMessage: Message = {
        id: `a-${sequence}`,
        role: "assistant",
        content: aiResponse,
        timestamp: sequence,
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
                      AI Asistan • {chatMode === "interview" ? "Mülakat Modu" : "Normal Mod"}
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
                      title="Konuşmayı temizle"
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
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-9 lg:px-11 sm:py-7 space-y-3 sm:space-y-4 bg-[#0a0a0a]/50 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent hover:scrollbar-thumb-emerald-500/50">
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
                      Demir AI&apos;ya Hoş Geldiniz!
                      <motion.div
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <span className="text-xl sm:text-2xl">👋</span>
                      </motion.div>
                    </h4>
                    <p className="text-[12px] sm:text-sm text-emerald-200/70 leading-relaxed max-w-xs px-2">
                      Ben Mehmet&apos;in dijital asistanıyım. Eğitim, deneyim, projeler, teknoloji ve iletişim sorabilirsiniz.
                    </p>
                    {chatMode === null && (
                      <div className="mt-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                        <p className="text-[11px] sm:text-xs text-emerald-200/90 mb-2 font-semibold">
                          Girişte seç: Mülakat moduna geçilsin mi?
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          <button
                            type="button"
                            onClick={() => setChatMode("interview")}
                            className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-600/30 border border-emerald-400/40 text-emerald-100 hover:bg-emerald-600/40 transition-colors"
                          >
                            Mülakat Modu
                          </button>
                          <button
                            type="button"
                            onClick={() => setChatMode("normal")}
                            className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 transition-colors"
                          >
                            Normal Mod
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 justify-center mt-3 sm:mt-4">
                      {QUICK_PROMPTS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => sendMessage(item.prompt)}
                          className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs text-emerald-300/90 backdrop-blur hover:bg-emerald-500/20 transition-colors"
                        >
                          {item.label}
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
                  className={`flex px-1 sm:px-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[74%] sm:max-w-[68%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-[13px] sm:text-[14.5px] leading-relaxed shadow-lg ${
                      m.role === "user"
                        ? "mr-2 sm:mr-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white font-semibold rounded-br-md shadow-emerald-500/40"
                        : "ml-2 sm:ml-3 bg-[#1a1a1a]/80 backdrop-blur-xl text-white/90 border border-emerald-500/20 rounded-bl-md whitespace-pre-line"
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start px-1 sm:px-2">
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
                  placeholder="Bir soru sorun..."
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
              Demir AI ile konuş!
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
