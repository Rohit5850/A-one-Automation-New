const pageBannerData = {
  title: {
    normal: "Our",
    highlight: " Services",
  },

  description:
    "Comprehensive electrical and automation solutions for your industrial needs",
};

export default function ServiceHeroSection(){
  return (
    <section className="relative overflow-hidden bg-[#162238] py-24">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div className="absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-400/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 lg:px-8">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-bold leading-tight text-white lg:text-6xl">
            {pageBannerData.title.normal}
            <span className="text-red-500">
              {pageBannerData.title.highlight}
            </span>
          </h1>

          <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-300">
            {pageBannerData.description}
          </p>

          {/* Bottom Accent Line */}
          <div className="mt-8 h-1 w-24 rounded-full bg-red-500"></div>
        </div>
      </div>
    </section>
  );
}