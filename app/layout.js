import { Manrope } from "next/font/google";
import "./globals.css";
import SiteChrome from "./Components/SiteChrome";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://aone-india.com"),

  title: {
    default: "Industrial Automation Company in Pithampur | A-ONE Automation Solutions",
    template: "%s | A-ONE Automation Solutions",
  },

  description:
    "Industrial Automation Company providing PLC Programming, SCADA, HMI, Electrical Panel Design and Commissioning Services.",

  keywords: [
  "Industrial Automation Company in Pithampur",
  "Industrial Automation Pithampur",
  "PLC Programming Pithampur",
  "SCADA Development Pithampur",
  "HMI Programming Pithampur",
  "Automation Company Pithampur",
  "Electrical Control Panel Pithampur",
  "Industrial Automation Indore",
  ],

  authors: [{ name: "A-One Automation" }],
  creator: "A-One Automation",
  publisher: "A-One Automation",

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "A-One Automation",
    description:
      "Industrial Automation Solutions for Manufacturing Industries.",
    url: "https://yourdomain.com",
    siteName: "A-One Automation",
    locale: "en_US",
    type: "website",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "A-One Automation",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "A-One Automation",
    description:
      "Industrial Automation Solutions for Manufacturing Industries.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}