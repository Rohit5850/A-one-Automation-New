import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
   metadataBase: new URL("https://yourdomain.com"),
   title: {
    default: "A-One Automation",
    template: "%s | A-One Automation",
  },
description: "Industrial Automation Company providing PLC Programming, SCADA, HMI, Electrical Panel Design and Commissioning Services.",
 keywords: [
    "Industrial Automation",
    "PLC Programming",
    "SCADA",
    "HMI",
    "Automation Company",
    "Electrical Panel",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
