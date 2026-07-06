"use client";

import Link from "next/link";
import Image from "next/image";
import { HiOutlinePhone } from "react-icons/hi2";
import { FiPhoneCall, FiMail } from "react-icons/fi";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import logo from '@/public/images/logo.png'

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const pathname = usePathname();

  const menu = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Certifications", href: "/certifications" },
  { label: "Contact", href: "/Contact" },
];

useEffect(() => {
  const handleScroll = () => {
    setIsSticky(window.scrollY > 38);
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <header className="w-full mb-[82px]">

      {/* Top Bar */}
      <div className=" bg-secondary text-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-2">

          <div className="hidden gap-6 text-sm md:flex">

            <a
              href="tel:+917489174850"
              className="flex items-center gap-2 hover:text-primary duration-300"
            >
              <FiPhoneCall size={15} />
              +91-7489174850
            </a>

            <a
              href="mailto:perfectelectrical.92@gmail.com"
              className="flex items-center gap-2 hover:text-primary duration-300"
            >
              <FiMail size={15} />
              aoneautomation.92@gmail.com
            </a>

          </div>

          <p className="ml-auto text-xs">
            GST : 23DTVPK2579B1ZG
          </p>

        </div>
      </div>

      {/* Main Navbar */}

      <div className={`fixed top-0 left-0 right-0 z-[999] bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${  isSticky  ? "translate-y-0 shadow-xl"  : "translate-y-[38px] shadow-sm" }`} >

        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5">

          {/* Logo */}

          <Link href="/" className="flex items-center gap-3">

            <Image
              src={logo}
              alt="Logo"
              width={52}
              height={52}
            />

            <div>

              <h2 className="text-[24px] font-bold leading-none text-secondary">
                Automation Solutions
              </h2>

              {/* <p className="mt-1 text-sm text-gray-500">
                Industrial Automation Experts
              </p> */}

            </div>

          </Link>

          {/* Desktop Menu */}

          <nav className="hidden items-center gap-3 lg:flex">

            {menu.map((item, index) => (
              <Link
                key={item}
                href={item.href}
                className={`rounded-xl px-3 py-1 text-[16px] font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? "bg-primary text-white"
                    : "text-secondary hover:bg-primary hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

          </nav>

          {/* Button */}

          <a
            href="tel:+917489174850"
            className="hidden items-center gap-2 rounded-xl bg-primary px-7 py-4 font-semibold text-white transition-all duration-300 hover:bg-secondary xl:flex"
          >
            <HiOutlinePhone size={20} />
            Call Now
          </a>

          {/* Mobile */}

          <button
            onClick={() => setOpen(!open)}
            className="text-secondary lg:hidden"
          >
            {open ? (
              <HiOutlineX size={30} />
            ) : (
              <HiOutlineMenuAlt3 size={30} />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Menu */}

      {open && (

        <div className="border-t bg-white lg:hidden">

          <div className="space-y-2 p-5">

            {menu.map((item) => (

              <Link
                key={item}
                href="#"
                className="block rounded-lg px-4 py-3 font-medium text-secondary hover:bg-primary hover:text-white"
              >
                {item}
              </Link>

            ))}

            <a
              href="tel:+917489174850"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary py-4 font-semibold text-white"
            >
              <HiOutlinePhone />
              Call Now
            </a>

          </div>

        </div>

      )}

    </header>
  );
}