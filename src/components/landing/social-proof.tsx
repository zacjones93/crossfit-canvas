import { Star } from "lucide-react";

export function SocialProof() {
  return (
    <section className="bg-gray-100 py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center">
          {/* Star Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              4.8 Stars from 200+ Reviews
            </span>
          </div>

          {/* Testimonial Quote */}
          <div className="max-w-2xl">
            <p className="text-lg italic text-gray-700">
              "The coaches are amazing and the community is so welcoming!"
            </p>
            <p className="text-sm text-gray-600 mt-1">- Sarah M.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
