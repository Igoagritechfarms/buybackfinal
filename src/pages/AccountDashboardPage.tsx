import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  User, Phone, Mail, Edit2, LogOut, Plus, ChevronDown, ChevronUp,
  Landmark, Eye, EyeOff, AlertCircle, CheckCircle2, Clock,
  ShieldCheck, Loader2, FileText, X, Save,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getMySubmissions, getMyBankDetails, saveBankDetails, upsertProfile,
  type BuybackSubmission, type BankAccount,
} from '../lib/supabase';
import { bankDetailsSchema, profileSchema } from '../lib/validation';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  pending:   { bg: 'bg-yellow-50',  text: 'text-yellow-700',  icon: <Clock size={13} />,        label: 'Pending' },
  reviewing: { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: <FileText size={13} />,     label: 'Reviewing' },
  approved:  { bg: 'bg-green-50',   text: 'text-green-700',   icon: <CheckCircle2 size={13} />, label: 'Approved' },
  rejected:  { bg: 'bg-red-50',     text: 'text-red-600',     icon: <X size={13} />,            label: 'Rejected' },
  completed: { bg: 'bg-purple-50',  text: 'text-purple-700',  icon: <ShieldCheck size={13} />,  label: 'Completed' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function maskAccountNumber(n: string) {
  if (n.length <= 4) return n;
  return '•'.repeat(n.length - 4) + n.slice(-4);
}

export const AccountDashboardPage = () => {
  const { user, profile, loading: authLoading, logout, refreshProfile } = useAuth();

  const [submissions, setSubmissions] = useState<BuybackSubmission[]>([]);
  const [bankDetails, setBankDetails] = useState<BankAccount | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '' });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Bank details state
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
  });

  // Pre-fill account_holder_name with profile name when opening bank edit
  useEffect(() => {
    if (editingBank && !bankDetails && profile?.full_name && !bankForm.account_holder_name) {
      setBankForm((p) => ({ ...p, account_holder_name: profile.full_name ?? '' }));
    }
  }, [editingBank]); // eslint-disable-line react-hooks/exhaustive-deps
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});
  const [savingBank, setSavingBank] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [subs, bank] = await Promise.all([getMySubmissions(), getMyBankDetails()]);
      setSubmissions(subs);
      setBankDetails(bank);
      if (bank) {
        setBankForm({
          bank_name: bank.bank_name,
          account_holder_name: bank.account_holder_name,
          account_number: bank.account_number,
          ifsc_code: bank.ifsc_code,
        });
      }
    } catch (err) {
      console.error('AccountDashboard fetch error', err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, fetchData]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name ?? '',
        email: profile.email ?? '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    const result = profileSchema.safeParse(profileForm);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setProfileErrors(errs);
      return;
    }
    setSavingProfile(true);
    try {
      await upsertProfile({ id: user!.id, ...result.data });
      await refreshProfile();
      toast.success('Profile updated successfully.');
      setEditingProfile(false);
      setProfileErrors({});
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      console.error('[Profile save error]', err);
      toast.error(`Failed to save profile: ${msg}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBank = async () => {
    // Normalize IFSC to uppercase before validation
    const normalizedForm = { ...bankForm, ifsc_code: bankForm.ifsc_code.toUpperCase() };
    const result = bankDetailsSchema.safeParse(normalizedForm);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setBankErrors(errs);
      return;
    }
    setSavingBank(true);
    try {
      // Ensure profile row exists first (required by FK constraint on bank_accounts)
      await upsertProfile({
        id: user!.id,
        full_name: profile?.full_name ?? result.data.account_holder_name,
        phone: profile?.phone ?? null,
      });
      const saved = await saveBankDetails({ user_id: user!.id, ...result.data });
      setBankDetails(saved);
      toast.success('Bank details saved successfully.');
      setEditingBank(false);
      setBankErrors({});
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      console.error('[Bank save error]', err);
      toast.error(`Failed to save bank details: ${msg}`);
    } finally {
      setSavingBank(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
    } catch {
      toast.error('Logout failed.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your profile and submissions</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={16} className="text-green-600" /> Profile
            </h2>
            <button
              onClick={() => {
                setEditingProfile(!editingProfile);
                setProfileErrors({});
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              <Edit2 size={14} /> {editingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="p-6">
            {!editingProfile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                    {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{profile?.full_name ?? 'Name not set'}</p>
                    <p className="text-xs text-gray-400">
                      Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">{profile?.phone ?? '—'}</span>
                    <ShieldCheck size={13} className="text-green-500" title="Verified" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-500">{profile?.email ?? 'Email not set'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                    className={`w-full p-3 rounded-xl border text-sm focus:ring-2 focus:ring-green-500 outline-none ${profileErrors['full_name'] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="Your full name"
                  />
                  {profileErrors['full_name'] && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {profileErrors['full_name']}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className={`w-full p-3 rounded-xl border text-sm focus:ring-2 focus:ring-green-500 outline-none ${profileErrors['email'] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="you@example.com"
                  />
                  {profileErrors['email'] && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {profileErrors['email']}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bank Details Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Landmark size={16} className="text-green-600" /> Bank Details
            </h2>
            <button
              onClick={() => {
                setEditingBank(!editingBank);
                setBankErrors({});
              }}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              {bankDetails && !editingBank ? (
                <><Edit2 size={14} /> Edit</>
              ) : editingBank ? (
                'Cancel'
              ) : (
                <><Plus size={14} /> Add</>
              )}
            </button>
          </div>

          <div className="p-6">
            {!editingBank ? (
              bankDetails ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      { label: 'Bank Name', value: bankDetails.bank_name },
                      { label: 'Account Holder', value: bankDetails.account_holder_name },
                      {
                        label: 'Account Number',
                        value: (
                          <span className="flex items-center gap-2">
                            <span className="font-mono">
                              {showAccountNumber ? bankDetails.account_number : maskAccountNumber(bankDetails.account_number)}
                            </span>
                            <button
                              onClick={() => setShowAccountNumber(!showAccountNumber)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showAccountNumber ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                          </span>
                        ),
                      },
                      { label: 'IFSC Code', value: bankDetails.ifsc_code },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-gray-400 text-xs">{label}</p>
                        <p className="font-semibold text-gray-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Last updated: {bankDetails.updated_at ? new Date(bankDetails.updated_at).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Landmark size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">No bank details added</p>
                  <p className="text-gray-400 text-xs mt-1">Add your bank account for fast payments</p>
                  <button
                    onClick={() => setEditingBank(true)}
                    className="mt-4 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Add Bank Details
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {[
                  { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
                  { key: 'account_holder_name', label: 'Account Holder Name', placeholder: 'As per bank records' },
                  { key: 'account_number', label: 'Account Number', placeholder: '9-18 digit account number', type: 'tel' },
                  { key: 'ifsc_code', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{label}</label>
                    <input
                      type={type ?? 'text'}
                      value={bankForm[key as keyof typeof bankForm]}
                      onChange={(e) => {
                        const val = key === 'ifsc_code' ? e.target.value.toUpperCase() : e.target.value;
                        setBankForm((p) => ({ ...p, [key]: val }));
                        if (bankErrors[key]) setBankErrors((p) => { const { [key]: _, ...rest } = p; return rest; });
                      }}
                      placeholder={placeholder}
                      className={`w-full p-3 rounded-xl border text-sm focus:ring-2 focus:ring-green-500 outline-none ${bankErrors[key] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    />
                    {bankErrors[key] && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={11} /> {bankErrors[key]}
                      </p>
                    )}
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setEditingBank(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBank}
                    disabled={savingBank}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {savingBank ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save Bank Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Submissions ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-green-600" /> My Submissions
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              {submissions.length} total
            </span>
          </div>

          {loadingData ? (
            <div className="p-10 text-center">
              <Loader2 className="animate-spin text-green-600 mx-auto mb-2" size={24} />
              <p className="text-sm text-gray-400">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-10 text-center">
              <FileText size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium">No submissions yet</p>
              <p className="text-gray-400 text-xs mt-1">Submit a sell or buy request to get started</p>
              <div className="flex gap-3 justify-center mt-4">
                <Link to="/sell" className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                  Sell Produce
                </Link>
                <Link to="/buy" className="px-4 py-2 border border-green-600 text-green-700 text-sm font-semibold rounded-xl hover:bg-green-50 transition-colors">
                  Buy Produce
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {submissions.map((sub) => (
                <div key={sub.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${sub.submission_type === 'sell' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {sub.submission_type}
                        </span>
                        <p className="font-semibold text-gray-900 text-sm">{sub.product_name}</p>
                        <StatusBadge status={sub.status ?? 'pending'} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {sub.quantity} {sub.quantity_unit} · {sub.location} · {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-IN') : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedSubmission(expandedSubmission === sub.id ? null : sub.id ?? null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    >
                      {expandedSubmission === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expandedSubmission === sub.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                          {[
                            { label: 'Contact', value: sub.contact_name },
                            { label: 'Phone', value: sub.contact_phone },
                            { label: 'Expected Price', value: sub.expected_price ? `₹${sub.expected_price}/unit` : '—' },
                            { label: 'Harvest Date', value: sub.harvest_date ?? '—' },
                            { label: 'Visit Date', value: sub.site_visit_date ?? '—' },
                            { label: 'Notes', value: sub.schedule_notes ?? '—' },
                            { label: 'Submitted', value: sub.created_at ? new Date(sub.created_at).toLocaleString('en-IN') : '—' },
                            { label: 'Last Updated', value: sub.updated_at ? new Date(sub.updated_at).toLocaleString('en-IN') : '—' },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <span className="text-gray-400 text-xs">{label}</span>
                              <p className="text-gray-700 font-medium text-xs mt-0.5">{value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
