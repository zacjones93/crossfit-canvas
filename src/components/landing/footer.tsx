export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Column 1: Branding */}
          <div>
            <h3 className="text-2xl font-bold mb-4">CrossFit Canvas</h3>
            <p className="text-gray-400 mb-6">Caldwell's Premier CrossFit Gym</p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Programs
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Schedule
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Coaches
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Programs</h4>
            <ul className="space-y-2">
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  CrossFit Classes
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  HYROX Training
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Personal Training
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Kids Program
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">Yoga</button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white transition-colors">Spin</button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Caldwell, Idaho 83605</li>
              <li>(555) 123-4567</li>
              <li>info@crossfitcanvas.com</li>
              <li className="mt-4">
                <p className="font-semibold text-white mb-2">Hours:</p>
                <p>Mon-Fri: 5am-8pm</p>
                <p>Sat: 7am-12pm</p>
                <p>Sun: 9am-11am</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} CrossFit Canvas. All rights reserved.</p>
            <div className="flex gap-6">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            CrossFit® is a registered trademark of CrossFit, LLC.
          </p>
        </div>
      </div>
    </footer>
  );
}
