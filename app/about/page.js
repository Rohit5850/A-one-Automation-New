import AboutCTASection from "../Components/AboutCTASection";
import AboutFAQSection from "../Components/AboutFAQSection";
import AboutHero from "../Components/AboutHero";
import AboutQualitySection from "../Components/AboutQualitySection";
import AboutStatsSection from "../Components/AboutStatsSection";
import AboutTechnologiesSection from "../Components/AboutTechnologiesSection";
import AboutTrustSection from "../Components/AboutTrustSection";
import AboutWhoweAre from "../Components/AboutWhoweAre";

export const metadata = {
  title: "About Us",

  description:
    "Learn more about A-One Automation and our industrial automation expertise.",

  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  return (

    <>
    <AboutHero />
    <AboutWhoweAre />
    <AboutTrustSection />
    <AboutTechnologiesSection />
    <AboutStatsSection />
    <AboutQualitySection />
    <AboutFAQSection />
    <AboutCTASection />
    </>
  );
}