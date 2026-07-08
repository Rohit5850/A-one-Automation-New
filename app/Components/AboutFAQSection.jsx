"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqData = {
  title: {
    normal: "Frequently Asked",
    highlight: " Questions",
  },

  faqs: [
    {
      question: "Do you provide PLC programming services?",
      answer:
        "Yes. We provide complete PLC programming services for Siemens, Delta, Mitsubishi, Allen Bradley, Schneider and other industrial automation platforms.",
    },
    {
      question: "Do you install and commission VFDs?",
      answer:
        "Yes. We supply, install, configure and commission VFDs for industrial motors along with testing and troubleshooting support.",
    },
    {
      question: "Do you manufacture control panels?",
      answer:
        "Yes. We design and manufacture PCC, MCC, APFC, PLC, VFD and custom industrial control panels based on client requirements.",
    },
    {
      question: "Do you provide AMC and maintenance?",
      answer:
        "Yes. We provide Annual Maintenance Contracts (AMC) including preventive maintenance, breakdown support and periodic inspections.",
    },
    {
      question: "Do you provide on-site installation?",
      answer:
        "Yes. Our engineers provide complete on-site installation, wiring, commissioning and testing across industrial projects.",
    },
    {
      question: "Can you upgrade existing automation systems?",
      answer:
        "Absolutely. We upgrade old PLCs, HMIs, SCADA systems and electrical panels with modern automation solutions while minimizing downtime.",
    },
  ],
};

export default function AboutFAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full bg-white py-24 pt-0">
      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">
        {/* Heading */}

        <div className="text-center mb-16">
          <h2 className="text-[32px] font-bold text-slate-900">
            {faqData.title.normal}
            <span className="text-red-500">
              {faqData.title.highlight}
            </span>
          </h2>
        </div>

        {/* FAQ Grid */}

        <div className="grid gap-6 lg:grid-cols-2">
          {faqData.faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <h3 className="pr-6 text-lg font-semibold text-slate-800">
                    {faq.question}
                  </h3>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                    {isOpen ? (
                      <Minus
                        size={20}
                        className="text-red-500"
                      />
                    ) : (
                      <Plus
                        size={20}
                        className="text-slate-700"
                      />
                    )}
                  </div>
                </button>

                <div
                  className={`grid transition-all duration-500 ${
                    isOpen
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-slate-600 leading-8">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}