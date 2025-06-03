import { Facebook, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary/100 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Section: About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              Refuger Aid is dedicated to providing innovative solutions for global challenges. Learn more about our mission and values.
            </p>
          </div>
          {/* Section: Sitemap */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sitemap</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/" className="hover:underline">About</a></li>
              <li><a href="/portals" className="hover:underline">Portals</a></li>
              <li><a href="/world" className="hover:underline">Volunteer</a></li>
              <li><a href="/" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          {/* Section: Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:underline">Blog</a></li>
              <li><a href="/faq" className="hover:underline">FAQ</a></li>
              <li><a href="/" className="hover:underline">Support</a></li>
              <li><a href="/" className="hover:underline">Privacy Policy</a></li>
            </ul>
          </div>
          {/* Section: Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-sm">
                <a href="mailto:duwagbale07@gmail.com" target="_blank">
                Email: support@refugeaicompass.com
                </a>
            </p>
            <p className="text-sm">
                <a href="tel:+2349022301155" target="_blank">
                 Call Us: +234 902 230 1155
                </a>
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" className="hover:opacity-75">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" className="hover:opacity-75">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" className="hover:opacity-75">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} RefugeeAid. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
