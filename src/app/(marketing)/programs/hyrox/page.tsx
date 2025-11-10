import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Timer,
  Dumbbell,
  Activity,
  Users,
  Target,
  Trophy,
  Zap,
  Heart,
  Clock,
} from "lucide-react";
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
          Hyrox Training in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          Prepare for the world&apos;s fastest growing fitness race. Build
          strength, endurance, and mental toughness.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-white text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 hover:cursor-pointer min-w-[200px]"
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
        <ChevronDown className="w-8 h-8 text-white/80" strokeWidth={3} />
      </div>
    </section>
  );
}

function WhatIsHyroxSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              What is Hyrox?
            </h2>
            <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
            <p className="font-sans text-xl text-muted-foreground leading-relaxed mb-6">
              Hyrox is a global fitness race for every body. It combines running
              with functional workout stations, creating the ultimate test of
              fitness.
            </p>
          </div>

          <div className="bg-charcoal-dark text-white rounded-sm p-8 mb-8">
            <h3 className="font-heading text-2xl uppercase tracking-wide mb-4">
              The Race Format
            </h3>
            <div className="h-[2px] bg-white mb-6 w-12" />
            <p className="font-sans text-white/90 leading-relaxed mb-6">
              8 x 1km runs alternating with 8 functional workout stations:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 font-sans text-white/90">
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>1000m SkiErg</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>50m Sled Push</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>50m Sled Pull</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>80m Burpee Broad Jumps</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>1000m Row</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>200m Farmers Carry</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white mt-1 font-bold">•</span>
                <span>100m Sandbag Lunges</span>
              </li>
              <li className="flex items-start gap-3">
                  <span className="text-white mt-1 font-bold">•</span>
                <span>75 or 100 Wall Balls</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScheduleSection() {
  return (
    <section className="py-20 bg-muted">
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
            <p className="font-sans text-2xl text-white/90 mb-6">10:30 AM</p>
            <p className="font-sans text-white/80 leading-relaxed">
              Join our dedicated Hyrox training session focused on race-specific
              movements and conditioning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrainingFocusSection() {
  const focuses = [
    {
      icon: Timer,
      title: "Endurance",
      description:
        "Build the aerobic base and stamina needed to maintain pace through 8km of running plus functional movements.",
    },
    {
      icon: Dumbbell,
      title: "Strength",
      description:
        "Develop the muscular strength and power required for sled pushes, pulls, and heavy carries.",
    },
    {
      icon: Activity,
      title: "Work Capacity",
      description:
        "Train your body to transition efficiently between running and high-intensity functional movements.",
    },
    {
      icon: Zap,
      title: "Mental Toughness",
      description:
        "Build the mental resilience to push through discomfort and maintain focus during competition.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Training Focus
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Our Hyrox programming targets the key areas you need to succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {focuses.map((focus, index) => {
              const Icon = focus.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-6 transition-all"
                >
                  <Icon
                    className="w-12 h-12 text-white mb-4"
                    strokeWidth={2}
                  />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                    {focus.title}
                  </h3>
                  <div className="h-[2px] bg-white mb-4 w-12" />
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {focus.description}
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

function WhyTrainHereSection() {
  const benefits = [
    {
      icon: Trophy,
      title: "Competition Experience",
      description:
        "Our coaches have competed in and understand the demands of Hyrox competitions.",
    },
    {
      icon: Users,
      title: "Community Support",
      description:
        "Train alongside others preparing for Hyrox. Share the journey and push each other.",
    },
    {
      icon: Target,
      title: "Full Equipment Access",
      description:
        "Practice on the exact equipment you'll use in competition: SkiErg, sleds, rowers, and more.",
    },
    {
      icon: Heart,
      title: "Scalable Programming",
      description:
        "Whether you're targeting PRO division or just starting, we'll meet you at your level.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Why Train at CrossFit Canvas?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-6 transition-all"
                >
                  <Icon
                    className="w-12 h-12 text-white mb-4"
                    strokeWidth={2}
                  />
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

function ReadyToStartSection() {
  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-6">
            Ready to Start Training?
          </h2>
          <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
          <p className="font-sans text-xl text-white/90 leading-relaxed mb-8">
            Join our Hyrox-focused training sessions and prepare for your first
            (or next) competition. Our programming integrates seamlessly with
            our regular CrossFit classes.
          </p>
          <p className="font-sans text-lg text-white/80 leading-relaxed mb-12">
            Book a free consultation to discuss your goals and how we can help
            you prepare.
          </p>

          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-black hover:text-white text-black text-base md:text-lg font-bold uppercase px-6 sm:px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 hover:cursor-pointer"
          >
            <a
              href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Schedule Your Free Consultation
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function HyroxPage() {
  return (
    <main>
      <ProgramHero />
      <WhatIsHyroxSection />
      <ScheduleSection />
      <TrainingFocusSection />
      <WhyTrainHereSection />
      <ReadyToStartSection />
    </main>
  );
}
