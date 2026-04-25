import { motion } from 'motion/react';
import { Award, Users, ShoppingBag, Leaf } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   Subtle agritech sketch background — line-art watermark
   ══════════════════════════════════════════════════════ */
const AgritechSketchBg = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <style>{`.sk{stroke:#16a34a;stroke-width:1.2;fill:none;opacity:0.07}`}</style>
    </defs>
    <g transform="translate(40,60)">
      <circle cx="30" cy="18" r="10" className="sk"/>
      <line x1="30" y1="28" x2="30" y2="60" className="sk"/>
      <line x1="30" y1="40" x2="12" y2="52" className="sk"/>
      <line x1="30" y1="40" x2="48" y2="48" className="sk"/>
      <line x1="30" y1="60" x2="16" y2="78" className="sk"/>
      <line x1="30" y1="60" x2="44" y2="78" className="sk"/>
      <path d="M48 48 Q60 44 62 52 Q60 60 48 56" className="sk"/>
      <line x1="70" y1="70" x2="70" y2="40" className="sk"/>
      <path d="M70 50 Q82 44 80 52" className="sk"/>
      <line x1="84" y1="70" x2="84" y2="38" className="sk"/>
    </g>
    <g transform="translate(20,340)">
      <rect x="0" y="0" width="60" height="40" rx="4" className="sk"/>
      <line x1="0" y1="12" x2="60" y2="12" className="sk"/>
      <line x1="20" y1="12" x2="20" y2="40" className="sk"/>
      <line x1="40" y1="12" x2="40" y2="40" className="sk"/>
      <rect x="8" y="-44" width="60" height="40" rx="4" className="sk"/>
    </g>
    <g transform="translate(980,80)">
      <rect x="20" y="20" width="110" height="60" rx="6" className="sk"/>
      <rect x="0" y="34" width="26" height="46" rx="4" className="sk"/>
      <rect x="4" y="38" width="18" height="16" rx="2" className="sk"/>
      <circle cx="28" cy="82" r="12" className="sk"/>
      <circle cx="106" cy="82" r="12" className="sk"/>
    </g>
    <g transform="translate(540,30)">
      <circle cx="30" cy="30" r="22" className="sk"/>
      <line x1="46" y1="46" x2="62" y2="62" className="sk" style={{strokeWidth:3}}/>
      <path d="M18 30 L26 38 L44 20" className="sk" style={{strokeWidth:2}}/>
    </g>
    <g transform="translate(200,220)" opacity="0.6">
      <path d="M0 0 Q80 -30 160 0" className="sk" style={{strokeDasharray:'6 4'}}/>
      <path d="M200 0 Q280 -30 360 0" className="sk" style={{strokeDasharray:'6 4'}}/>
    </g>
    <g transform="translate(960,310)">
      <rect x="0" y="30" width="160" height="100" rx="4" className="sk"/>
      <path d="M-10 30 L80 0 L170 30" className="sk"/>
      <rect x="55" y="80" width="50" height="50" rx="3" className="sk"/>
    </g>
  </svg>
);

/* ══════════════════════════════════════════════════════
   Farmers Factory — green badge circle + leaf + text
   ══════════════════════════════════════════════════════ */
const FarmersFactoryLogoSVG = () => (
  <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" width="200" height="90">
    {/* Green circle badge */}
    <circle cx="48" cy="50" r="42" fill="#1f6b35"/>
    <circle cx="48" cy="50" r="38" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity="0.4"/>
    {/* Stylised F from leaf */}
    <rect x="34" y="28" width="7" height="44" rx="3.5" fill="white"/>
    <rect x="34" y="28" width="26" height="7" rx="3.5" fill="white"/>
    <rect x="34" y="47" width="20" height="6" rx="3" fill="#a3e635"/>
    {/* Leaf accent */}
    <path d="M62 32 Q76 24 74 38 Q68 44 62 38 Z" fill="#a3e635"/>
    <line x1="66" y1="36" x2="74" y2="30" stroke="#1f6b35" strokeWidth="1.2"/>
    {/* Text */}
    <text x="100" y="42" fontFamily="Arial Black,sans-serif" fontSize="17" fontWeight="900"
          fill="#1a3a28" textAnchor="middle" letterSpacing="0.5">FARMERS</text>
    <text x="100" y="62" fontFamily="Arial Black,sans-serif" fontSize="17" fontWeight="900"
          fill="#1f6b35" textAnchor="middle" letterSpacing="0.5">FACTORY</text>
    <text x="100" y="78" fontFamily="Arial,sans-serif" fontSize="9" fill="#4b7a5e"
          textAnchor="middle" letterSpacing="1">FARM TO FORK NETWORK</text>
  </svg>
);

/* ══════════════════════════════════════════════════════
   Partner brand logos — each unique, accurate SVG
   ══════════════════════════════════════════════════════ */

/** Swiggy Instamart — supplied brand asset */
const InstamartLogoSVG = () => (
  <img
    src="/partners/instamart.jpg"
    alt="Swiggy Instamart logo"
    className="h-full w-full object-contain"
    loading="lazy"
  />
);

/** bigbasket — green bb square + red·green text + TATA tag */
const BigBasketLogoSVG = () => (
  <svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="220" height="80" rx="10" fill="white"/>
    {/* Green bb block */}
    <rect x="6" y="10" width="50" height="50" rx="10" fill="#56ab26"/>
    <text x="31" y="47" fontFamily="Arial Black,sans-serif" fontSize="28" fontWeight="900"
          fill="white" textAnchor="middle">bb</text>
    {/* bigbasket text */}
    <text x="67" y="40" fontFamily="Arial Black,sans-serif" fontSize="20" fontWeight="900"
          fill="#c1272d">big</text>
    <text x="103" y="40" fontFamily="Arial Black,sans-serif" fontSize="20" fontWeight="900"
          fill="#56ab26">basket</text>
    {/* A TATA Enterprise */}
    <text x="67" y="56" fontFamily="Arial,sans-serif" fontSize="9.5" fill="#1a56a8">A </text>
    <text x="78" y="56" fontFamily="Arial Black,sans-serif" fontSize="9.5" fontWeight="900"
          fill="#1a56a8">TATA</text>
    <text x="103" y="56" fontFamily="Arial,sans-serif" fontSize="9.5" fill="#1a56a8"> Enterprise</text>
  </svg>
);

/** DMart — cream bg, bold green D★Mart */
const DMartLogoSVG = () => (
  <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="80" rx="10" fill="#f5efdc"/>
    {/* Large D */}
    <text x="12" y="57" fontFamily="Arial Black,sans-serif" fontSize="50" fontWeight="900"
          fill="#1a6930">D</text>
    {/* Star above D */}
    <text x="50" y="26" fontSize="16" fill="#1a6930">★</text>
    {/* Mart */}
    <text x="62" y="57" fontFamily="Arial Black,sans-serif" fontSize="42" fontWeight="900"
          fill="#1a6930">Mart</text>
    {/* Tagline */}
    <text x="12" y="74" fontFamily="Arial,sans-serif" fontSize="9" fill="#3a7a40"
          letterSpacing="0.3">Daily Savings  Daily Discounts</text>
  </svg>
);

/** Zepto — purple bold brand */
const ZeptoLogoSVG = () => (
  <svg viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <defs>
      <linearGradient id="zepto-wordmark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f33276" />
        <stop offset="55%" stopColor="#f55258" />
        <stop offset="100%" stopColor="#ff7a45" />
      </linearGradient>
    </defs>
    <rect width="320" height="120" rx="18" fill="#4b0b78" />
    <text
      x="160"
      y="78"
      textAnchor="middle"
      fontFamily="Trebuchet MS, Arial Rounded MT Bold, Arial, sans-serif"
      fontSize="74"
      fontWeight="700"
      letterSpacing="0"
      fill="url(#zepto-wordmark)"
    >
      zepto
    </text>
  </svg>
);

/** TAJ Hotels — supplied brand asset */
const TajLogoSVG = () => (
  <img
    src="/partners/taj.jpg"
    alt="TAJ Hotels logo"
    className="h-full w-full object-contain"
    loading="lazy"
  />
);

/** Amazon — white bg, smile-arrow, bold amazon text */
const AmazonLogoSVG = () => (
  <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="80" rx="10" fill="white"/>
    {/* amazon text in black */}
    <text x="100" y="42" fontFamily="Arial Black,sans-serif" fontSize="30" fontWeight="900"
          fill="#1a1a1a" textAnchor="middle" letterSpacing="-0.5">amazon</text>
    {/* Smile arrow in Amazon orange */}
    <path d="M52 54 Q100 68 148 54" fill="none" stroke="#ff9900" strokeWidth="4"
          strokeLinecap="round"/>
    {/* Arrow tip */}
    <path d="M144 50 L150 54 L144 58" fill="none" stroke="#ff9900" strokeWidth="4"
          strokeLinecap="round" strokeLinejoin="round"/>
    {/* .in tag */}
    <text x="155" y="42" fontFamily="Arial,sans-serif" fontSize="13" fill="#ff9900">.in</text>
  </svg>
);

/* ══════════════════════════════════════════════════════
   Partner data — each entry has its own unique Logo component
   ══════════════════════════════════════════════════════ */
const PARTNERS: { Logo: () => JSX.Element; name: string; tagline: string }[] = [
  { Logo: InstamartLogoSVG,  name: 'Swiggy Instamart', tagline: 'Grocery delivery'        },
  { Logo: BigBasketLogoSVG,  name: 'bigbasket',         tagline: 'Online grocery'          },
  { Logo: DMartLogoSVG,      name: 'DMart',             tagline: 'Retail chain'            },
  { Logo: ZeptoLogoSVG,      name: 'Zepto',             tagline: 'Quick commerce delivery' },
  { Logo: TajLogoSVG,        name: 'TAJ Hotels',        tagline: 'Royal hospitality'       },
  { Logo: AmazonLogoSVG,     name: 'Amazon',            tagline: 'E-commerce marketplace'  },
];

/* ══════════════════════════════════════════════════════
   Main Section
   ══════════════════════════════════════════════════════ */
export const TrustedPartnersSection = () => (
  <section className="py-20 bg-white overflow-hidden relative" id="partners">
    <AgritechSketchBg />

    <div className="relative z-10 max-w-7xl mx-auto px-6">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-semibold mb-4">
          <Award size={15} className="text-green-600" />
          Our Buyer Partners
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3">
          Our Buyer Partners &amp;{' '}
          <span className="text-green-600">Trusted Brands</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-base">
          Your produce reaches India's top retailers, quick-commerce platforms, and luxury hotel chains — directly, transparently.
        </p>
      </motion.div>

      {/* ── FARMERS FACTORY — MAIN FEATURED ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 rounded-3xl bg-gradient-to-r from-green-800 via-green-700 to-green-800 border border-green-600/40 p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-green-900/20"
      >
        {/* Logo block */}
        <div className="shrink-0 flex flex-col items-center gap-4">
          <span className="text-xs font-black text-lime-300 uppercase tracking-widest bg-lime-500/15 border border-lime-500/30 px-4 py-1.5 rounded-full">
            ⭐ Main Partner — India's Farmer Network
          </span>
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-green-400/25 blur-2xl scale-125" />
            <div className="relative bg-white rounded-2xl shadow-lg p-4 flex items-center justify-center"
                 style={{ width: 200, height: 96 }}>
              <img
                src="/partners/farmers-factory-logo.jpg"
                alt="Farmers Factory logo"
                className="h-full w-full object-contain p-1"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-2">Farmers Factory</h3>
          <p className="text-green-300 text-base font-medium mb-4">
            Direct farmer collective partnership · FPO network integration
          </p>
          {/* Stat badges */}
          <div className="flex flex-wrap gap-3 mt-5 justify-center md:justify-start">
            {[
              { icon: <Users size={14}/>, val: '1,000+', sub: 'Farmers' },
              { icon: <Leaf size={14}/>, val: '24/7', sub: 'Technical Support' },
              { icon: <ShoppingBag size={14}/>, val: 'Restaurant', sub: 'Cloud Kitchen Partners' },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-2.5 shadow-sm"
              >
                <span className="text-lime-300">{s.icon}</span>
                <div>
                  <p className="text-sm font-black text-lime-300 leading-none">{s.val}</p>
                  <p className="text-xs text-green-200 leading-none mt-0.5">{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── 6 Buyer Partner Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {PARTNERS.map(({ Logo, name, tagline }, idx) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            whileHover={{ scale: 1.05, y: -6 }}
            className="flex flex-col items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-200 hover:shadow-lg transition-all duration-200 cursor-default"
          >
            {/* Logo box — fixed height, each brand renders its own SVG */}
            <div className="w-full flex items-center justify-center h-16 rounded-xl overflow-hidden bg-gray-50 p-1">
              <Logo />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-800 leading-snug">{name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{tagline}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-gray-400"
      >
        Partnered with trusted F&amp;B buyers, retailers, and farmer networks for consistent, large-volume market demand across India.
      </motion.p>
    </div>
  </section>
);
