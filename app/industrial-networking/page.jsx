import Image from "next/image";
import Link from "next/link";
import {
  Network,
  Cable,
  Cpu,
  Settings,
  Activity,
  Wrench,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
  Wifi,
  Monitor,
} from "lucide-react";

export const metadata = {
  title: "Industrial Networking Services in Pithampur",
  description:
    "A-ONE Automation Solutions provides industrial networking, EtherNet/IP, PROFINET, Modbus TCP, Modbus RTU, PLC communication and network troubleshooting services in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/industrial-networking/",
  },

  openGraph: {
    title:
      "Industrial Networking Services in Pithampur | A-ONE Automation Solutions",
    description:
      "Industrial Ethernet, EtherNet/IP, PROFINET, Modbus, PLC communication and network troubleshooting services in Pithampur and Indore.",
    url: "https://aone-india.com/industrial-networking/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial Communication & Networking",
    title: "Industrial Networking Services in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions provides industrial networking and communication services including EtherNet/IP, PROFINET, Modbus TCP, Modbus RTU, PLC networking, HMI communication and industrial network troubleshooting in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-2.jpg",
    imageAlt:
      "Industrial networking and PLC communication services in Pithampur",
  },

  intro: {
    label: "INDUSTRIAL NETWORKING EXPERTISE",
    title: "Reliable Communication Between PLCs, HMIs & Industrial Devices",
    paragraphs: [
      "Modern industrial machines depend on reliable communication between PLCs, HMIs, drives, remote IO, analyzers, SCADA systems and other devices. We configure and troubleshoot industrial communication networks based on application requirements.",
      "A-ONE Automation supports manufacturing industries in Pithampur and Indore with industrial Ethernet, PLC communication, Modbus, EtherNet/IP, PROFINET and network troubleshooting services.",
    ],
  },

  services: {
    label: "OUR NETWORKING SERVICES",
    title: "Industrial Networking Services in Pithampur",
    description:
      "Industrial communication and networking solutions for machines, PLC systems and production environments.",

    items: [
      {
        id: 1,
        title: "PLC to PLC Communication",
        description:
          "Communication between PLC controllers for machine synchronization, data exchange and process coordination.",
        icon: Cpu,
      },
      {
        id: 2,
        title: "EtherNet/IP",
        description:
          "Configuration and troubleshooting of EtherNet/IP communication between Rockwell PLCs, drives, IO and industrial devices.",
        icon: Network,
      },
      {
        id: 3,
        title: "PROFINET",
        description:
          "PROFINET communication setup for Siemens PLCs, HMIs, drives and distributed industrial devices.",
        icon: Cable,
      },
      {
        id: 4,
        title: "Modbus TCP / RTU",
        description:
          "Integration of meters, analyzers, VFDs and third-party devices using Modbus TCP and Modbus RTU.",
        icon: Settings,
      },
      {
        id: 5,
        title: "HMI & SCADA Communication",
        description:
          "PLC communication setup for industrial HMI and SCADA monitoring systems.",
        icon: Monitor,
      },
      {
        id: 6,
        title: "Network Troubleshooting",
        description:
          "Diagnosis of industrial communication faults, device connection issues and network-related machine problems.",
        icon: Wrench,
      },
    ],
  },

  protocols: {
    label: "PROTOCOLS WE SUPPORT",
    title: "Industrial Communication Protocols",
    description:
      "We work with widely used industrial communication standards for machine and plant automation.",

    items: [
      "EtherNet/IP",
      "PROFINET",
      "Modbus TCP",
      "Modbus RTU",
      "RS-485",
      "TCP/IP",
      "OPC",
      "Serial Communication",
      "Industrial Ethernet",
      "PLC Messaging",
      "Remote IO Communication",
      "Gateway Communication",
    ],
  },

  devices: {
    label: "CONNECTED DEVICES",
    title: "Industrial Devices We Integrate",
    description:
      "Industrial networks connect automation controllers with field and monitoring equipment across the plant.",

    items: [
      "PLCs",
      "HMIs",
      "SCADA Systems",
      "VFDs",
      "Servo Drives",
      "Remote IO",
      "Barcode Scanners",
      "Vision Systems",
      "Energy Meters",
      "Analyzers",
      "Industrial Gateways",
      "Network Switches",
    ],
  },

  industries: {
    title: "Industries We Serve",
    description:
      "Industrial networking and PLC communication services for manufacturing and process industries in Pithampur and Indore.",

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
    label: "NETWORK TROUBLESHOOTING",
    title: "Industrial Communication Fault Diagnosis",
    description:
      "Network communication faults can stop machines and create intermittent production problems. We provide systematic diagnosis for industrial communication and network issues.",

    image: "/images/img-5.webp",
    imageAlt:
      "Industrial network troubleshooting and PLC communication support",

    items: [
      "PLC communication failure",
      "Device not detected on network",
      "EtherNet/IP connection fault",
      "PROFINET device fault",
      "Modbus communication issue",
      "RS-485 wiring problems",
      "IP address conflicts",
      "Industrial switch troubleshooting",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "Industrial IoT",
      description:
        "PLC data monitoring, industrial gateways, MQTT, cloud connectivity and remote dashboards.",
      href: "/industrial-iot/",
      icon: Wifi,
    },
    {
      id: 2,
      title: "PLC Programming",
      description:
        "PLC programming, modification, troubleshooting and machine automation support.",
      href: "/plc-programming/",
      icon: Cpu,
    },
  ],

  cta: {
    title: "Need Industrial Networking Support?",
    description:
      "Contact A-ONE Automation Solutions for EtherNet/IP, PROFINET, Modbus, RS-485, PLC communication and industrial network troubleshooting services in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Request Networking Support",
    href: "/contact",
  },
};

export default function IndustrialNetworkingPage() {
  return (
    <main className="bg-white">
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
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-4 font-semibold text-white"
              >
                Request Networking Support
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-xl border border-white/20 px-7 py-4 font-semibold text-white"
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
          </div>
        </div>
      </section>

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
                  className="rounded-2xl border border-gray-200 bg-white p-8 transition hover:-translate-y-1 hover:border-primary hover:shadow-xl"
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

      <section className="py-20">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 lg:grid-cols-2">
          <div>
            <span className="font-semibold text-primary">
              {pageData.protocols.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.protocols.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.protocols.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pageData.protocols.items.map((item) => (
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

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="font-semibold text-blue-400">
              {pageData.devices.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {pageData.devices.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-300">
              {pageData.devices.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pageData.devices.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-5"
              >
                <Network size={20} className="text-blue-400" />
                <span className="font-semibold text-gray-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                className="rounded-xl border border-gray-200 p-5 text-center font-semibold text-secondary"
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

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
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-semibold text-secondary"
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