const pageBannerData = {
  title: {
    normal: "Our",
    highlight: " Projects",
  },

  description:
    "Real work, real results. Completed projects across various industries in Madhya Pradesh.",
};

export default function ProjectHeroSection() {
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

        {/* Glow */}

        <div className="absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-red-500/10 blur-[140px]" />

        <div className="absolute right-0 top-0 h-[450px] w-[450px] rounded-full bg-red-600/10 blur-[150px]" />

      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 lg:px-8">

        <div className="max-w-3xl">

          {/* Title */}

          <h1 className="text-[32px] font-bold leading-tight text-white">

            {pageBannerData.title.normal}

            <span className="text-[#ef233c]">
              {pageBannerData.title.highlight}
            </span>

          </h1>

          {/* Description */}

          <p className="mt-2 max-w-full text-[18px] leading-9 text-slate-300">
            {pageBannerData.description}
          </p>

          {/* Bottom Accent */}

          <div className="mt-4 h-1 w-24 rounded-full bg-[#ef233c]" />

        </div>

      </div>
    </section>
  );
}