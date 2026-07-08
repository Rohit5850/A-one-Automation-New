"use client";

import { useState , useEffect } from "react";
import {  FileBadge,  BadgeCheck,  Eye,  X, } from "lucide-react";


const certificationData = {
  title: {
    normal: "Current",
    highlight: " Certifications",
  },

  subtitle:
    "Official business registrations and certifications.",

  certificates: [
    {
      id: 1,
      title: "GST Registration",
      number: "23DTVPK2579B1ZG",
      description:
        "Government registered electrical solutions provider.",

      icon: FileBadge,

      image: "/images/certificates/gst.jpg",
    },

    {
      id: 2,
      title: "MSME Registration",
      number: "UDYAM-MP-01-XXXXXXXX",

      description:
        "Registered Micro, Small & Medium Enterprise.",

      icon: BadgeCheck,

      image: "/images/certificates/msme.jpg",
    },
  ],
};

export default function CertificationSection() {

  const [selectedCertificate, setSelectedCertificate] =
    useState(null);



    useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setSelectedCertificate(null);
    }
  };

  if (selectedCertificate) {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [selectedCertificate]);




  return (

    <section className="bg-white py-24">

      <div className="mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        {/* Heading */}

        <div className="mb-10 text-center">

          <h2 className="text-[32px] font-bold text-[#162238]">

            {certificationData.title.normal}

            <span className="text-[#ef233c]">
              {certificationData.title.highlight}
            </span>

          </h2>

          <p className="mt-2 text-[18px] text-slate-600">

            {certificationData.subtitle}

          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {certificationData.certificates.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-red-200 hover:shadow-2xl"
              >

                {/* Icon */}

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 transition duration-300 group-hover:bg-[#ef233c]">

                  <Icon
                    size={36}
                    className="text-[#ef233c] group-hover:text-white"
                  />

                </div>

                {/* Title */}

                <h3 className="mt-8 text-[21px] font-bold text-[#162238]">

                  {item.title}

                </h3>

                {/* Number */}

                <div className="mt-5 inline-flex rounded-lg bg-slate-100 px-5 py-2 text-sm font-medium text-slate-700">

                  {item.number}

                </div>

                {/* Description */}

                <p className="mt-6 text-[18px] leading-8 text-slate-600">

                  {item.description}

                </p>

                {/* Preview Button */}

                <button
                  onClick={() =>
                    setSelectedCertificate(item)
                  }
                  className="group/button mt-8 inline-flex items-center gap-3 font-semibold text-[#ef233c]"
                >

                  <Eye size={18} />

                  Preview Certificate

                </button>

              </div>

            );

          })}

        </div>

      </div>

      {/* PART-2 HERE */}


{selectedCertificate && (
      <div
        onClick={() => setSelectedCertificate(null)}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300"
        >
          {/* Close Button */}

          <button
            onClick={() => setSelectedCertificate(null)}
            className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
          >
            <X size={24} />
          </button>

          {/* Header */}

          <div className="border-b border-slate-200 px-8 py-6">

            <h3 className="text-3xl font-bold text-[#162238]">
              {selectedCertificate.title}
            </h3>

            <p className="mt-2 text-slate-500">
              Certificate Preview
            </p>

          </div>

          {/* Image */}

          <div className="bg-slate-100 p-8">

            <img
              src={selectedCertificate.image}
              alt={selectedCertificate.title}
              className="mx-auto max-h-[75vh] w-auto rounded-xl shadow-xl"
            />

          </div>

        </div>
      </div>
    )}
      

    </section>

  );

}