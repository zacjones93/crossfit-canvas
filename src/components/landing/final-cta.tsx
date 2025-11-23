import { Button } from "@/components/ui/button";
import { SITE_PHONE } from "@/constants";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/gym-fam.png')" }}
        />
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="font-heading text-5xl md:text-6xl uppercase text-white mb-4 tracking-wide">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="font-sans text-xl md:text-2xl text-white mb-12 max-w-3xl mx-auto">
          Join Caldwell&apos;s friendliest gym. No experience needed.
        </p>

        <Button
          asChild
          size="lg"
          className="bg-white text-black hover:bg-gray-100 text-base md:text-xl px-6 md:px-12 py-6 md:py-8 h-auto rounded-sm shadow-[0_8px_24px_rgba(0,0,0,0.3)] font-bold uppercase hover:scale-105 transition-all w-full md:w-auto md:min-w-[300px] max-w-[500px]"
        >
          <Link href="/tour">
            Schedule a Tour
          </Link>
        </Button>

        <p className="font-sans text-white text-base mt-6">
          Have questions? Call us at {SITE_PHONE} or send a message
        </p>
      </div>
    </section>
  );
}
