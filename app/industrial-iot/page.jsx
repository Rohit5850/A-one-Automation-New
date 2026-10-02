import Image from "next/image";
import Link from "next/link";
import {
  Wifi,
  Database,
  Cloud,
  Activity,
  Cpu,
  Network,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
  Monitor,
  BarChart3,
} from "lucide-react";

export const metadata = {
  title: "Industrial IoT Solutions in Pithampur",
  description:
    "A-ONE Automation Solutions provides Industrial IoT, PLC data monitoring, cloud connectivity, MQTT, Modbus, remote monitoring and industrial dashboard solutions in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/industrial-iot/",
  },

  openGraph: {
    title:
      "Industrial IoT Solutions in Pithampur | A-ONE Automation Solutions",
    description:
      "Industrial IoT, PLC data monitoring, cloud connectivity, MQTT, remote monitoring and industrial dashboards in Pithampur and Indore.",
    url: "https://aone-india.com/industrial-iot/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial IoT & Connected Automation",
    title: "Industrial IoT Solutions in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions provides Industrial IoT solutions for PLC data monitoring, remote machine monitoring, industrial gateways, MQTT communication, cloud connectivity and web-based dashboards for industries in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-2.jpg",
    imageAlt:
      "Industrial IoT and PLC data monitoring solutions in Pithampur",
  },

  intro: {
    label: "INDUSTRIAL IOT EXPERTISE",
    title: "Connect Industrial Machines, PLCs & Production Data",
    paragraphs: [
      "Industrial IoT enables machines, PLCs, analyzers and industrial equipment to securely send data to local servers, cloud platforms and web dashboards for monitoring and analysis.",
      "A-ONE Automation provides Industrial IoT solutions for manufacturing industries in Pithampur and Indore including data acquisition, gateway integration, industrial communication and remote monitoring.",
    ],
  },

  services: {
    label: "OUR IIOT SERVICES",
    title: "Industrial IoT Services in Pithampur",
    description:
      "Industrial connectivity and data monitoring solutions for machines, PLCs and production systems.",

    items: [
      {
        id: 1,
        title: "PLC Data Monitoring",
        description:
          "Acquire real-time PLC data for machine status, production counters, alarms and process monitoring.",
        icon: Cpu,
      },
      {
        id: 2,
        title: "Industrial IoT Gateway",
        description:
          "Integration of industrial gateways for collecting data from PLCs, analyzers, meters and field devices.",
        icon: Wifi,
      },
      {
        id: 3,
        title: "Cloud Connectivity",
        description:
          "Secure transfer of industrial data to cloud platforms and web applications for remote monitoring.",
        icon: Cloud,
      },
      {
        id: 4,
        title: "MQTT Integration",
        description:
          "MQTT-based communication for efficient transfer of machine and industrial process data.",
        icon: Network,
      },
      {
        id: 5,
        title: "Industrial Data Logging",
        description:
          "Store machine and production data for historical analysis, reporting and traceability.",
        icon: Database,
      },
      {
        id: 6,
        title: "Remote Monitoring",
        description:
          "Remote visualization of industrial equipment, process values and production status from web dashboards.",
        icon: Monitor,
      },
    ],
  },

  capabilities: {
    label: "IIOT CAPABILITIES",
    title: "Industrial Connectivity & Data Capabilities",
    description:
      "We integrate industrial devices, PLCs and networks with modern data monitoring systems.",

    items: [
      "PLC Data Acquisition",
      "MQTT Communication",
      "Modbus TCP",
      "Modbus RTU",
      "EtherNet/IP",
      "Industrial Gateways",
      "Cloud Integration",
      "Web Dashboards",
      "Remote Monitoring",
      "Historical Data Logging",
      "Production Monitoring",
      "Energy Monitoring",
      "Alarm Monitoring",
      "Machine Status Monitoring",
      "API Integration",
      "Database Integration",
    ],
  },

  architecture: {
    label: "IIOT ARCHITECTURE",
    title: "From Machine Data to Website Dashboard",
    description:
      "Industrial data can be collected from PLCs and field devices, transferred through an industrial gateway and displayed on a secure web dashboard.",

    items: [
      "PLC / Analyzer / Meter",
      "Industrial Communication",
      "Industrial IoT Gateway",
      "MQTT / HTTPS",
      "API / Server",
      "Database",
      "Website Dashboard",
      "Remote User",
    ],
  },

  industries: {
    title: "Industries We Serve",
    description:
      "Industrial IoT and remote monitoring solutions for manufacturing and process industries in Pithampur and Indore.",

    items: [
      "Automotive",
      "Pharmaceutical",
      "Food & Beverage",
      "Packaging",
      "Engineering",
      "Chemical",
      "Utilities",
      "Process Industries",
    ],
  },

  monitoring: {
    label: "REMOTE MONITORING",
    title: "Monitor Industrial Data from Anywhere",
    description:
      "Industrial IoT systems can provide real-time visibility of machines and production systems through secure web dashboards, helping engineering and management teams access operational information remotely.",

    image: "/images/img-4.jpg",
    imageAlt:
      "Industrial IoT remote monitoring dashboard in Pithampur",

    items: [
      "Machine running status",
      "Production counters",
      "Process values",
      "Energy consumption",
      "Alarm monitoring",
      "Historical trends",
      "Equipment status",
      "Remote dashboard access",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "Industrial Networking",
      description:
        "Industrial Ethernet, Modbus, EtherNet/IP, PROFINET and PLC communication solutions.",
      href: "/industrial-networking/",
      icon: Network,
    },
    {
      id: 2,
      title: "SCADA Development",
      description:
        "Industrial SCADA systems for monitoring, alarms, trends and production data.",
      href: "/scada-development/",
      icon: Activity,
    },
  ],

  cta: {
    title: "Need Industrial IoT or Remote Monitoring?",
    description:
      "Contact A-ONE Automation Solutions for Industrial IoT, PLC data monitoring, MQTT, industrial gateway, cloud connectivity and web dashboard solutions in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Discuss IIoT Requirement",
    href: "/contact",
  },
};

export default function IndustrialIoTPage() {
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
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-7 py-4 font-semibold text-white transition hover:opacity-90"
              >
                Discuss IIoT Requirement
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

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="font-semibold text-blue-400">
              {pageData.architecture.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {pageData.architecture.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-300">
              {pageData.architecture.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {pageData.architecture.items.map((item, index) => (
              <div
                key={item}
                className="rounded-xl bg-white/5 p-5 text-center"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 font-bold text-secondary">
                  {index + 1}
                </div>

                <p className="mt-4 font-semibold text-gray-100">{item}</p>
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
              src={pageData.monitoring.image}
              alt={pageData.monitoring.imageAlt}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <span className="font-semibold text-primary">
              {pageData.monitoring.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.monitoring.title}
            </h2>

            <p className="mt-5 text-[18px] leading-8 text-gray-600">
              {pageData.monitoring.description}
            </p>

            <div className="mt-7 space-y-4">
              {pageData.monitoring.items.map((item) => (
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