import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-24 bg-orange-600">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to Start Your Fitness Journey?
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
          Join Caldwell's friendliest gym. No experience needed.
        </p>

        <Button
          size="lg"
          className="bg-white text-orange-600 hover:bg-gray-100 text-xl px-12 py-8 h-auto rounded-lg shadow-2xl font-bold"
        >
          Book Your Free No Sweat Intro
        </Button>

        <p className="text-white/80 mt-6 text-lg">
          Have questions? Call us at (555) 123-4567 or send a message
        </p>
      </div>
    </section>
  );
}
