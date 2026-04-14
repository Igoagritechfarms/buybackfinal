import { useState } from 'react';
import { motion } from 'motion/react';
import { Quote, Star, Award, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVideoTestimonials, getTextTestimonials } from '../../config/testimonials';

/**
 * Testimonials Section - Premium customer reviews and success stories
 * Phase 0 Feature: Video testimonials with carousel + text reviews
 */
export const TestimonialsSection = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'text'>('text');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const videoTestimonials = getVideoTestimonials();
  const textReviews = getTextTestimonials();
  const currentVideo = videoTestimonials[currentVideoIndex];

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoTestimonials.length);
    setPlayingVideoId(null);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoTestimonials.length) % videoTestimonials.length);
    setPlayingVideoId(null);
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-agri-earth-50 to-white overflow-hidden">
      {/* Background decorations */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 left-10 w-72 h-72 bg-agri-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-20 right-10 w-72 h-72 bg-agri-earth-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="badge-green mx-auto w-fit mb-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Star size={14} />
            </motion.div>
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-agri-earth-900 mb-3">
            Trusted by Farmers & Buyers
          </h2>
          <p className="text-lg text-agri-earth-600 font-medium">
            Real stories from real people transforming their agricultural business
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setActiveTab('text')}
            className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
              activeTab === 'text'
                ? 'bg-agri-green-600 text-white shadow-lg'
                : 'bg-agri-earth-100 text-agri-earth-700 hover:bg-agri-earth-200'
            }`}
          >
            <Quote size={18} />
            Reviews
          </button>
        </motion.div>

        {/* Video Carousel Section */}
        {activeTab === 'video' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Main Video */}
              <div className="lg:col-span-2">
                <motion.div
                  key={currentVideoIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-3xl overflow-hidden bg-agri-earth-900 aspect-video group"
                >
                  {/* Video thumbnail with play button */}
                  <img
                    src={currentVideo.thumbnail}
                    alt={currentVideo.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPlayingVideoId(currentVideo.id)}
                      className="w-20 h-20 rounded-full bg-agri-green-500 flex items-center justify-center text-white shadow-2xl hover:bg-agri-green-600 transition-colors"
                    >
                      <Play size={36} fill="currentColor" />
                    </motion.button>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {Math.floor(currentVideo.duration / 60)}:{(currentVideo.duration % 60).toString().padStart(2, '0')}
                  </div>
                </motion.div>

                {/* Navigation buttons */}
                <div className="flex justify-between items-center mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={prevVideo}
                    className="w-12 h-12 rounded-full bg-agri-green-100 text-agri-green-600 hover:bg-agri-green-200 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <div className="flex gap-2">
                    {videoTestimonials.map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setCurrentVideoIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentVideoIndex
                            ? 'bg-agri-green-600 w-8'
                            : 'bg-agri-earth-300 w-2 hover:bg-agri-earth-400'
                        }`}
                      />
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextVideo}
                    className="w-12 h-12 rounded-full bg-agri-green-100 text-agri-green-600 hover:bg-agri-green-200 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Video Info Card */}
              <motion.div
                key={`info-${currentVideoIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-agri-green-50 to-white rounded-2xl p-8 border border-agri-green-200 h-fit"
              >
                <div className="mb-4">
                  <img
                    src={currentVideo.thumbnail}
                    alt={currentVideo.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-agri-green-300 mb-4"
                  />
                  <div className="badge-green w-fit mb-3">{currentVideo.badge}</div>
                  <h3 className="text-xl font-bold text-agri-earth-900 mb-1">{currentVideo.name}</h3>
                  <p className="text-sm text-agri-earth-600 font-medium">{currentVideo.role}</p>
                  <p className="text-xs text-agri-earth-500 mt-1">📍 {currentVideo.location}</p>
                </div>

                <h4 className="font-bold text-lg text-agri-green-700 mb-4">{currentVideo.title}</h4>

                <div className="space-y-3">
                  {currentVideo.highlights.map((highlight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-3 text-sm text-agri-earth-700"
                    >
                      <span className="text-agri-green-600 font-bold mt-0.5">✓</span>
                      <span>{highlight}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlayingVideoId(currentVideo.id)}
                  className="w-full mt-6 px-4 py-3 bg-agri-green-600 text-white font-bold rounded-xl hover:bg-agri-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="currentColor" />
                  Watch Story
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Text Reviews Grid */}
        {activeTab === 'text' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {textReviews.map((r, i) => (
              <motion.div
                key={`review-${i}`}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(22, 163, 74, 0.15)' }}
                className="group relative"
              >
                {/* Card background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-agri-earth-50 to-agri-green-50/30 rounded-2xl border border-agri-earth-100 shadow-lg transition-all duration-300" />

                {/* Card content */}
                <div className="relative p-6 flex flex-col h-full">
                  {/* Quote icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12 + 0.2 }}
                    className="mb-3"
                  >
                    <Quote size={28} className="text-agri-green-200" />
                  </motion.div>

                  {/* Star rating with animation */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.12 + 0.15 }}
                    className="flex gap-0.5 mb-4"
                  >
                    {[...Array(r.rating)].map((_, j) => (
                      <motion.div
                        key={`star-${j}`}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.12 + 0.15 + j * 0.05 }}
                      >
                        <Star
                          size={14}
                          fill="#16a34a"
                          className="text-agri-green-600"
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Testimonial text */}
                  <p className="text-sm text-agri-earth-700 leading-relaxed mb-6 flex-grow italic font-medium">
                    "{r.text}"
                  </p>

                  {/* Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.12 + 0.3 }}
                    className="mb-4 inline-flex w-fit px-3 py-1 rounded-lg bg-agri-green-100 text-agri-green-700 text-xs font-semibold"
                  >
                    {r.badge}
                  </motion.div>

                  {/* User info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-agri-earth-100">
                    <motion.img
                      whileHover={{ scale: 1.15 }}
                      src={r.image}
                      alt={r.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-agri-green-200 shadow-md"
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        const img = event.currentTarget;
                        if (img.dataset.fallbackApplied === 'true') {
                          return;
                        }
                        img.dataset.fallbackApplied = 'true';
                        img.src = '/testimonial-avatars/default-avatar.svg';
                      }}
                    />
                    <div className="flex-grow">
                      <div className="font-bold text-sm text-agri-earth-900">{r.name}</div>
                      <div className="text-xs text-agri-earth-500 font-medium">{r.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-agri-green-50 border border-agri-green-200">
            <Award size={18} className="text-agri-green-600" />
            <span className="text-sm font-bold text-agri-green-700">Join 1,200+ Happy Farmers Today</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
