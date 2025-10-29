import { Dumbbell, Trophy, Baby, User, Activity, Bike } from "lucide-react";

export function Programs() {
  const programs = [
    {
      icon: Dumbbell,
      title: "CrossFit Classes",
      description:
        "Our signature program. Constantly varied functional movements for all fitness levels.",
    },
    {
      icon: Trophy,
      title: "HYROX Training",
      description:
        "Specific training for HYROX competitions. Build endurance and functional strength.",
    },
    {
      icon: Baby,
      title: "Kids Program",
      description:
        "Fun, age-appropriate fitness for children. Dedicated space and specialized coaching.",
    },
    {
      icon: User,
      title: "Personal Training",
      description: "One-on-one coaching tailored to your specific goals and schedule.",
    },
    {
      icon: Activity,
      title: "Yoga Classes",
      description: "Flexibility, mobility, and recovery. Perfect complement to strength training.",
    },
    {
      icon: Bike,
      title: "Spin Classes",
      description: "High-intensity cardio in our dedicated spin room.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Programs We Offer
          </h2>
          <p className="text-xl text-gray-600">More than just CrossFit</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <Icon className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{program.title}</h3>
                <p className="text-gray-700 mb-4">{program.description}</p>
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  Learn More →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
