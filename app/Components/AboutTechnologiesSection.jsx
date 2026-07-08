"use client";

import Image from "next/image";
import {
  ClipboardList,
  Users,
  PenTool,
  Code2,
  Settings,
  CheckSquare,
  UserCog,
  ArrowRight,
  Factory,
} from "lucide-react";

// ---------------------------------------------
// Section content — edit this JSON block to change
// the technologies, process steps, industries, or
// images without touching the markup below.
// ---------------------------------------------
const technologiesData = {
  heading: { normal: "Automation Technologies ", highlight: "We Work With" },
  technologies: [
    {
      title: "PLC Programming",
      image: "/tech/plc.jpg",
      items: ["Siemens", "Delta", "Mitsubishi", "Allen Bradley"],
    },
    {
      title: "SCADA",
      image: "/tech/scada.jpg",
      items: ["WinCC", "Wonderware", "Ignition"],
    },
    {
      title: "HMI",
      image: "/tech/hmi.jpg",
      items: ["Weintek", "Delta", "Siemens"],
    },
    {
      title: "Drives",
      image: "/tech/drives.jpg",
      items: ["Delta", "ABB", "Yaskawa", "Schneider"],
    },
    {
      title: "Control Panels",
      image: "/tech/control-panels.jpg",
      items: ["PCC", "MCC", "VFD", "APFC", "PLC Panels"],
    },
    {
      title: "Industrial Electrical",
      image: "/tech/industrial-electrical.jpg",
      items: [
        "Electrical Installation",
        "Wiring & Cabling",
        "Earthing Systems",
        "Power Distribution",
      ],
    },
  ],
};

const processData = {
  heading: { normal: "Our ", highlight: "Working Process" },
  steps: [
    { icon: "requirement", title: "Requirement Analysis" },
    { icon: "inspection", title: "Site Inspection" },
    { icon: "design", title: "Solution Design" },
    { icon: "development", title: "Development" },
    { icon: "installation", title: "Installation" },
    { icon: "testing", title: "Testing" },
    { icon: "support", title: "Support & Maintenance" },
  ],
};

const industriesData = {
  heading: { normal: "Industries ", highlight: "We Serve" },
  industries: [
    { title: "Food Industry", image: "/industries/food.jpg" },
    { title: "Water Treatment", image: "/industries/water-treatment.jpg" },
    { title: "Chemical Plants", image: "/industries/chemical.jpg" },
    { title: "Textile Industry", image: "/industries/textile.jpg" },
    { title: "Pharmaceutical", image: "/industries/pharma.jpg" },
    { title: "Packaging", image: "/industries/packaging.jpg" },
    { title: "Steel Industry", image: "/industries/steel.jpg" },
    { title: "Power Plants", image: "/industries/power-plants.jpg" },
    { title: "Manufacturing", image: "/industries/manufacturing.jpg" },
    { title: "Automobile", image: "/industries/automobile.jpg" },
    { title: "Commercial Buildings", image: "/industries/commercial.jpg" },
    { title: "Infrastructure", image: "/industries/infrastructure.jpg" },
  ],
};

const processIconMap = {
  requirement: ClipboardList,
  inspection: Users,
  design: PenTool,
  development: Code2,
  installation: Settings,
  testing: CheckSquare,
  support: UserCog,
};

export default function AboutTechnologiesSection() {
  return (
    <section className="w-full bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12 space-y-16 lg:space-y-20">
        {/* ============ TECHNOLOGIES ============ */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            {technologiesData.heading.normal}
            <span className="text-red-500">
              {technologiesData.heading.highlight}
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {technologiesData.technologies.map((tech, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative w-20 h-16 mb-4">
                  <Image
                    src={tech.image}
                    alt={tech.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">
                  {tech.title}
                </h3>
                <ul className="text-xs text-slate-500 space-y-1 text-left w-full">
                  {tech.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-1.5 text-[14px]">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ============ WORKING PROCESS ============ */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
            {processData.heading.normal}
            <span className="text-red-500">{processData.heading.highlight}</span>
          </h2>

          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8 md:gap-y-8 md:gap-x-0">
            {processData.steps.map((step, i) => {
              const Icon = processIconMap[step.icon];
              const isLast = i === processData.steps.length - 1;
              return (
                <div key={i} className="flex items-start">
                  <div className="relative w-[140px] sm:w-[150px]">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="rounded-xl border border-slate-200 pt-6 pb-4 px-3 flex flex-col items-center text-center h-full">
                      <Icon className="w-6 h-6 text-slate-800 mb-2" />
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="hidden sm:flex items-center justify-center w-8 mt-10">
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ INDUSTRIES WE SERVE ============ */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            {industriesData.heading.normal}
            <span className="text-red-500">
              {industriesData.heading.highlight}
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {industriesData.industries.map((ind, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-xl overflow-hidden group"
              >
                <Image
                  src={ind.image}
                  alt={ind.title}
                  fill
                  sizes="(max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-red-600 shrink-0">
                    <Factory className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="text-white text-xs font-semibold drop-shadow">
                    {ind.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}