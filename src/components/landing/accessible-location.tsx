import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function AccessibleLocation() {
  return (
    <section className="bg-black py-24">
      <div className="container mx-auto px-6">
        {/* Top Heading */}
        <div className="max-w-6xl mx-auto mb-2">
          <h2 className="text-base max-w-[75ch] font-bold text-white uppercase leading-tight text-balance">
            CrossFit Canvas is easily accessible from all of Caldwell with a full parking lot to make getting to the gym the easiest part of your workout.
          </h2>
        </div>

        {/* Map and Address Section */}
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-0 md:relative">
          {/* Map Image */}
          <Image
            src="/assets/canvas-on-a-map.png"
            alt="CrossFit Canvas location on map"
            width={850}
            height={300}
            className="w-full h-auto object-cover md:object-contain grayscale"
          />

          {/* Address Box - Below map on mobile, absolute positioned on top right on desktop */}
          <div className="bg-white p-8 max-w-[400px] md:absolute md:top-6 md:right-6">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                <div>
                  <p className="text-base max-w-[45ch] font-bold text-black uppercase">
                  4611 Enterprise Way, Caldwell, ID 83605
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-black hover:bg-gray-800 text-white text-lg font-bold uppercase py-6"
                asChild
              >
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=4611+Enterprise+Way+Caldwell+ID+83605"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
