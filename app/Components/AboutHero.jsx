"use client";

import Image from "next/image";
import { Phone, ArrowRight } from "lucide-react";

// ---------------------------------------------
// Section content — edit this JSON block to change
// the copy, links, or image without touching markup.
// ---------------------------------------------
const aboutSectionData = {
  badge: "Trusted Automation Experts",
  heading: {
    lines: ["About Us Building Smart Industrial"],
    highlight: "Automation Solutions"
  },
  description:
    "Trusted automation partner delivering PLC Programming, SCADA, HMI, VFD, Control Panel Manufacturing and Industrial Electrical Solutions across India.",
  buttons: [
    {
      label: "Contact Us",
      href: "#contact",
      icon: "phone",
      variant: "primary"
    },
    {
      label: "Our Services",
      href: "#services",
      icon: "arrow",
      variant: "outline"
    }
  ],
  image: {
    src: "/control-panel-engineers.jpg",
    alt: "Industrial automation engineers working on a control panel"
  }
};

export default function AboutHero() {
  const { badge, heading, description, buttons, image } = aboutSectionData;

  return (
    <section className="relative w-full bg-[#050b18] overflow-hidden">
      {/* subtle background grid / stars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto max-w-[1500px] px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Text content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-blue-600/15 border border-blue-500/30 px-4 py-1.5 mb-6">
              <span className="text-blue-400 text-sm font-medium tracking-wide">
                {badge}
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-[32px]  font-bold leading-[1.15] text-white">
              {heading.lines.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
              <span className="text-blue-500">{heading.highlight}</span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-full text-slate-400 text-[18px] leading-relaxed">
              {description}
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {buttons.map((btn, i) => {
                const isPrimary = btn.variant === "primary";
                return (
                  <a
                    key={i}
                    href={btn.href}
                    className={
                      isPrimary
                        ? "group inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-300 px-6 py-3.5 text-white font-medium shadow-lg shadow-red-600/25"
                        : "group inline-flex items-center gap-2 rounded-full border border-slate-600 hover:border-slate-400 transition-colors duration-300 px-6 py-3.5 text-white font-medium"
                    }
                  >
                    {btn.icon === "phone" && <Phone className="w-4 h-4" />}
                    {btn.label}
                    {btn.icon === "arrow" && (
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Image with animated background */}
          <div className="relative flex items-center justify-center">
            {/* Animated glow blobs behind the image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[85%] h-[85%] rounded-full bg-blue-600/25 blur-3xl animate-blob-float" />
              <div className="absolute w-[60%] h-[60%] rounded-full bg-cyan-400/20 blur-3xl animate-blob-float-delayed" />
            </div>

            {/* Animated concentric rings */}
            <div className="absolute inset-0 hidden sm:flex items-center justify-center">
              <span className="absolute w-[70%] aspect-square rounded-full border border-blue-500/20 animate-ping-slow" />
              <span className="absolute w-[90%] aspect-square rounded-full border border-blue-500/10 animate-ping-slower" />
            </div>

            {/* Drifting particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {particles.map((p, i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-blue-400/70 animate-float-particle"
                  style={{
                    width: p.size,
                    height: p.size,
                    left: p.left,
                    top: p.top,
                    animationDuration: p.duration,
                    animationDelay: p.delay,
                  }}
                />
              ))}
            </div>

            {/* Image */}
            <div className="relative z-10 w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <Image
                src={image.src}
                alt={image.alt}
                width={800}
                height={533}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.08);
          }
          66% {
            transform: translate(-15px, 15px) scale(0.95);
          }
        }
        .animate-blob-float {
          animation: blob-float 9s ease-in-out infinite;
        }
        .animate-blob-float-delayed {
          animation: blob-float 11s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes ping-slow {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          80%,
          100% {
            transform: scale(1.15);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping-slow 6s cubic-bezier(0, 0, 0.2, 1) infinite;
          animation-delay: 1s;
        }

        @keyframes float-particle {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-18px) translateX(8px);
            opacity: 0.9;
          }
        }
        .animate-float-particle {
          animation-name: float-particle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-blob-float,
          .animate-blob-float-delayed,
          .animate-ping-slow,
          .animate-ping-slower,
          .animate-float-particle {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

// Static particle positions (kept outside component to avoid re-randomizing on render)
const particles = [
  { size: 6, left: "10%", top: "20%", duration: "5s", delay: "0s" },
  { size: 4, left: "80%", top: "15%", duration: "6s", delay: "0.5s" },
  { size: 5, left: "70%", top: "70%", duration: "7s", delay: "1s" },
  { size: 3, left: "20%", top: "80%", duration: "5.5s", delay: "1.5s" },
  { size: 4, left: "50%", top: "10%", duration: "6.5s", delay: "0.8s" },
  { size: 5, left: "90%", top: "50%", duration: "7.5s", delay: "0.3s" },
];