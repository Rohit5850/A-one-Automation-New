import Image from "next/image";
import Link from "next/link";
import logo from '@/public/images/logo.png'

import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  const quickLinks = [
    "Home",
    "About Us",
    "Our Services",
    "Projects",
    "Certifications",
    "Contact Us",
  ];

  const services = [
    "Control Panel Manufacturing",
    "PLC Programming & Automation",
    "VFD & Drive Services",
    "HMI Solutions",
    "PLC & VFD Repair",
    "Electrical AMC Services",
  ];

  const socials = [
    {
      title: "IndiaMART",
      link: "#",
    },
    {
      title: "Google Business",
      link: "#",
    },
  ];

  return (
    <footer className="bg-secondary text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-20 pb-10">

        <div className="grid gap-14 md:grid-cols-2 xl:grid-cols-4">

          {/* Company */}

          <div>

            <Image
              src={logo}
              alt="Perfect Electrical Solutions"
              width={70}
              height={70}
              className="rounded-lg bg-white p-2"
            />

            <h3 className="mt-7 text-[21px] font-bold">
              A-One Automation Solution
            </h3>

            <p className="mt-5 text-[16px] leading-8 text-gray-300">
              Expert Industrial Automation &
              Electrical Control Solutions.
            </p>

            <div className="mt-8 flex items-start gap-3">

              <MapPin
                className="mt-1 text-primary"
                size={22}
              />

              <p className="text-gray-300 leading-8 text-[16px]">
                Sanskar Valley,
                Sector No. 1,
                Pithampur,
                Dhar,
                Madhya Pradesh - 454775
              </p>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="mb-8 text-[21px] font-bold">
              Quick Links
            </h3>

            <div className="space-y-5">

              {quickLinks.map((item, index) => (

                <Link
                  key={index}
                  href="#"
                  className="block text-[16px] text-gray-300 transition hover:text-primary"
                >
                  {item}
                </Link>

              ))}

            </div>

          </div>

          {/* Services */}

          <div>

            <h3 className="mb-8 text-[21px] font-bold">
              Our Services
            </h3>

            <div className="space-y-5">

              {services.map((item, index) => (

                <Link
                  key={index}
                  href="#"
                  className="block text-[16px] text-gray-300 transition hover:text-primary"
                >
                  {item}
                </Link>

              ))}

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="mb-8 text-[21px] font-bold">
              Get In Touch
            </h3>

            <div className="space-y-6">

              <div className="flex items-center gap-4">

                <Phone
                  size={22}
                  className="text-primary"
                />

                <a
                  href="tel:+917489174850"
                  className="text-[16px] text-gray-300 hover:text-primary"
                >
                  +91-7489174850
                </a>

              </div>

              <div className="flex items-center gap-4">

                <Mail
                  size={22}
                  className="text-primary"
                />

                <a
                  href="mailto:aoneautomation.92@gmail.com"
                  className="text-[16px] text-gray-300 hover:text-primary"
                >
                  aoneautomation.92@gmail.com
                </a>

              </div>

            </div>

            <h4 className="mt-10 mb-6 text-[21px] font-bold">
              Find Us Online
            </h4>

            <div className="space-y-5">

              {socials.map((item, index) => (

                <Link
                  key={index}
                  href={item.link}
                  className="flex items-center gap-3 text-[16px] text-gray-300 transition hover:text-primary"
                >
                  <ExternalLink size={18} />
                  {item.title}
                </Link>

              ))}

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-16 border-t border-white/10 pt-8">

          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">

            <p className="text-gray-400 text-[14px]">
              © 2026 Perfect Electrical Solutions.
              All Rights Reserved.
            </p>

            <p className="text-gray-400 text-[14px]">
              GST : 23DTVPK2579B1ZG
            </p>

          </div>

        </div>

      </div>
    </footer>
  );
}