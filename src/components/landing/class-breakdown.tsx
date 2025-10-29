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
    },
    {
      time: "10-30 min",
      title: "Skill Development",
      items: [
        "Learn and practice specific movements",
        "Coaches provide individual feedback",
        "Build strength and technique",
      ],
    },
    {
      time: "30-55 min",
      title: 'Workout (The "WOD")',
      items: [
        "High-energy coached workout",
        "Scaled to your fitness level",
        "Push yourself with group motivation",
      ],
    },
    {
      time: "55-60 min",
      title: "Cool Down & Stretch",
      items: [
        "Guided recovery stretching",
        "Celebrate efforts with classmates",
        "Optional: stay for open gym",
      ],
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Happens in a CrossFit Canvas Class?
            </h2>
            <p className="text-xl text-gray-600">
              Every 60-minute class follows a proven structure designed to improve your fitness
              safely and effectively.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {phases.map((phase, index) => (
              <div key={index} className="flex gap-6">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {phase.time.split("-")[0]}
                  </div>
                  {index < phases.length - 1 && (
                    <div className="w-1 h-full bg-orange-300 mt-2 min-h-[80px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-sm font-semibold text-orange-600">{phase.time}</span>
                      <h3 className="text-2xl font-bold text-gray-900">{phase.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
