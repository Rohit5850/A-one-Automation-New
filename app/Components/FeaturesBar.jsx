"use client";

import { Headphones, Zap, ShieldCheck, IndianRupee } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Content — edit this JSON block to change the features               */
/* ------------------------------------------------------------------ */
const FEATURES_DATA = {
  items: [
    {
      id: "support",
      icon: "Headphones",
      title: "24/7 Support",
      description: "Round the clock technical support for your operations",
    },
    {
      id: "response",
      icon: "Zap",
      title: "Quick Response",
      description: "We respond quickly to all inquiries and service calls",
    },
    {
      id: "engineers",
      icon: "ShieldCheck",
      title: "Expert Engineers",
      description:
        "Certified engineers with years of industry experience",
    },
    {
      id: "pricing",
      icon: "IndianRupee",
      title: "Competitive Pricing",
      description: "Best quality services at competitive prices",
    },
  ],
};
/* ------------------------------------------------------------------ */

const ICONS = { Headphones, Zap, ShieldCheck, IndianRupee };

export default function FeaturesBar() {
  return (
    <section className="w-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-[1500px] rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {FEATURES_DATA.items.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.id} className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <Icon className="h-6 w-6 text-red-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[21px]">{item.title}</h3>
                  <p className="mt-1 text-[16px] leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom accent line */}
        <div className="absolute inset-x-6 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent sm:inset-x-8" />
      </div>
    </section>
  );
}