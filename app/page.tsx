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
  return (
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
  );
}
