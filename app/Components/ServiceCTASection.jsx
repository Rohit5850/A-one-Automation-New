"use client";

import { ArrowRight } from "lucide-react";

const ctaData = {
  title: {
    normal: "Need a",
    highlight: " Custom Solution?",
  },

  description:
    "Contact us for customized electrical and automation solutions tailored to your requirements.",

  button: {
    text: "Get Free Consultation",
    link: "/contact",
  },
};

export default function ServiceCTASection() {
  return (
    <section className="relative overflow-hidden bg-[#162238] py-12">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-red-500/10 blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          {/* Heading */}

          <h2 className="text-[32px] font-bold text-white">

            {ctaData.title.normal}

            <span className="text-[#ef233c]">
              {ctaData.title.highlight}
            </span>

          </h2>

          {/* Description */}

          <p className="mx-auto mt-6 max-w-3xl text-[18px] leading-8 text-slate-300">
            {ctaData.description}
          </p>

          {/* Button */}

          <div className="mt-12">

            <a
              href={ctaData.button.link}
              className="group inline-flex items-center gap-3 rounded-xl bg-[#ef233c] px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/30"
            >
              {ctaData.button.text}

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