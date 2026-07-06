"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const sectionData = {
  title: {
    normal: "Committed to",
    highlight: " Quality & Safety",
  },

  description: [
    "Every automation solution is designed, tested and installed following strict quality standards.",
    "We use genuine components from trusted manufacturers and follow industry best practices to ensure long-term reliability, safety and performance.",
  ],

  image: "/images/about/quality.jpg",

  checklist: [
    "Genuine Components",
    "Industrial Standards",
    "Safety Compliance",
    "Professional Installation",
    "Comprehensive Testing",
    "Documentation",
  ],

  brandsTitle: {
    normal: "Brands",
    highlight: " We Work With",
  },

  brands: [
    {
      name: "Siemens",
      logo: "/images/brands/siemens.png",
    },
    {
      name: "Delta",
      logo: "/images/brands/delta.png",
    },
    {
      name: "ABB",
      logo: "/images/brands/abb.png",
    },
    {
      name: "Schneider",
      logo: "/images/brands/schneider.png",
    },
    {
      name: "Mitsubishi",
      logo: "/images/brands/mitsubishi.png",
    },
    {
      name: "Weintek",
      logo: "/images/brands/weintek.png",
    },
    {
      name: "LS Electric",
      logo: "/images/brands/ls.png",
    },
    {
      name: "Allen Bradley",
      logo: "/images/brands/allen-bradley.png",
    },
    {
      name: "Fuji Electric",
      logo: "/images/brands/fuji.png",
    },
    {
      name: "Yaskawa",
      logo: "/images/brands/yaskawa.png",
    },
  ],
};

export default function AboutQualitySection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1500px] mx-auto px-5 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left */}

          <div>

            <h2 className="text-4xl font-bold text-slate-900">

              {sectionData.title.normal}

              <span className="text-red-500">
                {sectionData.title.highlight}
              </span>

            </h2>

            <div className="mt-8 space-y-6 text-slate-600 leading-8">

              {sectionData.description.map((item, index) => (
                <p key={index}>{item}</p>
              ))}

            </div>

            <div className="mt-10 grid grid-cols-[220px_1fr] gap-6">

              {/* Image */}

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg">

                <Image
                  src={sectionData.image}
                  alt="Quality"
                  width={220}
                  height={300}
                  className="h-full w-full object-cover"
                />

              </div>

              {/* Checklist */}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="space-y-5">

                  {sectionData.checklist.map((item, index) => (

                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >

                      <CheckCircle2
                        size={20}
                        className="text-red-500 shrink-0"
                      />

                      <span className="font-medium text-slate-700">
                        {item}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div>

            <h2 className="text-4xl font-bold text-slate-900">

              {sectionData.brandsTitle.normal}

              <span className="text-red-500">
                {sectionData.brandsTitle.highlight}
              </span>

            </h2>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">

              {sectionData.brands.map((brand) => (

                <div
                  key={brand.name}
                  className="group flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-xl"
                >

                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={120}
                    height={60}
                    className="object-contain transition duration-300 group-hover:scale-105"
                  />

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}