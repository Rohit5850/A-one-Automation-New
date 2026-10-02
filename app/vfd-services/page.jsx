import Image from "next/image";
import Link from "next/link";
import {
  Gauge,
  Settings,
  Wrench,
  Activity,
  Network,
  Zap,
  Factory,
  CheckCircle2,
  ArrowRight,
  Phone,
  Cpu,
  Monitor,
} from "lucide-react";

export const metadata = {
  title: "VFD Programming & Drive Services in Pithampur",
  description:
    "A-ONE Automation Solutions provides VFD programming, commissioning, troubleshooting, parameter setting and industrial drive services in Pithampur, Indore and Madhya Pradesh.",

  alternates: {
    canonical: "/vfd-services/",
  },

  openGraph: {
    title:
      "VFD Programming & Drive Services in Pithampur | A-ONE Automation Solutions",
    description:
      "Professional VFD programming, troubleshooting, commissioning and industrial drive services in Pithampur and Indore.",
    url: "https://aone-india.com/vfd-services/",
    type: "website",
  },
};

const pageData = {
  hero: {
    badge: "Industrial Drive & Automation Services",

    title: "VFD Programming & Drive Services in",

    highlight: "Pithampur & Indore",

    description:
      "A-ONE Automation Solutions provides professional VFD programming, parameter setting, commissioning, troubleshooting and industrial motor control solutions for manufacturing industries in Pithampur, Indore and across Madhya Pradesh.",

    image: "/images/img-3.webp",

    imageAlt:
      "VFD programming and industrial drive services in Pithampur",
  },

  intro: {
    label: "VFD & DRIVE EXPERTISE",

    title: "VFD Programming & Motor Control Solutions",

    paragraphs: [
      "We provide VFD programming and drive engineering services for industrial motors, machines, conveyors, pumps, fans and process applications. Our services include parameter configuration, speed control, PLC integration, fault troubleshooting and drive commissioning.",

      "A-ONE Automation supports industries in Pithampur, Indore and nearby industrial areas with reliable on-site VFD programming, troubleshooting and industrial automation support.",
    ],
  },

  services: {
    label: "OUR SERVICES",

    title: "VFD Programming Services in Pithampur",

    description:
      "Complete VFD and industrial drive solutions for machines, production lines and process industries.",

    items: [
      {
        id: 1,

        title: "VFD Programming",

        description:
          "Programming and parameter configuration of Variable Frequency Drives according to motor and machine requirements.",

        icon: Gauge,
      },

      {
        id: 2,

        title: "VFD Parameter Setting",

        description:
          "Configuration of acceleration, deceleration, motor parameters, frequency limits and control modes.",

        icon: Settings,
      },

      {
        id: 3,

        title: "VFD Troubleshooting",

        description:
          "Diagnosis of drive faults, trips, motor problems, communication errors and industrial machine issues.",

        icon: Wrench,
      },

      {
        id: 4,

        title: "PLC & VFD Integration",

        description:
          "Integration of VFDs with PLC systems using digital IO, analog signals and industrial communication networks.",

        icon: Cpu,
      },

      {
        id: 5,

        title: "Industrial Communication",

        description:
          "VFD communication using Modbus RTU, Modbus TCP, EtherNet/IP, PROFINET and other industrial protocols.",

        icon: Network,
      },

      {
        id: 6,

        title: "VFD Commissioning",

        description:
          "Motor testing, direction verification, parameter tuning, IO testing and complete drive commissioning.",

        icon: Activity,
      },
    ],
  },

  brands: {
    label: "VFD BRANDS WE SUPPORT",

    title: "Multi-Brand VFD Programming & Support",

    description:
      "We work with commonly used industrial Variable Frequency Drives for programming, commissioning, troubleshooting and PLC integration.",

    items: [
      "Allen-Bradley PowerFlex",
      "Siemens",
      "Schneider Electric",
      "ABB",
      "Delta",
      "Mitsubishi",
      "Yaskawa",
      "Danfoss",
    ],
  },

  capabilities: {
    label: "DRIVE CAPABILITIES",

    title: "Complete VFD & Motor Control Support",

    description:
      "From basic motor speed control to PLC-controlled industrial drive systems, we provide programming, configuration, integration and commissioning support.",

    items: [
      "Motor Parameter Setup",
      "Acceleration & Deceleration",
      "Forward / Reverse Control",
      "Multi-Speed Control",
      "Analog Speed Reference",
      "PID Control",
      "Digital IO Configuration",
      "Relay Output Configuration",
      "PLC Communication",
      "Drive Fault Monitoring",
      "Current & Frequency Monitoring",
      "Drive Backup & Restore",
    ],
  },

  industries: {
    title: "Industries We Serve",

    description:
      "VFD programming and industrial drive support for manufacturing and process industries in Pithampur and Indore.",

    items: [
      "Automotive",
      "Pharmaceutical",
      "Food & Beverage",
      "Packaging",
      "Engineering",
      "Chemical",
      "Water Treatment",
      "Process Industries",
    ],
  },

  applications: {
    label: "VFD APPLICATIONS",

    title: "Industrial Applications We Support",

    description:
      "Variable Frequency Drives are widely used for efficient motor speed and process control. We provide complete VFD engineering support for different industrial applications.",

    items: [
      "Conveyor Systems",
      "Pumps",
      "Industrial Fans",
      "Blowers",
      "Mixers",
      "Extruders",
      "Compressors",
      "Material Handling",
      "Process Machines",
      "Production Lines",
      "Cooling Systems",
      "HVAC Applications",
    ],
  },

  troubleshooting: {
    label: "VFD TROUBLESHOOTING",

    title: "VFD Fault & Breakdown Support",

    description:
      "Drive trips and motor control problems can stop production. We provide systematic troubleshooting for VFD faults, motor issues, parameter problems, communication failures and PLC integration problems.",

    image: "/images/img-3.webp",

    imageAlt:
      "VFD troubleshooting and industrial drive support in Pithampur",

    items: [
      "Overcurrent fault troubleshooting",
      "Overvoltage and undervoltage faults",
      "Motor overload issues",
      "Drive communication problems",
      "Analog input and speed reference problems",
      "Forward and reverse command issues",
      "VFD relay output configuration",
      "PLC and VFD communication troubleshooting",
    ],
  },

  relatedServices: [
    {
      id: 1,

      title: "PLC Programming",

      description:
        "PLC programming, troubleshooting, modification and machine automation solutions.",

      href: "/plc-programming/",

      icon: Cpu,
    },

    {
      id: 2,

      title: "HMI Programming",

      description:
        "Industrial HMI development, machine visualization, alarms, trends and operator control screens.",

      href: "/services",

      icon: Monitor,
    },
  ],

  cta: {
    title: "Need VFD Programming or Drive Support?",

    description:
      "Contact A-ONE Automation Solutions for VFD programming, parameter setting, troubleshooting, PLC integration and drive commissioning services in Pithampur, Indore and Madhya Pradesh.",

    buttonText: "Request VFD Support",

    href: "/contact",
  },
};

export default function VFDServicesPage() {
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
                Request VFD Support
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

                <span className="font-semibold text-secondary">
                  {brand}
                </span>
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
                <CheckCircle2
                  size={20}
                  className="text-blue-400"
                />

                <span className="text-gray-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}

      <section className="py-20">
        <div className="mx-auto max-w-[1500px] px-5">
          <div className="mb-12 text-center">
            <Factory
              className="mx-auto text-primary"
              size={40}
            />

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
                <Zap
                  size={20}
                  className="text-primary"
                />

                <span className="font-semibold text-secondary">
                  {item}
                </span>
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
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={21}
                    className="text-primary"
                  />

                  <span className="text-[17px] text-gray-700">
                    {item}
                  </span>
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
                  <Icon
                    className="text-primary"
                    size={35}
                  />

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