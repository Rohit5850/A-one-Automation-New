"use client";

import Image from "next/image";
import {
  UserRound,
  Settings2,
  Headset,
  Award,
  UserRound as MissionIcon,
  ShieldCheck,
  Eye,
  Plus,
} from "lucide-react";

// ---------------------------------------------
// Section content — edit this JSON block to change
// the copy, timeline, features, or image without
// touching the markup below.
// ---------------------------------------------
const whoWeAreData = {
  intro: {
    image: {
      src: "/engineer-control-panel.jpg",
      alt: "Automation engineer working on an industrial control panel",
    },
    heading: { normal: "Who ", highlight: "We Are" },
    paragraphs: [
      "A-One Automation Solution is a trusted industrial automation company specializing in designing, developing and implementing reliable automation systems for industries.",
      "We provide complete PLC Programming, SCADA Development, HMI Design, VFD Installation, Control Panel Manufacturing and Industrial Electrical Services.",
      "Our experienced engineers work closely with clients to understand their operational challenges and deliver cost-effective automation solutions that improve productivity, efficiency and safety.",
      "Whether it's a new automation project or upgrading an existing system, our goal is always to deliver high-quality engineering with dependable support.",
    ],
    features: [
      { icon: "engineers", label: "Experienced Engineers", color: "blue" },
      { icon: "automation", label: "Customized Automation", color: "green" },
      { icon: "support", label: "Complete Technical Support", color: "sky" },
      { icon: "quality", label: "Quality Components", color: "amber" },
    ],
  },
  journey: {
    heading: { normal: "Our ", highlight: "Journey" },
    milestones: [
      { year: "2018", label: "Company Founded" },
      { year: "2019", label: "First Industrial Automation Project" },
      { year: "2021", label: "Expanded PLC & SCADA Services" },
      { year: "2023", label: "Completed 250+ Projects" },
      { year: "Today", label: "Trusted Automation Partner" },
    ],
  },
  cards: [
    {
      icon: "mission",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      heading: { normal: "Our ", highlight: "Mission" },
      body: "To provide innovative, reliable and energy-efficient automation solutions that help industries increase productivity while maintaining the highest quality and safety standards.",
    },
    {
      icon: "vision",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      heading: { normal: "Our ", highlight: "Vision" },
      body: "To become one of India's most trusted industrial automation companies through innovation, technical excellence and long-term customer relationships.",
    },
    {
      icon: "values",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      heading: { normal: "Our ", highlight: "Values" },
      list: [
        "Quality First",
        "Innovation",
        "Customer Satisfaction",
        "Transparency",
        "Reliability",
        "Continuous Improvement",
      ],
    },
  ],
};

const featureIconMap = {
  engineers: UserRound,
  automation: Settings2,
  support: Headset,
  quality: Award,
};

const featureColorMap = {
  blue: { bg: "bg-blue-100", text: "text-blue-500" },
  green: { bg: "bg-green-100", text: "text-green-500" },
  sky: { bg: "bg-sky-100", text: "text-sky-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-500" },
};

const cardIconMap = {
  mission: MissionIcon,
  vision: Eye,
  values: ShieldCheck,
};

export default function AboutWhoweAre() {
  const { intro, journey, cards } = whoWeAreData;

  return (
    <section className="w-full bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1500px] px-6 lg:px-12">
        {/* TOP ROW: Who We Are + Our Journey */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* Who We Are card */}
          <div className="rounded-2xl border border-slate-200 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-6 sm:gap-8">
              {/* Image */}
              <div className="rounded-xl overflow-hidden h-56 sm:h-full">
                <Image
                  src={intro.image.src}
                  alt={intro.image.alt}
                  width={280}
                  height={320}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <div>
                <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900">
                  {intro.heading.normal}
                  <span className="text-red-500">{intro.heading.highlight}</span>
                </h2>

                <div className="mt-4 space-y-3">
                  {intro.paragraphs.map((p, i) => (
                    <p key={i} className="text-sm text-slate-500 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature badges */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {intro.features.map((f, i) => {
                const Icon = featureIconMap[f.icon];
                const color = featureColorMap[f.color];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${color.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${color.text}`} />
                    </span>
                    <span className="text-sm font-medium text-slate-700 leading-tight">
                      {f.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Our Journey card */}
          <div className="rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 mb-6">
              {journey.heading.normal}
              <span className="text-red-500">{journey.heading.highlight}</span>
            </h2>

            <ol className="relative border-l border-slate-200 ml-2">
              {journey.milestones.map((m, i) => (
                <li key={i} className="relative pl-6 pb-8 last:pb-0">
                  <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-slate-900" />
                  <p className="text-base font-bold text-slate-900">{m.year}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{m.label}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* BOTTOM ROW: Mission / Vision / Values */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = cardIconMap[card.icon];
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${card.iconBg}`}
                  >
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {card.heading.normal}
                    <span className="text-red-500">{card.heading.highlight}</span>
                  </h3>
                </div>

                {card.body && (
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {card.body}
                  </p>
                )}

                {card.list && (
                  <ul className="space-y-2">
                    {card.list.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-center gap-2 text-sm text-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}