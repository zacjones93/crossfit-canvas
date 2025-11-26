import { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { GettingStarted } from "@/components/landing/getting-started";
import { GoogleReviews } from "@/components/landing/google-reviews";
import { Community } from "@/components/landing/community";
import { AccessibleLocation } from "@/components/landing/accessible-location";
import { Facility } from "@/components/landing/facility";
import { MayhemAffiliate } from "@/components/landing/mayhem-affiliate";
import { FinalCTA } from "@/components/landing/final-cta";

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
      <GettingStarted />
      <GoogleReviews />
      <Community />
      <AccessibleLocation />
      <Facility />
      {/* <ValuePillars /> */}
      <MayhemAffiliate />
      <FinalCTA />
    </main>
  );
}
