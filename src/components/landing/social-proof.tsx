import { Star } from "lucide-react";

export function SocialProof() {
  return (
    <section className=" bg-gradient-to-b from-black via-black to-white/10 py-10 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
          {/* Star Rating - Crimson Red stars */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex gap-0.5 md:gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 md:w-7 md:h-7 fill-white text-white" />
              ))}
            </div>
            <span className="font-subheading text-base md:text-lg font-bold text-white text-balance">
              5 Stars from 100+ Reviews
            </span>
          </div>

          {/* Testimonial Quote - Brush font italic */}
          <div className="max-w-2xl">
            <p className="font-heading text-xl text-white leading-relaxed tracking-wide text-balance">
              &quot;Love this gym it is a true community with amazing coaches&quot;
            </p>
            <p className="font-sans text-base text-gray-300">- Anne Johnston</p>
          </div>
        </div>
      </div>
    </section>
  );
}
