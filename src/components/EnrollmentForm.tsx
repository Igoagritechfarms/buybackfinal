import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, MapPin, Leaf, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { submitLead, type BuyBackLead } from '../lib/supabase';

const CROP_TYPES = [
  'Cucumber', 'Oyster Mushroom', 'Button Mushroom', 'Microgreens',
  'Tomato', 'Spinach', 'Brinjal', 'Lady Finger', 'Bitter Gourd',
  'Toor Dal', 'Ragi', 'Jowar', 'Mango', 'Banana', 'Other',
];

const ZONES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy',
  'Tirunelveli', 'Vellore', 'Erode', 'Thanjavur', 'Dindigul', 'Other',
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export const EnrollmentForm = () => {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [form, setForm] = useState<BuyBackLead & { agreeToTerms: boolean }>({
    name: '', phone: '', age: undefined, pincode: '', zone: '',
    crop_type: '', acreage: undefined, farming_method: 'organic',
    language: lang, agreeToTerms: false,
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeToTerms) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const { agreeToTerms, ...lead } = form;
      lead.language = lang;
      await submitLead(lead);
      setStatus('success');
    } catch (err) {
      setErrMsg('Could not submit. Please try WhatsApp instead.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-10 text-center"
          >
            <div className="w-20 h-20 bg-agri-green-100 text-agri-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-agri-earth-900 mb-2">{t('success_title')}</h3>
            <p className="text-agri-earth-500 mb-6">{t('success_sub')}</p>
            <a
              href="https://wa.me/919999999999?text=I%20just%20registered%20on%20IGO%20Farm%20Gate%20Mandi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ebe5d] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Confirm on WhatsApp
            </a>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="card p-6 md:p-8 space-y-5"
          >
            <h2 className="text-2xl font-black text-agri-earth-900">{t('enroll_title')}</h2>
            <p className="text-agri-earth-500 text-sm">{t('enroll_sub')}</p>

            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">
                  <User size={12} className="inline mr-1" />{t('field_name')} *
                </label>
                <input className="input" placeholder="Enter your full name" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">
                  <Phone size={12} className="inline mr-1" />{t('field_phone')} *
                </label>
                <input className="input" placeholder="+91 XXXXX XXXXX" type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)} required pattern="[0-9]{10,13}" />
              </div>
            </div>

            {/* Age + Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">{t('field_age')}</label>
                <input className="input" placeholder="Your age" type="number" min={18} max={90}
                  value={form.age ?? ''} onChange={e => set('age', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">
                  <MapPin size={12} className="inline mr-1" />{t('field_pincode')}
                </label>
                <input className="input" placeholder="e.g. 600001" value={form.pincode}
                  onChange={e => set('pincode', e.target.value)} />
              </div>
            </div>

            {/* Zone */}
            <div>
              <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">District / Zone</label>
              <select className="input" value={form.zone} onChange={e => set('zone', e.target.value)}>
                <option value="">Select your district</option>
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            {/* Crop + Acreage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">
                  <Leaf size={12} className="inline mr-1" />{t('field_crop')} *
                </label>
                <select className="input" value={form.crop_type} onChange={e => set('crop_type', e.target.value)} required>
                  <option value="">Select crop type</option>
                  {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-2">{t('field_acreage')}</label>
                <input className="input" placeholder="e.g. 2.5" type="number" step="0.5" min={0}
                  value={form.acreage ?? ''} onChange={e => set('acreage', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
            </div>

            {/* Farming Method */}
            <div>
              <label className="block text-xs font-semibold text-agri-earth-500 uppercase tracking-wide mb-3">{t('field_method')}</label>
              <div className="grid grid-cols-3 gap-3">
                {(['organic', 'inorganic', 'mixed'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('farming_method', m)}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                      form.farming_method === m
                        ? 'bg-agri-green-600 border-agri-green-600 text-white shadow'
                        : 'border-agri-earth-200 text-agri-earth-600 hover:border-agri-green-300 bg-white'
                    }`}
                  >
                    {t(`method_${m}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 accent-agri-green-600"
                checked={form.agreeToTerms} onChange={e => set('agreeToTerms', e.target.checked)} required />
              <span className="text-xs text-agri-earth-500 leading-relaxed">
                I agree to be contacted by IGO Agritech on WhatsApp/phone for buyback enrollment and price updates.
              </span>
            </label>

            {/* Error */}
            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl text-sm">
                <AlertCircle size={16} /> {errMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !form.agreeToTerms}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <><Loader2 size={18} className="animate-spin" /> Registering...</>
              ) : t('submit')}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
