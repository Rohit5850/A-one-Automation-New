"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------
// Section content — edit this JSON block to change
// the stats without touching the markup below.
// `value` is the number to count up to, `suffix` is
// appended after counting (e.g. "+", "%"). For stats
// that aren't numeric counters (like "24/7"), set
// `static` to the exact string to display as-is.
// ---------------------------------------------
const statsData = {
  stats: [
    { value: 350, suffix: "+", label: "Projects Completed" },
    { value: 150, suffix: "+", label: "Happy Clients" },
    { value: 8, suffix: "+", label: "Years Experience" },
    { static: "24/7", label: "Technical Support" },
    { value: 98, suffix: "%", label: "Client Satisfaction" },
    { value: 50, suffix: "+", label: "Industrial Partners" },
  ],
};

function useCountUp(target, shouldStart, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    let start = null;
    let frameId;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [shouldStart, target, duration]);

  return value;
}

function StatItem({ stat, isLast, shouldStart }) {
  const count = useCountUp(stat.static ? 0 : stat.value, shouldStart);

  return (
    <div
      className={`relative flex-1 min-w-[140px] text-center px-6 py-8 ${
        !isLast ? "sm:border-r sm:border-white/10" : ""
      }`}
    >
      <p className="text-[32px]  font-extrabold text-red-500 tracking-tight">
        {stat.static ? stat.static : `${count}${stat.suffix}`}
      </p>
      <p className="mt-2 text-[16px] font-medium text-white">
        {stat.label}
      </p>
    </div>
  );
}

export default function AboutStatsSection() {
  const { stats } = statsData;
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#050b18] overflow-hidden"
    >
      {/* subtle background grid / stars */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative mx-auto max-w-[1500px] px-6 lg:px-12">
        <div className="flex flex-wrap items-stretch justify-center divide-y divide-white/10 sm:divide-y-0">
          {stats.map((stat, i) => (
            <StatItem
              key={i}
              stat={stat}
              isLast={i === stats.length - 1}
              shouldStart={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}