import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LoadingScreen from "@/components/LoadingScreen";
import { CommandMenuWrapper } from "@/components/CommandMenuWrapper";
import { ChatWidget } from "@/components/ChatWidget";
import { GA4PageTracker } from "@/components/GA4PageTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Font yüklenmeden fallback göster, sonra swap yap
  preload: true,   // Font'u önceden yükle
});

export const metadata: Metadata = {
  title: "Mehmet Demir - Portfolio",
  description: "Yazılım geliştirme yolculuğum, projelerim ve yetkinliklerim",
  metadataBase: new URL("https://mehmetdemir.blog"),
  alternates: {
    canonical: "https://mehmetdemir.blog",
  },
  applicationName: "Mehmet Demir Portfolio",
  keywords: [
    "Mehmet Demir",
    "Portfolio",
    "Yazılım Geliştirici",
    "Full Stack Developer",
    "React",
    "Next.js",
    "React Native",
    "Python",
  ],
  authors: [{ name: "Mehmet Demir", url: "https://mehmetdemir.blog" }],
  creator: "Mehmet Demir",
  publisher: "Mehmet Demir",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "xMwYGaRP_WSKS-Ko2RvpmGapPFlNlMak3iFVPsfEPN8",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    title: "Mehmet Demir - Portfolio",
    description: "Yazılım geliştirme yolculuğum, projelerim ve yetkinliklerim",
    type: "website",
    locale: "tr_TR",
    url: "https://mehmetdemir.blog",
    siteName: "Mehmet Demir Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mehmet Demir - Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mehmet Demir - Portfolio",
    description: "Yazılım geliştirme yolculuğum, projelerim ve yetkinliklerim",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth" data-theme="dark" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-HT948T4R3X"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HT948T4R3X');
            `,
          }}
        />
        <link rel="preload" href="/profile.jpg" as="image" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <LoadingScreen />
        <ThemeProvider>
          <GA4PageTracker />
          <CommandMenuWrapper />
          <ChatWidget />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
