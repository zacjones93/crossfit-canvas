import { Metadata } from "next";
import {
  Flame,
  Droplets,
  Heart,
  Sparkles,
  Activity,
  Scale,
  Zap,
  Moon,
  Sun,
  Clock,
  CircleDollarSign,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recovery & Wellness | CrossFit Canvas Caldwell",
  description:
    "Enhance your recovery with our Infrared Sauna and NormaTec Compression services at CrossFit Canvas in Caldwell, ID. Wellness memberships and punch cards available.",
};

/**
 * Wellness page showcasing recovery services: Infrared Sauna and NormaTec Compression
 * Includes benefits, best practices, and pricing options
 */
export default function WellnessPage() {
  const saunaBenefits = [
    {
      icon: Droplets,
      title: "Detoxification",
      description: "Sweat out toxins and impurities through deep tissue perspiration",
    },
    {
      icon: Sparkles,
      title: "Relaxation",
      description: "Reduce stress and promote mental clarity through heat therapy",
    },
    {
      icon: Heart,
      title: "Skin Health",
      description: "Improve skin tone, texture, and overall complexion",
    },
    {
      icon: Flame,
      title: "Pain Relief",
      description: "Alleviate muscle aches, joint pain, and chronic discomfort",
    },
    {
      icon: Activity,
      title: "Improved Circulation",
      description: "Enhance blood flow for better oxygen and nutrient delivery",
    },
    {
      icon: Scale,
      title: "Weight Loss",
      description: "Burn calories and support your metabolism naturally",
    },
  ];

  const saunaTimes = [
    {
      icon: Zap,
      title: "Post-Workout",
      time: "20-30 minutes",
      description: "Maximize recovery and reduce muscle soreness after training",
    },
    {
      icon: Sun,
      title: "Morning Sessions",
      time: "15-20 minutes",
      description: "Boost energy and mental clarity to start your day right",
    },
    {
      icon: Moon,
      title: "Evening Sessions",
      time: "20-30 minutes",
      description: "Promote relaxation and improve sleep quality",
    },
  ];

  const normatecBenefits = [
    {
      icon: Activity,
      title: "Reduced Muscle Soreness",
      description: "Accelerate recovery and minimize post-workout discomfort",
    },
    {
      icon: Heart,
      title: "Improved Circulation",
      description: "Enhanced blood flow for faster nutrient delivery to muscles",
    },
    {
      icon: Zap,
      title: "Faster Recovery",
      description: "Get back to training sooner with optimized recovery time",
    },
    {
      icon: Droplets,
      title: "Lymphatic Drainage",
      description: "Reduce swelling and flush metabolic waste from tissues",
    },
  ];

  const normatecTimes = [
    {
      icon: Zap,
      title: "Post-Workout",
      time: "15-20 minutes",
      description: "Use immediately after training for optimal recovery benefits",
    },
    {
      icon: Clock,
      title: "Rest Days",
      time: "20-30 minutes",
      description: "Active recovery to maintain mobility and reduce stiffness",
    },
    {
      icon: Sun,
      title: "Pre-Event",
      time: "10-15 minutes",
      description: "Prime your muscles and enhance performance before competition",
    },
  ];

  const pricingOptions = [
    {
      icon: CircleDollarSign,
      title: "Wellness Membership",
      price: "$199",
      period: "/year",
      description: "unlimited sessions",
      highlight: true,
      href: null,
    },
    {
      icon: Ticket,
      title: "10-Session Punch Card",
      price: "$99",
      period: "",
      description: "Never expires",
      highlight: false,
      href: "https://app.acuityscheduling.com/schedule/0cb40a58",
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-charcoal-dark to-black" />
        <div className="relative z-20 container mx-auto px-6 text-center">
          <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-wide text-white mb-4 leading-tight">
            Recovery & Wellness
          </h1>
          <p className="font-sans text-xl md:text-2xl text-white/90 font-normal">
            Recover Faster. Perform Better.
          </p>
        </div>
      </section>

      {/* Infrared Sauna Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
                Infrared Sauna
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Experience the healing power of infrared heat therapy. Our
                full-spectrum infrared sauna penetrates deep into tissues for
                maximum therapeutic benefits.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="mb-16">
              <h3 className="font-heading text-xl uppercase tracking-wide text-white/60 mb-8 text-center">
                Benefits
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {saunaBenefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="bg-charcoal-dark/50 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading text-lg font-bold text-white mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-white/70">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Times */}
            <div>
              <h3 className="font-heading text-xl uppercase tracking-wide text-white/60 mb-8 text-center">
                Best Times to Use
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {saunaTimes.map((time) => (
                  <div
                    key={time.title}
                    className="bg-charcoal-dark/30 rounded-lg p-6 border border-white/10 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white/10 rounded-full">
                        <time.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h4 className="font-heading text-lg font-bold text-white mb-1">
                      {time.title}
                    </h4>
                    <p className="text-sm font-semibold text-white/80 mb-2">
                      {time.time}
                    </p>
                    <p className="text-sm text-white/60">{time.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NormaTec Section */}
      <section className="bg-charcoal-dark py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
                NormaTec Compression
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Professional-grade compression therapy used by elite athletes
                worldwide. Dynamic pulse technology mimics natural muscle
                contractions for enhanced recovery.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="mb-16">
              <h3 className="font-heading text-xl uppercase tracking-wide text-white/60 mb-8 text-center">
                Benefits
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {normatecBenefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="bg-black/30 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading text-lg font-bold text-white mb-1">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-white/70">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Times */}
            <div>
              <h3 className="font-heading text-xl uppercase tracking-wide text-white/60 mb-8 text-center">
                Best Times to Use
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {normatecTimes.map((time) => (
                  <div
                    key={time.title}
                    className="bg-black/30 rounded-lg p-6 border border-white/10 text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white/10 rounded-full">
                        <time.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h4 className="font-heading text-lg font-bold text-white mb-1">
                      {time.title}
                    </h4>
                    <p className="text-sm font-semibold text-white/80 mb-2">
                      {time.time}
                    </p>
                    <p className="text-sm text-white/60">{time.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
                Wellness Pricing
              </h2>
              <p className="text-lg text-white/80">
                Choose the option that works best for your recovery routine
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {pricingOptions.map((option) => {
                const cardContent = (
                  <>
                    <div className="flex justify-center mb-4">
                      <div
                        className={`p-3 rounded-full ${
                          option.highlight ? "bg-black/10" : "bg-white/10"
                        }`}
                      >
                        <option.icon
                          className={`w-8 h-8 ${
                            option.highlight ? "text-black" : "text-white"
                          }`}
                        />
                      </div>
                    </div>
                    <h3
                      className={`font-heading text-xl font-bold mb-4 ${
                        option.highlight ? "text-black" : "text-white"
                      }`}
                    >
                      {option.title}
                    </h3>
                    <div className="mb-4">
                      <span
                        className={`text-4xl font-bold ${
                          option.highlight ? "text-black" : "text-white"
                        }`}
                      >
                        {option.price}
                      </span>
                      <span
                        className={`text-lg ${
                          option.highlight ? "text-black/60" : "text-white/60"
                        }`}
                      >
                        {option.period}
                      </span>
                    </div>
                    <p
                      className={
                        option.highlight ? "text-black/70" : "text-white/70"
                      }
                    >
                      {option.description}
                    </p>
                  </>
                );

                const cardClassName = `rounded-lg p-8 border text-center ${
                  option.highlight
                    ? "bg-white text-black border-white"
                    : "bg-charcoal-dark/50 text-white border-white/10"
                } ${option.href ? "hover:border-white/30 transition-colors" : ""}`;

                return option.href ? (
                  <Link
                    key={option.title}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClassName}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div key={option.title} className={cardClassName}>
                    {cardContent}
                  </div>
                );
              })}
            </div>

            {/* Contact Note */}
            <div className="text-center">
              <p className="text-white/60 text-base">
                Contact us at the gym to discuss membership options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-charcoal-dark py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
              Ready to Recover?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Book your wellness session and start feeling the difference
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-black text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105"
            >
              <Link
                href="https://app.acuityscheduling.com/schedule/0cb40a58"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a Session
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
