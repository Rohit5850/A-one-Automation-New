import Image from "next/image";
import {
  Cpu,
  Settings,
  Gauge,
  Monitor,
  Wrench,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";



export default function ServicesSection() {
  const services = [
    {
      id: 1,
      title: "Control Panel Manufacturing",
      description:
        "Custom-designed control panels including Fire Fighting Panels, APFC Panels, VFD Panels and Industrial PLC Control Panels.",
      image: "/images/img-1.jpg",
      icon: Cpu,
      tags: ["Manufacturing", "Commercial Buildings"],
    },
    {
      id: 2,
      title: "PLC Programming & Automation",
      description:
        "Advanced PLC programming and complete automation solutions using Siemens, Delta and Mitsubishi PLCs.",
      image: "/images/img-2.jpg",
      icon: Settings,
      tags: ["Factory Automation", "Process Industries"],
    },
    {
      id: 3,
      title: "VFD & Drive Services",
      description:
        "Installation, programming, troubleshooting and maintenance of Variable Frequency Drives.",
      image: "/images/img-3.webp",
      icon: Gauge,
      tags: ["Motor Control", "Energy Management"],
    },
    {
      id: 4,
      title: "HMI Solutions",
      description:
        "Delta, Weintek, Siemens and DOP HMI programming for industrial automation systems.",
      image: "/images/img-4.jpg",
      icon: Monitor,
      tags: ["Process Control", "Manufacturing"],
    },
    {
      id: 5,
      title: "PLC & VFD Repair",
      description:
        "Professional repair services for PLCs, Servo Drives, HMIs and Variable Frequency Drives.",
      image: "/images/img-5.webp",
      icon: Wrench,
      tags: ["Industrial Maintenance", "Manufacturing Support"],
    },
    {
      id: 6,
      title: "Electrical AMC Services",
      description:
        "Annual Maintenance Contracts for electrical panels and industrial automation systems.",
      image: "/images/img-6.webp",
      icon: ShieldCheck,
      tags: ["Industrial Plants", "Commercial Complexes"],
    },
  ];

  return (
    <section className="bg-white py-24 pt-0">
      <div className="mx-auto max-w-[1500px] px-5">

        {/* Heading */}

        <div className="mb-16 text-center">
          <h2 className="text-[32px] font-bold text-secondary ">
            Our <span className="text-primary">Services</span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-[18px] text-gray-600">
            Comprehensive electrical and automation solutions for industrial
            and commercial applications.
          </p>
        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-2xl"
              >
                {/* Image */}

                <div className="relative h-60 overflow-hidden">

                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                  <div className="absolute bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                    <Icon size={28} />
                  </div>
                </div>

                {/* Content */}

                <div className="p-7">

                  <h3 className="text-[21px] font-bold text-secondary">
                    {service.title}
                  </h3>

                  <p className="mt-4 text-[18px] leading-8 text-gray-600">
                    {service.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Button */}

        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-3 rounded-xl bg-primary px-8 py-4 font-semibold text-white transition hover:bg-secondary">
            View All Services
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}