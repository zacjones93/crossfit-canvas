export function GettingStarted() {
  const steps = [
    {
      number: "1",
      title: "Book Your Free No-Sweat Intro",
      description:
        "Schedule a complimentary intro session where we'll learn about your goals and show you around our facility.",
    },
    {
      number: "2",
      title: "Meet Your Coach",
      description:
        "Get paired with an experienced coach who will guide you through proper movement patterns and create your personalized plan.",
    },
    {
      number: "3",
      title: "Start Training",
      description:
        "Join our small group classes and become part of the Canvas community. All fitness levels welcome.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Getting Started is Easy
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Three simple steps to begin your fitness journey with us
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-12 md:space-y-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-6 md:flex-row md:gap-12 font-heading text-center md:text-left"
            >
              <div className="flex-shrink-0">
                <span className="block text-6xl font-black tracking-tighter text-primary md:text-8xl ">
                  {step.number}
                </span>
              </div>
              <div className="flex-1 pt-2 md:pt-6">
                <h3 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl font-heading">
                  {step.title}
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground font-sans">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
