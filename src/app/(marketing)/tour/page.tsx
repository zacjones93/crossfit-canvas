"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TourPage() {
  useEffect(() => {
    // Load the external script
    const script = document.createElement("script");
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="bg-black min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl uppercase text-white mb-4 tracking-wide">
            Schedule a Tour
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Come see our facility and meet our coaching team. We&apos;ll show
            you around and answer any questions you have.
          </p>
        </div>

        {/* Embedded Tour Calendar */}
        <div
          className="relative w-full overflow-hidden rounded-lg shadow-2xl bg-white"
          style={{ minHeight: "800px" }}
        >
          <iframe
            src="https://api.leadconnectorhq.com/widget/booking/waHykVleswpSMTW5IIeB"
            className="w-full h-full absolute inset-0"
            style={{ minHeight: "800px", border: "none", overflow: "hidden" }}
            id="9DWVY8TMhuMMcsT8ddFw_1763496553095"
            title="Tour Calendar"
            loading="lazy"
          />
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="font-sans text-white/80 text-base mb-4">
            Ready to jump in? Book your first intro class.
          </p>
          <Link
            href="/intro-class"
            className="inline-block bg-white text-black font-bold uppercase text-lg px-8 py-4 rounded-sm transition-all hover:scale-105 shadow-lg"
          >
            Book Intro Class
          </Link>
        </div>
      </div>
    </main>
  );
}
