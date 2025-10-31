export function ServicesAmenities() {
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6">
        <h2 className="font-heading text-5xl md:text-6xl uppercase text-white mb-12 text-center tracking-wide">
          Services &amp; Facility Amenities
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Nutrition Coaching */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Nutrition Coaching
            </h3>
            <div className="space-y-3 font-sans text-white/80 text-sm">
              <div>
                <p className="font-bold text-white">Month-To-Month: $250/Month</p>
                <p className="text-xs text-[#DC143C]">*CF Canvas Members: $25/off</p>
              </div>
              <div>
                <p className="font-bold text-white">3-Month Commitment: $200/Month</p>
                <p className="text-xs text-[#DC143C]">*CF Canvas Members: $25/off</p>
              </div>
            </div>
          </div>

          {/* Youth Fitness Classes */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Youth Fitness Classes
            </h3>
            <div className="space-y-3 font-sans text-white/80 text-sm">
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
          </div>

          {/* Punch Card & Drop Ins */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Punch Card &amp; Drop Ins
            </h3>
            <div className="space-y-2 font-sans text-white/80 text-sm">
              <p>1 Class Drop In: <span className="text-white font-bold">$20</span></p>
              <p>10 Class Punch Card: <span className="text-white font-bold">$169</span></p>
              <p>1 Week Drop in: <span className="text-white font-bold">$50</span></p>
              <p className="text-xs text-[#DC143C] pt-2">*(Punch Cards Expire in 6 Months)</p>
              <p className="text-xs text-[#DC143C]">**CF Canvas Members receive 25% off Punch Cards for additional classes</p>
            </div>
          </div>

          {/* Membership Amenities */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Membership Amenities:
            </h3>
            <ul className="space-y-2 font-sans text-white/80 text-sm">
              <li>• Workout Tracking App</li>
              <li>• Members Only App (Push Press)</li>
              <li>• Free In-Body Scans (1x/Month)</li>
              <li>• Cold Essential Oil Infused Towels</li>
              <li>• Men&apos;s &amp; Women Locker Room &amp; Showers</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Kids Room Supervision */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Kids Room Supervision:
            </h3>
            <div className="space-y-2 font-sans text-white/80 text-sm">
              <p>Monthly: <span className="text-white font-bold">$40/month</span></p>
              <p className="text-xs text-[#DC143C]">**$10/Month for each additional</p>
              <p className="text-xs text-[#DC143C]">*Daily: $5/per child</p>
              <p className="text-xs text-[#DC143C] pt-2">*See Schedule for Current Hours</p>
            </div>
          </div>

          {/* Personal Training */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Personal Training
            </h3>
            <div className="space-y-2 font-sans text-white/80 text-sm">
              <p className="text-white font-bold text-lg">$50/Session</p>
              <p className="text-xs text-[#DC143C] pt-2">*Discounts available for pre-paying for packages of 5+ sessions</p>
            </div>
          </div>

          {/* Wellness Memberships */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Wellness Memberships
            </h3>
            <div className="space-y-2 font-sans text-white/80 text-sm">
              <p className="mb-2">Unlimited Access to Infrared Sauna &amp; Normatec Recovery Boots</p>
              <p className="text-xs text-white/60">(30min Sessions)</p>
              <div className="pt-2 space-y-1">
                <p className="font-bold text-white">Cost:</p>
                <p>$15/30min Session</p>
                <p>$25/Month</p>
                <p>$199/1-Year</p>
              </div>
            </div>
          </div>

          {/* Discounts */}
          <div className="bg-charcoal-dark border border-[#DC143C]/20 p-6 hover:border-[#DC143C] transition-colors">
            <h3 className="font-subheading text-xl uppercase text-white mb-4 font-bold">
              Discounts
            </h3>
            <div className="space-y-2 font-sans text-white/80 text-sm">
              <p>Military / Police / Firefighter: <span className="text-white font-bold">15%</span></p>
              <p>Couples / Family: <span className="text-white font-bold">10%</span></p>
              <p>Healthcare / Teacher / Student: <span className="text-white font-bold">10%</span></p>
              <div className="pt-3 border-t border-white/10">
                <p className="font-bold text-white mb-2">Additional Pre-Paid Discount</p>
                <p>Prepaid 6 Months - <span className="text-white font-bold">5%</span></p>
                <p>Prepaid 12 Months - <span className="text-white font-bold">10%</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
