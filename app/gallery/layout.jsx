export const metadata = {
  title: "Industrial Automation Project Gallery | A-One Automation Solutions",
  description:
    "Explore our industrial automation projects including PLC panels, HMI & SCADA systems, control panels, VFD panels, installation and commissioning work.",

  keywords: [
    "industrial automation",
    "PLC panel",
    "control panel",
    "HMI SCADA",
    "VFD panel",
    "automation projects",
    "industrial automation India",
    "A-One Automation Solutions",
  ],

  openGraph: {
    title: "Industrial Automation Project Gallery",
    description:
      "Explore our latest PLC, HMI, SCADA, control panel and industrial automation projects.",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function GalleryLayout({ children }) {
  return children;
}