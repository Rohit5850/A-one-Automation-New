"use client";

import {
  BadgeCheck,
  Clock3,
  Headphones,
  ShieldCheck,
} from "lucide-react";

const offerData = {
  title: {
    normal: "What We",
    highlight: " Offer",
  },

  subtitle:
    "Complete electrical solutions with professional service",

  cards: [
    {
      id: 1,
      title: "Quality Components",
      description: "Genuine parts from trusted brands",

      icon: BadgeCheck,

      bg: "bg-blue-100",
      color: "text-blue-600",
    },

    {
      id: 2,
      title: "Quick Turnaround",
      description: "Fast installation and repair services",

      icon: Clock3,

      bg: "bg-green-100",
      color: "text-green-600",
    },

    {
      id: 3,
      title: "Expert Support",
      description: "24/7 technical assistance available",

      icon: Headphones,

      bg: "bg-orange-100",
      color: "text-orange-600",
    },

    {
      id: 4,
      title: "Safety Certified",
      description: "All work meets safety standards",

      icon: ShieldCheck,

      bg: "bg-purple-100",
      color: "text-purple-600",
    },
  ],
};

export default function ServicesWhatWeOfferSection() {
  return (
    <section className="w-full bg-white py-24">
      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">
        {/* Heading */}

        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-[32px] font-bold text-[#162238] ">
            {offerData.title.normal}

            <span className="text-[#ef233c]">
              {offerData.title.highlight}
            </span>
          </h2>

          <p className="mt-5 text-[18px] text-slate-600">
            {offerData.subtitle}
          </p>
        </div>

        {/* Cards */}

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {offerData.cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className="group rounded-2xl border border-slate-200 bg-[#f8fafc] p-5 text-center transition-all duration-500 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl"
              >
                {/* Icon */}

                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${card.bg} transition duration-300 group-hover:scale-110`}
                >
                  <Icon
                    className={card.color}
                    size={36}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}

                <h3 className="mt-8 text-[21px] font-bold text-[#162238] transition duration-300 group-hover:text-[#ef233c]">
                  {card.title}
                </h3>

                {/* Description */}

                <p className="mt-4 leading-8 text-[18px] text-slate-600">
                  {card.description}
                </p>

                {/* Bottom Accent */}

                <div className="mx-auto mt-8 h-1 w-0 rounded-full bg-[#ef233c] transition-all duration-500 group-hover:w-20"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}