import ServiceCTASection from "../Components/ServiceCTASection";
import ServiceHeroSection from "../Components/ServiceHeroSection";
import ServicesTabSection from "../Components/ServicesTabSection";
import ServicesWhatWeOfferSection from "../Components/ServicesWhatWeOfferSection";

export const metadata = {
  title: "Industrial Automation Services",

  description:
    "PLC Programming, SCADA Development, HMI Design, Electrical Automation, Commissioning Services.",

  alternates: {
    canonical: "/services",
  },
};

export default function services() {
  return (
  <>
  <ServiceHeroSection />
  <ServicesTabSection />
  <ServicesWhatWeOfferSection />
  <ServiceCTASection />
  </>
  
  );
}