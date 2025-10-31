import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_PHONE } from "@/constants";

export function Location() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Map */}
          <div>

          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Visit Us</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Address</p>
                    <p className="text-gray-700">Caldwell, Idaho 83605</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Hours</p>
                    <p className="text-gray-700">Monday-Friday: 5:00 AM - 8:00 PM</p>
                    <p className="text-gray-700">Saturday: 7:00 AM - 12:00 PM</p>
                    <p className="text-gray-700">Sunday: 9:00 AM - 11:00 AM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Phone</p>
                    <p className="text-gray-700">{SITE_PHONE}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Email</p>
                    <p className="text-gray-700">info@crossfitcanvas.com</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-6 w-full"
            >
              Send Us a Message
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
