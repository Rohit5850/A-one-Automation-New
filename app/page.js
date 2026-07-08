import Image from "next/image";
import Navbar from "./Components/Navbar";
import HeroSection from "./Components/HeroSection";
import WhyChooseUs from "./Components/WhyChooseUs";
import RecentProjects from "./Components/RecentProjects";
import CTASection from "./Components/CTASection";
import Footer from "./Components/Footer";
import ServicesSection from "./Components/ServicesSection";

export default function Home() {
  return (
    <>
     {/* <Navbar /> */}
     <HeroSection />
     <WhyChooseUs/>
     <ServicesSection />
     <RecentProjects />
     <CTASection />

     {/* <Footer /> */}
    </>
  );
}
