"use client";

import { Headset, PhoneCall, ArrowRight } from "lucide-react";

const ctaData = {
  title: "Ready to Automate Your Industry?",

  description:
    "Let's build reliable automation solutions that increase productivity and reduce downtime.",

  phone: "+91-7489174850",

  buttons: [
    {
      title: "Call: +91-7489174850",
      href: "tel:+917489174850",
      icon: "phone",
      variant: "light",
    },
    {
      title: "Send Inquiry",
      href: "/contact",
      icon: "arrow",
      variant: "outline",
    },
  ],
};

export default function AboutCTASection() {
  return (
    <section className="w-full bg-[#ff1b2d] py-12 relative overflow-hidden">

      {/* Background Blur */}

      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-white/10 blur-[120px]" />

      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-red-400/20 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">

          {/* Left */}

          <div className="flex items-start md:items-center gap-6 flex-col md:flex-row">

            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">

              <Headset
                size={52}
                className="text-white"
                strokeWidth={1.8}
              />

            </div>

            <div>

              <h2 className="text-[28px] font-bold text-white">
                {ctaData.title}
              </h2>

              <p className="mt-3 max-w-2xl text-[16px] text-red-100">
                {ctaData.description}
              </p>

            </div>

          </div>

          {/* Right */}

          <div className="flex flex-wrap items-center gap-5">

            {ctaData.buttons.map((button) => (

              <a
                key={button.title}
                href={button.href}
                className={`group inline-flex items-center gap-3 rounded-xl px-8 py-4 font-semibold transition-all duration-300
                  
                  ${
                    button.variant === "light"
                      ? "bg-white text-red-600 hover:-translate-y-1 hover:shadow-2xl"
                      : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-red-600 hover:-translate-y-1"
                  }

                `}
              >

                {button.icon === "phone" ? (
                  <PhoneCall size={18} />
                ) : (
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                )}

                {button.title}

              </a>

            ))}

          </div>

        </div>

      </div>
    </section>
  );
}