"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Award,
  Clock,
  ClipboardCheck,
  Cpu,
  Tag,
  Wrench,
  Zap,
} from "lucide-react";

// ---------------------------------------------
// Section content — edit this JSON block to change
// the heading, feature list, or image without
// touching the markup below.
// ---------------------------------------------
const trustSectionData = {
  heading: { normal: "Why Industries ", highlight: "Trust A-One" },
  features: [
    { icon: "certified", label: "Certified Engineers" },
    { icon: "quality", label: "Quality Workmanship" },
    { icon: "delivery", label: "On-Time Delivery" },
    { icon: "support", label: "Complete Project Support" },
    { icon: "technology", label: "Modern Automation Technology" },
    { icon: "pricing", label: "Competitive Pricing" },
    { icon: "amc", label: "AMC & Maintenance" },
    { icon: "assistance", label: "Fast Technical Assistance" },
  ],
  image: {
    src: "/engineer-tablet-panel.jpg",
    alt: "Automation engineer inspecting a control panel with a tablet",
  },
};

const iconMap = {
  certified: BadgeCheck,
  quality: Award,
  delivery: Clock,
  support: ClipboardCheck,
  technology: Cpu,
  pricing: Tag,
  amc: Wrench,
  assistance: Zap,
};

export default function AboutTrustSection() {
  const { heading, features, image } = trustSectionData;

  return (
    <section className="relative w-full bg-[#050b18] overflow-hidden">
      {/* subtle background grid / stars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto max-w-[1500px] grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center">
        {/* LEFT: Heading + feature grid */}
        <div className="px-6 sm:px-10 lg:px-12 py-10 lg:py-14">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-6">
            {heading.normal}
            <span className="text-red-500">{heading.highlight}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {features.map((f, i) => {
              const Icon = iconMap[f.icon];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3.5 transition-colors duration-300 hover:border-red-500/40 hover:bg-white/[0.04]"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-red-600 shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </span>
                  <span className="text-sm font-medium text-slate-200">
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Full-height image */}
        <div className="relative h-64 sm:h-80 lg:h-full lg:min-h-[420px]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={100}
            className="object-cover"
          />
          {/* soft edge fade into the dark background on the left, desktop only */}
          <div className="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#050b18] to-transparent" />
        </div>
      </div>
    </section>
  );
}