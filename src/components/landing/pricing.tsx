import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Try Us First",
      price: "$199",
      period: "one-time",
      description: "21 Days Unlimited",
      features: [
        "Unlimited classes for 21 days",
        "Foundations coaching included",
        "No commitment required",
        "Full facility access",
      ],
      cta: "Start Your Trial",
      featured: false,
    },
    {
      name: "Most Popular",
      price: "$165",
      period: "/month",
      description: "Unlimited Membership",
      features: [
        "Unlimited classes per month",
        "All class types included",
        "Open gym access",
        "Member app & tracking",
      ],
      cta: "Get Started",
      featured: true,
    },
    {
      name: "Flexible Schedule",
      price: "$135",
      period: "/month",
      description: "12 Classes/Month",
      features: [
        "12 classes per month",
        "All class types included",
        "Roll over unused classes",
        "Open gym access",
      ],
      cta: "Choose This Plan",
      featured: false,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            No contracts. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 ${
                plan.featured
                  ? "bg-orange-600 text-white shadow-2xl scale-105 border-4 border-orange-600"
                  : "bg-white text-gray-900 shadow-lg border-2 border-gray-200"
              } transition-all hover:shadow-xl`}
            >
              {plan.featured && (
                <div className="text-center mb-4">
                  <span className="inline-block bg-white text-orange-600 px-4 py-1 rounded-full text-sm font-bold">
                    {plan.name}
                  </span>
                </div>
              )}
              {!plan.featured && (
                <div className="text-center mb-4">
                  <span className="text-lg font-semibold">{plan.name}</span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span
                    className={`text-lg ${plan.featured ? "text-white/80" : "text-gray-600"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-lg font-medium mt-2 ${
                    plan.featured ? "text-white/90" : "text-gray-700"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.featured ? "text-white" : "text-orange-600"
                      }`}
                    />
                    <span className={plan.featured ? "text-white" : "text-gray-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-6 text-lg font-semibold ${
                  plan.featured
                    ? "bg-white text-orange-600 hover:bg-gray-100"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-gray-900 mb-3">Additional Options Available:</p>
          <div className="flex flex-wrap justify-center gap-4 text-gray-700">
            <span>• Drop-in: $25/class</span>
            <span>• 10-Class Pack: $200 (save $50)</span>
            <span>• Free No Sweat Intro Consultation</span>
          </div>
          <button className="mt-6 text-orange-600 hover:text-orange-700 font-medium">
            Questions about pricing? Contact us →
          </button>
        </div>
      </div>
    </section>
  );
}
