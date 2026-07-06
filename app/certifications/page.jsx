import CertificateCTASection from "../Components/CertificateCTASection";
import CertificationHeroSection from "../Components/CertificationHeroSection";
import CertificationSection from "../Components/CertificationSection";
import SafetyQualitySection from "../Components/SafetyQualitySection";


export const metadata = {
  title: "Industrial Automation Services",

  description:
    "PLC Programming, SCADA Development, HMI Design, Electrical Automation, Commissioning Services.",

  alternates: {
    canonical: "/services",
  },
};

export default function certifications() {
  return (
  <>
   <CertificationHeroSection />
   <CertificationSection />
   <SafetyQualitySection />
   <CertificateCTASection />
  </>
  
  );
}