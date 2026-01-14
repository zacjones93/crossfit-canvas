import { Button } from "@/components/ui/button";
import { ChevronDown, Bike, Heart, Zap, Users } from "lucide-react";
import { FinalCTA } from "@/components/landing/final-cta";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spin Classes - High-Energy Indoor Cycling | CrossFit Canvas",
  description:
    "Join our high-energy indoor cycling classes with structured intervals for all fitness levels. Tuesdays at 6:00am and Thursdays at 5:30pm in Caldwell, ID.",
  openGraph: {
    title: "Spin Classes - High-Energy Indoor Cycling | CrossFit Canvas",
    description:
      "Join our high-energy indoor cycling classes with structured intervals for all fitness levels. Tuesdays at 6:00am and Thursdays at 5:30pm.",
    type: "website",
  },
};

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
          Spin Classes in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          High-energy indoor cycling classes with structured intervals for all
          fitness levels.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-black hover:bg-white hover:text-black border-2 border-white text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 min-w-[200px]"
          >
            <Link href="/tour">Schedule a Tour</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white/10 hover:bg-white hover:text-black border-2 border-white text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 min-w-[200px] backdrop-blur-sm"
          >
            <Link href="/intro-class">Intro Class</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="w-8 h-8 text-white" strokeWidth={3} />
      </div>
    </section>
  );
}

function ScheduleSection() {
  const schedule = [
    {
      day: "Tuesday",
      time: "6:00am",
      icon: Bike,
    },
    {
      day: "Thursday",
      time: "5:30pm",
      icon: Bike,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Class Schedule
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Weekly spin classes designed to fit your schedule
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {schedule.map((session, index) => {
              const Icon = session.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center"
                >
                  <Icon className="w-16 h-16 text-white mx-auto mb-4" strokeWidth={2} />
                  <h3 className="font-heading text-3xl uppercase tracking-wide text-foreground mb-2">
                    {session.day}
                  </h3>
                  <div className="h-[2px] bg-white/80 w-16 mx-auto mb-4" />
                  <p className="font-subheading text-2xl font-bold text-white">
                    {session.time}
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

function WorkoutBreakdown() {
  const phases = [
    {
      title: "Warm Up",
      items: [
        "Music-driven energy to get you in the zone",
        "Coach guides you through every interval",
        "Adjustable resistance for all fitness levels",
      ],
      example: `3 Min ramp from RPE1 to RPE3
2x 30 Sec at RPE8, 1 Min at RPE2`,
    },
    {
      title: "Main Workout",
      items: [
        "Push your limits in a judgment-free environment",
        "Heart-pumping intervals with structured recovery",
        "Burn calories while building leg strength and endurance",
      ],
      example: `3x 1 Min standing, D8-10 at RPE8, 90 Sec, D1 at RPE2
3x 90 Sec at RPE7, 2 Min at RPE2
6x 30 Sec standing, D8-10 at RPE8, 45 Sec, D1 at RPE2`,
    },
  ];

  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-4">
              Workout Structure
            </h2>
            <p className="font-sans text-xl text-white/90">
              Every spin class follows a structured format with varied
              intensities and recovery periods
            </p>
          </div>

          <div className="space-y-8">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
              >
                <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-foreground mb-3">
                  {phase.title}
                </h3>
                <div className="h-[2px] bg-white/80 mb-4 w-12" />

                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-2">
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <span className="text-white mt-1 font-bold">•</span>
                        <span className="font-sans text-muted-foreground">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-muted border-l-4 border-white/80 rounded-sm p-4">
                    <p className="font-subheading text-xs font-bold text-white tracking-wider uppercase mb-2">
                      Example
                    </p>
                    <pre className="font-sans text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {phase.example}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: Heart,
      title: "Cardiovascular Fitness",
      description:
        "Improve heart health and endurance through sustained aerobic exercise and interval training.",
    },
    {
      icon: Zap,
      title: "Low-Impact Training",
      description:
        "Get an intense workout without the joint stress of running or high-impact activities.",
    },
    {
      icon: Users,
      title: "Group Energy",
      description:
        "Ride alongside motivated athletes who push you to reach new performance levels.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Why Spin?
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Build endurance and power in a supportive environment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
                >
                  <Icon className="w-12 h-12 text-white mb-4" strokeWidth={2} />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <div className="h-[2px] bg-white/80 mb-4 w-12" />
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

export default function SpinClassesPage() {
  return (
    <main>
      <ProgramHero />
      <ScheduleSection />
      <WorkoutBreakdown />
      <BenefitsSection />
      <FinalCTA />
    </main>
  );
}
