import Image from "next/image";
import Link from "next/link";
import {
  Cpu,
  PanelsTopLeft,
  Zap,
  Gauge,
  Wrench,
  ShieldCheck,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
  Settings,
  Network,
} from "lucide-react";

export const metadata = {
  title: "Control Panel Manufacturer in Pithampur",
  description:
    "A-ONE Automation Solutions designs and manufactures PLC panels, VFD panels, APFC panels, MCC panels and industrial control panels in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/control-panel-manufacturing/",
  },

  openGraph: {
    title:
      "Control Panel Manufacturer in Pithampur | A-ONE Automation Solutions",
    description:
      "PLC panels, VFD panels, APFC panels, MCC panels and industrial control panel manufacturing services in Pithampur and Indore.",
    url: "https://aone-india.com/control-panel-manufacturing/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial Electrical & Automation Panels",
    title: "Control Panel Manufacturer in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions designs and manufactures industrial control panels including PLC panels, VFD panels, APFC panels, MCC panels and customized automation panels for industries in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-1.jpg",
    imageAlt:
      "Industrial control panel manufacturing in Pithampur",
  },

  intro: {
    label: "CONTROL PANEL EXPERTISE",
    title: "Industrial Control Panel Design & Manufacturing",
    paragraphs: [
      "We design and manufacture industrial electrical and automation control panels according to machine, process and plant requirements. Our solutions include PLC panels, VFD panels, APFC panels, MCC panels and customized control systems.",
      "A-ONE Automation supports industries in Pithampur, Indore and nearby industrial areas with panel design, component selection, wiring, testing, installation and commissioning.",
    ],
  },

  services: {
    label: "OUR PANEL SOLUTIONS",
    title: "Control Panel Manufacturing Services in Pithampur",
    description:
      "Industrial panel design and manufacturing solutions for machine builders, factories and process industries.",

    items: [
      {
        id: 1,
        title: "PLC Control Panels",
        description:
          "Custom PLC control panels for machine automation, process control and industrial applications.",
        icon: Cpu,
      },
      {
        id: 2,
        title: "VFD Panels",
        description:
          "Industrial VFD panels for motor speed control, energy management and process automation.",
        icon: Gauge,
      },
      {
        id: 3,
        title: "APFC Panels",
        description:
          "Automatic Power Factor Correction panels for improved power factor and electrical efficiency.",
        icon: Zap,
      },
      {
        id: 4,
        title: "MCC Panels",
        description:
          "Motor Control Centre panels for reliable control and protection of industrial motors.",
        icon: PanelsTopLeft,
      },
      {
        id: 5,
        title: "Automation Panels",
        description:
          "Customized automation panels with PLC, HMI, VFD, relay, power supply and control components.",
        icon: Settings,
      },
      {
        id: 6,
        title: "Panel Modification & Retrofitting",
        description:
          "Modification and upgrading of existing industrial electrical panels for new automation requirements.",
        icon: Wrench,
      },
    ],
  },

  capabilities: {
    label: "PANEL CAPABILITIES",
    title: "Complete Electrical Panel Engineering Support",
    description:
      "From panel concept to final commissioning, we provide complete engineering support for industrial control and automation panels.",

    items: [
      "Electrical Panel Design",
      "GA Drawing",
      "Control Wiring",
      "Power Wiring",
      "PLC Integration",
      "HMI Integration",
      "VFD Integration",
      "Relay & Contactor Logic",
      "Terminal Planning",
      "Panel Testing",
      "IO Testing",
      "Site Commissioning",
    ],
  },

  components: {
    label: "PANEL COMPONENTS",
    title: "Industrial Components We Integrate",
    description:
      "We integrate industrial-grade electrical and automation components based on application requirements.",

    items: [
      "PLC",
      "HMI",
      "VFD",
      "SMPS",
      "MCB / MCCB",
      "Contactors",
      "Relays",
      "Timers",
      "Terminal Blocks",
      "Industrial Switches",
      "Meters",
      "Protection Devices",
    ],
  },

  industries: {
    title: "Industries We Serve",
    description:
      "Control panel manufacturing and automation panel solutions for industries in Pithampur and Indore.",

    items: [
      "Automotive",
      "Pharmaceutical",
      "Food & Beverage",
      "Packaging",
      "Engineering",
      "Chemical",
      "Machine Builders",
      "Process Industries",
    ],
  },

  quality: {
    label: "QUALITY & TESTING",
    title: "Panel Testing Before Dispatch",
    description:
      "Every industrial control panel should be properly checked before installation. We perform panel inspection and functional testing according to project requirements.",

    image: "/images/img-1.jpg",
    imageAlt:
      "Industrial control panel testing and commissioning",

    items: [
      "Wiring inspection",
      "Power circuit checking",
      "Control circuit testing",
      "PLC IO verification",
      "VFD parameter verification",
      "Terminal checking",
      "Component identification",
      "Functional testing",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "PLC Programming",
      description:
        "PLC programming, troubleshooting, modification and machine automation services.",
      href: "/plc-programming/",
      icon: Cpu,
    },
    {
      id: 2,
      title: "VFD & Drive Services",
      description:
        "VFD programming, parameter setting, troubleshooting and commissioning services.",
      href: "/vfd-services/",
      icon: Gauge,
    },
  ],

  cta: {
    title: "Need an Industrial Control Panel?",
    description:
      "Contact A-ONE Automation Solutions for PLC panels, VFD panels, APFC panels, MCC panels and customized industrial control panel solutions in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Request Panel Quotation",
    href: "/contact",
  },
};

export default function ControlPanelManufacturingPage() {
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
                Request Panel Quotation
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
                <div
                  key={service.id}
                  className="rounded-2xl border border-gray-200 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl"
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
                </div>
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

      {/* COMPONENTS */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="font-semibold text-blue-400">
              {pageData.components.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {pageData.components.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-300">
              {pageData.components.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pageData.components.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-5"
              >
                <Zap size={20} className="text-blue-400" />
                <span className="font-semibold text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mb-12 text-center">
            <Factory className="mx-auto text-primary" size={40} />

            <h2 className="mt-4 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.industries.title}
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-[18px] leading-8 text-gray-600">
              {pageData.industries.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {pageData.industries.items.map((industry) => (
              <div
                key={industry}
                className="rounded-xl border border-gray-200 p-5 text-center font-semibold text-secondary transition hover:border-primary hover:shadow-lg"
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUALITY */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 lg:grid-cols-2">
          <div className="relative h-[350px] overflow-hidden rounded-3xl md:h-[450px]">
            <Image
              src={pageData.quality.image}
              alt={pageData.quality.imageAlt}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <span className="font-semibold text-primary">
              {pageData.quality.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.quality.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.quality.description}
            </p>

            <div className="mt-7 space-y-4">
              {pageData.quality.items.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <ShieldCheck size={21} className="text-primary" />
                  <span className="text-[17px] text-gray-700">{item}</span>
                </div>
              ))}
            </div>
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