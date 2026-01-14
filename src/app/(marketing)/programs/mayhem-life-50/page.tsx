import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Heart,
  Clock,
  Users,
  Dumbbell,
} from "lucide-react";
import { FinalCTA } from "@/components/landing/final-cta";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mayhem Life 50+ | CrossFit Canvas",
  description:
    "Designed specifically for the older generation. Modified workouts focused on longevity, strength, and quality movement. Tuesday/Thursday @ 9:45am.",
  openGraph: {
    title: "Mayhem Life 50+ | CrossFit Canvas",
    description:
      "Modified CrossFit workouts focused on longevity, strength, and quality movement for ages 50+.",
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
          Mayhem Life 50+
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-4 max-w-2xl mx-auto font-normal leading-relaxed">
          Designed specifically for the older generation. Modified workouts
          focused on longevity, strength, and quality movement.
        </p>

        <p className="font-subheading text-base md:text-lg text-white/90 mb-10 font-bold tracking-wider">
          Tuesday / Thursday @ 9:45am
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
            className="border-2 border-white text-white hover:bg-white hover:text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 min-w-[200px]"
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

function ProgramBenefits() {
  const benefits = [
    {
      icon: Heart,
      title: "Longevity Focused",
      description:
        "Exercises designed to promote long-term health, mobility, and vitality for years to come.",
    },
    {
      icon: Dumbbell,
      title: "Strength & Balance",
      description:
        "Build functional strength and improve balance to maintain independence and prevent falls.",
    },
    {
      icon: Users,
      title: "Supportive Community",
      description:
        "Train alongside peers in a welcoming environment that celebrates progress at any age.",
    },
    {
      icon: Clock,
      title: "Proper Pacing",
      description:
        "Modified workouts with appropriate intensity, recovery, and movement quality emphasis.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Built for Longevity
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Quality movement and sustainable fitness for the older generation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
                >
                  <Icon className="w-12 h-12 text-white mb-4" strokeWidth={2} />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                    {item.title}
                  </h3>
                  <div className="h-[2px] bg-white/80 mb-4 w-12" />
                  <p className="font-sans text-muted-foreground leading-relaxed">
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

function WorkoutBreakdown() {
  const phases = [
    {
      time: "5-10 min",
      title: "Warm Up",
      items: [
        "Every workout is approachable regardless of experience",
        "Prepare your body with purposeful movement",
      ],
      example: `Mini Band Warm-Up
-Into-
5:00 Minutes
1:00 Air Bike
10 Banded Pull Aparts
5 Bodyweight Squats
3 Push Ups
10 Dead Bugs`,
    },
    {
      time: "15-20 min",
      title: "Strength",
      items: [
        "Build the strength to stay independent and active",
        "Personalized scaling to match your abilities",
        "Coached form and technique for injury prevention",
      ],
      example: `Every 2:00 Minutes x 5 sets
10 Goblet Squats
+
10 Reverse Lunges`,
    },
    {
      time: "15-20 min",
      title: "Metcon",
      items: [
        "Designed for sustainable intensity - not exhaustion",
        "Expert coaching ensures safe, effective movement",
        "Expert guidance keeps you moving safely and confidently",
      ],
      example: `3:00 AMRAP
12/10 Calorie Bike
12 Ring Rows
12 Dumbbell Bench Press
12 Sit Ups
-rest 2:00 between sets-`,
    },
    {
      time: "5-10 min",
      title: "Cooldown",
      items: [
        "Dedicated recovery time - not an afterthought",
        "Improve flexibility and reduce stiffness",
        "Leave feeling better than when you walked in",
      ],
      example: `3:00 Walk
Legs on Wall - Straight/Straddle/Squat positions
Down Dog to Seal Pose 4X
Lacrosse Ball-Chest/Shoulder`,
    },
  ];

  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-4">
              What to Expect in Class
            </h2>
            <p className="font-sans text-xl text-white/90">
              Each session follows a structured format designed for optimal
              longevity and sustainable fitness.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8 md:space-y-8">
            {phases.map((phase, index) => (
              <div key={index} className="flex gap-6">
                {/* Timeline indicator - hidden on mobile */}
                <div className="hidden md:flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {phase.time.split("-")[0]}
                  </div>
                  {index < phases.length - 1 && (
                    <div className="w-1 h-full bg-white/30 mt-2 min-h-[80px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4 md:pb-8">
                  <div className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 mb-3">
                      <span className="font-subheading text-sm font-bold text-white tracking-wider">
                        {phase.time}
                      </span>
                      <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-foreground">
                        {phase.title}
                      </h3>
                    </div>
                    {/* Red divider */}
                    <div className="h-[2px] bg-white/80 mb-4 w-12" />

                    {/* Two column layout: items on left, example on right */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Items list */}
                      <ul className="space-y-2">
                        {phase.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-start gap-3"
                          >
                            <span className="text-white mt-1 font-bold">•</span>
                            <span className="font-sans text-muted-foreground">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Example section */}
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MayhemLife50Page() {
  return (
    <main>
      <ProgramHero />
      <ProgramBenefits />
      <WorkoutBreakdown />
      <FinalCTA />
    </main>
  );
}
