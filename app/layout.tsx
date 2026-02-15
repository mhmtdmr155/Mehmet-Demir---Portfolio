import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LoadingScreen from "@/components/LoadingScreen";
import { CommandMenuWrapper } from "@/components/CommandMenuWrapper";
import { ChatWidget } from "@/components/ChatWidget";

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
        <link rel="preload" href="/profile.jpg" as="image" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <LoadingScreen />
        <ThemeProvider>
          <CommandMenuWrapper />
          <ChatWidget />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
