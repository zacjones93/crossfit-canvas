import Image from "next/image";

export function MayhemAffiliate() {
  return (
    <section className="bg-black py-12">
      <div className="container mx-auto px-6 py-8 md:py-12 border-t border-b border-white/20 ">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/assets/IMG_5345.AVIF"
              alt="Mayhem Affiliate"
              width={200}
              height={120}
              className="object-contain grayscale opacity-90"
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left max-w-2xl">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Programming from the Best: Mayhem Affiliate
            </h3>
            <p className="text-sm md:text-base text-white/80">
              World-class programming from the Mayhem team. Every workout expertly designed, tested, and scaled for
              all levels. Plus, you get access to coaching expertise right here in
              Caldwell to make sure worksouts work for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
