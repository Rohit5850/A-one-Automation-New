import Image from "next/image";
import Link from "next/link";
import {
  Monitor,
  Settings,
  Wrench,
  Activity,
  Bell,
  Database,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
  Cpu,
  Gauge,
} from "lucide-react";

export const metadata = {
  title: "HMI Programming Services in Pithampur",
  description:
    "A-ONE Automation Solutions provides HMI programming, screen development, modification, alarm, trend, recipe and PLC-HMI integration services in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/hmi-programming/",
  },

  openGraph: {
    title:
      "HMI Programming Services in Pithampur | A-ONE Automation Solutions",
    description:
      "Professional HMI programming, modification, alarm, trend, recipe and PLC integration services in Pithampur and Indore.",
    url: "https://aone-india.com/hmi-programming/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial HMI & Visualization Services",
    title: "HMI Programming Services in",
    highlight: "Pithampur & Indore",
    description:
      "A-ONE Automation Solutions provides professional HMI programming, screen development, modification, alarm management, trend visualization, recipe handling and PLC-HMI integration services for industries in Pithampur, Indore and across Madhya Pradesh.",
    image: "/images/img-4.jpg",
    imageAlt:
      "HMI programming and industrial visualization services in Pithampur",
  },

  intro: {
    label: "HMI DEVELOPMENT EXPERTISE",
    title: "Industrial HMI Programming & Operator Interface Solutions",
    paragraphs: [
      "We develop user-friendly HMI screens for industrial machines, process systems and production lines. Our HMI services include screen design, machine status visualization, alarms, trends, recipes, parameter setting and PLC communication.",
      "A-ONE Automation supports industries in Pithampur, Indore and nearby industrial areas with HMI development, modification, backup, migration and troubleshooting services.",
    ],
  },

  services: {
    label: "OUR SERVICES",
    title: "HMI Programming Services in Pithampur",
    description:
      "Complete HMI development and visualization solutions for industrial machines, production lines and process applications.",

    items: [
      {
        id: 1,
        title: "HMI Screen Development",
        description:
          "Development of clear and operator-friendly HMI screens for machine control, monitoring and process visualization.",
        icon: Monitor,
      },
      {
        id: 2,
        title: "HMI Modification",
        description:
          "Modification of existing HMI projects for machine changes, new parameters, alarms, recipes and process requirements.",
        icon: Settings,
      },
      {
        id: 3,
        title: "HMI Troubleshooting",
        description:
          "Diagnosis of HMI communication issues, tag problems, screen faults, alarm problems and PLC-HMI connectivity issues.",
        icon: Wrench,
      },
      {
        id: 4,
        title: "Alarm Management",
        description:
          "Configuration of machine alarms, alarm history, acknowledgement and operator fault indication.",
        icon: Bell,
      },
      {
        id: 5,
        title: "Trend & Data Visualization",
        description:
          "Real-time and historical trend screens for process variables, production data and machine parameters.",
        icon: Activity,
      },
      {
        id: 6,
        title: "Recipe & Data Handling",
        description:
          "Recipe management, production parameter storage and operator data entry for industrial applications.",
        icon: Database,
      },
    ],
  },

  brands: {
    label: "HMI PLATFORMS WE SUPPORT",
    title: "Multi-Brand HMI Programming & Support",
    description:
      "We work with commonly used industrial HMI platforms for development, modification, troubleshooting and PLC integration.",

    items: [
      "Rockwell FactoryTalk View",
      "Siemens WinCC",
      "Schneider HMI",
      "Mitsubishi GOT",
      "Delta HMI",
      "Weintek HMI",
      "Omron HMI",
      "Pro-face HMI",
    ],
  },

  capabilities: {
    label: "HMI CAPABILITIES",
    title: "Complete Industrial HMI Development",
    description:
      "From basic operator panels to advanced machine visualization, we create HMI applications focused on usability, diagnostics and process control.",

    items: [
      "Machine Overview Screens",
      "Motor & VFD Control Screens",
      "Alarm Screens",
      "Alarm History",
      "Real-Time Trends",
      "Historical Trends",
      "Recipe Management",
      "Parameter Setting",
      "User Login & Security",
      "Production Counters",
      "Maintenance Screens",
      "PLC Tag Integration",
    ],
  },

  industries: {
    title: "Industries We Serve",
    description:
      "HMI programming and visualization support for manufacturing and process industries in Pithampur and Indore.",

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

  applications: {
    label: "HMI APPLICATIONS",
    title: "Industrial HMI Applications We Develop",
    description:
      "We develop HMI interfaces for different machine and process applications with focus on simple operation, quick diagnostics and clear production information.",

    items: [
      "Machine Control",
      "Conveyor Systems",
      "VFD Control",
      "Batch Processes",
      "Production Monitoring",
      "Barcode Systems",
      "Vision Inspection",
      "Recipe Control",
      "Utility Monitoring",
      "Packaging Machines",
      "Process Plants",
      "Material Handling",
    ],
  },

  troubleshooting: {
    label: "HMI TROUBLESHOOTING",
    title: "HMI Fault & Communication Support",
    description:
      "HMI faults, communication problems and incorrect tag mapping can affect machine operation. We provide systematic troubleshooting for HMI software, PLC communication and visualization issues.",

    image: "/images/img-4.jpg",

    imageAlt:
      "HMI troubleshooting and PLC HMI communication support in Pithampur",

    items: [
      "HMI not communicating with PLC",
      "Incorrect or frozen tag values",
      "Alarm display problems",
      "Screen navigation issues",
      "HMI backup and restore",
      "PLC tag mapping problems",
      "Recipe handling problems",
      "HMI project modification",
    ],
  },

  relatedServices: [
    {
      id: 1,
      title: "PLC Programming",
      description:
        "PLC programming, troubleshooting, modification and complete machine automation solutions.",
      href: "/plc-programming/",
      icon: Cpu,
    },
    {
      id: 2,
      title: "VFD & Drive Services",
      description:
        "VFD programming, parameter setting, troubleshooting and PLC-drive integration services.",
      href: "/vfd-services/",
      icon: Gauge,
    },
  ],

  cta: {
    title: "Need HMI Programming or Modification Support?",
    description:
      "Contact A-ONE Automation Solutions for HMI programming, screen development, troubleshooting, alarm, trend, recipe and PLC-HMI integration services in Pithampur, Indore and Madhya Pradesh.",
    buttonText: "Request HMI Support",
    href: "/contact",
  },
};

export default function HMIProgrammingPage() {
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
                Request HMI Support
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

      {/* BRANDS */}
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

      {/* CAPABILITIES */}
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

      {/* APPLICATIONS */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="font-semibold text-primary">
              {pageData.applications.label}
            </span>

            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">
              {pageData.applications.title}
            </h2>

            <p className="mt-4 text-[18px] leading-8 text-gray-600">
              {pageData.applications.description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pageData.applications.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5"
              >
                <Monitor size={20} className="text-primary" />
                <span className="font-semibold text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TROUBLESHOOTING */}
      <section className="py-20">
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

      {/* RELATED SERVICES */}
      <section className="bg-gray-50 py-20">
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
      <section className="py-20">
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