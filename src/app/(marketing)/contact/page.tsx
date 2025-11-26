"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SITE_EMAIL, SITE_PHONE, SITE_PHONE_HREF } from "@/constants";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Captcha } from "@/components/captcha";
import { submitContactFormAction } from "./contact.action";
import { useServerAction } from "zsa-react";
import { useConfigStore } from "@/state/config";

export default function ContactPage() {
  const { isTurnstileEnabled } = useConfigStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const { execute: submitForm, isPending } = useServerAction(submitContactFormAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || "Failed to send message");
    },
    onStart: () => {
      toast.loading("Sending your message...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Message sent successfully!");
      setIsSuccess(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await submitForm({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: formData.message,
      captchaToken,
    });
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-charcoal-dark to-black" />
        <div className="relative z-20 container mx-auto px-6 text-center">
          <h1 className="font-heading text-4xl md:text-6xl uppercase tracking-wide text-white mb-4 leading-tight">
            Contact Us
          </h1>
          <p className="font-sans text-xl md:text-2xl text-white/90 font-normal">
            We&apos;re Here to Help You Get Started
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                  Get In Touch
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Have questions? We&apos;d love to hear from you. Send us a
                  message and we&apos;ll respond as soon as possible.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-xl font-bold mb-2">
                        Phone
                      </h3>
                      <a
                        href={SITE_PHONE_HREF}
                        className="text-base hover:text-primary transition-colors"
                      >
                        {SITE_PHONE}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-xl font-bold mb-2">
                        Email
                      </h3>
                      <a
                        href={`mailto:${SITE_EMAIL}`}
                        className="text-base hover:text-primary transition-colors"
                      >
                        {SITE_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-xl font-bold mb-2">
                        Location
                      </h3>
                      <p className="text-base leading-relaxed">
                        4611 Enterprise Way
                        <br />
                        Caldwell, Idaho 83605
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Off Franklin on the east side of the freeway near Crunch
                        Fitness
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading text-xl font-bold mb-2">
                        Hours
                      </h3>
                      <p className="text-base leading-relaxed">
                        <span className="font-semibold">Monday-Friday:</span>
                        <br />5am - 8pm
                      </p>
                      <p className="text-base leading-relaxed mt-2">
                        <span className="font-semibold">Saturday:</span>
                        <br />8am - 1pm
                      </p>
                      <p className="text-base leading-relaxed mt-2">
                        <span className="font-semibold">Sunday:</span>
                        <br />9am - 1pm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-lg border p-8 shadow-lg">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                      <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold mb-3">
                      Message Sent Successfully!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      Thank you for reaching out to us.
                    </p>
                    <p className="text-base text-muted-foreground">
                      We&apos;ll get back to you by email or phone as soon as
                      possible, typically within 24 hours.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: "", email: "", phone: "", message: "" });
                      setCaptchaToken(undefined);
                    }}
                    className="bg-black hover:bg-white hover:text-black border border-white text-white text-base font-bold uppercase px-8 py-3 h-auto rounded-sm transition-all hover:scale-105"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-2xl font-bold mb-6">
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-base font-medium mb-2 block"
                  >
                    Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-base font-medium mb-2 block"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="text-base font-medium mb-2 block"
                  >
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full"
                    placeholder="(208) 555-1234"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="text-base font-medium mb-2 block"
                  >
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full min-h-[150px]"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                {isTurnstileEnabled && (
                  <div className="flex justify-center">
                    <Captcha
                      onSuccess={(token) => setCaptchaToken(token)}
                      options={{
                        theme: "dark",
                      }}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending || (isTurnstileEnabled && !captchaToken)}
                  className="w-full bg-black hover:bg-white hover:text-black border border-white text-white text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  {isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Optional */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-[16/9] w-full rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.4567890123456!2d-116.6878901!3d43.6387901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54ae5601d0000001%3A0x1234567890abcdef!2s4611%20Enterprise%20Way%2C%20Caldwell%2C%20ID%2083605!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CrossFit Canvas Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white uppercase tracking-wide">
              Ready to Get Started?
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              Book a free intro session and experience CrossFit Canvas for
              yourself
            </p>
            <Button
              asChild
              size="lg"
              className="bg-black hover:bg-white hover:text-black border border-white text-white text-base font-bold uppercase px-8 py-6 h-auto rounded-sm transition-all hover:scale-105 hover:cursor-pointer"
            >
              <Link href="/tour">
                Schedule a Tour
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
