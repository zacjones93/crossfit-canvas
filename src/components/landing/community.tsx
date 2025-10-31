export function Community() {
  return (
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
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content on Right */}
          <div className="px-6 py-12 md:px-12 md:py-20">
            <div className="space-y-6 text-white">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                Our community is what makes us special and it&apos;s what will keep you going
              </h2>

              <div className="space-y-4 text-base md:text-lg">
                <p>
                  We know how frustrating it can be to not get the results you want. No worries! We will be here every step of the way.
                </p>

                <p>
                  CrossFit Canvas has been around for years helping people reach their fitness goals.
                </p>

                <p>
                  We believe in supporting people who are ready to take action and give them everything they need to crush their goals. It&apos;s why our members keep coming back for more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
