import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Projects from "@/components/Projects";
import Courses from "@/components/Courses";
import Certificates from "@/components/Certificates";
import References from "@/components/References";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Mehmet Demir",
      url: "https://mehmetdemir.blog",
      jobTitle: "Software Developer",
      sameAs: [
        "https://github.com/mhmtdmr155",
        "https://www.linkedin.com/in/mehmet-demir-35b720207",
        "https://www.instagram.com/mhmtdmir01",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Mehmet Demir Portfolio",
      url: "https://mehmetdemir.blog",
      publisher: {
        "@type": "Person",
        name: "Mehmet Demir",
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen overflow-x-hidden lg:pl-[var(--sidebar-width,15rem)]">
        <Navbar />
        <Hero />
        <About />
        <Experience />
        <Education />
        <Projects />
        <Courses />
        <Certificates />
        <References />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
