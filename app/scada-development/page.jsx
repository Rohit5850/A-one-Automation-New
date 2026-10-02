import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Database,
  Bell,
  BarChart3,
  Network,
  Settings,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
  Cpu,
  Monitor,
} from "lucide-react";

export const metadata = {
  title: "SCADA Development Services in Pithampur",
  description:
    "A-ONE Automation Solutions provides SCADA development, production monitoring, alarm management, historical trending, data logging and industrial monitoring solutions in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/scada-development/",
  },

  openGraph: {
    title:
      "SCADA Development Services in Pithampur | A-ONE Automation Solutions",
    description:
      "Professional SCADA development, monitoring, alarms, trends, reports and industrial data visualization services in Pithampur and Indore.",
    url: "https://aone-india.com/scada-development/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial SCADA & Monitoring Solutions",
    title: "SCADA Development Services in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions provides professional SCADA development, real-time monitoring, alarm management, historical trending, data logging and industrial visualization solutions for industries in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-4.jpg",
    imageAlt:
      "SCADA development and industrial monitoring services in Pithampur",
  },

  intro: {
    label: "SCADA DEVELOPMENT EXPERTISE",
    title: "Industrial SCADA & Production Monitoring Solutions",
    paragraphs: [
      "We develop SCADA systems for real-time machine and process monitoring, alarm management, historical data, trends, reports and production visualization. Our solutions help operators and maintenance teams monitor industrial systems more effectively.",
      "A-ONE Automation supports manufacturing and process industries in Pithampur, Indore and nearby industrial areas with SCADA development, modification, PLC integration and industrial data monitoring solutions.",
    ],
  },

  services: {
    label: "OUR SCADA SERVICES",
    title: "SCADA Development Services in Pithampur",
    description:
      "Complete SCADA and industrial monitoring solutions for machines, production lines, utilities and process plants.",

    items: [
      {
        id: 1,
        title: "SCADA Development",
        description:
          "Development of industrial SCADA applications for real-time process and machine monitoring.",
        icon: Monitor,
      },
      {
        id: 2,
        title: "Alarm Management",
        description:
          "Configuration of real-time alarms, alarm history, acknowledgement and operator fault indication.",
        icon: Bell,
      },
      {
        id: 3,
        title: "Historical Trending",
        description:
          "Real-time and historical trend visualization for process values, production parameters and equipment data.",
        icon: Activity,
      },
      {
        id: 4,
        title: "Data Logging",
        description:
          "Industrial process and production data logging for analysis, reporting and traceability.",
        icon: Database,
      },
      {
        id: 5,
        title: "PLC & SCADA Integration",
        description:
          "Integration of PLC systems with SCADA using industrial communication protocols and network architectures.",
        icon: Network,
      },
      {
        id: 6,
        title: "SCADA Modification",
        description:
          "Modification and upgrading of existing SCADA applications for new machines, tags, alarms and process requirements.",
        icon: Settings,
      },
    ],
  },

  capabilities: {
    label: "SCADA CAPABILITIES",
    title: "Complete Industrial Monitoring & Visualization",
    description:
      "From a single machine monitoring system to plant-wide SCADA, we develop solutions focused on visibility, diagnostics and operational data.",

    items: [
      "Real-Time Monitoring",
      "Alarm Management",
      "Alarm History",
      "Historical Trends",
      "Data Logging",
      "Production Monitoring",
      "Machine Status Monitoring",
      "Energy Monitoring",
      "Batch Monitoring",
      "Recipe Monitoring",
      "User Login & Security",
      "Industrial Reports",
    ],
  },

  applications: {
    label: "SCADA APPLICATIONS",
    title: "Industrial SCADA Applications We Develop",
    description:
      "SCADA systems can be used across production, process, utility and machine applications for centralized monitoring and control.",

    items: [
      "Production Lines",
      "Process Plants",
      "Utility Monitoring",
      "Water Treatment",
      "Energy Monitoring",
      "Conveyor Systems",
      "Batch Processes",
      "Machine Monitoring",
      "Packaging Lines",
      "HVAC Monitoring",
      "Motor & VFD Monitoring",
      "Remote Plant Monitoring",
    ],
  },

  industries: {
    title: "Industries We Serve",
    description:
      "SCADA development and industrial monitoring solutions for manufacturing and process industries in Pithampur and Indore.",

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

  monitoring: {
    label: "PRODUCTION MONITORING",
    title: "Real-Time Production & Process Visibility",
    description:
      "A properly designed SCADA system can provide clear visibility of machine status, production values, alarms and historical data. We develop monitoring solutions that help operators and engineering teams understand plant performance.",

    image: "/images/img-4.jpg",
    imageAlt:
      "Industrial SCADA production monitoring and data visualization",

    items: [
      "Machine running and stopped status",
      "Production counters",
      "Process parameter monitoring",
      "Alarm and fault history",
      "Motor and VFD status",
      "Analog value monitoring",
      "Historical process trends",
      "Operator event monitoring",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "PLC Programming",
      description:
        "PLC programming, modification, troubleshooting and complete machine automation services.",
      href: "/plc-programming/",
      icon: Cpu,
    },
    {
      id: 2,
      title: "HMI Programming",
      description:
        "Industrial HMI development, machine visualization, alarms, trends and operator control screens.",
      href: "/hmi-programming/",
      icon: Monitor,
    },
  ],

  cta: {
    title: "Need SCADA Development or Monitoring Support?",
    description:
      "Contact A-ONE Automation Solutions for SCADA development, production monitoring, alarm management, historical trending, data logging and PLC-SCADA integration services in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Request SCADA Support",
    href: "/contact",
  },
};

export default function SCADADevelopmentPage() {
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
                Request SCADA Support
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

      {/* APPLICATIONS */}
      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="font-semibold text-blue-400">
              {pageData.applications.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
              {pageData.applications.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-300">
              {pageData.applications.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pageData.applications.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-5"
              >
                <BarChart3 size={20} className="text-blue-400" />
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

      {/* MONITORING */}
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