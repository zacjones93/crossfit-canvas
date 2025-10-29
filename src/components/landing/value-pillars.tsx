import { Award, Building2, Users, Heart } from "lucide-react";

export function ValuePillars() {
  const pillars = [
    {
      icon: Award,
      title: "Certified Expert Coaches",
      description:
        "All coaches are CrossFit Level 1+ certified with years of experience. We focus on proper form, safety, and helping you reach your goals.",
    },
    {
      icon: Building2,
      title: "12,000 SF Facility",
      description:
        "State-of-the-art 12,000 square foot facility with Rogue equipment, showers, recovery room, and dedicated kids' area. Everything you need under one roof.",
    },
    {
      icon: Users,
      title: "Small Class Sizes",
      description:
        "Average 8-12 people per class means individual attention from coaches. You're not just a number - we learn your name, your goals, and how to help you succeed.",
    },
    {
      icon: Heart,
      title: "No-Clique Community",
      description:
        "From first-timers to competitive athletes, everyone is welcome here. No intimidation, no judgment - just supportive people working toward their goals together.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="flex justify-center">
                  <Icon className="w-16 h-16 text-orange-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{pillar.title}</h3>
                <p className="text-base text-gray-700 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
