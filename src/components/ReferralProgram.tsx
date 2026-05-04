import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { getMyReferrals, getMyReferralCode, type Referral } from '../lib/supabase';
import {
  Share2,
  Copy,
  Check,
  Gift,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  Smartphone,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react';

interface ReferralTier {
  level: number;
  name: string;
  referralsNeeded: number;
  bonusPerReferral: number;
  badge: string;
  color: string;
}

const TIERS: ReferralTier[] = [
  { level: 1, name: 'Starter',    referralsNeeded: 0,  bonusPerReferral: 100, badge: '🌱', color: 'from-blue-500 to-blue-600' },
  { level: 2, name: 'Grower',     referralsNeeded: 5,  bonusPerReferral: 150, badge: '🌿', color: 'from-green-500 to-green-600' },
  { level: 3, name: 'Pro Farmer', referralsNeeded: 15, bonusPerReferral: 200, badge: '🌾', color: 'from-amber-500 to-amber-600' },
  { level: 4, name: 'Elite',      referralsNeeded: 30, bonusPerReferral: 300, badge: '👑', color: 'from-purple-500 to-purple-600' },
];

function getTier(count: number): ReferralTier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const tier = TIERS[i];
    if (tier && count >= tier.referralsNeeded) return tier;
  }
  return TIERS[0]!;
}

function getNextTier(current: ReferralTier): ReferralTier | null {
  const idx = TIERS.findIndex(t => t.level === current.level);
  return idx < TIERS.length - 1 ? (TIERS[idx + 1] ?? null) : null;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export const ReferralProgram = () => {
  const { user, profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    Promise.all([getMyReferrals(), getMyReferralCode()]).then(([refs, code]) => {
      setReferrals(refs);
      // Fall back to client-computed code if DB column not yet populated
      if (code) {
        setReferralCode(code);
      } else {
        const src = profile?.full_name?.trim() || user.phone || user.email || user.id;
        const cleaned = src.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
        setReferralCode(`IGO-${cleaned || user.id.slice(0, 8).toUpperCase()}`);
      }
      setLoading(false);
    });
  }, [user, profile]);

  const referralLink = referralCode
    ? `${window.location.origin}/join?ref=${encodeURIComponent(referralCode)}`
    : '';

  const totalEarnings = referrals.reduce((sum, r) => sum + r.bonus_amount, 0);
  const totalCount = referrals.length;
  const currentTier = getTier(totalCount);
  const nextTier = getNextTier(currentTier);
  const progressPct = nextTier
    ? Math.min(100, (totalCount / nextTier.referralsNeeded) * 100)
    : 100;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (channel: 'whatsapp' | 'email' | 'sms' | 'more') => {
    if (!referralLink) return;
    const msg = `Join IGO Farmgate Mandi – buy and sell farm produce directly!\nUse my referral link: ${referralLink}`;
    switch (channel) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Join IGO Farmgate')}&body=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'sms':
        window.open(`sms:?&body=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'more':
        if (navigator.share) {
          navigator.share({ title: 'Join IGO Farmgate', text: msg, url: referralLink }).catch(() => {});
        } else {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
            <Gift className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Earn by Sharing</h2>
        </div>
        <p className="text-gray-500">Invite farmers &amp; buyers. Earn ₹{currentTier.bonusPerReferral} for every person who joins.</p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Referral link card */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border-2 border-green-200 shadow-md"
        >
          <h3 className="text-base font-bold text-gray-800 mb-4">Your Referral Link</h3>

          {/* Link row */}
          <div className="flex items-center gap-2 bg-white border-2 border-green-200 rounded-xl px-4 py-3 mb-3">
            <p className="flex-1 text-sm font-mono text-green-700 truncate">
              {referralLink || 'Generating…'}
            </p>
            <button
              onClick={handleCopy}
              disabled={!referralLink}
              className="shrink-0 flex items-center gap-1.5 bg-green-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Code badge */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Referral Code</p>
            <p className="text-xl font-black text-green-600 font-mono">{referralCode ?? '—'}</p>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { channel: 'whatsapp' as const, icon: <MessageSquare size={20} />, label: 'WhatsApp', bg: 'bg-green-100 text-green-700 hover:bg-green-200' },
              { channel: 'email'    as const, icon: <Mail size={20} />,          label: 'Email',    bg: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
              { channel: 'sms'     as const, icon: <Smartphone size={20} />,     label: 'SMS',      bg: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
              { channel: 'more'    as const, icon: <Share2 size={20} />,         label: 'More',     bg: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
            ].map(({ channel, icon, label, bg }) => (
              <button
                key={channel}
                onClick={() => handleShare(channel)}
                disabled={!referralLink}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-3 text-xs font-semibold transition disabled:opacity-40 ${bg}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between"
        >
          <div>
            <p className="text-green-200 text-xs font-semibold mb-1">Total Earnings</p>
            <p className="text-4xl font-black mb-1">₹{totalEarnings}</p>
            <p className="text-green-200 text-xs">from {totalCount} referral{totalCount !== 1 ? 's' : ''}</p>
          </div>

          <div className="space-y-3 mt-6">
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-green-100 text-xs mb-0.5">Current Tier</p>
              <p className="font-bold">{currentTier.badge} {currentTier.name}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <p className="text-green-100 text-xs mb-0.5">Bonus per Referral</p>
              <p className="font-bold text-lg">₹{currentTier.bonusPerReferral}</p>
            </div>
          </div>

          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-green-700 font-bold rounded-xl py-2.5 hover:bg-green-50 transition text-sm">
            <TrendingUp size={16} />
            Withdraw Earnings
          </button>
        </motion.div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900">Progress to {nextTier.badge} {nextTier.name}</h3>
            <span className="text-sm font-bold text-green-600">{totalCount} / {nextTier.referralsNeeded}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Referrals needed</p>
              <p className="text-xl font-bold text-green-700">{Math.max(0, nextTier.referralsNeeded - totalCount)}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <p className="text-xs text-gray-500 mb-1">New bonus/referral</p>
              <p className="text-xl font-bold text-amber-700">₹{nextTier.bonusPerReferral}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
              <p className="text-xs text-gray-500 mb-1">Bonus increase</p>
              <p className="text-xl font-bold text-purple-700">+₹{nextTier.bonusPerReferral - currentTier.bonusPerReferral}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tier progression */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Referral Tiers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {TIERS.map((tier, idx) => {
            const unlocked = totalCount >= tier.referralsNeeded;
            return (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl p-5 border-2 transition-all ${
                  unlocked
                    ? `bg-gradient-to-br ${tier.color} text-white border-transparent shadow-md`
                    : 'bg-gray-50 border-gray-200 text-gray-500 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-2xl mb-0.5">{tier.badge}</p>
                    <p className="font-bold">{tier.name}</p>
                  </div>
                  {unlocked ? <Unlock size={16} /> : <Lock size={16} />}
                </div>
                <div className="space-y-1 text-sm">
                  <p>Referrals: <span className="font-bold">{tier.referralsNeeded}+</span></p>
                  <p>Bonus: <span className="font-bold">₹{tier.bonusPerReferral}</span></p>
                </div>
                {unlocked && (
                  <div className="mt-3 inline-block px-2 py-0.5 bg-white/25 rounded-full text-xs font-bold">✓ Unlocked</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent referrals */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Users className="text-green-600" size={20} />
          <h3 className="font-bold text-gray-900">Your Referrals ({totalCount})</h3>
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-semibold text-gray-700 mb-1">No referrals yet</p>
            <p className="text-sm text-gray-400">Share your link above to start earning rewards!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-200 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {r.referred_name ?? r.referred_phone ?? 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-xs font-semibold text-gray-600 mb-0.5">
                    {r.status === 'completed' ? '✅ Sale Completed' : '📝 Signed Up'}
                  </p>
                  <p className={`text-base font-black ${r.bonus_amount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {r.bonus_amount > 0 ? `+₹${r.bonus_amount}` : 'Pending'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
