import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import styles from "../HeroSection.module.css";

/**
 * Hero Section — Perfect Electrical Solutions
 *
 * Layout/typography: Tailwind CSS
 * Animated background (drifting grid, flowing current lines, pulsing nodes,
 * floating particles, sparks, expanding pulse rings): CSS Module
 * (`HeroSection.module.css`) — no styled-jsx, no runtime dependency, works
 * in any Next.js setup (App Router or Pages Router) out of the box.
 *
 * Files needed side by side:
 *   components/HeroSection.tsx
 *   components/HeroSection.module.css
 *
 * Usage in app/page.tsx:
 *   import HeroSection from "@/components/HeroSection";
 *   export default function Home() {
 *     return <HeroSection />;
 *   }
 *
 * Requires: `npm install lucide-react`
 */

const quickLinks = [
  { label: "Control Panels", href: "/services" },
  { label: "PLC Programming", href: "/services" },
  { label: "VFD Solutions", href: "/services" },
  { label: "HMI Systems", href: "/services" },
  { label: "View Projects", href: "/projects" },
];

const particles = [
  { left: "5%", top: "20%", delay: "0s", duration: "6s" },
  { left: "12%", top: "38%", delay: "0.5s", duration: "8s" },
  { left: "19%", top: "56%", delay: "1s", duration: "10s" },
  { left: "26%", top: "74%", delay: "1.5s", duration: "6s" },
  { left: "33%", top: "20%", delay: "2s", duration: "8s" },
  { left: "40%", top: "38%", delay: "2.5s", duration: "10s" },
  { left: "47%", top: "56%", delay: "3s", duration: "6s" },
  { left: "54%", top: "74%", delay: "3.5s", duration: "8s" },
  { left: "61%", top: "20%", delay: "4s", duration: "10s" },
  { left: "68%", top: "38%", delay: "4.5s", duration: "6s" },
  { left: "75%", top: "56%", delay: "5s", duration: "8s" },
  { left: "82%", top: "74%", delay: "5.5s", duration: "10s" },
  { left: "89%", top: "20%", delay: "6s", duration: "6s" },
  { left: "96%", top: "38%", delay: "6.5s", duration: "8s" },
];

const sparks = [
  { left: "10%", top: "25%", delay: "0s" },
  { left: "21%", top: "50%", delay: "0.7s" },
  { left: "32%", top: "75%", delay: "1.4s" },
  { left: "43%", top: "25%", delay: "2.1s" },
  { left: "54%", top: "50%", delay: "2.8s" },
  { left: "65%", top: "75%", delay: "3.5s" },
  { left: "76%", top: "25%", delay: "4.2s" },
  { left: "87%", top: "50%", delay: "4.9s" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ---------------- Animated electric-current background ---------------- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        {/* drifting grid */}
        <div className={styles.gridAnimated} />

        {/* current lines + nodes */}
        <svg className={styles.electricSvg}>
          <defs>
            <linearGradient id="electricPulse" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59,130,246,0)" />
              <stop offset="20%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="40%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="50%" stopColor="rgba(96,165,250,1)" />
              <stop offset="60%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="80%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <line className={styles.electricLine} x1="0%" y1="15%" x2="100%" y2="15%" />
          <line className={styles.electricLine} x1="0%" y1="35%" x2="100%" y2="35%" style={{ animationDelay: "-1s" }} />
          <line className={styles.electricLine} x1="0%" y1="55%" x2="100%" y2="55%" style={{ animationDelay: "-2s" }} />
          <line className={styles.electricLine} x1="0%" y1="75%" x2="100%" y2="75%" style={{ animationDelay: "-3s" }} />
          <line className={styles.electricLine} x1="0%" y1="85%" x2="100%" y2="85%" style={{ animationDelay: "-4s" }} />

          <line className={styles.electricLine} x1="0%" y1="20%" x2="100%" y2="80%" style={{ animationDelay: "-2s" }} />
          <line className={styles.electricLine} x1="0%" y1="80%" x2="100%" y2="20%" style={{ animationDelay: "-4s" }} />

          <line className={styles.electricLine} x1="15%" y1="15%" x2="15%" y2="85%" />
          <line className={styles.electricLine} x1="50%" y1="10%" x2="50%" y2="90%" style={{ animationDelay: "-1s" }} />
          <line className={styles.electricLine} x1="85%" y1="15%" x2="85%" y2="85%" style={{ animationDelay: "-3s" }} />

          <circle className={styles.powerNode} cx="15%" cy="15%" r="4" />
          <circle className={styles.powerNode} cx="85%" cy="35%" r="4" style={{ animationDelay: "0.4s" }} />
          <circle className={styles.powerNode} cx="30%" cy="55%" r="4" style={{ animationDelay: "0.8s" }} />
          <circle className={styles.powerNode} cx="70%" cy="75%" r="4" style={{ animationDelay: "1.2s" }} />
          <circle className={styles.powerNode} cx="50%" cy="85%" r="4" style={{ animationDelay: "1.6s" }} />
        </svg>

        {/* floating particles */}
        <div className={styles.particlesContainer}>
          {particles.map((p, i) => (
            <div
              key={i}
              className={styles.particle}
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        {/* pulse rings */}
        <div className={styles.pulseWave} />
        <div className={styles.pulseWave} style={{ animationDelay: "2s" }} />
        <div className={styles.pulseWave} style={{ animationDelay: "4s" }} />

        {/* sparks */}
        <div className={styles.sparksContainer}>
          {sparks.map((s, i) => (
            <div
              key={i}
              className={styles.spark}
              style={{ left: s.left, top: s.top, animationDelay: s.delay }}
            />
          ))}
        </div>
      </div>

      {/* ---------------------------- Foreground content ---------------------------- */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left column */}
          <div className={`${styles.fadeInUp} space-y-6`}>
            <div className="inline-block">
              <span className="rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
                Trusted Industrial Automation Partner
              </span>
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Smart Industrial
              <br />
              <span className="text-blue-400">Automation Solutions</span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
              A-One Automation Solutions specializes in PLC Programming, SCADA Development, HMI Design, VFD Commissioning, Control Panel Manufacturing, and Industrial Electrical Solutions. We help industries improve productivity, efficiency, and process reliability through advanced automation technologies.
            </p>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <a
                href="tel:+91-7489174850"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              >
                <Phone size={20} />
                Call Now
              </a>

              <a
                href="https://wa.me/917489174850"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
              >
                <MessageCircle size={20} />
                WhatsApp
              </a>

              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Get Quote
                <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Right column — image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Professional Electrical Engineers at Work"
                className="h-[400px] w-full object-cover lg:h-[500px]"
                src="https://customer-assets.emergentagent.com/job_power-pro-india/artifacts/mznr8hoc_20250506-electris-hero.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
            </div>
          </div>
        </div>

        {/* Bottom quick-links bar */}
        <div className="mt-16 border-t border-slate-700 pt-8">
          <p className="mb-4 text-center text-sm text-slate-400">
            Looking for specific solutions?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}