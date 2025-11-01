import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Target,
  TrendingUp,
  Activity,
  Heart,
  Dumbbell,
  Users,
  Apple,
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
          Personal Training in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          One-on-one coaching with experienced trainers. Exciting workouts,
          nutritional guidance, and personalized attention.
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
              Schedule a Consultation
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

function WhyPersonalTrainingSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Personalized for Your Success
            </h2>
            <div className="h-[3px] bg-[#DC143C] w-24 mx-auto mb-8" />
            <p className="font-sans text-xl text-muted-foreground leading-relaxed">
              Experience exciting, quick, and new workout routines designed
              specifically for you by our experienced coaches.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
              <Users
                className="w-12 h-12 text-[#DC143C] mb-4"
                strokeWidth={2}
              />
              <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                Expert Coaches
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                Work one-on-one with experienced trainers who understand your
                goals and how to help you achieve them.
              </p>
            </div>

            <div className="bg-card border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
              <Target
                className="w-12 h-12 text-[#DC143C] mb-4"
                strokeWidth={2}
              />
              <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                Custom Programming
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                Exciting, quick, and new workout routines tailored to your
                fitness level, goals, and schedule.
              </p>
            </div>

            <div className="bg-card border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
              <Apple
                className="w-12 h-12 text-[#DC143C] mb-4"
                strokeWidth={2}
              />
              <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                Nutrition Support
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                Support and accountability in your nutrition program to help
                promote weight loss and better health.
              </p>
            </div>

            <div className="bg-card border-2 border-charcoal-light rounded-[4px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
              <Heart
                className="w-12 h-12 text-[#DC143C] mb-4"
                strokeWidth={2}
              />
              <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                All Levels Welcome
              </h3>
              <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                No prior fitness experience necessary. We meet you wherever you
                are in your fitness journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const benefits = [
    {
      icon: Dumbbell,
      title: "Body Composition & Strength",
      description:
        "Strength training builds lean muscle, which increases your resting metabolic rate. More muscle means your body burns more calories even at rest, making it easier to maintain a healthy weight and body composition.",
    },
    {
      icon: Activity,
      title: "Cardiovascular Health",
      description:
        "Minimum 20 minutes of cardio daily helps burn fat, improve your BMI, and significantly reduce the risk of cardiovascular disease. We'll integrate cardio efficiently into your training program.",
    },
    {
      icon: TrendingUp,
      title: "Sustainable Results",
      description:
        "Our approach combines effective training with nutritional support to create lasting change. No quick fixes—just proven methods that deliver real, sustainable results.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              What You&apos;ll Achieve
            </h2>
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-[4px] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <Icon
                        className="w-16 h-16 text-[#DC143C]"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-foreground mb-3">
                        {benefit.title}
                      </h3>
                      <div className="h-[2px] bg-[#DC143C] mb-4 w-12" />
                      <p className="font-sans text-lg text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
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

function GetStartedSection() {
  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-6">
            Ready to Start?
          </h2>
          <div className="h-[3px] bg-[#DC143C] w-24 mx-auto mb-8" />
          <p className="font-sans text-xl text-white/90 leading-relaxed mb-8">
            Schedule a free consultation to discuss your goals and create a
            personalized training plan.
          </p>
          <p className="font-sans text-lg text-white/80 leading-relaxed mb-12">
            No experience required. Just bring your commitment, and we&apos;ll handle
            the rest.
          </p>

          <Button
            size="lg"
            className="w-full sm:w-auto bg-[#DC143C] hover:bg-[#B01030] text-white text-base md:text-lg font-bold uppercase px-6 sm:px-8 py-6 h-auto rounded-[4px] shadow-[0_8px_16px_rgba(220,20,60,0.4)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(220,20,60,0.5)]"
            asChild
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

export default function PersonalTrainingPage() {
  return (
    <main>
      <ProgramHero />
      <WhyPersonalTrainingSection />
      <BenefitsSection />
      <GetStartedSection />
      <AccessibleLocation />
    </main>
  );
}
