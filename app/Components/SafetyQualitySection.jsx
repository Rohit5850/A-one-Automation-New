"use client";

import {
  ShieldCheck,
  BadgeCheck,
  FileText,
  CheckCircle2,
} from "lucide-react";

const safetyData = {
  title: {
    normal: "Safety & Quality",
    highlight: " Standards",
  },

  subtitle:
    "All our work complies with industrial safety regulations and quality standards.",

  items: [
    {
      id: 1,
      title: "Safety First",
      description:
        "All installations meet industrial safety standards.",

      icon: ShieldCheck,

      color: "green",
    },

    {
      id: 2,
      title: "Quality Assured",
      description:
        "Premium components and workmanship guarantee.",

      icon: BadgeCheck,

      color: "blue",
    },

    {
      id: 3,
      title: "Documentation",
      description:
        "Complete project documentation and certifications.",

      icon: FileText,

      color: "orange",
    },

    {
      id: 4,
      title: "Compliance",
      description:
        "Adherent to all electrical codes and regulations.",

      icon: CheckCircle2,

      color: "purple",
    },
  ],
};

const colorClasses = {
  green: {
    bg: "bg-green-100",
    icon: "text-green-600",
  },

  blue: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
  },

  orange: {
    bg: "bg-orange-100",
    icon: "text-orange-600",
  },

  purple: {
    bg: "bg-purple-100",
    icon: "text-purple-600",
  },
};

export default function SafetyQualitySection() {
  return (
    <section className="bg-white py-24">

      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        {/* Heading */}

        <div className="mb-20 text-center">

          <h2 className="text-4xl font-bold text-[#162238] lg:text-5xl">

            {safetyData.title.normal}

            <span className="text-[#ef233c]">
              {safetyData.title.highlight}
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {safetyData.subtitle}
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">

          {safetyData.items.map((item) => {

            const Icon = item.icon;

            const color = colorClasses[item.color];

            return (

              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl"
              >

                {/* Icon */}

                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${color.bg} transition duration-300 group-hover:scale-110`}
                >
                  <Icon
                    size={36}
                    className={color.icon}
                  />
                </div>

                {/* Title */}

                <h3 className="mt-8 text-3xl font-bold text-[#162238]">
                  {item.title}
                </h3>

                {/* Divider */}

                <div className="mx-auto my-5 h-1 w-16 rounded-full bg-[#ef233c]" />

                {/* Description */}

                <p className="leading-8 text-slate-600">
                  {item.description}
                </p>

              </div>

            );
          })}

        </div>

      </div>

    </section>
  );
}