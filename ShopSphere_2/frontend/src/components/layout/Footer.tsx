import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Electronics', href: '/products?category=Electronics' },
    { label: 'Clothing', href: '/products?category=Clothing' },
    { label: 'Home & Kitchen', href: '/products?category=Home+%26+Kitchen' },
  ],
  Account: [
    { label: 'My Profile', href: '/profile' },
    { label: 'My Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShopSphere</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Your premium shopping destination. Quality products, fast delivery.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center space-x-2"><Mail className="w-4 h-4" /><span>support@shopsphere.com</span></p>
              <p className="flex items-center space-x-2"><Phone className="w-4 h-4" /><span>+91 1234567890</span></p>
              <p className="flex items-center space-x-2"><MapPin className="w-4 h-4" /><span>Mumbai, India</span></p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-primary-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8 opacity-70" />
            <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8 opacity-70" />
            <img src="https://img.icons8.com/color/48/rupay.png" alt="RuPay" className="h-8 opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
}
