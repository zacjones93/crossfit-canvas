import { CheckCircle, Clock, DollarSign } from "lucide-react";

export function FAQHighlights() {
  const faqs = [
    {
      icon: CheckCircle,
      question: "Do I need experience?",
      answer:
        "Absolutely not! We work with complete beginners every day. Every workout is scaled to your current fitness level by our expert coaches.",
    },
    {
      icon: Clock,
      question: "What's a typical class like?",
      answer:
        "60-minute classes with warm-up, skill work, and workout. Small groups (8-12 people) ensure individual attention and proper form.",
    },
    {
      icon: DollarSign,
      question: "How much does it cost?",
      answer:
        "Unlimited membership starts at $165/month. Try us first with 21 days for $199 or a free No Sweat Intro consultation.",
      link: true,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 md:gap-12">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <div
                key={index}
                className="text-center md:text-left space-y-4 p-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-12 h-12 text-orange-600 mx-auto md:mx-0" />
                <h3 className="text-2xl font-bold text-gray-900">{faq.question}</h3>
                <p className="text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                {faq.link && (
                  <button className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center">
                    See all pricing options →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
