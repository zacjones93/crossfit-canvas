import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Apple,
  Activity,
  Heart,
  TrendingUp,
  Users,
  Calendar,
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
          Nutrition Coaching in Caldwell, ID
        </h1>

        <p className="font-sans text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
          Personalized diet plans tailored to your lifestyle. Achieve peak
          fitness, energy, and mood.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-white hover:bg-black hover:text-white text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 hover:cursor-pointer min-w-[200px]"
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
        <ChevronDown className="w-8 h-8 text-white/80" strokeWidth={3} />
      </div>
    </section>
  );
}

function PersonalizedApproachSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Comprehensive Diet Planning
            </h2>
            <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
            <p className="font-sans text-xl text-muted-foreground leading-relaxed">
              We will pin-point a comprehensive diet plan, custom to your
              lifestyle, that helps you feel you are at your peak potential in
              terms of fitness, energy levels, and mood.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center">
              <Activity
                className="w-12 h-12 text-white mb-4 mx-auto"
                strokeWidth={2}
              />
              <h3 className="font-heading text-xl uppercase tracking-wide text-foreground mb-3">
                Peak Fitness
              </h3>
              <div className="h-[2px] bg-white mb-4 w-12 mx-auto" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                Fuel your workouts and recovery with proper nutrition
              </p>
            </div>

            <div className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center">
              <TrendingUp
                className="w-12 h-12 text-white mb-4 mx-auto"
                strokeWidth={2}
              />
              <h3 className="font-heading text-xl uppercase tracking-wide text-foreground mb-3">
                Energy Levels
              </h3>
              <div className="h-[2px] bg-white mb-4 w-12 mx-auto" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                Maintain consistent energy throughout the day
              </p>
            </div>

            <div className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all text-center">
              <Heart
                className="w-12 h-12 text-white mb-4 mx-auto"
                strokeWidth={2}
              />
              <h3 className="font-heading text-xl uppercase tracking-wide text-foreground mb-3">
                Better Mood
              </h3>
              <div className="h-[2px] bg-white mb-4 w-12 mx-auto" />
              <p className="font-sans text-muted-foreground leading-relaxed">
                Feel your best mentally and emotionally
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatYouGetSection() {
  const inclusions = [
    {
      icon: Apple,
      title: "Customized Macro Nutrient Plans",
      description:
        "Receive a personalized macronutrient breakdown designed specifically for your goals, body composition, and activity level. We calculate exactly what you need to fuel your performance and achieve results.",
    },
    {
      icon: Calendar,
      title: "Weekly Check-In Sessions",
      description:
        "Stay on track with regular check-ins. We'll review your progress, adjust your plan as needed, and provide ongoing support to ensure you're making consistent progress toward your goals.",
    },
    {
      icon: Users,
      title: "Personal Nutrition Coach",
      description:
        "Work directly with a dedicated nutrition coach who understands your goals and challenges. Get expert guidance, accountability, and the support you need to succeed.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              Nutrition Coaching Includes
            </h2>
          </div>

          <div className="space-y-6">
            {inclusions.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-card border-2 border-charcoal-light rounded-sm p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                      <Icon className="w-16 h-16 text-white" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl md:text-3xl uppercase tracking-wide text-foreground mb-3">
                        {item.title}
                      </h3>
                      <div className="h-[2px] bg-white mb-4 w-12" />
                      <p className="font-sans text-lg text-muted-foreground leading-relaxed">
                        {item.description}
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

function LifestyleIntegrationSection() {
  return (
    <section className="py-20 bg-charcoal-dark relative">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-white mb-6">
            Built For Your Lifestyle
          </h2>
          <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
          <p className="font-sans text-xl text-white/90 leading-relaxed mb-8">
            Our nutrition coaching isn&apos;t about restrictive diets or
            complicated meal plans. We create sustainable, practical approaches
            that fit your real life.
          </p>
          <p className="font-sans text-lg text-white/80 leading-relaxed mb-12">
            Whether you&apos;re a busy parent, working professional, or
            competitive athlete, we&apos;ll design a nutrition strategy that
            works for your schedule, preferences, and goals.
          </p>

          <Button
            size="lg"
            className="bg-white hover:bg-black hover:text-white text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 hover:cursor-pointer"
            asChild
          >
            <a
              href="https://canvas.pushpress.com/landing/appointments/apptpkg_63f8d1d720bba8b2a72920b11cdc"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Your Nutrition Journey
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function NutritionPage() {
  return (
    <main>
      <ProgramHero />
      <PersonalizedApproachSection />
      <WhatYouGetSection />
      <LifestyleIntegrationSection />
    </main>
  );
}
