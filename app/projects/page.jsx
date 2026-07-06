import CertificateCTASection from "../Components/CertificateCTASection";
import ProjectCTASection from "../Components/ProjectCTASection";
import ProjectHeroSection from "../Components/ProjectHeroSection";
import ProjectsFilterSection from "../Components/ProjectsFilterSection";

export const metadata = {
  title: "Industrial Automation Services",

  description:
    "PLC Programming, SCADA Development, HMI Design, Electrical Automation, Commissioning Services.",

  alternates: {
    canonical: "/services",
  },
};

export default function projects() {
  return (
  <>
  <ProjectHeroSection />
  <ProjectsFilterSection />
  <ProjectCTASection />
  <CertificateCTASection />
  </>
  
  );
}