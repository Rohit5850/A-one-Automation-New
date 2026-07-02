import {
  Zap,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Expert Technical Team",
    description:
      "Experienced engineers with deep expertise in PLC programming, VFD systems, and industrial automation.",
    iconBg: "bg-blue-100",
    iconColor: "text-primary",
  },
  {
    icon: ShieldCheck,
    title: "Quality & Safety First",
    description:
      "All installations comply with industrial safety standards. Quality components and reliable workmanship.",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description:
      "Quick response for emergency repairs and technical support. Always available when you need us.",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#F8FAFC] py-20">
      <div className="mx-auto max-w-[1500px] px-5">

        {/* Heading */}

        <div className="text-center">

          <h2 className="text-3xl font-bold text-secondary md:text-5xl">
            Why Choose{" "}
            <span className="text-primary">
              A-one Automation Solution
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Trusted partner for industrial automation and
            electrical solutions across Madhya Pradesh
          </p>

        </div>

        {/* Cards */}

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-2xl"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <Icon
                    className={`${item.iconColor}`}
                    size={34}
                    strokeWidth={2}
                  />
                </div>

                <h3 className="mt-8 text-3xl font-bold text-secondary">
                  {item.title}
                </h3>

                <p className="mt-5 text-lg leading-9 text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}