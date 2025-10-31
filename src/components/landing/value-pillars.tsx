import { Award, Building2, Users, Heart } from "lucide-react";

export function ValuePillars() {
  const pillars = [
    {
      icon: Award,
      title: "CERTIFIED EXPERT COACHES",
      description:
        "All coaches are CrossFit Level 1+ certified with years of experience. We focus on proper form, safety, and helping you reach your goals.",
      // Placeholder for actual gym photo
      bgPosition: "center",
    },
    {
      icon: Building2,
      title: "12,000 SF FACILITY",
      description:
        "State-of-the-art 12,000 square foot facility with Rogue equipment, showers, recovery room, and dedicated kids' area. Everything you need under one roof.",
      bgPosition: "center",
    },
    {
      icon: Users,
      title: "SMALL CLASS SIZES",
      description:
        "Average 8-12 people per class means individual attention from coaches. You're not just a number - we learn your name, your goals, and how to help you succeed.",
      bgPosition: "center",
    },
    {
      icon: Heart,
      title: "NO-CLIQUE COMMUNITY",
      description:
        "From first-timers to competitive athletes, everyone is welcome here. No intimidation, no judgment - just supportive people working toward their goals together.",
      bgPosition: "center",
    },
  ];

  return (
    <section className="py-20 bg-white relative">
      {/* Subtle concrete texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden bg-gradient-to-br from-charcoal-dark to-black min-h-[400px] flex flex-col justify-end p-6 transition-transform hover:scale-[1.02]"
              >
                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 z-10" />

                {/* Placeholder for B&W photo background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 grayscale opacity-50" />

                {/* Red paint stroke accent on left edge */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#DC143C] z-20" />

                {/* Content */}
                <div className="relative z-20 space-y-3">
                  <Icon className="w-12 h-12 text-[#DC143C] mb-2" strokeWidth={2} />
                  <h3 className="font-heading text-2xl text-white tracking-wide leading-tight">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-sm text-white/90 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
