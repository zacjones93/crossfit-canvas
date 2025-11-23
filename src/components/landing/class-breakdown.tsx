import { WorkoutLevels } from "./workout-levels";

export function ClassBreakdown() {
  const phases = [
    {
      time: "0-10 min",
      title: "Group Warm-Up",
      items: [
        "Dynamic stretching and mobility",
        "Get blood flowing and prevent injury",
        "Coach introduces workout of the day",
      ],
      example: `Mini Band Hip Warm-Up
-Into-
8:00 AMRAP
30-second machine
5 Kip Swings
5 Scap Pull Ups
5 Alternating V-ups (each side)
5 DB Goblet Squats
6 Back Rack Lunges (PVC/Empty Bar)
5 Hand Release Push Ups`,
      isWorkout: false,
    },
    {
      time: "10-30 min",
      title: "Skill & Strength Development",
      items: [
        "Learn and practice specific movements",
        "Coaches provide individual feedback",
        "Build strength and technique",
      ],
      example: `Squat + Lunge Superset
5 sets - Every 3:00 Minutes
16 DB Goblet Squats (Light/Moderate)
+
8 Back Rack Reverse Lunges (per leg), build across sets based on feel`,
      isWorkout: false,
    },
    {
      time: "30-55 min",
      title: 'Workout (The "WOD")',
      items: [
        "High-energy coached workout",
        "Scaled to your fitness level",
        "Push yourself with group motivation",
      ],
      isWorkout: true,
    },
    {
      time: "55-60 min",
      title: "Cool Down & Stretch",
      items: [
        "Guided recovery stretching",
        "Celebrate efforts with classmates",
        "Optional: stay for open gym",
      ],
      example: `3-5 minutes of easy cardio (walk, slow row, machine ride, etc.)
1 Minute Couch Stretch
15x Bootstrappers
1 Minute Biceps Stretch on Rig`,
      isWorkout: false,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl uppercase tracking-wide text-foreground mb-4">
              What Happens in a CrossFit Canvas Class?
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Every 60-minute class follows a proven structure designed to
              improve your fitness safely and effectively. Every day is
              different, but you can expect the following pattern most days:
              warm up, skill/strength development, and a workout.
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
                  <div className="bg-card border-2 border-charcoal-light rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(220,20,60,0.15)] transition-all">
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

                      {/* Example section or Workout Levels */}
                      {phase.isWorkout ? (
                        <div>
                          <p className="font-subheading text-xs font-bold text-white tracking-wider uppercase mb-3">
                            Example - 4 Scaling Levels
                          </p>
                          <WorkoutLevels />
                        </div>
                      ) : (
                        <div className="bg-muted border-l-4 border-white/80 rounded-sm p-4">
                          <p className="font-subheading text-xs font-bold text-white tracking-wider uppercase mb-2">
                            Example
                          </p>
                          <pre className="font-sans text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {phase.example}
                          </pre>
                        </div>
                      )}
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
