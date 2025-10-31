import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Class Schedule | CrossFit Canvas",
  description:
    "View our class schedule and book your spot. Small classes with expert coaching at Caldwell's premier CrossFit gym.",
};

export default function SchedulePage() {
  return (
    <main className="bg-black min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl uppercase text-white mb-4 tracking-wide">
            Class Schedule
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Book your spot in our small group classes. All fitness levels welcome.
          </p>
        </div>

        {/* Embedded PushPress Calendar */}
        <div className="relative w-full overflow-hidden rounded-lg shadow-2xl bg-white" style={{ minHeight: '800px' }}>
          <iframe
            src="https://canvas.pushpress.com/landing/calendar"
            className="w-full h-full absolute inset-0"
            style={{ minHeight: '800px', border: 'none' }}
            title="Class Schedule"
            loading="lazy"
          />
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="font-sans text-white/80 text-base mb-4">
            New to CrossFit Canvas? Start with a free intro session.
          </p>
          <Link
            href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#DC143C] hover:bg-[#B01030] text-white font-bold uppercase text-lg px-8 py-4 rounded-[4px] transition-all hover:scale-105 shadow-lg"
          >
            Book Your Free No Sweat Intro
          </Link>
        </div>
      </div>
    </main>
  );
}
