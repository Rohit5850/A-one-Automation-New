"use client";

import { ShieldCheck, ArrowRight } from "lucide-react";

const trustCTAData = {
  icon: ShieldCheck,

  title: {
    normal: "Your Trust,",
    highlight: " Our Priority",
  },

  description:
    "We take compliance seriously. Every project is executed with proper certifications and adherence to safety standards.",

  button: {
    text: "Work With Certified Professionals",
    link: "/contact",
  },
};

export default function CertificateCTASection() {
  const Icon = trustCTAData.icon;

  return (
    <section className="relative overflow-hidden bg-[#162238] py-24">

      {/* Grid */}

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
        }}
      />

      {/* Glow */}

      <div className="absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-red-500/20 blur-[150px]" />

      <div className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-red-600/20 blur-[160px]" />

      {/* Floating Dots */}

      <div className="absolute left-20 top-20 h-2 w-2 animate-pulse rounded-full bg-red-400" />
      <div className="absolute right-32 bottom-20 h-3 w-3 animate-pulse rounded-full bg-red-500" />
      <div className="absolute left-1/2 top-28 h-2 w-2 animate-ping rounded-full bg-red-300" />

      {/* Content */}

      <div className="relative mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          {/* Icon */}

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">

            <Icon
              size={50}
              className="text-[#ef233c]"
            />

          </div>

          {/* Heading */}

          <h2 className="mt-10 text-4xl font-bold text-white lg:text-6xl">

            {trustCTAData.title.normal}

            <span className="text-[#ef233c]">
              {trustCTAData.title.highlight}
            </span>

          </h2>

          {/* Description */}

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-300">

            {trustCTAData.description}

          </p>

          {/* Button */}

          <div className="mt-12">

            <a
              href={trustCTAData.button.link}
              className="group inline-flex items-center gap-3 rounded-xl bg-[#ef233c] px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/30"
            >
              {trustCTAData.button.text}

              <ArrowRight
                size={22}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />

            </a>

          </div>

        </div>

      </div>

    </section>
  );
}