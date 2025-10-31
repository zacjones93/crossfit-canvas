import { Metadata } from "next";
import Image from "next/image";
import { ClassBreakdown } from "@/components/landing/class-breakdown";
import { FinalCTA } from "@/components/landing/final-cta";

export const metadata: Metadata = {
  title: "What is CrossFit? | CrossFit Canvas",
  description:
    "Learn about CrossFit methodology, functional movements, and how our constantly varied, high-intensity training program can help you achieve your fitness goals.",
};

export default function WhatIsCrossFit() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl font-heading">
              What is CrossFit?
            </h1>
            <p className="text-lg text-gray-600 md:text-xl font-sans">
              CrossFit is a strength and conditioning program that combines
              functional movements performed at high intensity. It&apos;s
              designed to prepare you for any physical challenge life throws
              your way.
            </p>
          </div>
        </div>
      </section>

      {/* Definition Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl font-heading">
                Constantly Varied, Functional Movements, Executed at High
                Intensity
              </h2>
              <div className="space-y-4 text-gray-600 font-sans">
                <p>
                  CrossFit is more than just a workout, it&apos;s a methodology
                  that prepares you for the unknown and unknowable. Whether
                  you&apos;re lifting groceries, playing with your kids, or
                  competing in sports, CrossFit gives you the fitness foundation
                  to excel.
                </p>
                <p>
                  Our program combines elements from weightlifting, gymnastics,
                  and conditioning to create a comprehensive fitness program.
                  Every day is different, keeping your body challenged and your
                  mind engaged.
                </p>
                <p>
                  All you have to do is show up, and we&apos;ll take care of the
                  rest.
                </p>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
              <Image
                src="/assets/rowing.png"
                alt="CrossFit athletes rowing in class"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Functional Movements */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-300">
                <Image
                  src="/assets/deadlift.png"
                  alt="Athlete performing deadlift - functional movement"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl font-heading">
                Functional Movements
              </h2>
              <div className="space-y-4 text-gray-600 font-sans">
                <p>
                  Functional movements are natural, multi-joint actions that
                  mirror real-life activities. Think squatting, lifting,
                  pushing, and pulling, movements you use every day.
                </p>
                <p>
                  This could be lifting a heavy box, carrying a child, or even
                  just picking up a small object. We will prepare you for all
                  the things you do in your daily life.
                </p>
                <p>
                  These movements are the foundation of human movement and the
                  key to developing practical, usable fitness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Constantly Varied */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl font-heading">
                Constantly Varied
              </h2>
              <div className="space-y-4 text-gray-600 font-sans">
                <p>
                  No two workouts are the same at CrossFit Canvas. Variety keeps
                  your body constantly improving and also keeps things exciting,
                  you&apos;ll never be bored!
                </p>
                <p>
                  One day might focus on heavy lifting, the next on gymnastic
                  skills, and another on high-intensity metabolic conditioning
                  (breathing heavy). Or there might be a mix of all three!
                </p>
                <p className="font-semibold text-gray-900">
                  The result? Comprehensive fitness that prepares you for
                  anything.
                </p>
              </div>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-200">
              <Image
                src="/assets/lunge.png"
                alt="Happy CrossFit athlete giving thumbs up"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* High Intensity */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl font-heading">
                High Intensity
              </h2>
              <p className="text-lg text-gray-600 font-sans">
                Intensity is where the magic happens. If you don&apos;t push
                yourself, you won&apos;t get the results you want. Intensity for
                you will look different for the person next to you.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900 font-heading">
                  Scalable
                </h3>
                <p className="text-gray-600 font-sans">
                  Intensity is relative to your fitness level. Beginners and
                  elite athletes train side by side, each at their optimal
                  intensity.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900 font-heading">
                  Measurable
                </h3>
                <p className="text-gray-600 font-sans">
                  Track your progress through scores and times. See tangible
                  improvements in your fitness journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Class Breakdown */}
      <ClassBreakdown />

      {/* CTA Section */}
      <FinalCTA />
    </main>
  );
}
