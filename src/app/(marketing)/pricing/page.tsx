import { Pricing } from "@/components/landing/pricing";
import { FAQHighlights } from "@/components/landing/faq-highlights";
import { ServicesAmenities } from "@/components/landing/services-amenities";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Pricing | CrossFit Canvas",
  description:
    "Choose the perfect membership plan for your fitness journey. No contracts, no hidden fees, cancel anytime.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Header */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-charcoal-dark to-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-6xl md:text-7xl uppercase text-white mb-6 tracking-wide">
              Membership Pricing
            </h1>
            <p className="font-sans text-xl md:text-2xl text-white/80 leading-relaxed">
              Join CrossFit Canvas and transform your fitness. Choose the plan
              that fits your schedule and goals.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* Additional Info Section */}
      <section className="py-16 bg-charcoal-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-heading text-3xl uppercase text-white mb-8 text-center">
              What&apos;s Included
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-black p-6 border-l-4 border-[#DC143C]">
                <h4 className="font-subheading text-lg uppercase text-white mb-3 font-bold">
                  All Classes
                </h4>
                <p className="font-sans text-white/70">
                  Access to all CrossFit classes, Olympic lifting sessions, and
                  specialty programs included in your membership.
                </p>
              </div>
              <div className="bg-black p-6 border-l-4 border-[#DC143C]">
                <h4 className="font-subheading text-lg uppercase text-white mb-3 font-bold">
                  Expert Coaching
                </h4>
                <p className="font-sans text-white/70">
                  Certified coaches guide every workout, ensuring proper form and
                  helping you reach your goals safely.
                </p>
              </div>
              <div className="bg-black p-6 border-l-4 border-[#DC143C]">
                <h4 className="font-subheading text-lg uppercase text-white mb-3 font-bold">
                  Community Support
                </h4>
                <p className="font-sans text-white/70">
                  Join a motivating community of members who support each other
                  through every workout and milestone.
                </p>
              </div>
              <div className="bg-black p-6 border-l-4 border-[#DC143C]">
                <h4 className="font-subheading text-lg uppercase text-white mb-3 font-bold">
                  Open Gym Access
                </h4>
                <p className="font-sans text-white/70">
                  Use our facility during open gym hours to practice skills, work
                  on personal goals, or get extra training.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Amenities Section */}
      <ServicesAmenities />

      {/* FAQ Section */}
      <FAQHighlights />
    </div>
  );
}
