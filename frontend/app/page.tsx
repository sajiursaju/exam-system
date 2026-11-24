import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import CategoryAndNotice from "@/components/landing/CategoryAndNotice";
import Features from "@/components/landing/Features";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar />
      <CategoryAndNotice />
      <Features />
      <CtaBanner />
      <Footer />
    </main>
  );
}