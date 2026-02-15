import { Metadata } from "next";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoachCard } from "@/components/coach-card";
import { coaches } from "@/constants/coaches";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - CrossFit Canvas Caldwell",
  description:
    "Learn about CrossFit Canvas in Caldwell, ID. Our mission, values, coaches, and commitment to helping you change your life through fitness.",
};

export default function AboutPage() {
  const programs = [
    "CrossFit Classes & Premium Facility",
    "Olympic Lifting",
    "Personal Training",
    "Kids Fitness Classes",
    "Sports Performance Training",
    "One-on-One Nutrition Programming",
    "Members-Only App",
    "Open Gym Access",
    "Top-of-the-line Equipment",
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-charcoal-dark to-black" />
        <div className="relative z-20 container mx-auto px-6 text-center">
          <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-wide text-white mb-4 leading-tight">
            About CrossFit Canvas
          </h1>
          <p className="font-sans text-xl md:text-2xl text-white/90 font-normal">
            Change Your Life With Us
          </p>
        </div>
      </section>
      {/* Mission Section with Image */}
      <section className="bg-black">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 items-center">
            {/* Image on Left */}
            <div className="relative h-[400px] md:h-[600px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('/assets/gym-fam.png')",
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content on Right */}
            <div className="px-6 py-12 md:px-12 md:py-20">
              <div className="space-y-6 text-white">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-balance">
                  About CrossFit Canvas
                </h1>

                <div className="space-y-4 text-base md:text-lg">
                  <p>
                    Simply put, our mission is to help you, &quot;Change Your
                    Life With Us.&quot; After spending time in our facility and
                    with our team we want our members to walk out of our doors
                    after a workout and feel like they are a better version of
                    themselves.
                  </p>

                  <p>
                    Our team cares about guiding and encouraging each and every
                    member to obtain the goals they seek for themselves. Our
                    members&apos; goals are specific and if we can assist in
                    that journey to realizing their aspirations then we have
                    truly helped them change their life.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Values - Dark Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6 text-white">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 text-balance">
              Our community is what makes us special and it&apos;s what will
              keep you going
            </h2>

            <div className="space-y-4 text-base md:text-lg">
              <p>
                CrossFit Canvas has been serving the Caldwell, Idaho community
                for years, focusing on supporting people ready to take action on
                their fitness goals.
              </p>

              <p>
                We understand that working out is challenging, but accessibility
                and convenience should never be barriers to your success.
                Whether you&apos;re just starting out or are a seasoned athlete,
                you&apos;ll find support, encouragement, and accountability from
                our coaches and fellow members.
              </p>

              <p>
                We believe in supporting people who are ready to take action and
                give them everything they need to crush their goals. It&apos;s
                why our members keep coming back for more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Section - Placeholder */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Meet Our Coaches
            </h2>
            <p className="text-lg text-muted-foreground">
              Our experienced coaching team is dedicated to helping you reach
              your goals
            </p>
          </div>

          {/* Coaches grid - 2 columns on desktop */}
          <div className="max-w-7xl mx-auto scroll-mt-44" id="coaches">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {coaches.map((coach) => (
                <CoachCard key={coach.name} coach={coach} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card rounded-lg border p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <MapPin className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-3">
                      Location
                    </h3>
                    <p className="text-base leading-relaxed">
                      4611 Enterprise Way
                      <br />
                      Caldwell, Idaho 83605
                    </p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Conveniently located off Franklin on the east side of the
                      freeway past Home Depot
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <Clock className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-heading text-2xl font-bold mb-3">
                      Hours
                    </h3>
                    <p className="text-base leading-relaxed">
                      <span className="font-semibold">Monday-Friday:</span>
                      <br />5 AM - 8 PM
                    </p>
                    <p className="text-base leading-relaxed mt-2">
                      <span className="font-semibold">Weekends:</span>
                      <br />8 AM - 3 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs & Amenities */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Programs & Amenities
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to reach your fitness goals
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {programs.map((program, index) => (
                <div key={index} className="flex items-start gap-3 group">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                  <p className="text-base">{program}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Join our community and start your fitness journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-black hover:bg-white hover:text-black border-2 border-white text-white text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105"
              >
                <Link href="/tour">
                  Schedule a Tour
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all"
              >
                <a href="/schedule">View Schedule</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
