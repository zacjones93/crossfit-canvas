import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Facility() {
  const features = [
    "State-of-the-art Rogue equipment",
    "Climate-controlled facility",
    "Clean showers & locker rooms",
    "Recovery room with foam rollers",
    "Dedicated kids' area",
    "Free parking",
    "Complimentary cold towels",
  ];

  return (
    <section className="bg-black relative">
      {/* Subtle concrete texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 items-center">
          {/* Content on Left */}
          <div className="px-6 py-12 md:px-12 md:py-20 order-2 md:order-1">
            <div className="relative">
              {/* Red paint stroke accent on left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white -ml-6" />

              <div className="space-y-8 text-white">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl uppercase tracking-wide leading-tight">
                  12,000 Square Feet of Premium Fitness Space
                </h2>

                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 mt-0.5 text-white flex-shrink-0"
                        strokeWidth={3}
                      />
                      <span className="font-sans text-base text-white/90">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-white text-black text-base font-bold uppercase px-8 py-6 rounded-sm transition-all hover:scale-105 hover:cursor-pointer"
                  >
                    Schedule a Tour
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Image on Right */}
          <div className="relative h-[400px] md:h-[600px] order-1 md:order-2">
            <Image
              src="/assets/canvas-gym-shot.png"
              alt="CrossFit Canvas facility interior"
              fill
              className="object-cover grayscale"
            />
            {/* Dark gradient overlay for consistency */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
