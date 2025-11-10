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
          <p className="text-xs text-white/80">*CF Canvas Members: $25/off</p>
        </div>
        <div>
          <p className="font-bold text-white">3-Month Commitment: $200/Month</p>
          <p className="text-xs text-white/80">*CF Canvas Members: $25/off</p>
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
          <p>Cost: $100</p>
        </div>
      </div>
    ),
  },
  {
    title: "Punch Card & Drop Ins",
    content: (
      <>
        <p>
          1 Class Drop In: <span className="text-white font-bold">$20</span>
        </p>
        <p>
          10 Class Punch Card:{" "}
          <span className="text-white font-bold">$169</span>
        </p>
        <p>
          1 Week Drop in: <span className="text-white font-bold">$50</span>
        </p>
        <p className="text-xs text-white/80 pt-2">
          *(Punch Cards Expire in 6 Months)
        </p>
        <p className="text-xs text-white/80">
          **CF Canvas Members receive 25% off Punch Cards for additional classes
        </p>
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
        <p>
          Monthly: <span className="text-white font-bold">$40/month</span>
        </p>
        <p className="text-xs text-white/80">**$10/Month for each additional</p>
        <p className="text-xs text-white/80">*Daily: $5/per child</p>
        <p className="text-xs text-white/80 pt-2">
          *See Schedule for Current Hours
        </p>
      </>
    ),
  },
  {
    title: "Personal Training",
    content: (
      <>
        <p className="text-white font-bold text-lg">$50/Session</p>
        <p className="text-xs text-white/80 pt-2">
          *Discounts available for pre-paying for packages of 5+ sessions
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
        <p className="text-xs text-white/60">(30min Sessions)</p>
        <div className="pt-2 space-y-1">
          <p className="font-bold text-white">Cost:</p>
          <p>$15/30min Session</p>
          <p>$25/Month</p>
          <p>$199/1-Year</p>
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
          <span className="text-white font-bold">15%</span>
        </p>
        <p>
          Couples / Family: <span className="text-white font-bold">10%</span>
        </p>
        <p>
          Healthcare / Teacher / Student:{" "}
          <span className="text-white font-bold">10%</span>
        </p>
        <div className="pt-3 border-t border-white/10">
          <p className="font-bold text-white mb-2">
            Additional Pre-Paid Discount
          </p>
          <p>
            Prepaid 6 Months - <span className="text-white font-bold">5%</span>
          </p>
          <p>
            Prepaid 12 Months -{" "}
            <span className="text-white font-bold">10%</span>
          </p>
        </div>
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
