import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "TRY US FIRST",
      price: "$169",
      period: "one-time",
      description: "10-Class Pack",
      features: [
        "10 classes",
        "All class types included",
        "Open gym access",
      ],
      cta: "GET STARTED",
      featured: false,
      href: "https://canvas.pushpress.com/landing/plans/plan_91a3a83ae76cf7",
    },
    {
      name: "MOST POPULAR",
      price: "$45",
      period: "/week",
      description: "Unlimited Membership",
      features: [
        "Unlimited classes per month",
        "All class types included",
        "Open gym access",
        "Member app & tracking",
      ],
      cta: "GET STARTED",
      featured: true,
      href: "https://canvas.pushpress.com/landing/plans/plan_9e9a199f39f4f8",
    },
    {
      name: "FLEXIBLE SCHEDULE",
      price: "$35",
      period: "/week",
      description: "12 Classes/Month",
      features: [
        "12 classes per month",
        "All class types included",
        "Open gym access",
        "Member app & tracking"
      ],
      cta: "CHOOSE THIS PLAN",
      featured: false,
      href: "https://canvas.pushpress.com/landing/plans/plan_766d9a593e8a76",
    },
  ];

  return (
    <section className="py-20 bg-black relative">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-5xl md:text-6xl uppercase text-white mb-4 tracking-wide">
            Simple, Transparent Pricing
          </h2>
          <p className="font-sans text-xl text-white/80">
            No contracts. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white overflow-hidden ${
                plan.featured
                  ? "shadow-[0_0_0_4px_#DC143C] md:scale-105 relative order-first md:order-none"
                  : "shadow-[0_8px_24px_rgba(255,255,255,0.1)]"
              } transition-all hover:shadow-[0_12px_32px_rgba(220,20,60,0.4)] hover:-translate-y-1`}
            >
              {/* Featured indicator */}
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#DC143C]" />
              )}

              <div className="p-8">
                {/* Plan name */}
                <div className="text-center mb-6">
                  <span className={`font-subheading text-sm font-bold tracking-wider ${
                    plan.featured ? "text-[#DC143C]" : "text-charcoal-medium"
                  }`}>
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div className="text-center mb-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="font-heading text-6xl text-black">{plan.price}</span>
                    <span className="font-sans text-lg text-charcoal-medium">
                      {plan.period}
                    </span>
                  </div>
                  <p className="font-heading text-xl text-black mt-2 tracking-wide">
                    {plan.description}
                  </p>
                </div>

                {/* Red brush stroke divider */}
                <div className="h-[2px] bg-[#DC143C] my-6 mx-auto w-16" />

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#DC143C]"
                        strokeWidth={3}
                      />
                      <span className="font-sans text-sm text-charcoal-medium">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`w-full py-6 text-base font-bold uppercase rounded-[4px] ${
                    plan.featured
                      ? "bg-[#DC143C] hover:bg-[#B01030] text-white shadow-[0_4px_12px_rgba(220,20,60,0.4)]"
                      : "bg-black hover:bg-charcoal-dark text-white"
                  } transition-all`}
                  size="lg"
                >
                  <a href={plan.href} target="_blank" rel="noopener noreferrer">
                    {plan.cta}
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-16 text-center">
          <p className="font-subheading text-lg font-bold text-white mb-4">
            Additional Options Available:
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white/80 font-sans">
            <a href="/schedule" className="hover:text-[#DC143C] transition-colors">
              • Drop-in: $20/class
            </a>
            <a
              href="https://canvas.pushpress.com/landing/plans/plan_3f8d7b94131578"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#DC143C] transition-colors"
            >
              • 1 Week Drop-In: $45
            </a>
            <a
              href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#DC143C] transition-colors"
            >
              • Free No Sweat Intro Consultation
            </a>
          </div>
          <a href="/contact" className="group mt-6 text-[#DC143C] hover:text-[#B01030] font-medium inline-block">
            <span className="relative">
              Questions about pricing? Contact us
              <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#DC143C] transform origin-left transition-transform group-hover:scale-x-110" />
            </span>
            <span className="ml-1 transition-transform group-hover:translate-x-1 inline-block">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
