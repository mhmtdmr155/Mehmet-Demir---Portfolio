# Kişisel Portföy Web Sitesi

Modern, responsive ve animasyonlu kişisel portföy web sitesi. Next.js, TypeScript, Tailwind CSS ve Framer Motion kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- ✨ Modern ve temiz tasarım
- 📱 Tam responsive (mobil, tablet, desktop)
- 🎨 Smooth animasyonlar (Framer Motion)
- 🧭 Smooth scroll navigasyon
- 📄 Tüm bölümler: Hakkımda, Eğitim, Projeler, Kurslar, Sertifikalar, Referanslar, İletişim
- 🎯 SEO optimizasyonu
- ⚡ Hızlı yükleme (Next.js optimizasyonları)

## 🛠️ Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Styling
- **Framer Motion** - Animasyonlar
- **React Icons** - İkonlar

## 📦 Kurulum

1. Projeyi klonlayın veya indirin
2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

4. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## ✏️ Kişiselleştirme

### Bilgilerinizi Güncelleme

1. **Hero Bölümü** (`components/Hero.tsx`):
   - Adınızı ve soyadınızı güncelleyin
   - Sosyal medya linklerinizi ekleyin

2. **Hakkımda Bölümü** (`components/About.tsx`):
   - Kendiniz hakkında bilgileri güncelleyin

3. **Eğitim Bölümü** (`components/Education.tsx`):
   - Eğitim bilgilerinizi ekleyin

4. **Projeler Bölümü** (`components/Projects.tsx`):
   - Projelerinizi ekleyin veya düzenleyin

5. **Kurslar** (`components/Courses.tsx`):
   - Aldığınız kursları ekleyin

6. **Sertifikalar** (`components/Certificates.tsx`):
   - Sertifikalarınızı ekleyin

7. **Referanslar** (`components/References.tsx`):
   - Referans bilgilerinizi ekleyin

8. **İletişim** (`components/Contact.tsx`):
   - Sosyal medya linklerinizi güncelleyin
   - EmailJS ile form gönderme işlevi aktif (kurulum aşağıda)

9. **Footer** (`components/Footer.tsx`):
   - Adınızı güncelleyin

10. **Metadata** (`app/layout.tsx`):
    - Site başlığı ve açıklamasını güncelleyin

## 🌐 Yayınlama (Deployment)

### Vercel ile Yayınlama (Önerilen - Ücretsiz)

1. **GitHub'a Yükleyin:**
   ```bash
   git init
   git add .
   git commit -m "İlk commit"
   git remote add origin https://github.com/kullaniciadi/repo-adi.git
   git push -u origin main
   ```

2. **Vercel'e Giriş Yapın:**
   - [vercel.com](https://vercel.com) adresine gidin
   - GitHub hesabınızla giriş yapın

3. **Projeyi İçe Aktarın:**
   - "New Project" butonuna tıklayın
   - GitHub repository'nizi seçin
   - Vercel otomatik olarak Next.js'i algılayacak
   - "Deploy" butonuna tıklayın

4. **Hazır!** 
   - Siteniz birkaç dakika içinde yayında olacak
   - Örnek URL: `https://proje-adi.vercel.app`

### Netlify ile Yayınlama (Alternatif)

1. GitHub'a yükleyin (yukarıdaki adımlar)
2. [netlify.com](https://netlify.com) adresine gidin
3. "Add new site" > "Import an existing project"
4. GitHub repository'nizi seçin
5. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. "Deploy site" butonuna tıklayın

### GitHub Pages ile Yayınlama

1. `next.config.ts` dosyasını düzenleyin:
   ```typescript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

2. Build alın:
   ```bash
   npm run build
   ```

3. `out` klasörünü GitHub Pages'e yükleyin

## 📧 EmailJS Kurulumu (Contact Form)

Contact form EmailJS ile entegre edilmiştir. Kurulum için:

1. **EmailJS Hesabı Oluşturun:**
   - [emailjs.com](https://www.emailjs.com) adresine gidin
   - Ücretsiz hesap oluşturun

2. **Email Service Ekleyin:**
   - Dashboard'da "Email Services" bölümüne gidin
   - Gmail, Outlook veya başka bir servis ekleyin
   - Service ID'yi not edin

3. **Email Template Oluşturun:**
   - "Email Templates" bölümüne gidin
   - "Create New Template" butonuna tıklayın
   - Template içeriğini düzenleyin:
     ```
     Konu: Yeni İletişim Formu Mesajı
     
     İsim: {{from_name}}
     Email: {{from_email}}
     Mesaj: {{message}}
     Duygu: {{feeling}}
     ```
   - Template ID'yi not edin

4. **Public Key Alın:**
   - "Account" > "General" bölümünden Public Key'i kopyalayın

5. **Environment Variables Ayarlayın:**
   - Proje root dizininde `.env.local` dosyası oluşturun:
     ```env
     NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
     NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
     NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
     ```
   - Değerleri yukarıda not ettiğiniz bilgilerle doldurun

6. **Test Edin:**
   - `npm run dev` ile projeyi çalıştırın
   - Contact formunu doldurup gönderin
   - Email'inizin gelen kutusunu kontrol edin

**Not:** `.env.local` dosyası Git'e commit edilmemelidir (zaten `.gitignore`'da olmalı).

## 📝 Notlar

- ✅ Contact form EmailJS ile backend entegrasyonu yapılmıştır
- CV indirme linkini `public` klasörüne CV dosyanızı ekleyerek aktif edebilirsiniz
- Proje görselleri için `public` klasörünü kullanabilirsiniz
- Rate limiting: Form 10 saniyede bir gönderim yapılabilir (spam koruması)

## 📄 Lisans

Bu proje kişisel kullanım için oluşturulmuştur.

## 🙏 Teşekkürler

İlham alınan site: [erenkadiroglu.com](https://erenkadiroglu.com)
