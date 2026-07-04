import Image from "next/image";
import Link from "next/link";

export default function ContactHero() {
  return (
    <section className="relative w-full overflow-hidden">

      {/* Page Width */}
      <div className="max-w-[1500px] mx-auto relative h-[260px] sm:h-[320px] md:h-[400px] lg:h-[450px]">

        {/* Background Image */}
        <Image
          src="/images/contact/banner_img.png"
          alt="Contact Banner"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071528]/95 via-[#071528]/75 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center">

          <div className="w-full max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-16">

            <div className="max-w-xl">

              {/* Badge */}

              <span className="inline-flex items-center rounded-full bg-blue-600/20 border border-blue-400/20 px-5 py-2 text-sm font-medium text-white">
                Contact Us
              </span>

              {/* Heading */}

              <h1 className="mt-6 text-white font-bold leading-tight
              text-4xl
              sm:text-5xl
              md:text-6xl">

                Get In Touch

              </h1>

              {/* Paragraph */}

              <p className="mt-5 text-gray-300 leading-8
              text-base
              md:text-lg">

                We are here to help you with the best industrial automation
                and electrical solutions.

              </p>

              {/* Breadcrumb */}

              <div className="mt-8 flex items-center gap-3 text-sm">

                <Link
                  href="/"
                  className="text-white hover:text-red-500 transition"
                >
                  Home
                </Link>

                <span className="text-gray-400">/</span>

                <span className="text-red-500 font-medium">
                  Contact Us
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}