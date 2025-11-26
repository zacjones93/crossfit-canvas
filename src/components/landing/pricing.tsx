"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const PLANS_URLS = {
  "classPack": "https://canvas.pushpress.com/landing/plans/plan_91a3a83ae76cf7",
  "unlimitedMembership": "https://canvas.pushpress.com/landing/plans/plan_9e9a199f39f4f8",
  "flexibleSchedule13": "https://canvas.pushpress.com/landing/plans/plan_766d9a593e8a76",
  "flexibleSchedule9": "https://canvas.pushpress.com/landing/plans/plan_be817dbd9d1430",
  "openGymOnly": "https://canvas.pushpress.com/landing/plans/plan_8fa3451b688ac9",
  "oneWeekDropIn": "https://canvas.pushpress.com/landing/plans/plan_3f8d7b94131578",
} as const;

export function Pricing() {
  const [flexibleVariant, setFlexibleVariant] = useState<"13" | "9">("13");

  const plans = [
    {
      name: "TRY US FIRST",
      price: "$169",
      period: "one-time",
      description: "10-Class Pack",
      features: ["10 classes", "All class types included", "Open gym access (with discounted upgrade)"],
      cta: "GET STARTED",
      featured: false,
      href: PLANS_URLS.classPack,
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
      href: PLANS_URLS.unlimitedMembership,
    },
    {
      name: "FLEXIBLE SCHEDULE",
      variants: [
        {
          id: "13",
          label: "13/month",
          price: "$35",
          period: "/week",
          description: "13 Classes/Month",
          features: [
            "13 classes per month",
            "All class types included",
            "Member app & tracking",
            "Open gym access (with discounted upgrade)",
          ],
          href: PLANS_URLS.flexibleSchedule13,
        },
        {
          id: "9",
          label: "9/month",
          price: "$25",
          period: "/week",
          description: "9 Classes/Month",
          features: [
            "9 classes per month",
            "All class types included",
            "Member app & tracking",
            "Open gym access (with discounted upgrade)",
          ],
          href: PLANS_URLS.flexibleSchedule9,
        },
      ],
      defaultVariant: "13",
      cta: "GET STARTED",
      featured: false,
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
          {plans.map((plan, index) => {
            // Check if plan has variants
            const hasVariants = 'variants' in plan && Array.isArray(plan.variants);
            const currentVariant = hasVariants && plan.variants
              ? plan.variants.find((v) => v.id === flexibleVariant) || plan.variants[0]
              : null;

            // Compute display values
            const displayPrice = hasVariants && currentVariant ? currentVariant.price : plan.price;
            const displayPeriod = hasVariants && currentVariant ? currentVariant.period : plan.period;
            const displayDescription = hasVariants && currentVariant ? currentVariant.label : plan.description;
            const displayFeatures = hasVariants && currentVariant ? currentVariant.features : (plan.features || []);
            const displayHref = hasVariants && currentVariant ? currentVariant.href : plan.href;

            return (
              <div
                key={index}
                className={`bg-white overflow-hidden rounded-sm ${
                  plan.featured
                    ? "md:scale-110 relative order-first md:order-none"
                    : ""
                } transition-all hover:-translate-y-[2px]`}
              >
                <div className="p-8 h-full flex flex-col justify-between">
                  {/* Plan name */}
                  <div>
                    <div className="text-center mb-6">
                      <span
                        className={`font-subheading text-sm font-bold tracking-wider ${
                          plan.featured ? "text-black" : "text-charcoal-medium"
                        }`}
                      >
                        {plan.name}
                      </span>
                    </div>

                    {/* Variant Toggle - only show if plan has variants */}
                    {hasVariants && (
                      <Tabs
                        value={flexibleVariant}
                        onValueChange={(value) => setFlexibleVariant(value as "13" | "9")}
                        className="mb-4"
                      >
                        <TabsList className="grid w-full max-w-[240px] mx-auto grid-cols-2">
                          <TabsTrigger value="13" className="text-xs font-bold uppercase">
                            13/month
                          </TabsTrigger>
                          <TabsTrigger value="9" className="text-xs font-bold uppercase">
                            9/month
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}

                    {/* Price with animation */}
                    <div
                      key={hasVariants ? flexibleVariant : 'static'}
                      className="text-center mb-2 animate-in fade-in duration-200"
                    >
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="font-heading text-6xl text-black">
                          {displayPrice}
                        </span>
                        <span className="font-sans text-lg text-charcoal-medium">
                          {displayPeriod}
                        </span>
                      </div>
                      <p className="font-heading text-xl text-black mt-2 tracking-wide">
                        {displayDescription}
                      </p>
                    </div>

                    {/* Red brush stroke divider */}
                    <div className="h-[2px] bg-black my-6 mx-auto w-16" />

                    {/* Features with animation */}
                    <ul
                      key={hasVariants ? `${flexibleVariant}-features` : 'static-features'}
                      className="space-y-3 mb-8 animate-in fade-in duration-200 mx-auto w-fit"
                    >
                      {displayFeatures.map((feature, featureIndex) => (
                        <li key={featureIndex}>
                          <div className="flex justify-start items-center gap-3">
                            <Check
                              className="w-5 h-5 mt-0.5 flex-shrink-0 text-black"
                              strokeWidth={3}
                            />
                            <span className="font-sans text-sm text-charcoal-medium max-w-[20ch]">
                              {feature}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* CTA Button */}
                  <Button
                    asChild
                    className={`w-full py-6 text-base font-bold uppercase rounded-sm ${
                      plan.featured
                        ? "bg-black hover:bg-white hover:text-black hover:border-black border border-transparent text-white"
                        : "bg-black hover:bg-charcoal-dark text-white"
                    } transition-all`}
                    size="lg"
                  >
                    <a href={displayHref} target="_blank" rel="noopener noreferrer">
                      {plan.cta}
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Options */}
        <div className="mt-16 text-center">
          <p className="font-subheading text-lg font-bold text-white mb-4">
            Additional Options Available:
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white/80 font-sans">
            <Link
                href={PLANS_URLS.openGymOnly}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
              • Open Gym Only: $65/month
            </Link>
            <Link href="/drop-in" className="hover:text-white transition-colors">
              • Drop-in: $20/class
            </Link>
            <Link
              href={PLANS_URLS.oneWeekDropIn}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              • 1 Week Drop-In: $45
            </Link>
            <Link
              href="/tour"
              className="hover:text-white transition-colors"
            >
              • Free No Sweat Intro Consultation
            </Link>
          </div>
          <a
            href="/contact"
            className="group mt-6 text-white/80 hover:text-white font-medium inline-block"
          >
            <span className="relative">
              Questions about pricing? Contact us
              <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-white/80 group-hover:bg-white transform origin-left transition-transform group-hover:scale-x-110" />
            </span>
            <span className="ml-1 transition-transform group-hover:translate-x-1 inline-block">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
