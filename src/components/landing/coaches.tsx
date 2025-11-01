export function Coaches() {
  const coaches = [
    {
      name: "Jon",
      title: "Owner & Head Coach",
      credentials: "CrossFit Level 2 Trainer | 8+ Years Coaching Experience",
      bio: "I started CrossFit Canvas to create the gym I always wanted - where everyone feels welcome regardless of fitness level. My favorite part is watching members surprise themselves with what they can achieve.",
    },
    {
      name: "Abi",
      title: "Owner & Coach",
      credentials: "CrossFit Level 1 Trainer | Nutrition Certified",
      bio: "I love helping people build confidence through fitness. Whether you're brand new or an experienced athlete, I'll help you scale workouts to challenge you appropriately and reach your goals.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Meet Your Coaches
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {coaches.map((coach, index) => (
            <div key={index} className="bg-card rounded-xl p-8 shadow-lg text-center">
              {/* Placeholder for coach photo */}
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl font-bold text-white">{coach.name[0]}</span>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">{coach.name}</h3>
              <p className="text-lg font-semibold text-orange-600 mb-2">{coach.title}</p>
              <p className="text-sm text-muted-foreground mb-4">{coach.credentials}</p>
              <p className="text-muted-foreground leading-relaxed mb-6">{coach.bio}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-orange-600 hover:text-orange-700 font-medium text-lg">
            Meet all our coaches →
          </button>
        </div>
      </div>
    </section>
  );
}
