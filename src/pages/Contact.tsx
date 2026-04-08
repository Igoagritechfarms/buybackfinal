import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactMessage } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';

export const Contact = () => {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { promise, error: showError } = useNotification();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim() || !form.email.includes('@')) errors.email = 'Valid email is required';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, ''))) {
      errors.phone = 'Valid 10-digit phone number is required';
    }
    if (!form.subject.trim() || form.subject.length < 5) errors.subject = 'Subject must be at least 5 characters';
    if (!form.message.trim() || form.message.length < 10) errors.message = 'Message must be at least 10 characters';
    return errors;
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError('Please fill in all fields correctly');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      await promise(
        submitContactMessage({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: form.subject,
          message: form.message,
        }),
        {
          loading: 'Sending your message...',
          success: 'Message sent! Our team will respond within 2 hours.',
          error: 'Failed to send message. Please try again.',
        }
      );
      setSent(true);
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err) {
      // Error is handled by promise notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-agri-earth-50">
      <div className="bg-agri-earth-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">Get in Touch</h1>
          <p className="text-agri-earth-400 text-lg">Our farm support team is ready to help you — 6 days a week.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info */}
          <div className="space-y-5">
            {[
              { icon: <Phone size={20} className="text-agri-green-600" />, label: 'Phone', val: '+91 99999 99999', href: 'tel:+919999999999' },
              { icon: <Mail size={20} className="text-agri-green-600" />, label: 'Email', val: 'info@igoagritech.com', href: 'mailto:info@igoagritech.com' },
              { icon: <MapPin size={20} className="text-agri-green-600" />, label: 'Location', val: 'Tamil Nadu, India', href: '#' },
              { icon: <Clock size={20} className="text-agri-green-600" />, label: 'Working Hours', val: 'Mon–Sat, 8 AM – 6 PM', href: '#' },
            ].map(c => (
              <div key={c.label} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-agri-green-50 rounded-xl flex items-center justify-center shrink-0">{c.icon}</div>
                <div>
                  <div className="text-xs text-agri-earth-400 font-medium uppercase tracking-wide">{c.label}</div>
                  <a href={c.href} className="font-semibold text-agri-earth-900 hover:text-agri-green-600 transition-colors">{c.val}</a>
                </div>
              </div>
            ))}

          </div>

          {/* Form */}
          <div className="lg:col-span-2 card p-6 md:p-8">
            {sent ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 bg-agri-green-100 text-agri-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-agri-earth-900 mb-2">Message Sent!</h3>
                <p className="text-agri-earth-500">Our team will respond within 2 hours by phone or email.</p>
                <button onClick={() => setSent(false)} className="mt-6 btn-secondary text-sm">Send Another</button>
              </motion.div>
            ) : (
              <form onSubmit={handle} className="space-y-5">
                <h2 className="text-xl font-bold text-agri-earth-900 mb-6">Send us a Message</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">Your Name</label>
                    <input
                      className={`input ${formErrors.name ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="Full name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} /> {formErrors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">Phone Number</label>
                    <input
                      className={`input ${formErrors.phone ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="10-digit number"
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertCircle size={12} /> {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">Email</label>
                  <input
                    className={`input ${formErrors.email ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="your@email.com"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {formErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">Subject</label>
                  <input
                    className={`input ${formErrors.subject ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                  />
                  {formErrors.subject && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {formErrors.subject}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">Message</label>
                  <textarea
                    className={`input min-h-[120px] resize-none ${formErrors.message ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                  {formErrors.message && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle size={12} /> {formErrors.message}
                    </p>
                  )}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
                  {isSubmitting ? 'Sending...' : 'Send Message'} {!isSubmitting && <Send size={18} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
