"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { SITE_PHONE, SITE_PHONE_HREF } from "@/constants";

export function FAQHighlights() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "HOW DO I GET STARTED?",
      answer:
        "Schedule a free No Sweat Intro where a coach discusses your objectives and creates a tailored plan for success.",
    },
    {
      question: "HOW LONG DOES IT TAKE TO SEE RESULTS?",
      answer:
        "Consistency yields results over time. Beginners may notice strength improvements and fitness gains within 30 days.",
    },
    {
      question: "DO I GET THE CHANCE TO MEET NEW FRIENDS?",
      answer:
        "Yes, small group fitness classes facilitate meeting others with shared fitness goals.",
    },
    {
      question: "WHAT SETS YOU APART FROM OTHER GYMS?",
      answer:
        "The facility functions as a supportive community where \"if you win, we all win.\"",
    },
    {
      question: "HOW OFTEN DO YOU RECOMMEND COMING TO WORKOUT CLASSES?",
      answer:
        "Beginners should start with 2-4 weekly sessions, progressing to 5 weekly after several months while allowing recovery time.",
    },
    {
      question: "DO YOU PROVIDE FREE REFRESHMENTS THERE?",
      answer:
        "High-end filtered water is complimentary; additional beverages are available for purchase.",
    },
    {
      question: "DO I HAVE TO BE FIT TO JOIN?",
      answer:
        "No fitness level requirement exists. The program features universal scalability for all individuals. Coaches will make sure the workout of the day fits your current fitness level.",
    },
    {
      question: "WHAT KIND OF EXERCISES CAN I EXPECT DURING A WORKOUT?",
      answer:
        "Classes include strength training (Olympic lifts, deadlifts, bodyweight work) followed by programmed workouts lasting 5-20+ minutes.",
    },
    {
      question: "DO I HAVE TO STOP EATING MY FAVORITE FOODS TO BE HEALTHY?",
      answer:
        "No. Sustainable wellness requires realistic, manageable approaches with balanced macronutrient tracking.",
    },
    {
      question: "WHAT PAYMENT METHODS DO YOU ACCEPT?",
      answer:
        "All major credit and debit cards accepted; personal checks are not accepted.",
    },
  ];

  return (
    <section className="py-20 bg-black relative">
      <div className="container mx-auto px-6">
        {/* Main heading */}
        <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-white text-center mb-16 tracking-tight">
          FREQUENTLY ASKED
          <br />
          QUESTIONS
        </h2>

        {/* Still curious section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
          <h3 className="font-heading text-2xl md:text-3xl text-white tracking-wide">
            STILL CURIOUS? TALK TO US!
          </h3>
          <a
            href={SITE_PHONE_HREF}
            className="bg-white text-black font-heading text-lg px-8 py-3 hover:bg-[#DC143C] hover:text-white transition-colors"
          >
            {SITE_PHONE}
          </a>
          <a
            href="/contact"
            className="bg-white text-black font-heading text-lg px-8 py-3 hover:bg-[#DC143C] hover:text-white transition-colors"
          >
            CONTACT US
          </a>
        </div>

        {/* FAQ accordion items */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-white/20">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full py-6 flex items-start justify-between gap-4 text-left group"
              >
                <h3 className="font-heading text-lg md:text-xl text-white tracking-wide group-hover:text-[#DC143C] transition-colors">
                  {faq.question}
                </h3>
                <Plus
                  className={`w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : ""
                  }`}
                  strokeWidth={2.5}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <p className="font-sans text-base text-white/80 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
