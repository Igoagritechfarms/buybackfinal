/**
 * Farmer & Buyer Testimonials Configuration
 * Phase 0 Feature: Video Testimonials + Text Reviews
 *
 * Contains farmer video testimonials and buyer reviews
 * Videos are stored on Supabase with fallback to placeholder videos
 */

export interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  videoUrl: string;
  thumbnail: string;
  duration: number; // in seconds
  badge: string;
  title: string;
  highlights: string[];
}

export interface TextTestimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  image: string;
  badge: string;
}

/**
 * FARMER VIDEO TESTIMONIALS (5 Videos for Phase 0)
 * These are farmer success stories with video proof
 * Videos hosted on Supabase or YouTube
 */
export const farmerVideoTestimonials: VideoTestimonial[] = [
  {
    id: 'farmer-1',
    name: 'Ramesh Kumar',
    role: 'Cucumber Farmer',
    location: 'Madurai, Tamil Nadu',
    videoUrl: 'https://example-supabase.com/testimonials/ramesh-cucumber.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-7049fae79241?w=400&q=80',
    duration: 120,
    badge: '🌱 8 Harvests',
    title: 'From 30% Loss to Full Market Price',
    highlights: [
      'Lost 30% to middlemen before IGO',
      'Now gets full market price in 7 days',
      'Direct bank transfer every week',
      '8 successful harvests with IGO'
    ]
  },
  {
    id: 'farmer-2',
    name: 'Priya Muthukumar',
    role: 'Microgreens Farmer',
    location: 'Bangalore, Karnataka',
    videoUrl: 'https://example-supabase.com/testimonials/priya-microgreens.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    duration: 95,
    badge: '🏆 Premium',
    title: 'Premium Prices for Premium Quality',
    highlights: [
      'Consistent buyers for 6 months',
      'Premium pricing tier available',
      'Zero wastage through IGO platform',
      'Expanded farm by 40%'
    ]
  },
  {
    id: 'farmer-3',
    name: 'Senthil Nathan',
    role: 'Mushroom Farmer',
    location: 'Coimbatore, Tamil Nadu',
    videoUrl: 'https://example-supabase.com/testimonials/senthil-mushroom.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    duration: 110,
    badge: '✅ Verified',
    title: 'Focus on Growing, IGO Handles the Rest',
    highlights: [
      'Transparent pricing - no hidden charges',
      'Self transport intake support included',
      'Fair quality verification process',
      'Recommended to 15+ farmers'
    ]
  },
  {
    id: 'farmer-4',
    name: 'Deepa Krishnan',
    role: 'Tomato & Vegetable Farmer',
    location: 'Hosur, Tamil Nadu',
    videoUrl: 'https://example-supabase.com/testimonials/deepa-vegetables.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    duration: 105,
    badge: '💪 Consistent',
    title: 'Consistent Income, Zero Middlemen',
    highlights: [
      '₹4.5L earned in 6 months',
      'No commission deductions',
      'Planned next farm expansion',
      'Family now supports farming business'
    ]
  },
  {
    id: 'farmer-5',
    name: 'Ravinder Singh',
    role: 'Organic Lettuce & Greens Farmer',
    location: 'Pune, Maharashtra',
    videoUrl: 'https://example-supabase.com/testimonials/ravinder-greens.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507838957267-9daab77a96eb?w=400&q=80',
    duration: 115,
    badge: '🌿 Organic',
    title: 'Organic Certification + Fair Pricing',
    highlights: [
      'Organic certification support from IGO',
      'Premium prices for certified produce',
      'Direct B2B connections with restaurants',
      'Expanded to 8 acres organically'
    ]
  }
];

/**
 * TEXT TESTIMONIALS (Buyer & Farmer Reviews)
 * Used in cards grid view
 */
export const textTestimonials: TextTestimonial[] = [
  {
    id: 'review-1',
    name: 'Ramesh Kumar',
    role: 'Cucumber Farmer, Madurai',
    text: 'IGO Agritech changed everything for me. I used to lose 30% to middlemen. Now I get full market price in 7 days — directly in my account.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    badge: '🌱 8 Harvests',
  },
  {
    id: 'review-2',
    name: 'Anitha Selvam',
    role: 'Restaurant Owner, Chennai',
    text: "The freshness and quality of microgreens from IGO is outstanding. Delivery is always on time. Best B2B supplier I've worked with.",
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    badge: '👨‍💼 Top Buyer',
  },
  {
    id: 'review-3',
    name: 'Senthil Nathan',
    role: 'Mushroom Farmer, Coimbatore',
    text: 'Transparent pricing and self transport intake — I just focus on growing. IGO handles everything else. Highly recommend to all farmers.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/53.jpg',
    badge: '🏆 Premium',
  },
  {
    id: 'review-4',
    name: 'Priya Muthukumar',
    role: 'Homemaker, Salem',
    text: 'We get fresh vegetables delivered directly from farms. The quality difference is night and day compared to supermarkets.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/29.jpg',
    badge: '⭐ Loyal',
  },
  {
    id: 'review-5',
    name: 'Arun Sharma',
    role: 'Distributor, Bangalore',
    text: 'The reliability of supply chain through IGO is unmatched. My B2B clients trust us because IGO never disappoints on quality or timing.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/61.jpg',
    badge: '📦 B2B',
  },
  {
    id: 'review-6',
    name: 'Deepa Krishnan',
    role: 'Vegetable Farmer, Hosur',
    text: 'Best decision I made was joining IGO. The platform is so easy to use, and I get fair prices. My income doubled in 6 months.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/36.jpg',
    badge: '💪 Growth',
  },
];

/**
 * BUYER TESTIMONIALS (Restaurant & Retail)
 * For B2B section highlighting buyer satisfaction
 */
export const buyerTestimonials: TextTestimonial[] = [
  {
    id: 'buyer-1',
    name: 'Anitha Selvam',
    role: 'Restaurant Owner, Chennai',
    text: 'The freshness and quality of microgreens from IGO is outstanding. Delivery is always on time. Best B2B supplier I\'ve worked with.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/52.jpg',
    badge: '👨‍💼 Top Buyer',
  },
  {
    id: 'buyer-2',
    name: 'Vikram Patel',
    role: 'Hotel Manager, Hyderabad',
    text: 'Consistent quality, competitive pricing, and reliable delivery. IGO has become our primary vegetable supplier. Couldn\'t be happier.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/47.jpg',
    badge: '⭐ Premium',
  },
  {
    id: 'buyer-3',
    name: 'Lakshmi Exports',
    role: 'Organic Store, Pune',
    text: 'Certified organic products at fair prices. Our customers love the freshness. IGO has helped us scale our business significantly.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    badge: '🌿 Organic',
  },
];

/**
 * Helper functions
 */
export const getVideoTestimonials = () => farmerVideoTestimonials;
export const getTextTestimonials = () => textTestimonials;
export const getBuyerTestimonials = () => buyerTestimonials;
export const getAllTestimonials = () => [...textTestimonials, ...buyerTestimonials];
