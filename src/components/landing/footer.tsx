import ThemeSwitch from "../theme-switch";
import { SITE_PHONE } from "@/constants";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Column 1: Branding */}
          <div>
            <h3 className="font-heading text-3xl uppercase text-white mb-2 tracking-wide">
              CrossFit Canvas
            </h3>
            {/* Red brush stroke underline */}
            <div className="h-[3px] w-24 bg-white mb-4" />
            <p className="font-sans text-gray-400 mb-6">Caldwell&apos;s Premier CrossFit Gym</p>

            {/* Social Media Links */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/crossfitcanvas"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://www.instagram.com/crossfitcanvas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-subheading font-bold text-lg mb-4 uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  About Us
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Pricing
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Schedule
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/about#coaches" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Coaches
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Contact
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div>
            <h4 className="font-subheading font-bold text-lg mb-4 uppercase tracking-wide">
              Programs
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/programs/crossfit-classes" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  CrossFit Classes
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/programs/hyrox" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  HYROX Training
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/programs/personal-training" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Personal Training
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/programs/kids-fitness-classes" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Kids Program
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/programs/olympic-lifting" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Olympic Lifting
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link href="/programs/nutrition" className="group font-sans text-gray-400 hover:text-white transition-colors relative">
                  Nutrition
                    <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-white transition-all group-hover:w-full" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-subheading font-bold text-lg mb-4 uppercase tracking-wide">
              Contact
            </h4>
            <ul className="space-y-2.5 font-sans text-gray-400 text-sm">
              <li>Caldwell, Idaho 83605</li>
              <li>{SITE_PHONE}</li>
              <li>info@crossfitcanvas.com</li>
              <li className="mt-4 pt-2">
                <p className="font-semibold text-white mb-2">Hours:</p>
                <p>Mon-Fri: 5am-8pm</p>
                <p>Sat: 7am-12pm</p>
                <p>Sun: 9am-11am</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with red separator */}
      <div className="border-t border-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p className="font-sans">© {currentYear} CrossFit Canvas. All rights reserved.</p>
            <div className="flex gap-6 items-center">
              {/* <Link href="/privacy" className="font-sans hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="font-sans hover:text-white transition-colors">
                Terms of Service
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
