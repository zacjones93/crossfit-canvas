import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden pt-3">
      {/* Background Image/Video with Gradient Overlay - Gritty B&W aesthetic */}
      <div className="absolute inset-0 z-0">
        {/* Hero Background Image - Mobile and prefers-reduced-motion */}
        <div className="absolute inset-0 lg:hidden motion-reduce:lg:block">
          <Image
            src="/assets/hero-mobile.png"
            alt="CrossFit Canvas Gym"
            fill
            className="object-cover grayscale"
            priority
          />
        </div>

        {/* Hero Background Video - Desktop (respects prefers-reduced-motion) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hidden lg:block motion-reduce:hidden absolute inset-0 w-full h-full object-cover grayscale"
        >
          <source src="/crossfit-canvas-hero-video.webm" type="video/webm" />
        </video>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10" />
      </div>

      {/* Content - Asymmetric layout */}
      <div className="relative z-20 container mx-auto px-6 text-center max-w-5xl">
        {/* Headline: Bebas Neue, UPPERCASE, White, 72px */}
        <h1 className="font-heading text-4xl md:text-7xl lg:text-[72px] uppercase tracking-wide text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-tight text-balance">
        Build strength, lose fat, boost endurance, and gain confidence.
        </h1>

        {/* Subheadline: Work Sans, White, 20px */}
        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          Small classes (10-15 people). Expert coaching. Every fitness level welcome.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Primary CTA: Crimson Red, White Text, UPPERCASE */}
          <Link href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-[#DC143C] hover:bg-[#B01030] hover:cursor-pointer text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-[4px] shadow-[0_8px_16px_rgba(220,20,60,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(220,20,60,0.5)] min-w-[200px]"
            >
                Book Your Free No Sweat Intro
            </Button>
          </Link>

          {/* Secondary CTA: Red text with underline */}
          <Link href="/schedule" className="group text-white text-base md:text-lg font-medium px-4 py-2 transition-all">
            <span className="relative inline-block">
              View Class Schedule
              {/* Red brush stroke underline */}
              <span className="absolute left-0 right-0 -bottom-1 h-[3px] bg-[#DC143C] transform origin-left transition-transform group-hover:scale-x-110" />
            </span>
            <span className="ml-1 text-[#DC143C] transition-transform group-hover:translate-x-1 inline-block">→</span>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator: Red down arrow */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="w-8 h-8 text-[#DC143C]" strokeWidth={3} />
      </div>
    </section>
  );
}
