const certificationHeroData = {
  title: {
    normal: "Certifications &",
    highlight: " Compliance",
  },

  description:
    "Licensed and certified electrical solutions provider committed to safety and quality standards.",
};

export default function CertificationHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#162238] py-15">
      {/* Background Effects */}

      <div className="absolute inset-0">

        {/* Grid */}

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />

        {/* Left Glow */}

        <div className="absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-red-500/10 blur-[150px]" />

        {/* Right Glow */}

        <div className="absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-red-600/10 blur-[160px]" />

      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        <div className="max-w-4xl">

          {/* Title */}

          <h1 className="text-[32px] font-bold leading-tight text-white">

            {certificationHeroData.title.normal}

            <span className="text-[#ef233c]">
              {certificationHeroData.title.highlight}
            </span>

          </h1>

          {/* Description */}

          <p className="mt-4 max-w-[full] text-[18px] leading-9 text-slate-300">
            {certificationHeroData.description}
          </p>

          {/* Accent Line */}

          <div className="mt-4 h-1 w-28 rounded-full bg-[#ef233c]" />

        </div>

      </div>
    </section>
  );
}