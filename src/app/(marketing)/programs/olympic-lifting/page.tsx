import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Trophy,
  Users,
  Target,
  Zap,
  Clock,
  Award,
} from "lucide-react";
import { FinalCTA } from "@/components/landing/final-cta";
import Link from "next/link";

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
          Olympic Lifting in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          Master the snatch, clean & jerk with expert coaching. Small group
          sessions focused on technique and strength development.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

          <Button
            size="lg"
            className="border-2 border-white text-black bg-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 hover:cursor-pointer min-w-[200px] hover:bg-white"
            asChild
          >
            <Link href="/tour">
              Schedule a Tour
            </Link>
            </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white/80" strokeWidth={3} />
      </div>
    </section>
  );
}

function ScheduleSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Class Schedule
            </h2>
            <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
          </div>

          <div className="bg-charcoal-dark text-white rounded-sm p-8 text-center">
            <Clock
              className="w-16 h-16 text-white mx-auto mb-6"
              strokeWidth={2}
            />
            <h3 className="font-heading text-3xl uppercase tracking-wide mb-4">
              Saturday Mornings
            </h3>
            <p className="font-sans text-2xl text-white/90 mb-6">8:00 AM</p>
            <p className="font-sans text-white/80 leading-relaxed">
              Small group coaching sessions focused on Olympic lifting technique
              and strength progression.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MovementsFocusSection() {
  const movements = [
    {
      icon: Zap,
      title: "Snatch",
      description:
        "Develop explosive power and coordination with the most technical lift in weightlifting. Progress from learning positions to full competition lifts.",
    },
    {
      icon: Trophy,
      title: "Clean & Jerk",
      description:
        "Master the two-part lift that combines pulling power with overhead strength and stability.",
    },
    {
      icon: Target,
      title: "Push Press & Push Jerk",
      description:
        "Build pressing strength and learn efficient force transfer from legs through core to overhead position.",
    },
    {
      icon: Award,
      title: "Split Jerk",
      description:
        "Develop the footwork, timing, and balance needed for heavy overhead lifts in the split position.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Movements We Focus On
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Progressive coaching on all major Olympic lifting movements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {movements.map((movement, index) => {
              const Icon = movement.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-6 transition-all"
                >
                  <Icon className="w-12 h-12 text-white mb-4" strokeWidth={2} />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                    {movement.title}
                  </h3>
                  <div className="h-[2px] bg-white mb-4 w-12" />
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {movement.description}
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

function CoachingApproachSection() {
  const benefits = [
    {
      icon: Users,
      title: "Small Group Format",
      description:
        "Train with a focused group while receiving individual attention from experienced coaches. We keep classes small so every athlete gets the coaching they need.",
    },
    {
      icon: Target,
      title: "Personalized Technique",
      description:
        "Work one-on-one with coaches to develop efficient lifting form suited to your individual physiology. We understand everyone moves differently.",
    },
    {
      icon: Trophy,
      title: "All Levels Welcome",
      description:
        "Whether you're new to Olympic lifting or a developing lifter looking to refine technique, our programming meets you at your level.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Our Coaching Approach
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-6 transition-all"
                >
                  <Icon className="w-12 h-12 text-white mb-4" strokeWidth={2} />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <div className="h-[2px] bg-white mb-4 w-12" />
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {benefit.description}
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

function AccessoryWorkSection() {
  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-6">
            Technique Through Accessory Work
          </h2>
          <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
          <p className="font-sans text-xl text-white/90 leading-relaxed mb-8">
            We use carefully selected accessory exercises to address individual
            movement patterns and build the strength foundation needed for
            efficient Olympic lifting.
          </p>
          <p className="font-sans text-lg text-white/80 leading-relaxed">
            Each session combines full lifts with targeted accessory work to
            develop positions, timing, and power.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function OlympicLiftingPage() {
  return (
    <main>
      <ProgramHero />
      <ScheduleSection />
      <MovementsFocusSection />
      <CoachingApproachSection />
      <AccessoryWorkSection />
      <FinalCTA />
    </main>
  );
}
