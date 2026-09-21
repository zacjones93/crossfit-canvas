import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowUpRight,
  HeartPulse,
  Instagram,
  Scissors,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "On-Site Services",
  description:
    "Explore medicine and aesthetic care, barbering, and massage therapy available through trusted providers at CrossFit Canvas in Caldwell, Idaho.",
};

const services = [
  {
    number: "02",
    name: "Vital Edge",
    eyebrow: "Medicine & Aesthetic",
    description:
      "Personalized medicine and aesthetic care from Kat, NP—conveniently connected to the CrossFit Canvas community.",
    detail:
      "Visit Vital Edge on Instagram for current services, availability, and the latest booking information.",
    href: "https://www.instagram.com/vitaledge_np_kat",
    cta: "Visit Instagram",
    icon: HeartPulse,
    actionIcon: Instagram,
  },
  {
    number: "03",
    name: "Beastly Gents",
    eyebrow: "Barbershop",
    description:
      "Sharp cuts, beard care, and traditional hot-towel grooming from a local barbershop built around helping you look your best.",
    detail:
      "Choose your service and reserve an appointment directly with Beastly Gents.",
    href: "https://www.beastlygents.com/book-appointment",
    cta: "Book Barber Service",
    icon: Scissors,
    actionIcon: ArrowUpRight,
  },
];

export default function ServicesPage() {
  return (
    <main className="overflow-hidden bg-[#0a0a0a] text-white">
      <section className="relative border-b border-white/10 px-6 pb-16 pt-20 md:pb-24 md:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.09),transparent_26%)]" />
        <div className="absolute -right-20 top-10 select-none font-heading text-[16rem] leading-none text-white/[0.025] md:text-[28rem]">
          03
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="h-px w-12 bg-[#c89b5d]" />
            <p className="font-subheading text-xs font-bold uppercase tracking-[0.28em] text-[#d7ae75]">
              More than a gym
            </p>
          </div>
          <div className="grid items-end gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <h1 className="max-w-4xl font-heading text-6xl uppercase leading-[0.88] tracking-wide sm:text-7xl md:text-8xl lg:text-[7.5rem]">
              Services for
              <span className="block text-white/45">the whole you.</span>
            </h1>
            <p className="max-w-md border-l border-white/20 pl-6 text-base leading-7 text-white/65 md:text-lg">
              Training is one piece of feeling your best. Meet the independent
              providers bringing health, grooming, and recovery services closer
              to our community.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <article className="group grid border border-white/10 bg-[#111] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative aspect-square overflow-hidden lg:aspect-auto lg:min-h-[600px]">
              <Image
                src="/assets/services/martha-massage.png"
                alt="Martha, licensed massage therapist at CrossFit Canvas"
                fill
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#111]/25" />
            </div>

            <div className="flex flex-col p-7 sm:p-10 lg:p-14">
              <div className="mb-16 flex items-start justify-between lg:mb-24">
                <span className="font-heading text-5xl text-white/15 transition-colors group-hover:text-[#c89b5d]">
                  01
                </span>
                <div className="flex h-14 w-14 items-center justify-center border border-white/15 text-white transition-colors group-hover:border-[#c89b5d] group-hover:text-[#d7ae75]">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-auto">
                <p className="mb-3 font-subheading text-xs font-bold uppercase tracking-[0.22em] text-[#d7ae75]">
                  Licensed Massage Therapist
                </p>
                <h2 className="font-heading text-5xl uppercase tracking-wide sm:text-6xl">
                  Massage with Martha
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-7 text-white/80">
                  Personalized therapeutic massage designed to reduce pain and
                  tension, relieve stress, and support better movement and
                  overall well-being.
                </p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                  Invest in your recovery with dedicated one-on-one care, right
                  here at CrossFit Canvas.
                </p>
                <a
                  href="https://app.acuityscheduling.com/schedule/0cb40a58"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-3 bg-white px-6 py-4 font-subheading text-sm font-bold uppercase tracking-wider text-black no-underline transition-colors hover:bg-[#d7ae75]"
                >
                  Book a Massage
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </article>

          <div className="grid gap-px overflow-hidden border-x border-b border-white/10 bg-white/10 lg:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.name}
                className="group relative flex min-h-[430px] flex-col bg-[#111] p-7 transition-colors duration-300 hover:bg-[#171717] sm:p-10"
              >
                <div className="mb-16 flex items-start justify-between">
                  <span className="font-heading text-5xl text-white/15 transition-colors group-hover:text-[#c89b5d]">
                    {service.number}
                  </span>
                  <div className="flex h-14 w-14 items-center justify-center border border-white/15 text-white transition-colors group-hover:border-[#c89b5d] group-hover:text-[#d7ae75]">
                    <service.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="mb-3 font-subheading text-xs font-bold uppercase tracking-[0.22em] text-[#d7ae75]">
                    {service.eyebrow}
                  </p>
                  <h2 className="font-heading text-5xl uppercase tracking-wide sm:text-6xl">
                    {service.name}
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-7 text-white/80">
                    {service.description}
                  </p>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
                    {service.detail}
                  </p>
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center gap-3 border-b border-white/40 pb-2 font-subheading text-sm font-bold uppercase tracking-wider text-white no-underline transition-colors hover:border-[#d7ae75] hover:text-[#d7ae75]"
                  >
                    {service.cta}
                    <service.actionIcon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section className="border-t border-white/10 bg-white px-6 py-14 text-black md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="font-subheading text-xs font-bold uppercase tracking-[0.25em] text-black/50">
              All in one place
            </p>
            <h2 className="mt-3 max-w-3xl font-heading text-5xl uppercase leading-none tracking-wide md:text-7xl">
              Train hard. Recover well. Feel your best.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-black/60">
            Service availability, pricing, and booking are managed independently
            by each provider. Follow the links above for current details.
          </p>
        </div>
      </section>
    </main>
  );
}
