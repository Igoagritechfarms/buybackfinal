import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, ArrowRight, Instagram, Facebook, Youtube, Heart, Star, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const Footer = () => (
  <footer className="bg-gray-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    </div>

    <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <BrandLogo
            to="/"
            linkClassName="group w-fit"
            className="flex flex-col items-start gap-1.5"
            imageClassName="h-16 w-auto rounded-xl"
            caption="Agricultural Marketplace"
            captionClassName="pl-1 text-[9px] font-semibold leading-none uppercase tracking-widest text-gray-500"
          />

          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering farmers through transparent farmgate mandi, fair pricing, and technology-driven logistics across India & beyond.
          </p>

          <div className="flex gap-3">
            {[
              { icon: <Facebook size={15} />, href: '#', color: 'hover:bg-blue-600' },
              { icon: <Instagram size={15} />, href: '#', color: 'hover:bg-pink-600' },
              { icon: <Youtube size={15} />, href: '#', color: 'hover:bg-red-600' },
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className={`w-9 h-9 bg-white/8 border border-white/10 ${social.color} rounded-xl flex items-center justify-center transition-all duration-300`}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={13} className="text-lime-500" />
            <span>ISO Certified · FSSAI Approved</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h4 className="font-bold mb-5 text-xs uppercase tracking-widest text-gray-500">Platform</h4>
          <ul className="space-y-3">
            {[
              { label: 'Sell Your Harvest', to: '/sell' },
              { label: 'Buy Fresh Produce', to: '/buy' },
              { label: 'Market Prices', to: '/market' },
              { label: 'Product Catalog', to: '/catalog' },
              { label: 'Earn Rewards', to: '/referrals' },
              { label: 'Contact Us', to: '/contact' },
            ].map((linkItem, index) => (
              <motion.li
                key={linkItem.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={linkItem.to}
                  className="text-sm text-gray-400 hover:text-lime-400 transition-all duration-300 flex items-center gap-2 group"
                >
                  <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300 text-lime-600" />
                  {linkItem.label}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h4 className="font-bold mb-5 text-xs uppercase tracking-widest text-gray-500">Products</h4>
          <ul className="space-y-3">
            {[
              { label: '🥒 Cucumber' },
              { label: '🍄 Oyster Mushroom' },
              { label: '🌱 Microgreens' },
              { label: '🧅 Exotic Vegetables' },
              { label: '🥗 Fresh Greens' },
              { label: '🐔 Animal Products' },
            ].map((product, index) => (
              <motion.li
                key={product.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="text-sm text-gray-400 hover:text-lime-400 transition-all duration-300 flex items-center gap-2 cursor-pointer group"
              >
                <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform duration-300 text-lime-600" />
                {product.label}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h4 className="font-bold mb-5 text-xs uppercase tracking-widest text-gray-500">Contact</h4>
          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <MapPin size={15} className="text-lime-500 mt-0.5 shrink-0" />
              <span className="text-gray-400">No 17 , Kovalan street, 2nd main road, Uthandi kanathur, Chennai 600119.</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={15} className="text-lime-500 shrink-0" />
              <a href="tel:+91 8925893321" className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                +91 8925893321
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={15} className="text-lime-500 shrink-0" />
              <a href="mailto:buyback@igogroups.com" className="text-sm text-gray-400 hover:text-lime-400 transition-colors">
                buyback@igogroups.com
              </a>
            </li>
          </ul>

          <a
            href="https://wa.me/+918925893321"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp Us
          </a>
        </motion.div>
      </div>

      <motion.div
        className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <span>© 2026 Farmgate Mandi · IGO Agricultural Marketplace. All Rights Reserved.</span>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Heart size={10} className="text-red-400" />
          </motion.div>
        </div>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Sitemap'].map((label) => (
            <span key={label} className="hover:text-lime-400 transition-colors cursor-pointer">{label}</span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-6 flex justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="bg-white/5 border border-white/8 rounded-full px-5 py-2 flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
              <Star key={index} size={11} fill="#fbbf24" className="text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium">4.9/5 from 800+ farmers across India</span>
        </div>
      </motion.div>
    </div>
  </footer>
);
