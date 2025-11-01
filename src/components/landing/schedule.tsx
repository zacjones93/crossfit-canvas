import { Button } from "@/components/ui/button";

export function Schedule() {
  const schedule = [
    { time: "5:00 AM", type: "CrossFit" },
    { time: "6:00 AM", type: "CrossFit" },
    { time: "9:00 AM", type: "CrossFit" },
    { time: "12:00 PM", type: "CrossFit" },
    { time: "4:30 PM", type: "CrossFit" },
    { time: "5:30 PM", type: "CrossFit" },
    { time: "6:30 PM", type: "HYROX Training" },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">50+ Classes Weekly</h2>
          <p className="text-xl text-muted-foreground">
            Classes from 5:00 AM to 6:45 PM every day
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
            Sample Schedule (Monday)
          </h3>

          <div className="bg-muted rounded-xl p-6 mb-8">
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-card rounded-lg"
                >
                  <span className="font-semibold text-foreground">{item.time}</span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      item.type === "HYROX Training"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-muted-foreground"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-muted-foreground mb-8">
            Classes available 7 days a week with options for every schedule
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6"
            >
              Book Your Free No-Sweat Intro
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white text-lg px-8 py-6"
            >
              Contact for Full Schedule
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
