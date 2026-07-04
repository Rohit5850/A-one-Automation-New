"use client";

import { Phone } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Content — edit this JSON block to change the banner                */
/* ------------------------------------------------------------------ */
const CTA_DATA = {
  heading: "Need Immediate Assistance?",
  subheading: "Call us now for emergency support and quick solutions",
  phoneDisplay: "+91-7489174850",
  phoneHref: "tel:+917489174850",
};
/* ------------------------------------------------------------------ */

export default function CallCta() {
  return (
    <section className="w-full bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center gap-6 rounded-2xl bg-red-600 p-6 sm:flex-row sm:justify-between sm:p-8">
        {/* Left: icon + text */}
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white">
            <Phone className="h-6 w-6 text-red-600" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {CTA_DATA.heading}
            </h3>
            <p className="mt-1 text-sm text-red-100">{CTA_DATA.subheading}</p>
          </div>
        </div>

        {/* Right: call button */}
        <a
          href={CTA_DATA.phoneHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 sm:w-auto"
        >
          <Phone className="h-4 w-4" strokeWidth={2.5} />
          {CTA_DATA.phoneDisplay}
        </a>
      </div>
    </section>
  );
}