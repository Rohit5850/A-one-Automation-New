import Image from "next/image";
import Link from "next/link";
import {
  Cpu,
  Monitor,
  Gauge,
  PanelsTopLeft,
  Network,
  Factory,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Phone,
  Activity,
} from "lucide-react";

export const metadata = {
  title: "Industrial Automation Company in Pithampur",
  description:
    "A-ONE Automation Solutions provides PLC programming, HMI, SCADA, VFD, control panel, machine automation and industrial automation services in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/industrial-automation-pithampur/",
  },

  openGraph: {
    title:
      "Industrial Automation Company in Pithampur | A-ONE Automation Solutions",
    description:
      "Industrial automation, PLC, HMI, SCADA, VFD, control panel and machine automation services in Pithampur and Indore.",
    url: "https://aone-india.com/industrial-automation-pithampur/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial Automation Solutions",
    title: "Industrial Automation Company in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions provides complete industrial automation services including PLC programming, HMI development, SCADA systems, VFD programming, control panel manufacturing, machine automation and industrial troubleshooting for industries in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-2.jpg",
    imageAlt:
      "Industrial automation services in Pithampur and Indore",
  },

  intro: {
    label: "A-ONE AUTOMATION SOLUTIONS",
    title: "Complete Industrial Automation Support for Manufacturing Industries",
    paragraphs: [
      "We provide industrial automation solutions for machines, production lines, process plants and manufacturing systems. Our engineering support covers PLC programming, HMI development, SCADA, VFD systems, control panels, industrial communication and commissioning.",
      "A-ONE Automation supports industries in Pithampur, Indore and nearby industrial areas with new automation projects, machine modifications, troubleshooting, retrofitting and on-site commissioning.",
    ],
  },

  services: {
    label: "OUR AUTOMATION SERVICES",
    title: "Industrial Automation Services in Pithampur",
    description:
      "End-to-end industrial automation services for manufacturing plants, OEMs, machine builders and process industries.",

    items: [
      {
        id: 1,
        title: "PLC Programming",
        description:
          "PLC logic development, machine sequence programming, modification, troubleshooting and commissioning.",
        href: "/plc-programming/",
        icon: Cpu,
      },
      {
        id: 2,
        title: "HMI Programming",
        description:
          "Industrial HMI screen development, alarms, trends, recipes, visualization and PLC integration.",
        href: "/hmi-programming/",
        icon: Monitor,
      },
      {
        id: 3,
        title: "SCADA Development",
        description:
          "SCADA systems for production monitoring, alarms, historical trends, data logging and reporting.",
        href: "/scada-development/",
        icon: Activity,
      },
      {
        id: 4,
        title: "VFD & Drive Services",
        description:
          "VFD programming, parameter setting, PLC integration, troubleshooting and drive commissioning.",
        href: "/vfd-services/",
        icon: Gauge,
      },
      {
        id: 5,
        title: "Control Panel Manufacturing",
        description:
          "PLC panels, VFD panels, MCC panels, APFC panels and customized industrial automation panels.",
        href: "/control-panel-manufacturing/",
        icon: PanelsTopLeft,
      },
      {
        id: 6,
        title: "Industrial Networking",
        description:
          "PLC, HMI, SCADA and drive communication using EtherNet/IP, PROFINET, Modbus and industrial networks.",
        href: "/contact",
        icon: Network,
      },
    ],
  },

  capabilities: {
    label: "AUTOMATION CAPABILITIES",
    title: "Industrial Automation Engineering Capabilities",
    description:
      "Our automation services cover machine control, process monitoring, industrial communication and complete system integration.",

    items: [
      "PLC Logic Development",
      "Machine Sequence Control",
      "HMI Visualization",
      "SCADA Monitoring",
      "VFD & Motor Control",
      "Servo Integration",
      "Barcode Integration",
      "Vision System Integration",
      "Analog IO Control",
      "PID Control",
      "Industrial Networking",
      "Data Logging",
      "Production Monitoring",
      "Machine Retrofitting",
      "Panel Engineering",
      "Site Commissioning",
    ],
  },

  industries: {
    title: "Industries We Serve in Pithampur",
    description:
      "Industrial automation solutions for manufacturing, engineering and process industries in Pithampur and Indore.",

    items: [
      "Automotive",
      "Pharmaceutical",
      "Food & Beverage",
      "Packaging",
      "Engineering",
      "Chemical",
      "Plastic",
      "Machine Builders",
    ],
  },

  support: {
    label: "BREAKDOWN & SUPPORT",
    title: "Industrial Automation Troubleshooting & Breakdown Support",
    description:
      "Machine breakdowns caused by PLC, HMI, VFD, communication or electrical control problems can affect production. We provide systematic troubleshooting and on-site automation support for industrial plants.",

    image: "/images/img-5.webp",
    imageAlt:
      "Industrial automation troubleshooting support in Pithampur",

    items: [
      "PLC fault diagnosis",
      "Machine sequence troubleshooting",
      "HMI communication problems",
      "VFD trip troubleshooting",
      "Industrial network faults",
      "Control panel troubleshooting",
      "IO signal problems",
      "Machine modification support",
    ],
  },

  whyChooseUs: {
    label: "WHY A-ONE AUTOMATION",
    title: "Automation Support Focused on Industrial Requirements",
    description:
      "We work on practical industrial automation requirements including machine control, production monitoring, troubleshooting and system upgrades.",

    items: [
      "Industrial automation engineering",
      "Multi-brand PLC support",
      "Machine and process automation",
      "On-site troubleshooting",
      "PLC, HMI, SCADA and VFD integration",
      "Control panel engineering",
      "Industrial communication support",
      "Project commissioning support",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "PLC Programming Services",
      description:
        "PLC programming, machine automation, troubleshooting and commissioning services.",
      href: "/plc-programming/",
      icon: Cpu,
    },
    {
      id: 2,
      title: "SCADA Development",
      description:
        "Industrial SCADA systems for monitoring, alarms, trends, reports and data logging.",
      href: "/scada-development/",
      icon: Activity,
    },
  ],

  cta: {
    title: "Need Industrial Automation Support in Pithampur?",
    description:
      "Contact A-ONE Automation Solutions for PLC, HMI, SCADA, VFD, control panel, machine automation and industrial troubleshooting services in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Request Automation Support",
    href: "/contact",
  },
};

export default function IndustrialAutomationPithampurPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-secondary py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-primary/15 px-5 py-2 text-sm font-semibold text-blue-300">
              {pageData.hero.badge}
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {pageData.hero.title}{" "}
              <span className="text-blue-400">
                {pageData.hero.highlight}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[18px] leading-8 text-gray-300">
              {pageData.hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-4 font-semibold text-white transition hover:opacity-90"
              >
                Request Automation Support
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-xl border border-white/20 px-7 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                <Phone size={20} />
                Contact Us
              </Link>
            </div>
          </div>

          <div className="relative h-[380px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl md:h-[480px]">
            <Image
              src={pageData.hero.image}
              alt={pageData.hero.imageAlt}
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-20">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="font-semibold text-primary">
              {pageData.intro.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.intro.title}
            </h2>
          </div>

          <div>
            {pageData.intro.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`text-[18px] leading-8 text-gray-600 ${
                  index > 0 ? "mt-5" : ""
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="font-semibold text-primary">
              {pageData.services.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.services.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-600">
              {pageData.services.description}
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {pageData.services.items.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group rounded-2xl border border-gray-200 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white">
                    <Icon size={27} />
                  </div>

                  <h3 className="mt-6 text-[21px] font-bold text-secondary">
                    {service.title}
                  </h3>

                  <p className="mt-4 text-[17px] leading-8 text-gray-600">
                    {service.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">
                    View Service
                    <ArrowRight size={17} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="py-20">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="font-semibold text-primary">
              {pageData.capabilities.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.capabilities.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.capabilities.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pageData.capabilities.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5"
              >
                <CheckCircle2 size={21} className="text-primary" />
                <span className="font-semibold text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mb-12 text-center">
            <Factory className="mx-auto text-blue-400" size={40} />

            <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
              {pageData.industries.title}
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-[18px] leading-8 text-gray-300">
              {pageData.industries.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {pageData.industries.items.map((industry) => (
              <div
                key={industry}
                className="rounded-xl bg-white/5 p-5 text-center font-semibold text-gray-100"
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="py-20">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 lg:grid-cols-2">
          <div className="relative h-[350px] overflow-hidden rounded-3xl md:h-[450px]">
            <Image
              src={pageData.support.image}
              alt={pageData.support.imageAlt}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <span className="font-semibold text-primary">
              {pageData.support.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.support.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.support.description}
            </p>

            <div className="mt-7 space-y-4">
              {pageData.support.items.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Wrench size={20} className="text-primary" />
                  <span className="text-[17px] text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="font-semibold text-primary">
              {pageData.whyChooseUs.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.whyChooseUs.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-600">
              {pageData.whyChooseUs.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pageData.whyChooseUs.items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5"
              >
                <CheckCircle2
                  size={21}
                  className="mt-1 shrink-0 text-primary"
                />

                <span className="font-semibold text-secondary">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RELATED SERVICES */}
      <section className="py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="grid gap-7 md:grid-cols-2">
            {pageData.relatedServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  className="rounded-2xl border border-gray-200 bg-white p-8"
                >
                  <Icon className="text-primary" size={35} />

                  <h3 className="mt-5 text-2xl font-bold text-secondary">
                    {service.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-600">
                    {service.description}
                  </p>

                  <Link
                    href={service.href}
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-primary"
                  >
                    Explore Service
                    <ArrowRight size={18} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="rounded-3xl bg-primary px-6 py-14 text-center md:px-12">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {pageData.cta.title}
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-[18px] leading-8 text-white/90">
              {pageData.cta.description}
            </p>

            <Link
              href={pageData.cta.href}
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-semibold text-secondary transition hover:shadow-xl"
            >
              {pageData.cta.buttonText}
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}