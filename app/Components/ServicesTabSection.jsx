"use client";

import { useMemo, useState } from "react";
import {
  Cpu,
  Cog,
  Monitor,
  Wrench,
  Shield,
  Gauge,
  ArrowRight,
} from "lucide-react";

const servicesData = {
  tabs: [
    "All",
    "Manufacturing",
    "Factory Automation",
    "Motor Control",
    "Process Control",
    "Industrial Maintenance",
    "Industrial Plants",
  ],

  services: [
    {
      id: 1,
      category: "Manufacturing",
      title: "Control Panel Manufacturing",
      description:
        "Custom-designed control panels including Fire Fighting Panels, APFC Panels, VFD Panels and Industrial PLC Control Panels.",

      image: "/images/services/service-1.jpg",

      icon: Cpu,

      industries: [
        "Manufacturing",
        "Commercial Buildings",
        "Industrial Plants",
      ],
    },

    {
      id: 2,
      category: "Factory Automation",
      title: "PLC Programming & Automation",

      description:
        "Advanced Industrial PLC programming and complete automation solutions using Siemens, Delta and Mitsubishi PLCs.",

      image: "/images/services/service-2.jpg",

      icon: Cog,

      industries: [
        "Factory Automation",
        "Process Industries",
        "Material Handling",
      ],
    },

    {
      id: 3,
      category: "Motor Control",

      title: "VFD & Drive Services",

      description:
        "Complete VFD installation, programming and repair services with expert troubleshooting.",

      image: "/images/services/service-3.jpg",

      icon: Gauge,

      industries: [
        "Motor Control",
        "Energy Management",
        "Industrial Machinery",
      ],
    },

    {
      id: 4,
      category: "Process Control",

      title: "HMI Solutions",

      description:
        "Human Machine Interface installation and programming using Delta, Weintek and Siemens HMI.",

      image: "/images/services/service-4.jpg",

      icon: Monitor,

      industries: [
        "Process Control",
        "Manufacturing",
        "Automation Systems",
      ],
    },

    {
      id: 5,
      category: "Industrial Maintenance",

      title: "PLC & VFD Repair",

      description:
        "Professional repair services for PLC, VFD, Servo Drives and HMI systems.",

      image: "/images/services/service-5.jpg",

      icon: Wrench,

      industries: [
        "Industrial Maintenance",
        "Manufacturing Support",
        "Emergency Repairs",
      ],
    },

    {
      id: 6,
      category: "Industrial Plants",

      title: "Electrical AMC Services",

      description:
        "Comprehensive Annual Maintenance Contracts for electrical and automation equipment.",

      image: "/images/services/service-6.jpg",

      icon: Shield,

      industries: [
        "Industrial Plants",
        "Commercial Complexes",
        "Manufacturing Units",
      ],
    },
  ],
};

export default function ServicesTabSection() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredServices = useMemo(() => {
    if (activeTab === "All") {
      return servicesData.services;
    }

    return servicesData.services.filter(
      (service) => service.category === activeTab
    );
  }, [activeTab]);

  return (
    <section className="w-full bg-[#f8fafc] py-24">
      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        {/* Tabs */}

        <div className="mb-14 flex flex-wrap justify-center gap-4">

          {servicesData.tabs.map((tab) => (

            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-300

              ${
                activeTab === tab
                  ? "bg-[#ef233c] border-[#ef233c] text-white shadow-lg shadow-red-500/30"
                  : "border-gray-200 bg-white text-[#162238] hover:border-red-200 hover:bg-red-50 hover:text-[#ef233c]"
              }

              `}
            >
              {tab}
            </button>

          ))}

        </div>

        {/* Cards Grid */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {/* PART-2 STARTS FROM HERE */}

         {filteredServices.map((service) => {
  const Icon = service.icon;

  return (
    <div
      key={service.id}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#162238] via-[#162238]/70 to-transparent" />

        {/* Icon */}
        <div className="absolute bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#ef233c] shadow-xl shadow-red-500/30 transition duration-300 group-hover:scale-110">
          <Icon className="text-white" size={24} />
        </div>

        {/* Title */}
        <div className="absolute bottom-6 left-24 right-6">
          <h3 className="text-[21px] font-bold leading-tight text-white">
            {service.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-7">
        <p className="leading-8 text-[18px] text-gray-600">
          {service.description}
        </p>

        {/* Industries */}
        <div className="mt-7">
          <h4 className="mb-3 text-sm font-semibold text-[#162238]">
            Industries Served:
          </h4>

          <div className="flex flex-wrap gap-2">
            {service.industries.map((industry) => (
              <span
                key={industry}
                className="rounded-full border border-red-100 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-600 transition duration-300 hover:bg-[#ef233c] hover:text-white"
              >
                {industry}
              </span>
            ))}
          </div>
        </div>

        {/* Button */}
        <button className="group/button mt-8 inline-flex items-center gap-2 font-semibold text-[#ef233c] transition-all duration-300 hover:gap-4">
          Get Quote

          <ArrowRight
            size={18}
            className="transition-transform duration-300 group-hover/button:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
})}
        </div>

      </div>
    </section>
  );
}