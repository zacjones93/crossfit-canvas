import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Users,
  Heart,
  Trophy,
  Clock,
  Calendar,
  DollarSign,
  Target,
} from "lucide-react";
import { AccessibleLocation } from "@/components/landing/accessible-location";

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
          Kids Fitness Classes in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          Ages 6-12. Building fitness, character, and confidence through fun,
          functional movement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-[#DC143C] hover:bg-[#B01030] text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-[4px] shadow-[0_8px_16px_rgba(220,20,60,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(220,20,60,0.5)] min-w-[200px]"
            asChild
          >
            <a
              href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Free Trial Class
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

function PhilosophySection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-black mb-4">
              Movement First, Character Always
            </h2>
            <div className="h-[3px] bg-[#DC143C] w-24 mx-auto mb-8" />
            <p className="font-sans text-xl text-charcoal-medium leading-relaxed mb-6">
              Our youth fitness program emphasizes how well your child moves,
              not how much or how fast. We prioritize functional movement
              development alongside character building.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center">
              <Target
                className="w-12 h-12 text-[#DC143C] mb-4 mx-auto"
                strokeWidth={2}
              />
              <h3 className="font-heading text-xl uppercase tracking-wide text-black mb-3">
                Quality Movement
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12 mx-auto" />
              <p className="font-sans text-charcoal-medium leading-relaxed">
                Focus on proper technique and body control
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center">
              <Heart
                className="w-12 h-12 text-[#DC143C] mb-4 mx-auto"
                strokeWidth={2}
              />
              <h3 className="font-heading text-xl uppercase tracking-wide text-black mb-3">
                Character Building
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12 mx-auto" />
              <p className="font-sans text-charcoal-medium leading-relaxed">
                Develop confidence, discipline, and teamwork
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center">
              <Trophy
                className="w-12 h-12 text-[#DC143C] mb-4 mx-auto"
                strokeWidth={2}
              />
              <h3 className="font-heading text-xl uppercase tracking-wide text-black mb-3">
                Fun & Engaging
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12 mx-auto" />
              <p className="font-sans text-charcoal-medium leading-relaxed">
                Keep kids excited about fitness
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClassStructureSection() {
  const phases = [
    {
      time: "10 min",
      title: "General Warm-Up",
      description:
        "Dynamic stretching, footwork drills, and bodyweight movements to prepare the body for activity and build fundamental movement patterns.",
    },
    {
      time: "15-20 min",
      title: "Strength & Skill Progression",
      description:
        "Practice functional movements like squats, deadlifts, lunges, burpees, box jumps, and pressing/pulling exercises. Coaches provide guidance on proper form.",
    },
    {
      time: "10-15 min",
      title: "Workout",
      description:
        "Put the practiced movements together in a fun, age-appropriate workout. Kids work at their own pace while staying engaged with the group.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-black mb-4">
              Class Structure
            </h2>
            <p className="font-sans text-xl text-charcoal-medium mb-8">
              Each 45-50 minute session follows a proven format
            </p>
          </div>

          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="bg-white border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-[#DC143C] text-white flex items-center justify-center font-bold text-sm">
                      {phase.time}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-2xl uppercase tracking-wide text-black mb-3">
                      {phase.title}
                    </h3>
                    <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
                    <p className="font-sans text-charcoal-medium leading-relaxed">
                      {phase.description}
                    </p>
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

function ProgramScheduleSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-black mb-4">
              Current Programs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Spring Program */}
            <div className="bg-white border-2 border-charcoal-light rounded-[4px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
              <Calendar
                className="w-12 h-12 text-[#DC143C] mb-4"
                strokeWidth={2}
              />
              <h3 className="font-heading text-3xl uppercase tracking-wide text-black mb-4">
                Spring Session
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-6 w-12" />

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock
                    className="w-5 h-5 text-[#DC143C] mt-1 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-sans font-bold text-black">
                      6 Weeks Program
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      April 14 – May 24
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users
                    className="w-5 h-5 text-[#DC143C] mt-1 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-sans font-bold text-black">
                      Schedule Options
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      Monday/Wednesday @ 6:45pm
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      Saturday @ 9:15am
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign
                    className="w-5 h-5 text-[#DC143C] mt-1 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-sans font-bold text-black">Pricing</p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      $99 for 2x/week
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      $125 for 3x/week
                    </p>
                  </div>
                </div>
              </div>

              <p className="font-sans text-sm text-charcoal-medium italic">
                Free trial class available. Mid-program enrollment accepted with
                prorated fees.
              </p>
            </div>

            {/* Summer Program */}
            <div className="bg-white border-2 border-charcoal-light rounded-[4px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
              <Calendar
                className="w-12 h-12 text-[#DC143C] mb-4"
                strokeWidth={2}
              />
              <h3 className="font-heading text-3xl uppercase tracking-wide text-black mb-4">
                Summer Session
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-6 w-12" />

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock
                    className="w-5 h-5 text-[#DC143C] mt-1 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-sans font-bold text-black">
                      8 Weeks Program
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      June 2 – July 28
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users
                    className="w-5 h-5 text-[#DC143C] mt-1 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-sans font-bold text-black">
                      Schedule Options
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      Tuesday/Thursday @ 9:45-10:45am
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      Monday/Wednesday @ 6:45-7:45pm
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      Saturday @ 9:15-10:15am
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign
                    className="w-5 h-5 text-[#DC143C] mt-1 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="font-sans font-bold text-black">Pricing</p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      $125 for 2x/week (16 classes)
                    </p>
                    <p className="font-sans text-sm text-charcoal-medium">
                      $150 for 3x/week (24 classes)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyKidsFitnessSection() {
  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-6">
            More Than Just Exercise
          </h2>
          <div className="h-[3px] bg-[#DC143C] w-24 mx-auto mb-8" />
          <p className="font-sans text-xl text-white/90 leading-relaxed mb-8">
            Our kids fitness classes teach valuable life skills: perseverance,
            teamwork, respect, and confidence. Kids learn that fitness can be
            fun while developing a foundation for lifelong health.
          </p>
          <p className="font-sans text-lg text-white/80 leading-relaxed mb-12">
            Give your child the gift of fitness, confidence, and community.
          </p>

          <Button
            size="lg"
            className="bg-[#DC143C] hover:bg-[#B01030] text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-[4px] shadow-[0_8px_16px_rgba(220,20,60,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(220,20,60,0.5)]"
            asChild
          >
            <a
              href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Free Trial Class
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function KidsFitnessClassesPage() {
  return (
    <main>
      <ProgramHero />
      <PhilosophySection />
      <ClassStructureSection />
      <ProgramScheduleSection />
      <WhyKidsFitnessSection />
      <AccessibleLocation />
    </main>
  );
}
