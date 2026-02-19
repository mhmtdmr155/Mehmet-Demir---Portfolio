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

// Kapsamlı Mehmet Demir Bilgi Veritabanı (CV + Portfolio)
const KNOWLEDGE_BASE = {
  // Eğitim - CV'den detaylı
  egitim: {
    keywords: ["egitim", "okul", "universite", "hangi bolum", "kacinci sinif", "ogrenci", "mezun", "lisans", "hazirlik", "ingilizce", "gno", "not ortalamasi"],
    variations: ["okuyor", "okuyorsun", "hangi okulda", "nerede okuyor", "not ortalaman", "ortalaması kaç"],
    answer: "🎓 **Eğitim Geçmişim:**\n\n**Lisans (2022 - Devam Ediyor)**\nKahramanmaraş Sütçü İmam Üniversitesi\nBilgisayar Mühendisliği 3. sınıf\nGNO: 2.84\n\n**İngilizce Hazırlık (2022-2023)**\nKSÜ Yabancı Diller Yüksekokulu\nSeviye: B2 (Profesyonel Çalışma Yetkinliği)\n\n**Lise (2017-2021)**\nŞehit Ali Çiftçi Çok Programlı Anadolu Lisesi"
  },
  
  // Deneyim - CV'den güncel ve detaylı
  deneyim: {
    keywords: ["deneyim", "is", "calis", "staj", "kariyer", "tecrube", "nerede calis", "is deneyimi", "calisma", "sirket", "pozisyon"],
    variations: ["nerede calisiyor", "hangi firmada", "is yerinde", "hangi pozisyonda"],
    answer: "💼 **İş Deneyimim:**\n\n**1️⃣ Prep ShipHub** (Haziran 2025 - Devam Ediyor)\n📍 Web & Mobile Developer\n🌎 Amerika merkezli lojistik ve e-ticaret şirketi\n• React ve React Native ile yüksek performanslı web/mobil arayüzler geliştiriyorum\n• Kullanıcı odaklı, modern UI/UX çözümleri üretiyorum\n• Gerçek zamanlı lojistik sistemleri tasarlıyorum\n\n**2️⃣ Helikanon Yazılım** (Ağustos-Eylül 2025)\n📍 Stajyer Yazılım Geliştirici\n• Kurumsal Web ve Mobil uygulama geliştirme\n• Proje süreçlerine aktif katılım\n\n**3️⃣ Freelance Software Developer** (Haziran 2023 - Devam Ediyor)\n📍 Bağımsız Yazılım Geliştirici\n• Global müşteriler için butik yazılım çözümleri\n• Proje yönetimi ve müşteri iletişimi\n• Anahtar teslim yazılım süreçleri"
  },

  // Prep ShipHub - Detaylı
  prepShipHub: {
    keywords: ["prep", "shiphub", "ship hub", "lojistik", "amerika", "guncel is", "su anki is"],
    variations: ["su an nerede", "simdi nerede", "guncel pozisyon"],
    answer: "🚀 **Prep ShipHub (Aktif Pozisyon)**\n\n📍 **Pozisyon:** Web & Mobile Developer\n📅 **Süre:** Haziran 2025 - Devam Ediyor\n🌎 **Şirket:** Amerika merkezli lojistik ve e-ticaret çözümleri\n\n**Sorumluluklar:**\n• React ile modern, responsive web arayüzleri geliştirme\n• React Native ile cross-platform mobil uygulamalar\n• Yüksek performanslı, kullanıcı odaklı UI/UX tasarımı\n• Lojistik süreçler için teknolojik çözümler üretme\n• Gerçek dünya iş problemlerini kod ile çözme\n\nBu pozisyonda hem frontend teknolojilerimi ileri seviyeye taşıyorum hem de global ölçekte iş süreçlerini öğreniyorum!"
  },

  // Teknofest - CV'den detaylı
  teknofest: {
    keywords: ["teknofest", "siha", "iha", "uav", "istiklal", "drone", "insansiz hava araci", "savunma sanayi"],
    variations: ["teknofestte ne yaptin", "uav projesi", "siha projesi"],
    answer: "🚁 **İstiklal SİHA - Teknofest 2024**\n\n📍 **Takım:** KSÜ ALYA UAV İnsansız Hava Aracı Takımı\n📅 **Süre:** Aralık 2023 - Haziran 2024\n🎯 **Rol:** Yazılım Ekip Üyesi\n\n**Görevler:**\n• Savunma sanayii standartlarında yazılım mimarisi geliştirme\n• İnsansız hava aracı sistem entegrasyonu\n• Karmaşık problemler için teknolojik çözümler üretme\n• Takım çalışması içinde koordinasyon\n• Mission-critical (görev kritik) sistemler üzerine çalışma\n\nBu proje sayesinde yüksek hassasiyetli, güvenlik odaklı yazılım geliştirme disiplinini öğrendim. Savunma sanayii teknolojileriyle çalışma fırsatı buldum!"
  },

  // Projeler - CV'den detaylı ve güncel
  projeler: {
    keywords: ["proje", "yaptigin", "github", "portfolio", "gelistirdigin", "ne yaptın", "projelerini anlat", "hangi projeler"],
    variations: ["ne tur projeler", "en iyi projen"],
    answer: "🚀 **Öne Çıkan Projelerim:**\n\n**1️⃣ YouTube Success Predictor** ⭐\n🤖 Makine Öğrenimi tabanlı video başarı tahmin sistemi\n• 2600+ video verisi ile eğitilmiş ML modelleri\n• XGBoost, Random Forest, Ensemble algoritmaları\n• 80+ özellik ile ilk 7 günlük görüntülenme tahmini\n• %95 güven aralığı ve confidence scoring\n• Flask backend + Production-ready\n• YouTube Data API v3 entegrasyonu\n\n**2️⃣ Kapsamlı Ürün Yönetim Sistemi**\n• React + Spring Boot Full-Stack\n• Yetki tabanlı erişim kontrolü (Protected Routes)\n• Dinamik admin dashboard\n• Ürün, kategori, kullanıcı yönetimi\n\n**3️⃣ Restaurant Order Tracking System**\n• Garson ihtiyacını minimize eden sipariş sistemi\n• Full-Stack uygulama\n• Gerçek zamanlı sipariş takibi\n\n**4️⃣ Minesweeper Game**\n• C dili ile geliştirilmiş\n• Algoritma ve hafıza yönetimi odaklı\n• Strateji oyunu mekaniği\n\n📂 Tüm kodlar GitHub'da: github.com/mhmtdmr155"
  },

  // YouTube Predictor - CV'den çok detaylı
  youtubePredictor: {
    keywords: ["youtube", "video", "success predictor", "tahmin", "makine ogrenmesi projesi", "yapay zeka projesi", "ml projesi"],
    variations: ["youtube projesi", "video tahmini", "en iyi projen"],
    answer: "🎬 **YouTube Success Predictor - En Gelişmiş Projem**\n\n🤖 **Ne Yapar?**\nYouTube içerik üreticilerinin video yüklemeden ÖNCE başarı tahmininde bulunmalarını sağlayan yapay zeka sistemi.\n\n📊 **Teknik Detaylar:**\n• 2600+ video verisi (YouTube Data API v3)\n• 80+ özellik analizi (başlık, tag, thumbnail, yayın zamanı vb.)\n• İlk 7 günlük görüntülenme sayısı tahmini\n• %95 güven aralığı ile prediction intervals\n• Dinamik confidence scoring (güven puanlaması)\n• Kişiselleştirilmiş optimizasyon önerileri\n\n🔧 **Teknolojiler:**\n• Python + Flask (Backend)\n• Scikit-learn (ML Framework)\n• XGBoost + Random Forest + Ensemble Learning\n• Pandas + NumPy (Veri işleme)\n• Production-ready deployment\n\n💡 **Özel Özellikler:**\n✓ Gerçek zamanlı tahmin\n✓ Çoklu model ensemble yaklaşımı\n✓ Güven aralığı hesaplaması\n✓ Actionable insights (uygulanabilir öneriler)\n\nBu proje, makine öğrenimi ve web teknolojilerini birleştirerek iş değeri yaratan bir çözüm!"
  },

  // Yetenekler - CV'den tam liste
  yetenekler: {
    keywords: ["yetenek", "beceri", "skill", "yapabilir", "teknoloji", "bildigin", "tech stack", "hangi diller", "teknik yetkinlik"],
    variations: ["ne biliyorsun", "hangi teknolojiler", "hangi dilleri biliyorsun"],
    answer: "💻 **Teknik Yetkinliklerim:**\n\n**Programlama Dilleri:**\n• JavaScript / TypeScript ⭐⭐⭐⭐⭐\n• Python ⭐⭐⭐⭐⭐\n• C ⭐⭐⭐⭐\n• SQL / MySQL ⭐⭐⭐⭐\n\n**Frontend:**\n• React.js & Next.js ⭐⭐⭐⭐⭐\n• Vue.js ⭐⭐⭐⭐\n• HTML5 / CSS3 / TailwindCSS ⭐⭐⭐⭐⭐\n• Framer Motion (Animasyonlar)\n\n**Mobil:**\n• React Native (Expo) ⭐⭐⭐⭐⭐\n• Cross-Platform Development\n\n**Backend:**\n• Flask (Python) ⭐⭐⭐⭐\n• Spring Boot (Java) ⭐⭐⭐\n• Node.js ⭐⭐⭐\n\n**Yapay Zeka & ML:**\n• Scikit-learn ⭐⭐⭐⭐\n• Pandas / NumPy ⭐⭐⭐⭐\n• Machine Learning Algorithms\n• XGBoost, Random Forest, Ensemble\n\n**Veritabanı:**\n• PostgreSQL ⭐⭐⭐⭐\n• MSSQL ⭐⭐⭐⭐\n• MySQL ⭐⭐⭐⭐\n\n**Tools & Diğer:**\n• Git & GitHub ⭐⭐⭐⭐⭐\n• VS Code\n• Figma (UI/UX)\n• RESTful API Design\n• Agile Methodologies"
  },

  // Kişisel Beceriler - CV'den
  kisiselBeceri: {
    keywords: ["kisisel beceri", "soft skill", "profesyonel beceri", "takim calisma", "iletisim", "ogrenme"],
    variations: ["kisisel yetenekler", "soft skill"],
    answer: "🌟 **Kişisel ve Profesyonel Becerilerim:**\n\n✅ **Yapay Zekayı Etkin Kullanma**\n• AI araçları ile verimlilik artışı\n• Prompt engineering\n• ML/AI çözümler üretme\n\n✅ **Takım Çalışması & Etkili İletişim**\n• Teknofest ve şirket projelerinde ekip deneyimi\n• Global iletişim (Work and Travel)\n• Code review ve pair programming\n\n✅ **Sürekli Öğrenme**\n• Yeni teknolojilere hızlı adaptasyon\n• Online kurslar ve self-learning\n• Trend teknolojileri takip etme\n\n✅ **Problem Çözme**\n• Analitik düşünme\n• Algoritma tasarımı\n• Debug ve optimizasyon\n\n✅ **Yeniliğe Açık Olma**\n• Modern teknolojileri deneme cesareti\n• Best practices uygulama\n• Inovatif çözümler üretme\n\n✅ **Etkin Git & GitHub Kullanımı**\n• Version control best practices\n• Branch management\n• Open source contributions"
  },

  // Referans - CV'den
  referans: {
    keywords: ["referans", "tavsiye", "yasin celik", "microsoft", "referansın kim"],
    variations: ["referansin", "kimden referans"],
    answer: "👨‍💼 **Profesyonel Referansım:**\n\n**Yasin Çelik**\n📍 Senior Software Engineer at Microsoft\n💼 LinkedIn: linkedin.com/in/yasin-celik-30933a31/\n📧 E-Posta: yasincelikk16@gmail.com\n\nYasin Bey, Microsoft'ta senior pozisyonda çalışan deneyimli bir yazılım mühendisi. Profesyonel gelişimim ve teknik yetkinliklerim hakkında bilgi alabilirsin."
  },

  // Ehliyet - CV'den
  ehliyet: {
    keywords: ["ehliyet", "surucu belgesi", "arac kullan", "motor"],
    variations: ["ehliyetin var mi", "arac kullanabiliyor"],
    answer: "🚗 **Sürücü Belgeleri:**\nM, B, B1, F sınıfı ehliyet\n\n• M: Motosiklet/Moped\n• B: Otomobil\n• B1: Motorlu bisiklet\n• F: Traktör\n\nMobilite konusunda tamamen esneğim!"
  },

  // Work and Travel - CV'den
  workTravel: {
    keywords: ["work and travel", "amerika", "abd", "usa", "yaz program", "kulturel", "global deneyim"],
    variations: ["amerikaya gitti", "work travel", "abd deneyimi"],
    answer: "🌎 **Work and Travel - ABD Deneyimi**\n\n2024 yazında Amerika'da Work and Travel programına katıldım.\n\n**Kazanımlar:**\n• Global iletişim becerileri\n• Farklı kültürlerle çalışma deneyimi\n• Profesyonel İngilizce pratiği\n• Uluslararası iş perspektifi\n• Adaptasyon ve problem çözme yeteneği\n\nBu deneyim, profesyonel hayatımda global projelerde çalışma motivasyonumu artırdı. Şu an Amerika merkezli Prep ShipHub'da çalışıyorum ve bu deneyimimi aktif kullanıyorum!"
  },

  // Dil - CV'den
  dil: {
    keywords: ["dil", "ingilizce", "language", "yabanci dil", "ingilizce seviye"],
    variations: ["ingilizce biliyor", "ingilizce seviyesi", "hangi diller"],
    answer: "🌐 **Dil Yetkinliğim:**\n\n**İngilizce: B2 Seviyesi**\n✓ Profesyonel Çalışma Yetkinliği\n✓ KSÜ Yabancı Diller Yüksekokulu (2022-2023)\n✓ İş ortamında rahatça kullanabiliyorum\n✓ Teknik dokümantasyon okuma/yazma\n✓ Amerika'da Work and Travel deneyimi\n✓ Global müşterilerle iletişim\n\n**Türkçe: Ana Dil**\n✓ Akıcı yazılı ve sözlü iletişim"
  },

  // İletişim - Güncel
  iletisim: {
    keywords: ["iletisim", "mail", "email", "ulas", "telefon", "contact", "sosyal medya", "linkedin", "github", "numara"],
    variations: ["nasil iletisime gec", "mail adresi", "telefon numarasi"],
    answer: "📞 **İletişim Bilgilerim:**\n\n📧 **E-Posta:** mhmtdmr1552@gmail.com\n📱 **Telefon:** +90 543 232 3167\n\n💼 **LinkedIn:** linkedin.com/in/mehmet-demir-35b720207\n🐙 **GitHub:** github.com/mhmtdmr155\n📸 **Instagram:** @mhmtdmir01\n\n💬 **İletişim Formu:** Bu sitedeki 'İletişim' bölümünden direkt mesaj gönderebilirsin!\n\n✨ İş birlikleri, staj fırsatları, kariyer teklifleri ve projeler için her zaman açığım. Hemen iletişime geç!"
  },

  // CV İndirme
  cv: {
    keywords: ["cv", "ozgecmis", "resume", "indir", "cv indir", "ozgecmisini goster", "pdf"],
    variations: ["cv yi nereden", "cv nasil", "cv si var mi"],
    answer: "📄 **CV İndirme:**\n\nCV'mi şu yollardan indirebilirsin:\n\n1️⃣ Sağ üstteki menüden 'CV İndir' butonuna tıkla\n2️⃣ Anasayfadaki Hero bölümünde 'CV İndir' butonunu kullan\n3️⃣ Direkt link: `/MEHMET DEMİR CV.pdf`\n\n📋 **CV İçeriği:**\n✓ Detaylı iş deneyimleri\n✓ Tüm projeler\n✓ Teknik yetkinlikler\n✓ Eğitim geçmişi\n✓ Sertifikalar\n✓ Profesyonel referans\n✓ İletişim bilgileri\n\nTek sayfalık, profesyonel formatta PDF!"
  },

  // GNO - CV'den
  gno: {
    keywords: ["not ortalaması", "gno", "akademik basari", "not ortalaman"],
    variations: ["ortalaması kaç", "gno su ne kadar"],
    answer: "📊 **Akademik Başarı:**\n\nGNO: 2.84 / 4.00\n\nKahramanmaraş Sütçü İmam Üniversitesi\nBilgisayar Mühendisliği 3. sınıf\n\nNot: Akademik not ortalamasının yanı sıra, pratik projeler ve gerçek dünya deneyimlerine odaklanıyorum. Staj, Teknofest ve freelance projelerde kazandığım teknik beceriler, teorik bilgimi güçlendiriyor!"
  },

  // İş Arama Durumu
  isAriyorum: {
    keywords: ["is ariyor", "staj ariyor", "musait", "calisabilir", "ise acik", "open to work", "part time", "full time"],
    variations: ["is ariyormusun", "staj yapabilir", "musait misin"],
    answer: "✅ **İş Durumum: Open to Work**\n\n🎯 **Aradığım Pozisyonlar:**\n• Full-time yazılım geliştirici\n• Part-time remote iş fırsatları\n• Staj pozisyonları (yazılım mühendisliği)\n• Proje bazlı iş birlikleri\n• Freelance projeler\n\n💼 **İlgi Alanlarım:**\n• React / React Native geliştirme\n• Full-Stack web uygulamaları\n• AI/ML destekli projeler\n• Startup ekiplerinde çalışma\n• Lojistik/E-ticaret teknolojileri\n\n📍 **Lokasyon:** Gaziantep/Kahramanmaraş (Remote'a açık)\n\n💡 Şu anda Prep ShipHub'da part-time çalışıyorum, additional opportunities için tamamen açığım!\n\n📞 İletişim: mhmtdmr1552@gmail.com | +90 543 232 3167"
  },

  // Freelance - CV'den detaylı
  freelance: {
    keywords: ["freelance", "serbest", "proje bazli", "musteri", "kendi basina", "bagimsiz"],
    variations: ["freelance calisiyor", "serbest calisma", "freelancer misin"],
    answer: "💼 **Freelance Software Developer**\n📅 Haziran 2023 - Devam Ediyor\n\n**Ne Yapıyorum?**\n• Global ölçekteki müşteriler için butik yazılım çözümleri\n• İhtiyaç analizleri ve teknik danışmanlık\n• Web ve mobil tabanlı özel yazılımlar\n• Anahtar teslim proje süreçleri\n• Proje yönetimi ve müşteri iletişimi\n\n**Hizmetler:**\n✓ React/Next.js web uygulamaları\n✓ React Native mobil uygulamalar\n✓ Flask/Python backend geliştirme\n✓ Machine Learning entegrasyonları\n✓ UI/UX tasarım ve optimizasyon\n\n**Çalışma Şeklim:**\n• Esnek çalışma saatleri\n• Remote-first\n• Agile metodoloji\n• Düzenli güncelleme ve raporlama\n\n💡 Freelance projen var mı? Hemen iletişime geç!"
  },

  // Neden işe alınmalı - CV bazlı
  nedenSen: {
    keywords: ["neden", "niye seni", "farkın ne", "avantajın", "neden tercih", "neden ise almaliyiz", "seni ayiran"],
    variations: ["senin farkin", "neden seni secelim"],
    answer: "🌟 **Beni Neden İşe Almalısınız?**\n\n**1️⃣ Kanıtlanmış Deneyim**\n• Amerika merkezli şirkette (Prep ShipHub) aktif developer\n• Savunma sanayii projesi (İstiklal SİHA) deneyimi\n• 2+ yıl freelance çalışma tecrübesi\n• Gerçek dünya problemlerini çözdüm\n\n**2️⃣ Modern Teknoloji Stack'i**\n• React, Next.js, React Native (üretim seviyesi)\n• Python, Flask, Machine Learning\n• Full-Stack geliştirme yetkinliği\n• Clean code ve best practices\n\n**3️⃣ Hızlı Öğrenme & Adaptasyon**\n• Yeni teknolojilere hızlı adapte oluyorum\n• Sürekli öğrenme tutkusu\n• 4 Udemy kursu tamamladım\n• Trend teknolojileri takip ediyorum\n\n**4️⃣ Global Perspektif**\n• ABD Work and Travel deneyimi\n• B2 İngilizce yetkinliği\n• Global müşterilerle çalışma tecrübesi\n• Kültürel farkındalık\n\n**5️⃣ Problem Çözme Odaklı**\n• Analitik düşünme yeteneği\n• Karmaşık problemleri basitleştirme\n• Production-ready çözümler üretme\n• Microsoft senior engineer referansı\n\n💡 **En Önemlisi:** Kod yazmayı seviyorum ve teknolojiye tutkuyla bağlıyım! Her projede değer katmaya odaklanıyorum. 🚀"
  },

  // Hedefler
  hedef: {
    keywords: ["hedef", "gelecek", "amac", "plan", "kariyer hedefi", "ne olmak istiyor", "vizyon"],
    variations: ["hedefin ne", "gelecekte ne yapacak", "planin ne"],
    answer: "🎯 **Kariyer Hedeflerim:**\n\n**Kısa Vadede (1 yıl):**\n• Profesyonel bir yazılım ekibinde full-time pozisyon\n• React/React Native uzmanlığımı ileri seviyeye taşımak\n• Büyük ölçekli projelerde deneyim kazanmak\n• Cloud teknolojileri (AWS, Docker) öğrenmek\n\n**Orta Vadede (2-3 yıl):**\n• AI/ML konusunda derinleşmek\n• Full-Stack mimari tasarımında uzmanlaşmak\n• Senior developer seviyesine ulaşmak\n• Açık kaynak projelere katkı yapmak\n\n**Uzun Vadede (5+ yıl):**\n• Kendi SaaS ürünlerimi geliştirmek\n• Yazılım girişimcilik alanında yer almak\n• Teknoloji topluluğuna değer katmak\n• Mentorluk ve bilgi paylaşımı yapmak\n\n🚀 **Vizyon:** Teknolojinin geleceğini şekillendiren, dünyaya değer katan projeler geliştirmek ve yazılım alanında iz bırakmak!\n\n💡 Sürekli öğrenme ve gelişme benim için yaşam tarzı. 'Kodla, öğren, geliştir' mottosu ile ilerliyorum!"
  },

  // Konum
  konum: {
    keywords: ["nerede yasiyor", "hangi sehir", "konum", "gaziantep", "kahramanmaras", "lokasyon", "nerede oturuyor"],
    variations: ["hangi ilde", "nerede kalıyor"],
    answer: "📍 **Lokasyon:**\n\n🏠 **Şu An:** Gaziantep & Kahramanmaraş\n• Okul: Kahramanmaraş (KSÜ)\n• Ev: Gaziantep\n• Esnek lokasyon\n\n💻 **Remote Çalışma:** %100 Açık\n• Tam zamanlı remote pozisyonlara uygunluk\n• Saat dilimi: GMT+3 (Türkiye)\n• Home office setup mevcut\n• Online iş birliği araçlarına hakim\n\n🚗 **Mobilite:** Yüksek\n• Ehliyet: M, B, B1, F\n• İş için seyahat etmeye açık\n• Relocation (taşınma) imkanı var\n\n🌍 Türkiye genelinde veya global remote pozisyonlar için müsaitim!"
  },

  // React - Detaylı
  react: {
    keywords: ["react", "react native", "frontend", "next", "nextjs", "next.js", "web gelistirme", "reactjs"],
    variations: ["react biliyor", "react native bilir", "reactte iyimisin"],
    answer: "⚛️ **React Ekosistemi Uzmanlığım:**\n\n**React.js ⭐⭐⭐⭐⭐**\n• Next.js 14+ (App Router, Server Components)\n• TypeScript entegrasyonu\n• Context API, Custom Hooks\n• Performance optimizasyonu\n• Component design patterns\n\n**React Native ⭐⭐⭐⭐⭐**\n• Expo framework\n• Cross-platform (iOS + Android)\n• Native module entegrasyonları\n• Prep ShipHub'da production uygulamalar\n\n**Kullandığım Libraries:**\n• Framer Motion (Animasyonlar)\n• TailwindCSS (Styling)\n• React Query (Data fetching)\n• Zustand/Context (State management)\n\n**Gerçek Projeler:**\n✓ Bu portfolio sitesi (Next.js 16 + React 19)\n✓ Prep ShipHub lojistik uygulamaları\n✓ Ürün yönetim sistemi\n✓ 10+ freelance React projesi\n\n💡 React benim günlük kullandığım ana teknolojim. Modern, performanslı ve maintainable uygulamalar geliştiriyorum!"
  },

  // Python & AI - CV bazlı detaylı
  python: {
    keywords: ["python", "flask", "backend", "machine learning", "ml", "yapay zeka", "ai", "makine ogrenmesi", "scikit"],
    variations: ["python biliyor", "yapay zeka", "ai projesi", "pythonda ne yapabilir"],
    answer: "🐍 **Python & AI/ML Uzmanlığım:**\n\n**Python ⭐⭐⭐⭐⭐**\n• 3+ yıl deneyim\n• Clean code ve best practices\n• OOP ve functional programming\n\n**Flask Backend**\n• RESTful API geliştirme\n• Production-ready deployment\n• YouTube Predictor projesi (aktif)\n\n**Machine Learning**\n• Scikit-learn (ana framework)\n• XGBoost, Random Forest, Ensemble\n• Model training ve evaluation\n• Feature engineering (80+ özellik)\n• Prediction intervals (%95 güven)\n• Confidence scoring\n\n**Data Science**\n• Pandas (veri manipülasyonu)\n• NumPy (numerical computing)\n• 2600+ veri seti ile çalışma\n• Data cleaning & preprocessing\n\n**Gerçek Proje:**\n🎬 YouTube Success Predictor\n• 2600+ video verisi\n• 80+ özellik analizi\n• Production-ready Flask app\n• Ensemble learning\n• Actionable insights\n\n💡 Python ile hem web backend hem AI/ML çözümleri geliştiriyorum. Veri bilimi ve web teknolojilerini birleştirme konusunda deneyimliyim!"
  },

  // Kurslar
  kurslar: {
    keywords: ["kurs", "egitim aldigin", "udemy", "sertifika", "ogrendigin", "kurs tamamla", "online egitim"],
    variations: ["hangi kurslar", "ne kurslar aldi", "sertifikalar"],
    answer: "📚 **Tamamladığım Kurslar & Sertifikalar:**\n\n**Udemy:**\n1️⃣ The Web Developer Bootcamp 2025\n   • Full-Stack web development\n   • HTML, CSS, JavaScript, Node.js\n\n2️⃣ React - The Complete Guide 2025\n   • Modern React patterns\n   • Hooks, Context, Performance\n\n3️⃣ React Native - The Practical Guide\n   • Cross-platform mobil geliştirme\n   • Expo ve native modules\n\n4️⃣ Sıfırdan Web Developer Olma\n   • Frontend temelleri\n   • Türkçe kapsamlı eğitim\n\n**Diğer Sertifikalar:**\n🎓 Bilgi Teknolojileri Stajı Katılım Sertifikası\n   • Excel, Photoshop, AutoCAD, Python\n\n🎓 LIFT UP Katılım Belgesi\n   • Sanayi odaklı lisans bitirme projeleri konferansı\n\n💡 Sürekli öğrenmeye inanıyorum. Yeni teknolojiler için düzenli olarak kurs ve dokümantasyon takip ediyorum!"
  },

  // Selamlama
  selamlama: {
    keywords: ["merhaba", "selam", "hey", "hi", "hello", "nasilsin", "gunaydın", "iyi gunler"],
    variations: ["selamlar", "slm", "naber"],
    answer: "Merhaba! 👋 Ben **Demir AI**, Mehmet Demir'in dijital asistanıyım.\n\n🤖 Size nasıl yardımcı olabilirim?\n\n**Bana şunları sorabilirsiniz:**\n• 🎓 Eğitim geçmişi ve akademik başarı\n• 💼 İş deneyimleri (Prep ShipHub, Teknofest, Freelance)\n• 🚀 Projeler (YouTube Predictor, SİHA, Full-Stack apps)\n• 💻 Teknolojiler ve yetenekler\n• 📞 İletişim bilgileri\n• 🎯 Kariyer hedefleri\n• 📄 CV indirme\n\nHangi konuda bilgi almak istersiniz? 😊"
  },

  // Teşekkür
  tesekkur: {
    keywords: ["tesekkur", "tesekkurler", "sagol", "eyv", "tsk", "super", "harika"],
    variations: ["cok tesekkur", "tesekkur ederim", "sagolasın"],
    answer: "Rica ederim! 😊 Yardımcı olabildiysem ne mutlu bana!\n\n✨ Başka sorunuz varsa çekinmeden sorun. Mehmet hakkında her şeyi biliyorum!\n\nİyi günler! 🚀"
  },

  // Kimsin
  kimsin: {
    keywords: ["sen kimsin", "kim", "demir ai", "yapay zeka", "assistant", "bot"],
    variations: ["sen nesin", "ne tur bir bot"],
    answer: "🤖 **Ben Demir AI!**\n\nMehmet Demir'in özel dijital asistanıyım. Onun hakkındaki tüm bilgileri biliyorum:\n\n✓ Eğitim ve kariyer geçmişi\n✓ Teknik yetenekler ve projeler\n✓ İş deneyimleri\n✓ İletişim bilgileri\n✓ Gelecek hedefleri\n\n💡 Gelişmiş Türkçe dil işleme ile sorularınızı anlıyor ve doğru cevaplar veriyorum.\n\n🎯 Amacım: Mehmet'i tanımanıza ve iş birliği fırsatlarını keşfetmenize yardımcı olmak!\n\nBana bir şey sormak ister misiniz? 😊"
  },

  // Genel / Default
  genel: {
    keywords: ["kendini tanit", "hakkinda", "seni anlat", "mehmet kim", "anlat"],
    variations: ["kim bu mehmet", "mehmet hakkinda"],
    answer: "👨‍💻 **Mehmet Demir - Kısaca**\n\n🎓 **Eğitim:** KSÜ Bilgisayar Mühendisliği 3. sınıf (GNO: 2.84)\n💼 **Pozisyon:** Web & Mobile Developer @ Prep ShipHub\n🚀 **Uzmanlık:** React, React Native, Python, AI/ML\n🌍 **Deneyim:** Amerika merkezli şirket + Teknofest + Freelance\n⭐ **En İyi Proje:** YouTube Success Predictor (ML)\n\n**Teknik Stack:**\nReact/Next.js • React Native • Python/Flask • TypeScript • Machine Learning • PostgreSQL • Git\n\n**Öne Çıkan Özellikler:**\n✓ Production-ready kod yazabilme\n✓ Full-Stack geliştirme\n✓ AI/ML entegrasyonları\n✓ Global iş deneyimi (ABD)\n✓ Microsoft senior engineer referansı\n\n📍 Gaziantep/Kahramanmaraş (Remote açık)\n📧 mhmtdmr1552@gmail.com\n📱 +90 543 232 3167\n\n💡 **Motto:** \"Kodla, öğren, geliştir!\"\n\nDaha detaylı bilgi için spesifik soru sorabilirsin! 🚀"
  }
};

// Gelişmiş Türkçe-aware matching algoritması
function findBestMatch(userMessage: string): string {
  const normalized = normalizeText(userMessage);
  const words = normalized.split(/\s+/);

  let maxScore = 0;
  let bestAnswer = "";

  // Her kategoriyi skorla
  for (const [, data] of Object.entries(KNOWLEDGE_BASE)) {
    let score = 0;
    
    // Ana keywords
    for (const keyword of data.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalized.includes(normalizedKeyword)) {
        score += normalizedKeyword.length * 2;
      }
      if (words.includes(normalizedKeyword)) {
        score += 5;
      }
    }
    
    // Variations
    if (data.variations) {
      for (const variation of data.variations) {
        const normalizedVariation = normalizeText(variation);
        if (normalized.includes(normalizedVariation)) {
          score += normalizedVariation.length * 1.5;
        }
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestAnswer = data.answer;
    }
  }

  // Eğer hiç eşleşme yoksa
  if (maxScore < 3) {
    return "🤔 Bu konuda şu anda detaylı bilgim yok.\n\n**Bana şunları sorabilirsiniz:**\n\n📚 Eğitim ve GNO\n💼 İş deneyimleri (Prep ShipHub, Helikanon, Freelance)\n🚁 Teknofest İstiklal SİHA projesi\n🚀 YouTube Predictor ve diğer projeler\n💻 Teknolojiler (React, Python, AI/ML)\n🎯 Kariyer hedefleri\n📞 İletişim bilgileri\n📄 CV indirme\n🌍 Work and Travel deneyimi\n👨‍💼 Profesyonel referans\n\nDaha spesifik bir soru sormak ister misiniz? 😊";
  }

  return bestAnswer;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const typingDelay = 300 + Math.random() * 400;

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
            className="w-[92vw] sm:w-[420px] max-w-[420px] h-[88vh] sm:h-[700px] sm:max-h-[88vh] backdrop-blur-2xl bg-gradient-to-br from-[#0a0a0a]/95 via-[#111111]/95 to-[#0a0a0a]/95 border border-emerald-500/20 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden ring-1 ring-emerald-500/20"
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
                      AI Asistan • Aktif
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
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7 space-y-3 sm:space-y-4 bg-[#0a0a0a]/50 backdrop-blur-sm scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent hover:scrollbar-thumb-emerald-500/50">
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
                      <RiRobot2Fill className="relative text-emerald-400 w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]" />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[15px] sm:text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
                      Demir AI&apos;ya Hoş Geldiniz!
                      <motion.div
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <span className="text-xl sm:text-2xl">👋</span>
                      </motion.div>
                    </h4>
                    <p className="text-[12.5px] sm:text-sm text-emerald-200/70 leading-relaxed max-w-xs px-2">
                      Ben Mehmet&apos;in dijital asistanıyım. Eğitim, deneyim, projeler ve daha fazlası hakkında bana soru sorabilirsiniz.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-3 sm:mt-4">
                      <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs text-emerald-300/90 backdrop-blur">💼 Deneyim</span>
                      <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs text-emerald-300/90 backdrop-blur">🚀 Projeler</span>
                      <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs text-emerald-300/90 backdrop-blur">💻 Teknoloji</span>
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
                    className={`max-w-[75%] sm:max-w-[72%] rounded-2xl px-4 py-3 text-[14px] sm:text-[14.5px] leading-relaxed shadow-lg ${
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
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 bg-gradient-to-t from-[#0a0a0a] via-emerald-950/10 to-transparent backdrop-blur-xl border-t border-emerald-500/20">
              <div className="flex gap-3 sm:gap-4">
                <input
                  className="flex-1 bg-[#1a1a1a]/80 backdrop-blur-xl border-2 border-emerald-500/20 rounded-3xl px-6 py-5 sm:py-6 text-[18px] sm:text-[19px] text-white placeholder:text-emerald-300/50 focus:outline-none focus:border-emerald-500/70 focus:ring-4 focus:ring-emerald-500/30 transition-all shadow-inner font-semibold"
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
                  className="px-7 py-5 sm:px-8 sm:py-6 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white rounded-3xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 active:shadow-emerald-500/80 border-2 border-emerald-400/40"
                >
                  <HiPaperAirplane className="rotate-90 w-[38px] h-[38px] sm:w-[42px] sm:h-[42px]" />
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
        className="group relative flex items-center justify-center w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_50px_rgba(16,185,129,0.6)] active:shadow-[0_20px_60px_rgba(16,185,129,0.7)] transition-all z-[10000] border-2 border-emerald-400/30"
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
            <HiX size={28} className="sm:w-8 sm:h-8 drop-shadow-lg" />
          ) : (
            <div className="relative">
              {/* AI Robot Face with Smile */}
              <RiRobot2Fill size={34} className="sm:w-[38px] sm:h-[38px] drop-shadow-2xl" />
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
