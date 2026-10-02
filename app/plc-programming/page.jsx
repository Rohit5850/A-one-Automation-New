import Image from "next/image";
import Link from "next/link";
import {
  Cpu,
  Settings,
  Network,
  Wrench,
  Activity,
  Gauge,
  Monitor,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
} from "lucide-react";

export const metadata = {
  title: "PLC Programming Services in Pithampur",
  description:
    "A-ONE Automation Solutions provides PLC programming, troubleshooting, modification, commissioning and industrial automation services in Pithampur, Indore and Madhya Pradesh.",
  alternates: {
    canonical: "/plc-programming/",
  },
};

const pageData = {
  hero: {
    badge: "Industrial Automation Services",
    title: "PLC Programming Services in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions provides professional PLC programming, troubleshooting, modification, commissioning and complete machine automation services for industries in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-2.jpg",
    imageAlt:
      "PLC programming and industrial automation services in Pithampur",
  },

  intro: {
    label: "PLC AUTOMATION EXPERTISE",
    title: "PLC Programming & Automation for Industrial Machines",
    paragraphs: [
      "We develop and modify PLC programs for industrial machines, production systems and process applications. Our services include PLC logic development, sequence control, IO integration, troubleshooting, communication, HMI integration and machine commissioning.",
      "A-ONE Automation supports manufacturing industries in Pithampur, Indore and nearby industrial areas with on-site automation and PLC engineering services.",
    ],
  },

  services: {
    label: "OUR SERVICES",
    title: "PLC Programming Services in Pithampur",
    description:
      "PLC engineering solutions for machine manufacturers, factories, production lines and process industries.",

    items: [
      {
        id: 1,
        title: "PLC Programming",
        description:
          "Development of reliable PLC control logic for machines, production lines and industrial processes.",
        icon: Cpu,
      },
      {
        id: 2,
        title: "PLC Modification",
        description:
          "Modification and optimization of existing PLC programs according to machine and process requirements.",
        icon: Settings,
      },
      {
        id: 3,
        title: "PLC Troubleshooting",
        description:
          "Diagnosis and troubleshooting of PLC faults, machine interlocks, communication and automation problems.",
        icon: Wrench,
      },
      {
        id: 4,
        title: "Machine Automation",
        description:
          "Complete automation solutions for new machines, conveyors and industrial manufacturing systems.",
        icon: Activity,
      },
      {
        id: 5,
        title: "Industrial Communication",
        description:
          "PLC communication using EtherNet/IP, PROFINET, Modbus TCP, Modbus RTU and industrial networks.",
        icon: Network,
      },
      {
        id: 6,
        title: "PLC Commissioning",
        description:
          "PLC testing, IO checking, sequence validation and machine commissioning at industrial sites.",
        icon: Gauge,
      },
    ],
  },

  brands: {
    label: "PLC BRANDS WE SUPPORT",
    title: "Multi-Brand PLC Programming & Support",
    description:
      "Our engineers work with widely used industrial PLC platforms for programming, troubleshooting, communication and machine integration.",
    items: [
      "Allen-Bradley / Rockwell",
      "Siemens",
      "Schneider Electric",
      "Mitsubishi",
      "Omron",
      "Delta",
    ],
  },

  capabilities: {
    label: "AUTOMATION CAPABILITIES",
    title: "Complete PLC & Machine Automation Support",
    description:
      "From a single machine PLC modification to complete industrial automation projects, our services cover engineering, programming, testing and commissioning.",
    items: [
      "Sequence Programming",
      "Timer & Counter Logic",
      "Analog IO Programming",
      "PID Control",
      "Motor & VFD Control",
      "Servo Integration",
      "HMI Integration",
      "SCADA Integration",
      "Barcode Integration",
      "Vision System Integration",
      "Data Logging",
      "PLC Networking",
    ],
  },

  industries: {
    title: "Industries We Serve",
    description:
      "PLC programming and automation support for manufacturing and process industries in Pithampur and Indore.",
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

  troubleshooting: {
    label: "PLC TROUBLESHOOTING",
    title: "PLC Breakdown & Troubleshooting Support",
    description:
      "Machine breakdown caused by PLC logic, IO, communication or sequence problems can affect production. We provide systematic PLC troubleshooting and automation support to identify and resolve industrial control problems.",
    image: "/images/img-5.webp",
    imageAlt: "PLC troubleshooting and industrial machine support",
    items: [
      "PLC fault diagnosis",
      "Digital and analog IO troubleshooting",
      "PLC communication troubleshooting",
      "Machine sequence problems",
      "HMI and PLC communication",
      "VFD and PLC integration issues",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "HMI Programming",
      description:
        "Operator-friendly HMI development, modification, alarm, trending and machine visualization.",
      href: "/services",
      icon: Monitor,
    },
    {
      id: 2,
      title: "SCADA & Monitoring",
      description:
        "SCADA development, production monitoring, alarm management, trends and industrial data visualization.",
      href: "/services",
      icon: Activity,
    },
  ],

  cta: {
    title: "Need PLC Programming or Automation Support?",
    description:
      "Contact A-ONE Automation Solutions for PLC programming, troubleshooting, machine automation and commissioning support in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Request a Site Visit",
    href: "/contact",
  },
};

export default function PLCProgrammingPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
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
                Request PLC Support
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

      {/* Intro */}
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

      {/* Services */}
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

      {/* Brands */}
      <section className="py-20">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="font-semibold text-primary">
              {pageData.brands.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.brands.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.brands.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pageData.brands.items.map((brand) => (
              <div
                key={brand}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5"
              >
                <CheckCircle2 className="text-primary" size={22} />
                <span className="font-semibold text-secondary">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-secondary py-20">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="font-semibold text-blue-400">
              {pageData.capabilities.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {pageData.capabilities.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-300">
              {pageData.capabilities.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pageData.capabilities.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-4"
              >
                <CheckCircle2 size={20} className="text-blue-400" />
                <span className="text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
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

      {/* Troubleshooting */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 lg:grid-cols-2">
          <div className="relative h-[350px] overflow-hidden rounded-3xl md:h-[450px]">
            <Image
              src={pageData.troubleshooting.image}
              alt={pageData.troubleshooting.imageAlt}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <span className="font-semibold text-primary">
              {pageData.troubleshooting.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.troubleshooting.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.troubleshooting.description}
            </p>

            <div className="mt-7 space-y-4">
              {pageData.troubleshooting.items.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={21} className="text-primary" />
                  <span className="text-[17px] text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="grid gap-7 md:grid-cols-2">
            {pageData.relatedServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.id}
                  className="rounded-2xl border border-gray-200 p-8"
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