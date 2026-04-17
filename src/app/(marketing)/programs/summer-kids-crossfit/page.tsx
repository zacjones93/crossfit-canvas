import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Target,
  Zap,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

const ENROLL_URL = "https://canvas.pushpress.com/landing/plans";
const HERO_IMAGE = "/assets/kids/summer-kids-crossfit.png";

export const metadata: Metadata = {
  title: "Summer Kids CrossFit Program | CrossFit Canvas",
  description:
    "Summer Kids CrossFit Program in Caldwell, ID. June 1 – July 31. Ages 6-12. Speed, agility, footwork, coordination, and basic strength training in a fun coach-led program.",
  openGraph: {
    title: "Summer Kids CrossFit Program | CrossFit Canvas",
    description:
      "Summer Kids CrossFit Program in Caldwell, ID. June 1 – July 31. Ages 6-12. Speed, agility, footwork, coordination, and basic strength training in a fun coach-led program.",
  },
};

function ProgramHero() {
  return (
    <section className="relative overflow-hidden bg-black pt-3">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-charcoal-dark to-black" />
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('/texture/concrete.png')] bg-repeat" />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: Editorial text block */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="font-heading text-white/60 text-5xl md:text-6xl leading-none tracking-wide">
                01
              </span>
              <div className="h-px bg-white/40 flex-1 max-w-[80px]" />
              <p className="font-subheading text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/70">
                Summer 2026 / Issue No. 01
              </p>
            </div>

            <h1 className="font-heading text-[56px] sm:text-7xl md:text-8xl lg:text-[120px] uppercase tracking-tight text-white leading-[0.88] mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              Kids
              <br />
              <span className="text-white">Cross</span>
              <span className="italic text-white/70">Fit</span>
            </h1>

            <div className="flex items-center gap-3 mb-8">
              <div className="h-[3px] bg-white w-16" />
              <p className="font-subheading text-sm md:text-base font-bold uppercase tracking-[0.25em] text-white/80">
                Ages 6–12 / Caldwell, ID
              </p>
            </div>

            <div className="mb-8">
              <p className="font-subheading text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/50 mb-1">
                Runs
              </p>
              <p className="font-heading text-3xl md:text-4xl text-white leading-none tracking-wide">
                06.01
                <span className="text-white/40 mx-2">—</span>
                07.31
              </p>
            </div>

            <p className="font-sans text-lg md:text-xl text-white/85 mb-10 max-w-xl leading-relaxed">
              Speed, agility, footwork, coordination, and basic strength training
              in a fun coach-led program. Built to turn summer into something
              they&apos;ll remember.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                size="lg"
                className="bg-white hover:bg-white/90 text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-[1.02] min-w-[200px] shadow-[4px_4px_0_0_rgba(255,255,255,0.25)]"
                asChild
              >
                <Link href={ENROLL_URL} target="_blank" rel="noopener noreferrer">
                  Enroll Now
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent hover:bg-white hover:text-black border-2 border-white text-white text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-[1.02] min-w-[200px]"
              >
                <Link href="/tour">Schedule a Tour</Link>
              </Button>
            </div>
          </div>

          {/* Right: Clipped B&W photo bleeding off the right edge */}
          <div className="relative h-[460px] md:h-[560px] lg:h-[640px] -mr-6 lg:-mr-[max(2rem,calc((100vw-1280px)/2+0rem))]">
            {/* Vertical metadata — runs up the left side of the image */}
            <div className="hidden md:flex absolute -left-4 top-8 flex-col items-center gap-4 z-20 pointer-events-none">
              <p
                className="font-subheading text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 whitespace-nowrap"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                FRAME 001 · CROSSFIT CANVAS
              </p>
              <div className="h-16 w-px bg-white/30" />
            </div>

            {/* Image container with intentional diagonal clip */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath:
                  "polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 12%)",
              }}
            >
              <Image
                src={HERO_IMAGE}
                alt="Young athlete pressing a dumbbell overhead at CrossFit Canvas kids program"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center grayscale contrast-[1.08] saturate-0"
              />
              {/* Darkening edge gradient for contrast with text on small screens */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/40 lg:to-transparent" />
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[url('/texture/concrete.png')] bg-repeat pointer-events-none" />
            </div>

            {/* Outlined echo frame, offset — reinforces the intentional-clip feel */}
            <div
              className="absolute inset-0 border-2 border-white/30 pointer-events-none translate-x-3 translate-y-3 hidden md:block"
              style={{
                clipPath:
                  "polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 12%)",
              }}
            />

            {/* Caption strip — bottom left over image */}
            <div className="absolute bottom-4 left-4 md:left-8 z-20 flex items-center gap-3">
              <div className="h-[2px] bg-white w-8" />
              <p className="font-subheading text-[11px] md:text-xs font-bold uppercase tracking-[0.3em] text-white">
                Build · Move · Belong
              </p>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown className="w-7 h-7 text-white/60" strokeWidth={2.5} />
        </div>
      </div>
    </section>
  );
}

function ProgramDetailsSection() {
  const details = [
    {
      icon: Calendar,
      label: "Dates",
      value: ["Starting June 1st", "through July 31st"],
      num: "01",
    },
    {
      icon: Clock,
      label: "Days & Times",
      value: ["Mon / Wed / Fri", "9:45am & 5:30pm"],
      num: "02",
    },
    {
      icon: Users,
      label: "Ages",
      value: ["6–12 years old"],
      num: "03",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] bg-[url('/texture/concrete.png')] bg-repeat pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white text-black font-subheading font-bold uppercase text-xs tracking-[0.25em] px-3 py-1 rounded-sm mb-6">
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              Limited Space Available
            </div>
            <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tight text-foreground mb-4">
              Program Details
            </h2>
            <div className="h-[3px] bg-white w-24 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {details.map(({ icon: Icon, label, value, num }) => (
              <div
                key={label}
                className="group relative bg-card border-2 border-charcoal-light rounded-sm p-8 transition-all hover:border-white hover:-translate-y-1"
              >
                <span className="absolute top-3 right-4 font-heading text-4xl text-white/20 group-hover:text-white/40 transition-colors leading-none">
                  {num}
                </span>
                <Icon className="w-10 h-10 text-white mb-5" strokeWidth={2} />
                <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                  {label}
                </h3>
                <div className="h-[2px] bg-white mb-4 w-10" />
                <div className="font-sans text-muted-foreground leading-relaxed">
                  {value.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatTheyLearnSection() {
  const skills = [
    {
      icon: Zap,
      title: "Speed & Agility",
      description: "Quick-footed drills that build athletic reaction time.",
    },
    {
      icon: Target,
      title: "Footwork & Coordination",
      description:
        "Skill-based patterns that develop balance and body awareness.",
    },
    {
      icon: Users,
      title: "Basic Strength Training",
      description:
        "Age-appropriate functional movements with a focus on form.",
    },
    {
      icon: Sparkles,
      title: "Conditioning",
      description:
        "Fun, coach-led workouts that keep kids engaged and moving.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted relative overflow-hidden">
      {/* Diagonal accent line */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] border-t-2 border-r-2 border-white/5 rotate-12 pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-subheading text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
              Section 02 / Curriculum
            </p>
            <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tight text-foreground mb-4">
              What They&apos;ll Learn
            </h2>
            <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
            <p className="font-sans text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Speed &amp; agility, footwork, coordination, basic strength, and
              conditioning — in a fun coach-led program.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {skills.map((skill, idx) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.title}
                  className="group relative bg-card border-2 border-charcoal-light rounded-sm p-8 transition-all hover:border-white"
                >
                  <span className="absolute top-4 right-5 font-heading text-5xl text-white/15 group-hover:text-white/35 transition-colors leading-none">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <Icon className="w-10 h-10 text-white mb-5" strokeWidth={2} />
                  <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                    {skill.title}
                  </h3>
                  <div className="h-[2px] bg-white mb-4 w-12" />
                  <p className="font-sans text-muted-foreground leading-relaxed">
                    {skill.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const packages = [
    {
      title: "3 Classes Per Week",
      price: "$199",
      description: "Full program access, three sessions every week.",
      featured: true,
    },
    {
      title: "2 Classes Per Week",
      price: "$149",
      description: "Consistent weekly schedule, two sessions every week.",
    },
    {
      title: "10-Class Punch Card",
      price: "$99",
      description: "Flexible drop-in access. Use any 10 classes.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-subheading text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
              Section 03 / Pricing
            </p>
            <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tight text-foreground mb-4">
              Package Options
            </h2>
            <div className="h-[3px] bg-white w-24 mx-auto mb-6" />
            <p className="font-sans text-base md:text-lg text-muted-foreground uppercase tracking-[0.2em] font-bold">
              10% Family Discount Available
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {packages.map((pkg) => (
              <div
                key={pkg.title}
                className={`relative bg-card border-2 rounded-sm p-8 flex flex-col transition-all hover:-translate-y-1 ${
                  pkg.featured
                    ? "border-white shadow-[6px_6px_0_0_rgba(255,255,255,0.15)]"
                    : "border-charcoal-light hover:border-white"
                }`}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-6 bg-white text-black font-subheading text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-sm">
                    Most Popular
                  </span>
                )}
                <DollarSign
                  className="w-10 h-10 text-white mb-4"
                  strokeWidth={2}
                />
                <h3 className="font-heading text-2xl uppercase tracking-wide text-foreground mb-3">
                  {pkg.title}
                </h3>
                <div className="h-[2px] bg-white mb-4 w-12" />
                <p className="font-heading text-6xl text-foreground mb-4 leading-none">
                  {pkg.price}
                </p>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {pkg.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="bg-white hover:bg-black hover:text-white text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-[1.02] hover:cursor-pointer shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]"
              asChild
            >
              <Link href={ENROLL_URL} target="_blank" rel="noopener noreferrer">
                Enroll Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/texture/concrete.png')] bg-repeat" />

      {/* Oversized background type */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <span className="font-heading text-[200px] md:text-[320px] leading-none tracking-tighter text-white whitespace-nowrap">
          ENROLL
        </span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-subheading text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-white/60 mb-4">
            Section 04 / Final Call
          </p>
          <h2 className="font-heading text-4xl md:text-6xl uppercase tracking-tight text-white mb-6">
            Secure Your Child&apos;s Spot
          </h2>
          <div className="h-[3px] bg-white w-24 mx-auto mb-8" />
          <p className="font-sans text-lg md:text-xl text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto">
            Space is limited for the summer program. Reserve a spot today and
            give your kid a summer of movement, confidence, and community.
          </p>

          <Button
            size="lg"
            className="bg-white hover:bg-black hover:text-white text-black text-base md:text-lg font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-[1.02] hover:cursor-pointer shadow-[4px_4px_0_0_rgba(255,255,255,0.25)]"
            asChild
          >
            <Link href={ENROLL_URL} target="_blank" rel="noopener noreferrer">
              Enroll Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function SummerKidsCrossFitPage() {
  return (
    <main>
      <ProgramHero />
      <ProgramDetailsSection />
      <WhatTheyLearnSection />
      <PricingSection />
      <FinalCtaSection />
    </main>
  );
}
