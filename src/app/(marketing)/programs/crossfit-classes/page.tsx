import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Activity,
  Heart,
  Zap,
  Target,
  Trophy,
} from "lucide-react";
import { ClassBreakdown } from "@/components/landing/class-breakdown";
import { FinalCTA } from "@/components/landing/final-cta";

function ProgramHero() {
  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden pt-3">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-charcoal-dark to-black grayscale" />
        <div className="absolute inset-0 opacity-[0.03] z-[5] mix-blend-overlay bg-[url('/texture/concrete.png')] bg-repeat" />
      </div>

      <div className="relative z-20 container mx-auto px-6 text-center max-w-5xl">
        <h1 className="font-heading text-4xl md:text-6xl lg:text-[64px] uppercase tracking-wide text-white mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] leading-tight text-balance">
          CrossFit Classes in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          Coach-led group classes using CrossFit methodologies. Scalable to any
          fitness level.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-[#DC143C] hover:bg-[#B01030] text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-[4px] shadow-[0_8px_16px_rgba(220,20,60,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(220,20,60,0.5)] min-w-[200px]"
          >
            <a
              href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Your Free No Sweat Intro
            </a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="w-8 h-8 text-[#DC143C]" strokeWidth={3} />
      </div>
    </section>
  );
}

function MethodologySection() {
  const methodology = [
    {
      icon: Heart,
      title: "Nutrition",
      description:
        "Diet lays the molecular foundations for fitness and health. Proper nutrition is the foundation of all athletic performance.",
    },
    {
      icon: Activity,
      title: "Metabolic Conditioning",
      description:
        "Building capacity in three metabolic pathways: phosphagen, glycolytic, and oxidative for complete cardio conditioning.",
    },
    {
      icon: Zap,
      title: "Gymnastics",
      description:
        "Developing body control through functional bodyweight movements. Build strength, flexibility, and coordination.",
    },
    {
      icon: Target,
      title: "Weightlifting & Throwing",
      description:
        "Olympic lifts and ballistic movements develop power, speed, and explosive strength for complete athletic development.",
    },
    {
      icon: Trophy,
      title: "Sport",
      description:
        "Applying fitness in competitive scenarios. The workout of the day tests and refines your capabilities.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-black mb-4">
              The CrossFit Methodology
            </h2>
            <p className="font-sans text-xl text-charcoal-medium">
              CrossFit is built on five core components that work together to
              create complete fitness.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methodology.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
                >
                  <Icon
                    className="w-12 h-12 text-[#DC143C] mb-4"
                    strokeWidth={2}
                  />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-black mb-3">
                    {item.title}
                  </h3>
                  <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
                  <p className="font-sans text-charcoal-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScalabilitySection() {
  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-6">
            Scalable to Your Level
          </h2>
          <div className="h-[3px] bg-[#DC143C] w-24 mx-auto mb-8" />
          <p className="font-sans text-xl text-white/90 leading-relaxed mb-8">
            Workouts can be adjusted in weight, intensity, and certain mechanics
            to scale to the experience and fitness levels of any individual.
          </p>
          <p className="font-sans text-lg text-white/80 leading-relaxed">
            Whether you&apos;re just starting your fitness journey or you&apos;re a
            seasoned athlete, our coaches will help you find the right variation
            to challenge yourself safely and effectively.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function CrossFitClassesPage() {
  return (
    <main>
      <ProgramHero />
      <MethodologySection />
      <ClassBreakdown />
      <ScalabilitySection />
      <FinalCTA />
    </main>
  );
}
