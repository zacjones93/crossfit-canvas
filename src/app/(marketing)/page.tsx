import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { FAQHighlights } from "@/components/landing/faq-highlights";
import { ValuePillars } from "@/components/landing/value-pillars";
import { Pricing } from "@/components/landing/pricing";
import { ClassBreakdown } from "@/components/landing/class-breakdown";
import { Programs } from "@/components/landing/programs";
import { Coaches } from "@/components/landing/coaches";
import { Testimonials } from "@/components/landing/testimonials";
import { Facility } from "@/components/landing/facility";
import { Schedule } from "@/components/landing/schedule";
import { Location } from "@/components/landing/location";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "CrossFit Canvas | Premier CrossFit Gym in Caldwell, Idaho",
  description:
    "Join Caldwell's friendliest CrossFit gym. Small classes (8-12 people), expert coaches, and welcoming community. All fitness levels welcome. Book your free intro today!",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <FAQHighlights />
      <ValuePillars />
      <Pricing />
      <ClassBreakdown />
      <Programs />
      <Coaches />
      <Testimonials />
      <Facility />
      <Schedule />
      <Location />
      <FinalCTA />
      <Footer />
    </main>
  );
}
