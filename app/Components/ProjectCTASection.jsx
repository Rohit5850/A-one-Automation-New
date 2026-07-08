"use client";

import { ArrowRight } from "lucide-react";

const projectCTAData = {
  title: {
    normal: "Want to See Your",
    highlight: " Project Here?",
  },

  description:
    "Join our list of satisfied clients. Contact us for your next electrical or automation project.",

  button: {
    text: "Start Your Project",
    link: "/contact",
  },
};

export default function ProjectCTASection() {
  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        <div className="relative overflow-hidden rounded-[32px] bg-[#162238] px-8 py-10 lg:px-20">

          {/* Background Grid */}

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

          {/* Left Glow */}

          <div className="absolute -left-28 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-red-500/20 blur-[130px]" />

          {/* Right Glow */}

          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-red-600/20 blur-[140px]" />

          <div className="relative mx-auto max-w-4xl text-center">

            {/* Heading */}

            <h2 className="text-[32px] font-bold leading-tight text-white">

              {projectCTAData.title.normal}

              <span className="text-[#ef233c]">
                {projectCTAData.title.highlight}
              </span>

            </h2>

            {/* Description */}

            <p className="mx-auto mt-2 max-w-3xl text-[18px] leading-9 text-slate-300">
              {projectCTAData.description}
            </p>

            {/* Button */}

            <div className="mt-12">

              <a
                href={projectCTAData.button.link}
                className="group inline-flex items-center gap-3 rounded-xl bg-[#ef233c] px-10 py-5 text-lg font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/30"
              >
                {projectCTAData.button.text}

                <ArrowRight
                  size={22}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />

              </a>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}