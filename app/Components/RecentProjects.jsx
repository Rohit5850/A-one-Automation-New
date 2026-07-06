import { MapPin, ArrowRight } from "lucide-react";


/**
 * Recent Projects Section
 *
 * Layout/typography: Tailwind CSS
 * Data: plain JSON array defined in this same file (as requested) — swap
 * `image` values for your own real project photos before shipping.
 *
 * Usage in app/page.tsx:
 *   import RecentProjects from "@/components/RecentProjects";
 *   export default function Home() {
 *     return <RecentProjects />;
 *   }
 */

// ---------------------------------------------------------------------------
// Project data (JSON) — edit this array to add/remove/update projects
// ---------------------------------------------------------------------------
const projects = [
  {
    id: 1,
    title: "Fire Fighting Control Panel Installation",
    description:
      "Three-phase fire fighting control panel with automatic water pump control system for commercial complex.",
    location: "Indore, MP",
    category: "Control Panel",
    image: "/images/services/service_control_panel.jpg",
  },
  {
    id: 2,
    title: "Industrial PLC Automation",
    description:
      "Complete automation solution with Delta PLC programming for packaging machine control system.",
    location: "Pithampur, MP",
    category: "Automation",
    image: "/images/services/service_plc.webp",
  },
  {
    id: 3,
    title: "VFD Panel for Cooling Tower",
    description:
      "Three-phase VFD control panel for energy-efficient cooling tower motor control with temperature sensing.",
    location: "Dewas, MP",
    category: "VFD Systems",
    image: "/images/services/services_vfd.jpg",
  },
  {
    id: 4,
    title: "HMI Screen Integration",
    description:
      "Delta HMI screen programming and integration with existing PLC system for real-time monitoring.",
    location: "Indore, MP",
    category: "HMI Solutions",
    image: "/images/services/services_hmi.jpg",
  },
  {
    id: 5,
    title: "APFC Panel Installation",
    description:
      "Automatic Power Factor Correction panel to reduce electricity bills and improve power quality.",
    location: "Pithampur, MP",
    category: "Power Management",
    image: "/images/services/services_apfc.jpg",
  },
  {
    id: 6,
    title: "PLC Repair & Upgradation",
    description:
      "Complete PLC system diagnostics, repair, and firmware upgrade for improved performance.",
    location: "Indore, MP",
    category: "Repair Services",
    image: "/images/services/service_plc.webp",
  },
];

export default function RecentProjects() {
  return (
    <section className="bg-slate-50 py-20 pt-0">
      <div className="mx-auto max-w-[1500px] px-4">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-[32px] font-bold text-slate-900">
            Recent Projects
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[18px] text-slate-500">
            Real work, real results. See our completed projects across
            various industries.
          </p>
        </div>

        {/* Project grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md"
            >
              {/* Image + badge */}
              <div className="relative h-56 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow">
                  {project.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[21px] font-bold text-slate-900">
                  {project.title}
                </h3>
                <p className="mt-2 text-[16px] leading-relaxed text-slate-500">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin size={14} className="text-red-500" />
                  {project.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 flex justify-center">
          <a
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-secondary hover:shadow-xl"
          >
            View All Projects
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}