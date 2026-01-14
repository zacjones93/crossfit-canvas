import { Button } from "@/components/ui/button";
import { ChevronDown, Dumbbell, Timer, Zap } from "lucide-react";
import { FinalCTA } from "@/components/landing/final-cta";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mayhem Hunt | CrossFit Canvas",
  description:
    "Focused strength and conditioning class featuring structured warm-ups, strength work, and intense metcons. Monday, Wednesday, Friday at 6:00am.",
  openGraph: {
    title: "Mayhem Hunt | CrossFit Canvas",
    description:
      "Focused strength and conditioning class featuring structured warm-ups, strength work, and intense metcons. Monday, Wednesday, Friday at 6:00am.",
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
          Mayhem Hunt
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-4 max-w-2xl mx-auto font-normal leading-relaxed">
          A focused strength and conditioning class featuring structured
          warm-ups, strength work, and intense metcons.
        </p>

        <p className="font-subheading text-sm font-bold text-white tracking-wider uppercase mb-10">
          Monday / Wednesday / Friday @ 6:00am
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
            className="bg-white hover:bg-black hover:text-white border-2 border-white text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 min-w-[200px]"
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

function WorkoutBreakdown() {
  const phases = [
    {
      time: "Part 1",
      title: "Warm-Up",
      icon: Zap,
      items: [
        "Train for the pursuit - prepare your body for the backcountry",
        "Hip and lower body activation for rugged terrain",
        "Progressive loading to build real-world strength",
      ],
      example: `Mayhem Hip Halo Activation
- 10 Side step R/L
- 10 Forward/Backwards Walk R/L
- 10 Glute Bridges
- 10 Single Leg Glute Bridges R/L
- 10 Bird Dogs R/L
- 10 Squats

Part 2.
2-3 sets
10 Cossack Squats
10 Bodyweight Calf Raises
10 Bodyweight Tibia Raises

Part 3.
Start building to weight`,
    },
    {
      time: "Part 2",
      title: "Strength",
      icon: Dumbbell,
      items: [
        "Functional leg strength for hiking and hauling",
        "Unilateral work to prevent imbalances on uneven ground",
        "Time-based intervals to build work capacity",
      ],
      example: `Every 2:00 Minutes x 6 Sets
8 Dumbbell Front Squats
+
12 Bulgarian Split Squats (6/6)`,
    },
    {
      time: "Part 3",
      title: "Metcon",
      icon: Timer,
      items: [
        "Hunt-specific conditioning for pack-outs and pursuits",
        "Loaded carries that mimic real backcountry demands",
        "Build the endurance to go deep and get back out",
      ],
      example: `For Time:
5 Rounds
10 Burpee Box Step Overs
1-Lap with Sandbag (Downstairs/Upstairs)
200ft KB/DB Farmer Carry (2-Downbacks)
1000m Bike-Erg
-rest 2 minutes-`,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              What to Expect
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Each Mayhem Hunt session follows a structured approach to build
              strength and conditioning.
            </p>
          </div>

          <div className="space-y-8 md:space-y-8">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div key={index} className="flex gap-6">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm flex-shrink-0">
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    {index < phases.length - 1 && (
                      <div className="w-1 h-full bg-white/30 mt-2 min-h-[80px]" />
                    )}
                  </div>

                  <div className="flex-1 pb-4 md:pb-8">
                    <div className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
                      <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 mb-3">
                        <span className="font-subheading text-sm font-bold text-white tracking-wider">
                          {phase.time}
                        </span>
                        <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-foreground">
                          {phase.title}
                        </h3>
                      </div>
                      <div className="h-[2px] bg-white/80 mb-4 w-12" />

                      <div className="grid md:grid-cols-2 gap-6">
                        <ul className="space-y-2">
                          {phase.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="flex items-start gap-3"
                            >
                              <span className="text-white mt-1 font-bold">
                                •
                              </span>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MayhemHuntPage() {
  return (
    <main>
      <ProgramHero />
      <WorkoutBreakdown />
      <FinalCTA />
    </main>
  );
}
