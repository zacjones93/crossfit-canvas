"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function IntroClassPage() {
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
            Book Your Intro Class
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Start your CrossFit journey with a personalized intro class. Our
            coaches will guide you through the basics and help you get started.
          </p>
        </div>

        {/* Embedded Intro Class Calendar */}
        <div
          className="relative w-full overflow-hidden rounded-lg shadow-2xl bg-white"
          style={{ minHeight: "800px" }}
        >
          <iframe
            src="https://api.leadconnectorhq.com/widget/booking/zWZyz7cKRqP5zrZmmfuC"
            className="w-full h-full absolute inset-0"
            style={{ minHeight: "800px", border: "none", overflow: "hidden" }}
            id="9DWVY8TMhuMMcsT8ddFw_1763496613627"
            title="Intro Class Calendar"
            loading="lazy"
          />
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="font-sans text-white/80 text-base mb-4">
            Want to see the facility first? Schedule a tour.
          </p>
          <Link
            href="/tour"
            className="inline-block bg-white text-black font-bold uppercase text-lg px-8 py-4 rounded-sm transition-all hover:scale-105 shadow-lg"
          >
            Schedule a Tour
          </Link>
        </div>
      </div>
    </main>
  );
}
