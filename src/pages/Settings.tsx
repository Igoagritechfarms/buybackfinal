import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Bell, Shield, Lock, Camera, Phone, Mail,
  MapPin, Save, Check, Eye, EyeOff, Smartphone,
  Globe, TrendingUp, Tag, Megaphone, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'account' | 'notifications' | 'privacy' | 'security';

/* ── Toggle Switch ── */
const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 ${
      checked ? 'bg-lime-500' : 'bg-gray-200'
    }`}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow ${
        checked ? 'right-1' : 'left-1'
      }`}
    />
  </button>
);

/* ── Notification Row ── */
const NotifRow = ({
  icon: Icon,
  title,
  desc,
  badge,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-lime-200 hover:shadow-sm transition-all">
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className={`p-2 rounded-lg ${checked ? 'bg-lime-100' : 'bg-gray-100'}`}>
        <Icon size={16} className={checked ? 'text-lime-600' : 'text-gray-400'} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-lime-100 text-lime-700 rounded-full">{badge}</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

/* ── Privacy Row ── */
const PrivacyRow = ({
  icon: Icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-white hover:border-lime-200 transition-all">
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${checked ? 'bg-lime-50' : 'bg-gray-50'}`}>
        <Icon size={16} className={checked ? 'text-lime-600' : 'text-gray-400'} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<Tab>('account');

  /* ── Account ── */
  const [name, setName] = useState('Ramesh Kumar');
  const [email, setEmail] = useState('farmer@igobuyback.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Madurai, Tamil Nadu');
  const [bio, setBio] = useState('Organic farmer specialising in vegetables and microgreens.');
  const [accountSaved, setAccountSaved] = useState(false);

  const saveAccount = () => {
    setAccountSaved(true);
    toast.success('Profile updated successfully!');
    setTimeout(() => setAccountSaved(false), 2000);
  };

  /* ── Notifications ── */
  const [notifs, setNotifs] = useState({
    priceAlerts: true,
    orderUpdates: true,
    paymentConfirmations: true,
    marketDigest: false,
    newBuyers: true,
    promotions: false,
    smsAlerts: true,
    pushAlerts: false,
  });
  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((p) => ({ ...p, [key]: !p[key] }));

  /* ── Privacy ── */
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showPhone: false,
    showLocation: true,
    dataCollection: true,
    thirdParty: false,
    personalizedAds: false,
  });
  const togglePrivacy = (key: keyof typeof privacy) =>
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));

  /* ── Security ── */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const updatePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.error('Please fill in all password fields.');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    toast.success('Password updated successfully!');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account and preferences</p>
          </motion.div>

          {/* Tab Bar */}
          <motion.div
            className="flex gap-1 mt-6 overflow-x-auto pb-1 scrollbar-hide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-lime-500 text-white shadow-md shadow-lime-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">

          {/* ═══════════ ACCOUNT TAB ═══════════ */}
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-6 mb-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-400 to-green-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                      {name.charAt(0)}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-lime-500 text-white rounded-lg flex items-center justify-center shadow hover:bg-lime-600 transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">{email}</p>
                    <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 bg-lime-100 text-lime-700 rounded-full">
                      Verified Farmer ✓
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Farm Location
                    </label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Bio / About Farm
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveAccount}
                    className="flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-lime-200"
                  >
                    {accountSaved ? <Check size={17} /> : <Save size={17} />}
                    {accountSaved ? 'Saved!' : 'Save Changes'}
                  </motion.button>
                  <p className="text-xs text-gray-400">Changes are saved to your account</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle size={18} className="text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900">Danger Zone</h4>
                    <p className="text-xs text-red-600 mt-0.5">These actions are irreversible. Please be certain.</p>
                  </div>
                </div>
                <button className="px-5 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════ NOTIFICATIONS TAB ═══════════ */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Active', value: Object.values(notifs).filter(Boolean).length, color: 'lime' },
                  { label: 'Disabled', value: Object.values(notifs).filter((v) => !v).length, color: 'gray' },
                  { label: 'Total', value: Object.keys(notifs).length, color: 'blue' },
                ].map((s) => (
                  <div key={s.label} className={`bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm`}>
                    <p className={`text-3xl font-black ${s.color === 'lime' ? 'text-lime-600' : s.color === 'blue' ? 'text-blue-600' : 'text-gray-400'}`}>
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Email Notifications */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Mail size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">Email Notifications</h3>
                </div>
                <div className="p-4 space-y-3">
                  <NotifRow icon={TrendingUp} title="Price Alerts" desc="Get notified when market prices change significantly" badge="Real-time" checked={notifs.priceAlerts} onChange={() => toggleNotif('priceAlerts')} />
                  <NotifRow icon={Check} title="Order Updates" desc="Track your buy/sell order status changes" badge="Important" checked={notifs.orderUpdates} onChange={() => toggleNotif('orderUpdates')} />
                  <NotifRow icon={Tag} title="Payment Confirmations" desc="Receive confirmations when payments are processed" badge="Critical" checked={notifs.paymentConfirmations} onChange={() => toggleNotif('paymentConfirmations')} />
                  <NotifRow icon={Globe} title="Weekly Market Digest" desc="A weekly summary of market trends and prices" checked={notifs.marketDigest} onChange={() => toggleNotif('marketDigest')} />
                  <NotifRow icon={User} title="New Buyer Enquiries" desc="Know when buyers express interest in your produce" checked={notifs.newBuyers} onChange={() => toggleNotif('newBuyers')} />
                  <NotifRow icon={Megaphone} title="Promotions & Offers" desc="Special deals, seasonal offers, and programme updates" checked={notifs.promotions} onChange={() => toggleNotif('promotions')} />
                </div>
              </div>

              {/* SMS / Push */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Smartphone size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">SMS & Push Notifications</h3>
                </div>
                <div className="p-4 space-y-3">
                  <NotifRow icon={Phone} title="SMS Alerts" desc="Receive SMS for critical updates and OTP verifications" badge="SMS" checked={notifs.smsAlerts} onChange={() => toggleNotif('smsAlerts')} />
                  <NotifRow icon={Bell} title="Push Notifications" desc="Browser push notifications for real-time alerts" badge="Push" checked={notifs.pushAlerts} onChange={() => toggleNotif('pushAlerts')} />
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setNotifs(Object.fromEntries(Object.keys(notifs).map((k) => [k, true])) as typeof notifs)}
                  className="flex-1 py-3 bg-lime-500 text-white font-bold rounded-xl hover:bg-lime-600 transition-colors text-sm"
                >
                  Enable All
                </button>
                <button
                  onClick={() => setNotifs(Object.fromEntries(Object.keys(notifs).map((k) => [k, false])) as typeof notifs)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Disable All
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════ PRIVACY TAB ═══════════ */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <Shield size={18} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Your Privacy Matters</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    We comply with GDPR and Indian data protection laws. We never sell your personal data.
                  </p>
                </div>
              </div>

              {/* Profile Visibility */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Eye size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">Profile Visibility</h3>
                </div>
                <div className="p-4 space-y-3">
                  <PrivacyRow icon={User} title="Public Farm Profile" desc="Show your farm profile and produce listings to buyers" checked={privacy.profileVisible} onChange={() => togglePrivacy('profileVisible')} />
                  <PrivacyRow icon={Phone} title="Show Phone Number" desc="Allow buyers to see and contact your phone number" checked={privacy.showPhone} onChange={() => togglePrivacy('showPhone')} />
                  <PrivacyRow icon={MapPin} title="Show Farm Location" desc="Display your farm's district/zone to potential buyers" checked={privacy.showLocation} onChange={() => togglePrivacy('showLocation')} />
                </div>
              </div>

              {/* Data & Analytics */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <TrendingUp size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">Data & Analytics</h3>
                </div>
                <div className="p-4 space-y-3">
                  <PrivacyRow icon={Globe} title="Usage Analytics" desc="Help us improve the platform by sharing anonymous usage data" checked={privacy.dataCollection} onChange={() => togglePrivacy('dataCollection')} />
                  <PrivacyRow icon={Shield} title="Third-Party Sharing" desc="Share anonymised data with logistics and payment partners" checked={privacy.thirdParty} onChange={() => togglePrivacy('thirdParty')} />
                  <PrivacyRow icon={Tag} title="Personalised Ads" desc="Allow relevant ads based on your farming activity" checked={privacy.personalizedAds} onChange={() => togglePrivacy('personalizedAds')} />
                </div>
              </div>

              {/* Save Privacy */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toast.success('Privacy settings saved!')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-lime-200"
              >
                <Save size={17} />
                Save Privacy Settings
              </motion.button>
            </motion.div>
          )}

          {/* ═══════════ SECURITY TAB ═══════════ */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Change Password */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Lock size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">Change Password</h3>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Current Password', value: currentPw, onChange: setCurrentPw },
                    { label: 'New Password', value: newPw, onChange: setNewPw },
                    { label: 'Confirm New Password', value: confirmPw, onChange: setConfirmPw },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full pl-9 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Password strength indicator */}
                  {newPw && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Password strength</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              newPw.length >= level * 2
                                ? newPw.length >= 8
                                  ? 'bg-lime-500'
                                  : 'bg-yellow-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {newPw.length < 4 ? 'Too short' : newPw.length < 8 ? 'Could be stronger' : 'Strong password ✓'}
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={updatePassword}
                    className="flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl transition-colors"
                  >
                    <Lock size={16} />
                    Update Password
                  </motion.button>
                </div>
              </div>

              {/* 2FA */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Smartphone size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">Two-Factor Authentication</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Authenticator App (TOTP)</p>
                      <p className="text-xs text-gray-500 mt-0.5">Use Google Authenticator or similar for an extra layer of security</p>
                    </div>
                    <Toggle checked={twoFA} onChange={setTwoFA} />
                  </div>
                  {twoFA && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-lime-50 border border-lime-200 rounded-xl text-sm text-lime-800"
                    >
                      ✓ Two-factor authentication is <strong>enabled</strong>. Your account is more secure.
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                  <Globe size={17} className="text-lime-600" />
                  <h3 className="font-bold text-gray-900">Active Sessions</h3>
                </div>
                <div className="p-6 space-y-3">
                  {[
                    { device: 'Chrome on Windows', location: 'Chennai, TN', time: 'Current session', active: true },
                    { device: 'Safari on iPhone', location: 'Madurai, TN', time: '2 days ago', active: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.device}</p>
                        <p className="text-xs text-gray-500">{s.location} · {s.time}</p>
                      </div>
                      {s.active ? (
                        <span className="text-xs font-bold px-2 py-1 bg-lime-100 text-lime-700 rounded-full">Active</span>
                      ) : (
                        <button className="text-xs text-red-500 hover:text-red-700 font-semibold">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
