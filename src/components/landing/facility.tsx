import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            12,000 Square Feet of Premium Fitness Space
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Placeholder for facility photos - using gradient boxes */}
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg"
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6"
            >
              Schedule a Tour
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
