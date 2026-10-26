// PlcTesterButton.jsx
// Floating "PLC Tester" button — bottom-right, Tailwind CSS.
// Aapki website (Next.js) par kahin bhi render karo. Click -> app khulti hai.

export default function PlcTesterButton() {
  return (
    <a
      href="https://plc-tester-pwa.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open PLC Tester"
      className="
        fixed bottom-8 right-8 z-50
        inline-flex items-center gap-2
        rounded-full bg-blue-600 px-5 py-3
        text-sm font-semibold text-white
        shadow-lg shadow-blue-600/40
        transition hover:bg-blue-700 active:translate-y-px
      "
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
      PLC Tester
    </a>
  );
}
