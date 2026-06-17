import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PLANS_URLS } from "@/components/landing/pricing";

const SPECIAL_FEATURES = [
  "4 weeks of unlimited classes",
  "All class types included",
  "Open gym access",
  "Personalized onboarding",
];

export function NewMemberSpecial() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: "url('/assets/deadlift.png')" }}
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-charcoal-dark border border-white/20 rounded-sm p-8 md:p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Limited time badge */}
          <span className="inline-block bg-crimson text-white font-subheading text-xs md:text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-sm mb-6">
            Limited Time Offer
          </span>

          <h2 className="font-heading text-5xl md:text-6xl uppercase text-white mb-4 tracking-wide">
            New Member Special
          </h2>
          <p className="font-sans text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get 4 full weeks of unlimited CrossFit — every class, open gym, and
            coaching included. The easiest way to start your journey.
          </p>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-2 mb-8">
            <span className="font-heading text-7xl md:text-8xl text-white">
              $97
            </span>
            <span className="font-sans text-lg text-white/70">
              for 4 weeks
            </span>
          </div>

          {/* Features */}
          <ul className="grid sm:grid-cols-2 gap-3 mb-10 max-w-xl mx-auto text-left">
            {SPECIAL_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <Check
                  className="w-5 h-5 flex-shrink-0 text-crimson"
                  strokeWidth={3}
                />
                <span className="font-sans text-sm text-white/90">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            size="lg"
            className="bg-white text-black hover:bg-gray-100 text-base md:text-xl px-6 md:px-12 py-6 md:py-8 h-auto rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.3)] font-bold uppercase hover:scale-105 transition-all w-full md:w-auto md:min-w-[300px] max-w-[500px]"
          >
            <a
              href={PLANS_URLS.newMemberSpecial}
              target="_blank"
              rel="noopener noreferrer"
            >
              Claim Your Special
            </a>
          </Button>

          <p className="font-sans text-white/60 text-sm mt-6">
            New members only. No contract required.
          </p>
        </div>
      </div>
    </section>
  );
}
