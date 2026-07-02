import Image from "next/image";
import Navbar from "./Components/Navbar";
import HeroSection from "./Components/HeroSection";
import WhyChooseUs from "./Components/WhyChooseUs";
import Services from "./Components/Services";
import RecentProjects from "./Components/RecentProjects";
import CTASection from "./Components/CTASection";
import Footer from "./Components/Footer";

export default function Home() {
  return (
    <>
     <Navbar />
     <HeroSection />
     <WhyChooseUs/>
     <Services />
     <RecentProjects />

     <CTASection />

     <Footer />
    </>
  );
}
