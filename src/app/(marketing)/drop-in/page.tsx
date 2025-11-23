import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Drop-In | CrossFit Canvas",
  description:
    "Drop in and experience CrossFit Canvas. Choose from flexible drop-in options including 1-week, single class, or open gym access.",
};

export default function DropInPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-charcoal-dark to-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-6xl md:text-7xl uppercase text-white mb-6 tracking-wide">
              Drop-In Visits
            </h1>
            <p className="font-sans text-xl md:text-2xl text-white/80 leading-relaxed mb-8">
              You&apos;re welcome to drop in and experience CrossFit Canvas! Use our
              facility and choose from our flexible drop-in options.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Options */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* 1-Week Option */}
              <Link
                href="#"
                className="group bg-charcoal-dark border-2 border-white/10 hover:border-white/30 rounded-lg p-8 transition-all hover:scale-105 flex flex-col items-center text-center"
              >
                <h3 className="font-heading text-3xl uppercase text-white mb-4 tracking-wide">
                  1-Week
                </h3>
                <div className="mb-6">
                  <span className="font-heading text-5xl text-white">$45</span>
                </div>
                <p className="font-sans text-white/70 mb-6">
                  Full access to all classes and facility for one week
                </p>
                <Button className="w-full bg-white text-black font-bold uppercase hover:bg-white/90 transition-all">
                  Get Started
                </Button>
              </Link>

              {/* 1-Class Option */}
              <Link
                href="#"
                className="group bg-charcoal-dark border-2 border-white/10 hover:border-white/30 rounded-lg p-8 transition-all hover:scale-105 flex flex-col items-center text-center"
              >
                <h3 className="font-heading text-3xl uppercase text-white mb-4 tracking-wide">
                  1-Class
                </h3>
                <div className="mb-6">
                  <span className="font-heading text-5xl text-white">$20</span>
                </div>
                <p className="font-sans text-white/70 mb-6">
                  Drop in for a single class and experience our coaching
                </p>
                <Button className="w-full bg-white text-black font-bold uppercase hover:bg-white/90 transition-all">
                  Get Started
                </Button>
              </Link>

              {/* 1-Open Gym Option */}
              <Link
                href="#"
                className="group bg-charcoal-dark border-2 border-white/10 hover:border-white/30 rounded-lg p-8 transition-all hover:scale-105 flex flex-col items-center text-center"
              >
                <h3 className="font-heading text-3xl uppercase text-white mb-4 tracking-wide">
                  1-Open Gym
                </h3>
                <div className="mb-6">
                  <span className="font-heading text-5xl text-white">$10</span>
                </div>
                <p className="font-sans text-white/70 mb-6">
                  Use our facility during open gym for your own workout
                </p>
                <Button className="w-full bg-white text-black font-bold uppercase hover:bg-white/90 transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-charcoal-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl uppercase text-white mb-6 tracking-wide">
              What to Expect
            </h2>
            <p className="font-sans text-xl text-white/80 leading-relaxed mb-8">
              All drop-ins receive a warm welcome from our community and access
              to our professional coaching staff. Bring a water bottle, athletic
              shoes, and a positive attitude!
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-black/50 p-6 rounded-lg">
                <h3 className="font-heading text-xl uppercase text-white mb-3">
                  First Time Visiting?
                </h3>
                <p className="font-sans text-white/70">
                  We recommend arriving 10-15 minutes early to sign a waiver and
                  meet your coach.
                </p>
              </div>
              <div className="bg-black/50 p-6 rounded-lg">
                <h3 className="font-heading text-xl uppercase text-white mb-3">
                  What to Bring
                </h3>
                <p className="font-sans text-white/70">
                  Water bottle, athletic shoes, and comfortable workout clothes.
                  We provide all equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto text-center">
        <h2 className="font-heading text-4xl uppercase text-white mb-6 tracking-wide">
          Class Schedule
        </h2>
        <p className="font-sans text-xl text-white/80 leading-relaxed mb-8 max-w-[75ch] mx-auto text-balance">
          See what classes are available and book when it&apos;s convenient for you. All fitness levels
          welcome.
        </p>
        <div
            className="relative w-full overflow-hidden rounded-lg shadow-2xl bg-white max-w-5xl mx-auto py-16"
            style={{ minHeight: "800px" }}
          >
          <iframe
            src="https://canvas.pushpress.com/landing/calendar"
            className="w-full h-full absolute inset-0"
            style={{ minHeight: "800px", border: "none" }}
            title="Class Schedule"
            loading="lazy"
          />
        </div>
      </section>
      {/*
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-4xl uppercase text-white mb-6 tracking-wide">
              Ready to Join Full-Time?
            </h2>
            <p className="font-sans text-xl text-white/80 mb-8">
              Check out our membership options for unlimited access and better
              value.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-block bg-white text-black font-bold uppercase text-lg px-8 py-4 rounded-sm transition-all hover:scale-105 shadow-lg"
              >
                View Membership Pricing
              </Link>
              <Link
                href="/tour"
                className="inline-block bg-transparent border-2 border-white text-white font-bold uppercase text-lg px-8 py-4 rounded-sm transition-all hover:bg-white hover:text-black shadow-lg"
              >
                Schedule a Tour
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
