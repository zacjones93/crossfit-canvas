import { ServicesAmenitiesCard } from "./services-amenities-card";
import type { ReactNode } from "react";

interface ServiceAmenity {
  title: string;
  content: ReactNode;
}

const servicesAmenitiesData: ServiceAmenity[] = [
  {
    title: "Nutrition Coaching",
    content: (
      <div className="space-y-3">
        <div>
          <p className="font-bold text-white">Month-To-Month: $250/Month</p>
          <p className="font-bold text-white">3-Month Commitment: $200/Month</p>
          <p className="text-xs text-white/80">*CF Canvas Members: $50/off</p>
        </div>
        <div>
          <p className="font-bold text-white">
            Nutrition Consult &amp; Goals Meeting with Coach follow up.
          </p>
          <p>Cost: $99</p>
        </div>
      </div>
    ),
  },
  {
    title: "Youth Fitness Classes",
    content: (
      <div className="space-y-3">
        <div>
          <p className="font-bold text-white mb-1">6-Week Program:</p>
          <p>2x/Week: $99</p>
          <p>3x/Week: $125</p>
        </div>
        <div>
          <p className="font-bold text-white">Kids Class (10) Punch Card:</p>
          <p>Cost: $99</p>
        </div>
        <p className="text-xs text-white/80">*Single Kids Class: $15</p>
      </div>
    ),
  },
  {
    title: "Punch Card & Drop Ins",
    content: (
      <>
        <p>Single - Open Gym $10</p>
        <p>10 Open Gym Punch Card $79</p>
        <p>Single Class - Drop In $20</p>
        <p>10 Class Punch Card $169</p>
        <p>1 Week Drop in $45</p>
        <p className="text-xs text-white/80 pt-2">
          *(Punch Cards Expire in 6 Months)
        </p>
        <p className="text-xs text-white/80">Add: T-Shirt for $15!</p>
      </>
    ),
  },
  {
    title: "Membership Amenities:",
    content: (
      <ul className="space-y-2">
        <li>• Workout Tracking App</li>
        <li>• Members Only App (Push Press)</li>
        <li>• Free In-Body Scans (1x/Month)</li>
        <li>• Cold Essential Oil Infused Towels</li>
        <li>• Men&apos;s &amp; Women Locker Room &amp; Showers</li>
      </ul>
    ),
  },
  {
    title: "Kids Room Supervision:",
    content: (
      <>
        <p className="font-bold text-white">Free Included with memberships.</p>
        <p className="text-xs text-white/80 pt-2">
          *See Schedule for Current Hours
        </p>
      </>
    ),
  },
  {
    title: "Wellness Memberships",
    content: (
      <>
        <p className="mb-2">
          Unlimited Access to Infrared Sauna &amp; Normatec Recovery Boots
        </p>
        <p className="text-xs text-white/60">(30-min Sessions)</p>
        <div className="pt-2 space-y-1">
          <p className="font-bold text-white">Cost:</p>
          <p>$15 for 30-min Session</p>
          <p>$25/Month</p>
          <p>$199/1-Year - Pre-Paid</p>
        </div>
      </>
    ),
  },
  {
    title: "Discounts",
    content: (
      <>
        <p>
          Military / Police / Firefighter:{" "}
          <span className="text-white font-bold">15% off</span>
        </p>
        <p className="text-xs text-white/80">*Active Duty or retired.</p>
        <p className="pt-2">
          Couples / Family: <span className="text-white font-bold">10% off</span>
        </p>
        <p className="text-xs text-white/80">*Same Household only.</p>
        <p className="pt-2">
          Healthcare / Teacher / Student:{" "}
          <span className="text-white font-bold">10% off</span>
        </p>
      </>
    ),
  },
  {
    title: "Pre-Paid Pricing:",
    content: (
      <>
        <p>
          <span className="font-bold text-white">1-Year Unlimited</span> =
          $2,145 (Saves: $195)
        </p>
        <p>
          <span className="font-bold text-white">6-Month Unlimited</span> =
          $1,111 (Saves: $59)
        </p>
        <p className="pt-2">
          <span className="font-bold text-white">1-Year (13 Classes/Month)</span>{" "}
          = $1,669 (Saves: $151)
        </p>
        <p>
          <span className="font-bold text-white">6-Month (13 Classes/Month)</span>{" "}
          = $864 (Saves: $46)
        </p>
        <p className="text-xs text-white/80 pt-2">
          *Receive discount on top of above pricing.
        </p>
        <p className="text-xs text-white/80">*None Refundable after purchase.</p>
      </>
    ),
  },
];

export function ServicesAmenities() {
  const firstRow = servicesAmenitiesData.slice(0, 4);
  const secondRow = servicesAmenitiesData.slice(4);

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="font-heading text-5xl md:text-6xl uppercase text-white mb-12 text-center tracking-wide">
          Services &amp; Facility Amenities
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {firstRow.map((item) => (
            <ServicesAmenitiesCard
              key={item.title}
              title={item.title}
              content={item.content}
            />
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondRow.map((item) => (
            <ServicesAmenitiesCard
              key={item.title}
              title={item.title}
              content={item.content}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
