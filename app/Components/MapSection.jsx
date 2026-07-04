"use client";

/* ------------------------------------------------------------------ */
/*  Content — edit this to change the map location / card text         */
/* ------------------------------------------------------------------ */
const MAP_DATA = {
  business: "A-One Automation Solution",
  addressLines: [
    "Sanwer Bypass, Near Indore Dewas Toll,",
    "Indore, Madhya Pradesh 453775",
  ],
  // Google Maps embed URL (no API key required for basic embed)
  embedSrc:
    "https://www.google.com/maps?q=A-One+Automation+Solution,Sanwer+Bypass,Indore+Dewas+Toll,Indore,Madhya+Pradesh+453775&output=embed",
  // "View larger map" link — opens full Google Maps in a new tab
  largerMapUrl:
    "https://www.google.com/maps/search/?api=1&query=A-One+Automation+Solution,Sanwer+Bypass,Indore+Dewas+Toll,Indore,Madhya+Pradesh+453775",
};
/* ------------------------------------------------------------------ */

export default function MapSection() {
  return (
    <section className="w-full bg-white px-4 py-12 sm:px-6 sm:py-8 lg:px-8">
      <div className="relative mx-auto w-full max-w-[1500px] overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        {/* Map embed */}
        <div className="h-[320px] w-full sm:h-[420px] lg:h-[480px]">
          <iframe
            title={`${MAP_DATA.business} location map`}
            src={MAP_DATA.embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
          />
        </div>

        {/* Overlay info card */}
        <div className="absolute left-4 top-4 max-w-xs rounded-xl bg-white p-5 shadow-lg sm:left-6 sm:top-6">
          <h3 className="text-base font-bold text-gray-900 sm:text-lg">
            {MAP_DATA.business}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {MAP_DATA.addressLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < MAP_DATA.addressLines.length - 1 && <br />}
              </span>
            ))}
          </p>
          <a
            href={MAP_DATA.largerMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View larger map
          </a>
        </div>
      </div>
    </section>
  );
}