"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

const categories = [
  "All",
  "PLC Panels",
  "Control Panels",
  "HMI & SCADA",
  "Installation & Site Work",
  "Industrial Projects",
  "Custom Solutions",
];

const projects = [
  {
    id: 1,
    title: "PLC Control Panel",
    category: "PLC Panels",
    location: "Ahmedabad, Gujarat",
    image: "/images/gallery/plc-control-panel.jpg",
  },
  {
    id: 2,
    title: "HMI Panel Integration",
    category: "HMI & SCADA",
    location: "Pune, Maharashtra",
    image: "/images/gallery/hmi-panel.jpg",
  },
  {
    id: 3,
    title: "Motor Control Center (MCC)",
    category: "Control Panels",
    location: "Vadodara, Gujarat",
    image: "/images/gallery/mcc-panel.jpg",
  },
  {
    id: 4,
    title: "On-Site Installation",
    category: "Installation & Site Work",
    location: "Surat, Gujarat",
    image: "/images/gallery/site-installation.jpg",
  },
  {
    id: 5,
    title: "Automation for Textile Plant",
    category: "Industrial Projects",
    location: "Bhilwara, Rajasthan",
    image: "/images/gallery/textile-automation.jpg",
  },
  {
    id: 6,
    title: "Custom Control Panel",
    category: "Custom Solutions",
    location: "Indore, Madhya Pradesh",
    image: "/images/gallery/custom-panel.jpg",
  },
  {
    id: 7,
    title: "Material Handling Automation",
    category: "Industrial Projects",
    location: "Mumbai, Maharashtra",
    image: "/images/gallery/material-handling.jpg",
  },
  {
    id: 8,
    title: "VFD Panel",
    category: "PLC Panels",
    location: "Rajkot, Gujarat",
    image: "/images/gallery/vfd-panel.jpg",
  },
];

const reviews = [
  {
    id: 1,
    name: "Rahul Mehta",
    designation: "Project Head, Shree Textiles",
    review:
      "Excellent service and professional team. The quality of the control panel and support was outstanding.",
    rating: 5,
    avatar: "/images/reviews/client-1.jpg",
  },
  {
    id: 2,
    name: "Pooja Sharma",
    designation: "Operations Manager, Aarya Foods",
    review:
      "Very reliable and responsive team. They delivered our project on time with great quality.",
    rating: 5,
    avatar: "/images/reviews/client-2.jpg",
  },
  {
    id: 3,
    name: "Vikram Patel",
    designation: "Director, Patel Industries",
    review:
      "Best industrial automation solutions provider. Highly recommended!",
    rating: 5,
    avatar: "/images/reviews/client-3.jpg",
  },
  {
    id: 4,
    name: "Amit Singh",
    designation: "CEO, Singh Agro",
    review:
      "Great technical knowledge and after-sales support. We are fully satisfied with their work.",
    rating: 5,
    avatar: "/images/reviews/client-4.jpg",
  },
];

function LocationIcon() {
  return (
    <svg
      className="h-[17px] w-[17px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-5.5 7-12a7 7 0 10-14 0c0 6.5 7 12 7 12z"
      />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
    </svg>
  );
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const categoryMatch =
        activeCategory === "All" || project.category === activeCategory;

      const searchMatch =
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.location.toLowerCase().includes(search.toLowerCase()) ||
        project.category.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#0b1528]">

      {/* ================= HERO ================= */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        <div className="relative mx-auto min-h-[400px] max-w-[1500px] overflow-hidden rounded-[16px] bg-[#061b2e] md:min-h-[420px]">
          
          <Image
            src="/images/gallery/gallery-hero.jpg"
            alt="Industrial automation engineer working on control panel"
            fill
            priority
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#061b2e]/95 via-[#061b2e]/75 to-[#061b2e]/20" />

          <div className="relative z-10 flex min-h-[400px] flex-col justify-between px-6 py-8 text-white sm:px-10 md:min-h-[420px] md:px-12 md:py-10 lg:px-16">
            
            <div>
              <div className="mb-5 flex items-center gap-3 text-sm text-white/80">
                <span>Home</span>
                <span>›</span>
                <span className="font-semibold text-white">Gallery</span>
              </div>

              <h1 className="text-[42px] font-bold leading-[1.05] tracking-[-1.5px] sm:text-[52px] lg:text-[60px]">
                Our Gallery
              </h1>

              <p className="mt-4 max-w-[570px] text-[16px] leading-7 text-white/90 sm:text-[17px]">
                A glimpse of our work, innovation and successful projects
                across industries.
              </p>
            </div>

            <div className="mt-10 grid max-w-[700px] grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                ["100+", "Projects"],
                ["50+", "Happy Clients"],
                ["10+", "Industries"],
                ["5+", "Years of Excellence"],
              ].map(([number, label]) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                    <span className="text-lg">◫</span>
                  </div>

                  <div>
                    <div className="text-[20px] font-bold">{number}</div>
                    <div className="text-[12px] text-white/80">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute right-6 top-7 z-20 hidden items-center gap-4 rounded-xl bg-[#061827]/85 px-6 py-4 text-white shadow-xl backdrop-blur-md sm:flex lg:right-10 lg:top-10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold">
              ✓
            </div>
            <div>
              <p className="text-[22px] font-bold leading-none">100+</p>
              <p className="mt-1 text-[11px] text-white/80">
                Projects Completed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-[70px]">
        <div className="mx-auto max-w-[1500px]">
          
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-[14px] font-bold uppercase tracking-wide text-[#0878e8]">
                Our Work
              </p>

              <h2 className="text-[34px] font-bold tracking-[-1px] sm:text-[42px]">
                Project Gallery
              </h2>

              <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-slate-600">
                Explore our latest projects, panel installations, site work and
                industrial automation solutions that power businesses across
                India.
              </p>
            </div>

            <div className="flex h-[52px] w-full items-center rounded-xl bg-[#f3f6fa] px-5 lg:w-[360px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search gallery..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              <SearchIcon />
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-8 flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-6 py-[11px] text-[13px] font-semibold transition-all duration-200 ${
                  activeCategory === category
                    ? "border-[#00528c] bg-[#00528c] text-white shadow-md"
                    : "border-slate-200 bg-white text-[#111827] hover:border-[#00528c] hover:text-[#00528c]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* PROJECT GRID */}
          <div className="mt-7 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <article key={project.id} className="group">
                <div
                  onClick={() => setSelectedImage(project)}
                  className="relative aspect-[1.6/1] cursor-pointer overflow-hidden rounded-[10px] bg-slate-100"
                >
                  <Image
                    src={project.image}
                    alt={`${project.title} - ${project.location}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <button
                    aria-label={`View ${project.title}`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#101827] shadow-md"
                  >
                    <ZoomIcon />
                  </button>

                  <span className="absolute bottom-0 left-3 rounded-t-[7px] bg-[#cceaff] px-3 py-[6px] text-[11px] font-semibold text-[#00518c]">
                    {project.category}
                  </span>
                </div>

                <h3 className="mt-3 text-[17px] font-bold leading-6 text-[#101827]">
                  {project.title}
                </h3>

                <div className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-600">
                  <LocationIcon />
                  <span>{project.location}</span>
                </div>
              </article>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No projects found.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another category or search term.
              </p>
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div className="mt-12 flex justify-center">
              <button className="flex items-center gap-3 rounded-lg border border-[#00528c] px-7 py-3.5 text-[13px] font-semibold text-[#00528c] transition hover:bg-[#00528c] hover:text-white">
                Load More Projects
                <span>↓</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="bg-gradient-to-b from-[#f1f9ff] to-[#f7fbff] px-4 py-14 sm:px-6 lg:px-8 lg:py-[65px]">
        <div className="mx-auto max-w-[1500px]">
          
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[14px] font-bold uppercase tracking-wide text-[#0878e8]">
                Testimonials
              </p>

              <h2 className="text-[34px] font-bold tracking-[-1px] sm:text-[42px]">
                What Our Clients Say
              </h2>

              <p className="mt-2 text-[15px] text-slate-600">
                Real feedback from our valued clients who trust us for reliable
                automation solutions.
              </p>
            </div>

            <button className="flex h-[48px] shrink-0 items-center justify-center gap-2 rounded-lg bg-[#00528c] px-6 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#003f6c]">
              ✎
              Write a Review
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex min-h-[270px] flex-col rounded-xl border border-white bg-white p-6 shadow-[0_8px_30px_rgba(15,61,91,0.05)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e7f4ff] text-[22px] font-bold leading-none text-[#005ea8]">
                    “
                  </div>

                  <div className="flex gap-[2px] text-[17px] text-[#ffb000]">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <span key={index}>★</span>
                    ))}
                  </div>
                </div>

                <p className="mt-5 flex-1 text-[14px] leading-[1.65] text-slate-700">
                  “{review.review}”
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-[44px] w-[44px] shrink-0 overflow-hidden rounded-full bg-slate-200">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-[#07366b]">
                      {review.name}
                    </h3>
                    <p className="mt-[2px] text-[11px] text-slate-500">
                      {review.designation}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 flex justify-center gap-2">
            <span className="h-[7px] w-5 rounded-full bg-[#00528c]" />
            <span className="h-[7px] w-[7px] rounded-full bg-slate-300" />
            <span className="h-[7px] w-[7px] rounded-full bg-slate-300" />
            <span className="h-[7px] w-[7px] rounded-full bg-slate-300" />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-r from-[#00487d] via-[#005b9f] to-[#0067a9] px-7 py-9 text-white sm:px-10 lg:px-16 lg:py-11">
            
            <div className="absolute -bottom-40 left-[40%] h-[350px] w-[350px] rotate-45 bg-white/[0.035]" />
            <div className="absolute -bottom-52 left-[53%] h-[420px] w-[420px] rotate-45 bg-white/[0.025]" />

            <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wide text-white/75">
                  Let's Work Together
                </p>

                <h2 className="mt-2 text-[31px] font-bold tracking-[-0.5px] sm:text-[38px]">
                  Have a Project in Mind?
                </h2>

                <p className="mt-2 text-[14px] text-white/85">
                  Get in touch with our team and let's build something great
                  together.
                </p>
              </div>

              <a
                href="/contact"
                className="flex h-[52px] w-fit min-w-[170px] items-center justify-center gap-4 rounded-lg bg-white px-7 text-[14px] font-semibold text-[#003e70] shadow-lg transition hover:-translate-y-0.5"
              >
                Contact Us
                <span className="text-xl">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= IMAGE LIGHTBOX ================= */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-medium text-black"
          >
            ×
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1100px]"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black">
              <Image
                src={selectedImage.image}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="mt-4 text-white">
              <h3 className="text-xl font-bold">{selectedImage.title}</h3>
              <p className="mt-1 text-sm text-white/70">
                {selectedImage.location}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}