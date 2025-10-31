import { Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "I was intimidated by CrossFit but the coaches at Canvas made me feel so welcome. Six months in and I'm stronger than I've ever been. The small classes mean real coaching, not just watching a whiteboard.",
      name: "Sarah M.",
      memberSince: "Member since 2023",
      achievement: "Lost 25 lbs | First pull-up achieved",
    },
    {
      quote:
        "As a former athlete, I needed something that challenged me. The programming is excellent and the community keeps me coming back. Best decision I made for my fitness.",
      name: "Mike R.",
      memberSince: "Member since 2022",
      achievement: "Competed in first CrossFit competition",
    },
    {
      quote:
        "I'm in my 50s and never thought I'd do CrossFit. The coaches scale everything perfectly to my level. I feel stronger and healthier than I did in my 40s!",
      name: "Linda K.",
      memberSince: "Member since 2023",
      achievement: "Improved mobility | Reduced back pain",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Members Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 relative">
              <Quote className="w-12 h-12 text-orange-600 opacity-20 absolute top-4 right-4" />

              <div className="relative">
                {/* Placeholder for member photo */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{testimonial.name[0]}</span>
                </div>

                <p className="text-lg italic text-gray-700 mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="text-center">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.memberSince}</p>
                  <p className="text-sm text-orange-600 font-medium mt-2">
                    {testimonial.achievement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-orange-600 hover:text-orange-700 font-medium text-lg">
            Read all 200+ reviews →
          </button>
        </div>
      </div>
    </section>
  );
}
