"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  MapPin,
  ArrowRight,
} from "lucide-react";

const projectData = {
  filters: [
    "All",
    "Control Panel",
    "Automation",
    "VFD Systems",
    "HMI Solutions",
    "Power Management",
    "Repair Services",
    "AMC Services",
    "Motor Control Centre",
  ],

  projects: [
    {
      id: 1,
      category: "Control Panel",
      title: "Fire Fighting Control Panel Installation",
      image: "/images/projects/project-1.jpg",
      description:
        "Three-phase fire fighting control panel with automatic water pump control system for commercial complex.",
      client: "Perfect Electrical Solutions",
      location: "Indore, MP",
    },

    {
      id: 2,
      category: "Automation",
      title: "Industrial PLC Automation",
      image: "/images/projects/project-2.jpg",
      description:
        "Complete industrial automation solution with Delta PLC programming.",
      client: "Packaging Industry",
      location: "Pithampur, MP",
    },

    {
      id: 3,
      category: "VFD Systems",
      title: "VFD Panel for Cooling Tower",
      image: "/images/projects/project-3.jpg",
      description:
        "Energy-efficient VFD panel with complete installation and commissioning.",
      client: "Cooling Plant",
      location: "Dewas, MP",
    },

    {
      id: 4,
      category: "HMI Solutions",
      title: "HMI Screen Integration",
      image: "/images/projects/project-4.jpg",
      description:
        "HMI programming with PLC integration for industrial process monitoring.",
      client: "Food Processing Unit",
      location: "Indore, MP",
    },

    {
      id: 5,
      category: "Power Management",
      title: "APFC Panel Installation",
      image: "/images/projects/project-5.jpg",
      description:
        "Automatic power factor correction panel for textile industry.",
      client: "Textile Industry",
      location: "Pithampur, MP",
    },

    {
      id: 6,
      category: "Repair Services",
      title: "PLC Repair & Upgradation",
      image: "/images/projects/project-6.jpg",
      description:
        "Complete PLC diagnostics and repair with firmware upgrades.",
      client: "Pharmaceutical Company",
      location: "Indore, MP",
    },

    {
      id: 7,
      category: "Repair Services",
      title: "VFD Drive Repair",
      image: "/images/projects/project-7.jpg",
      description:
        "Expert repair and testing of industrial VFD drives.",
      client: "CNC Machine Shop",
      location: "Pithampur, MP",
    },

    {
      id: 8,
      category: "AMC Services",
      title: "Electrical AMC Service",
      image: "/images/projects/project-8.jpg",
      description:
        "Annual maintenance contract for industrial electrical systems.",
      client: "Auto Component Manufacturer",
      location: "Pithampur, MP",
    },

    {
      id: 9,
      category: "Motor Control Centre",
      title: "Motor Control Centre",
      image: "/images/projects/project-9.jpg",
      description:
        "Custom MCC design and installation for production plants.",
      client: "Packaging Industry",
      location: "Dewas, MP",
    },

    {
      id: 10,
      category: "Control Panel",
      title: "Industrial Control Panel Upgrade",
      image: "/images/projects/project-10.jpg",
      description:
        "Modernization of industrial control panels using latest components.",
      client: "Chemical Processing Plant",
      location: "Indore, MP",
    },
  ],
};

export default function ProjectsFilterSection() {

  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProjects = useMemo(() => {

    if (activeFilter === "All") {
      return projectData.projects;
    }

    return projectData.projects.filter(
      (item) => item.category === activeFilter
    );

  }, [activeFilter]);

  return (

    <section className="w-full bg-[#f8fafc] py-20">

      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        {/* Filter */}

        <div className="mb-10 flex flex-wrap items-center gap-4">

          <div className="flex items-center gap-2 font-semibold text-[#162238]">

            <Filter size={18} />

            <span>Filter:</span>

          </div>

          {projectData.filters.map((filter) => (

            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-xl border px-6 py-3 text-sm font-semibold transition-all duration-300

              ${
                activeFilter === filter
                  ? "border-[#ef233c] bg-[#ef233c] text-white shadow-lg shadow-red-500/20"
                  : "border-gray-200 bg-white text-[#162238] hover:border-red-200 hover:bg-red-50 hover:text-[#ef233c]"
              }

              `}
            >
              {filter}
            </button>

          ))}

        </div>

        {/* Count */}

        <div className="mb-8 text-sm font-medium text-slate-600">

          Showing
          <span className="mx-1 font-bold text-[#ef233c]">
            {filteredProjects.length}
          </span>
          Projects

        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {/* PART-2 HERE */}

          {filteredProjects.map((project) => (
  <div
    key={project.id}
    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
  >
    {/* Image */}

    <div className="relative h-72 overflow-hidden">

      <img
        src={project.image}
        alt={project.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-gradient-to-t from-[#162238] via-[#162238]/50 to-transparent" />

      {/* Project Number */}

      <div className="absolute left-4 top-4 rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#162238] shadow">
        #{project.id}
      </div>

      {/* Category */}

      <div className="absolute right-4 top-4 rounded-full bg-[#ef233c] px-4 py-1 text-xs font-semibold text-white shadow-lg">
        {project.category}
      </div>

      {/* Bottom Content */}

      <div className="absolute bottom-6 left-6 right-6">

        <h3 className="text-3xl font-bold leading-tight text-white">
          {project.title}
        </h3>

      </div>

    </div>

    {/* Card Body */}

    <div className="p-7">

      <p className="leading-8 text-slate-600">
        {project.description}
      </p>

      {/* Divider */}

      <div className="my-6 h-px bg-gray-200" />

      {/* Client */}

      <div className="mb-4">

        <p className="text-sm font-semibold text-[#162238]">
          Client:
        </p>

        <p className="mt-1 text-slate-600">
          {project.client}
        </p>

      </div>

      {/* Location */}

      <div className="mb-8 flex items-center gap-2 text-slate-600">

        <MapPin
          size={16}
          className="text-[#ef233c]"
        />

        <span>{project.location}</span>

      </div>

      {/* Button */}

      <button className="group/button inline-flex items-center gap-2 font-semibold text-[#ef233c] transition-all duration-300 hover:gap-4">

        View Project

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover/button:translate-x-1"
        />

      </button>

    </div>
  </div>
))}

        </div>

      </div>

    </section>

  );

}