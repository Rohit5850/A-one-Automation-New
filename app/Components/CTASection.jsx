import { Phone, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-[1500px] px-5">

        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Ready to Start Your Project?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
            Get expert consultation and competitive quotes for your
            electrical and automation needs.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">

            <a
              href="tel:+917489174850"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-10 py-5 text-lg font-semibold text-primary transition duration-300 hover:-translate-y-1 hover:bg-gray-100"
            >
              <Phone size={22} />
              Call: +91-7489174850
            </a>

            <button className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/30 bg-white/10 px-10 py-5 text-lg font-semibold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-primary">
              Send Inquiry
              <ArrowRight size={22} />
            </button>

          </div>

        </div>

      </div>
    </section>
  );
}