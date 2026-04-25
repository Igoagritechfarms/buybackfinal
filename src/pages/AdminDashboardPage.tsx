import { Fragment, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Landmark,
  Eye,
  EyeOff,
  Settings,
  AlertCircle,
  Upload,
  Download,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import {
  adminGetAllProfiles,
  adminGetAllSubmissions,
  adminUpdateSubmissionStatus,
  adminGetAllBankAccounts,
  adminGetAllFormDetails,
  adminGetAllPaymentScreenshots,
  adminUploadPaymentScreenshot,
  getPaymentScreenshotDownloadUrl,
  validatePaymentScreenshotFile,
  Profile,
  BuybackSubmission,
  BankAccount,
  UserFormDetails,
  PaymentScreenshot,
} from '../lib/supabase';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const SUBMISSION_STATUSES: BuybackSubmission['status'][] = [
  'pending',
  'reviewing',
  'approved',
  'rejected',
  'completed',
];

const STATUS_CONFIG: Record<
  NonNullable<BuybackSubmission['status']>,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  reviewing: { label: 'Reviewing', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  approved: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  rejected: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  completed: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
};

type Tab = 'submissions' | 'users' | 'bank';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BuybackSubmission['status'] }) {
  const cfg = STATUS_CONFIG[status ?? 'pending'];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-3">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function maskAccountNumber(num: string) {
  if (num.length <= 4) return num;
  return '•'.repeat(num.length - 4) + num.slice(-4);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<Tab>('submissions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [submissions, setSubmissions] = useState<BuybackSubmission[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [formDetails, setFormDetails] = useState<UserFormDetails[]>([]);
  const [paymentScreenshots, setPaymentScreenshots] = useState<PaymentScreenshot[]>([]);

  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [uploadingPaymentFor, setUploadingPaymentFor] = useState<string | null>(null);

  // Filters & pagination — submissions
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState<BuybackSubmission['status'] | 'all'>('all');
  const [subTypeFilter, setSubTypeFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const [subPage, setSubPage] = useState(1);

  // Filters & pagination — users
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);

  // Bank
  const [bankSearch, setBankSearch] = useState('');
  const [bankPage, setBankPage] = useState(1);
  const [revealedAccounts, setRevealedAccounts] = useState<Set<string>>(new Set());

  // Expanded submission row
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, sRes, bRes, fRes, payRes] = await Promise.allSettled([
        adminGetAllProfiles(),
        adminGetAllSubmissions(),
        adminGetAllBankAccounts(),
        adminGetAllFormDetails(),
        adminGetAllPaymentScreenshots(),
      ]);
      if (pRes.status === 'fulfilled') setProfiles(pRes.value);
      if (sRes.status === 'fulfilled') setSubmissions(sRes.value);
      if (bRes.status === 'fulfilled') setBankAccounts(bRes.value);
      if (fRes.status === 'fulfilled') setFormDetails(fRes.value);
      if (payRes.status === 'fulfilled') setPaymentScreenshots(payRes.value);

      const failed = [pRes, sRes, bRes, fRes, payRes].filter((r) => r.status === 'rejected');
      if (failed.length === 5) {
        const msg = 'Failed to load data. Run the SQL fix in Supabase and try again.';
        setError(msg);
        toast.error(msg);
      } else if (failed.length > 0) {
        toast.warning('Some data could not be loaded. Check Supabase RLS policies.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Status update ──────────────────────────────────────────────────────────

  const handleStatusChange = useCallback(
    async (id: string, newStatus: BuybackSubmission['status']) => {
      setUpdatingStatus(id);
      try {
        await adminUpdateSubmissionStatus(id, newStatus);
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        );
        toast.success(`Status updated to "${STATUS_CONFIG[newStatus ?? 'pending'].label}"`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update status');
      } finally {
        setUpdatingStatus(null);
      }
    },
    []
  );

  const handlePaymentUpload = useCallback(
    async (bank: BankAccount, file: File | undefined) => {
      if (!file) return;
      setUploadingPaymentFor(bank.id ?? bank.user_id);
      try {
        validatePaymentScreenshotFile(file);
        const uploaded = await adminUploadPaymentScreenshot({
          userId: bank.user_id,
          bankAccountId: bank.id ?? null,
          file,
        });
        setPaymentScreenshots((prev) => [uploaded, ...prev]);
        toast.success('Payment screenshot uploaded');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploadingPaymentFor(null);
      }
    },
    []
  );

  const handlePaymentDownload = useCallback(async (shot: PaymentScreenshot) => {
    try {
      const url = await getPaymentScreenshotDownloadUrl(shot.file_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch {
      toast.error('Logout failed');
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    totalUsers: profiles.length,
    totalSubmissions: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
  };

  // ── Filtered / paginated data ───────────────────────────────────────────────

  const filteredSubmissions = submissions.filter((s) => {
    const q = subSearch.toLowerCase();
    const matchesSearch =
      !q ||
      s.contact_name.toLowerCase().includes(q) ||
      s.contact_phone.includes(q) ||
      s.product_name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q);
    const matchesStatus = subStatusFilter === 'all' || s.status === subStatusFilter;
    const matchesType = subTypeFilter === 'all' || s.submission_type === subTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const subTotalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const pagedSubmissions = filteredSubmissions.slice((subPage - 1) * PAGE_SIZE, subPage * PAGE_SIZE);

  const filteredUsers = profiles.filter((p) => {
    const q = userSearch.toLowerCase();
    return (
      !q ||
      (p.full_name ?? '').toLowerCase().includes(q) ||
      (p.phone ?? '').includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);

  const filteredBank = bankAccounts.filter((b) => {
    const q = bankSearch.toLowerCase();
    return (
      !q ||
      b.account_holder_name.toLowerCase().includes(q) ||
      b.bank_name.toLowerCase().includes(q) ||
      b.ifsc_code.toLowerCase().includes(q)
    );
  });

  const bankTotalPages = Math.max(1, Math.ceil(filteredBank.length / PAGE_SIZE));
  const pagedBank = filteredBank.slice((bankPage - 1) * PAGE_SIZE, bankPage * PAGE_SIZE);

  // Reset pages when filters change
  useEffect(() => { setSubPage(1); }, [subSearch, subStatusFilter, subTypeFilter]);
  useEffect(() => { setUserPage(1); }, [userSearch]);
  useEffect(() => { setBankPage(1); }, [bankSearch]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo
            to="/admin/dashboard"
            className="flex items-center gap-2"
            imageClassName="h-8 w-auto rounded-lg"
          />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest text-gray-500 border-l border-gray-700 pl-3">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm text-gray-400 truncate max-w-[200px]">
            {user?.email}
          </span>
          <button
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition"
            title="Manage Products"
          >
            <Settings size={17} />
          </button>
          <button
            onClick={fetchAll}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition"
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white transition"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-700 rounded-xl text-red-400 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
          <StatCard icon={ClipboardList} label="Total Submissions" value={stats.totalSubmissions} color="bg-purple-500" />
          <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-yellow-500" />
          <StatCard icon={TrendingUp} label="Approved" value={stats.approved} color="bg-green-600" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit border border-gray-800">
          {(
            [
              { id: 'submissions', label: 'Submissions', icon: ClipboardList },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bank', label: 'Bank Details', icon: Landmark },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === id
                  ? 'bg-lime-500 text-gray-950'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Submissions Tab ── */}
        {activeTab === 'submissions' && (
          <section className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search name, phone, product..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                />
              </div>
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value as typeof subStatusFilter)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              >
                <option value="all">All Statuses</option>
                {SUBMISSION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
              <select
                value={subTypeFilter}
                onChange={(e) => setSubTypeFilter(e.target.value as typeof subTypeFilter)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              >
                <option value="all">All Types</option>
                <option value="sell">Sell</option>
                <option value="buy">Buy</option>
              </select>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {filteredSubmissions.length} result{filteredSubmissions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    {['Contact', 'Product', 'Qty', 'Type', 'Location', 'Status', 'Date', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {pagedSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    pagedSubmissions.map((sub, index) => {
                      const rowKey =
                        sub.id ??
                        `${sub.user_id ?? 'guest'}-${sub.created_at ?? 'submission'}-${index}`;
                      return (
                        <Fragment key={rowKey}>
                          <tr
                            className="hover:bg-gray-800/40 cursor-pointer transition"
                            onClick={() =>
                              setExpandedRow(expandedRow === rowKey ? null : rowKey)
                            }
                          >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-200">{sub.contact_name}</div>
                            <div className="text-xs text-gray-500">{sub.contact_phone}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                            {sub.product_name}
                          </td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {sub.quantity} {sub.quantity_unit}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                sub.submission_type === 'sell'
                                  ? 'bg-orange-900/50 text-orange-300'
                                  : 'bg-sky-900/50 text-sky-300'
                              }`}
                            >
                              {sub.submission_type === 'sell' ? 'Sell' : 'Buy'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 max-w-[140px] truncate">
                            {sub.location}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={sub.status ?? 'pending'}
                              onChange={(e) =>
                                handleStatusChange(
                                  sub.id!,
                                  e.target.value as BuybackSubmission['status']
                                )
                              }
                              disabled={updatingStatus === sub.id}
                              className={`text-xs rounded-lg px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-lime-500/40 transition ${
                                STATUS_CONFIG[sub.status ?? 'pending'].bg
                              } ${STATUS_CONFIG[sub.status ?? 'pending'].text} border-transparent bg-opacity-80 cursor-pointer disabled:opacity-60`}
                            >
                              {SUBMISSION_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_CONFIG[s].label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {sub.created_at
                              ? new Date(sub.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {expandedRow === sub.id ? '▲' : '▼'}
                          </td>
                        </tr>

                        {/* Expanded row */}
                        {expandedRow === rowKey && (
                          <tr className="bg-gray-800/30">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                                {[
                                  ['Expected Price', sub.expected_price ? `₹${sub.expected_price}` : '—'],
                                  ['Harvest / Delivery Date', sub.harvest_date ?? '—'],
                                  ['Site Visit Date', sub.site_visit_date ?? '—'],
                                  ['Notes', sub.schedule_notes ?? '—'],
                                  ['Submission ID', sub.id ?? '—'],
                                  ['User ID', sub.user_id ?? 'Guest'],
                                  ['Last Updated', sub.updated_at ? new Date(sub.updated_at).toLocaleString('en-IN') : '—'],
                                ].map(([label, val]) => (
                                  <div key={label}>
                                    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                                    <div className="text-gray-300 break-all">{val}</div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-800">
              <Pagination
                page={subPage}
                totalPages={subTotalPages}
                onPrev={() => setSubPage((p) => p - 1)}
                onNext={() => setSubPage((p) => p + 1)}
              />
            </div>
          </section>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <section className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search name, phone, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    {['User', 'Phone', 'Form Details', 'Bank Details', 'Role', 'Joined'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {pagedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    pagedUsers.map((profile) => {
                      const initial = profile.full_name?.charAt(0)?.toUpperCase() ?? '?';
                      const subCount = submissions.filter((s) => s.user_id === profile.id).length;
                      const fd = formDetails.find((f) => f.user_id === profile.id);
                      const bank = bankAccounts.find((b) => b.user_id === profile.id);
                      return (
                        <tr key={profile.id} className="hover:bg-gray-800/40 transition align-top">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-lime-500/20 text-lime-400 flex items-center justify-center text-sm font-bold shrink-0">
                                {initial}
                              </div>
                              <div>
                                <div className="font-medium text-gray-200">
                                  {profile.full_name ?? <span className="text-gray-500 italic">No name</span>}
                                </div>
                                <div className="text-xs text-gray-500">{subCount} submission{subCount !== 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{profile.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {fd ? (
                              <div className="space-y-0.5">
                                {fd.address && <div>{fd.address}</div>}
                                {fd.city && <div>{fd.city}{fd.state ? `, ${fd.state}` : ''}</div>}
                                {fd.pincode && <div>{fd.pincode}</div>}
                                {fd.crop_type && <div className="text-lime-400">Crop: {fd.crop_type}</div>}
                                {fd.acreage != null && <div>{fd.acreage} acres</div>}
                                {fd.farming_method && <div className="capitalize">{fd.farming_method}</div>}
                              </div>
                            ) : <span className="text-gray-600 italic">No details</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {bank ? (
                              <div className="space-y-0.5">
                                <div className="text-gray-200">{bank.account_holder_name}</div>
                                <div>{bank.bank_name}</div>
                                {bank.branch_name && <div>{bank.branch_name}</div>}
                                <div className="font-mono">{'•'.repeat(Math.max(0, bank.account_number.length - 4))}{bank.account_number.slice(-4)}</div>
                                <div>{bank.ifsc_code}</div>
                                {bank.upi_id && <div className="text-lime-400">{bank.upi_id}</div>}
                              </div>
                            ) : <span className="text-gray-600 italic">No bank details</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                profile.role === 'admin'
                                  ? 'bg-lime-900/50 text-lime-300'
                                  : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {profile.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            <div>{new Date(profile.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-800">
              <Pagination
                page={userPage}
                totalPages={userTotalPages}
                onPrev={() => setUserPage((p) => p - 1)}
                onNext={() => setUserPage((p) => p + 1)}
              />
            </div>
          </section>
        )}

        {/* ── Bank Details Tab ── */}
        {activeTab === 'bank' && (
          <section className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search holder name, bank, IFSC..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {filteredBank.length} record{filteredBank.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    {['Account Holder', 'Bank', 'Account Number', 'IFSC', 'Branch / UPI', 'Payment Proof', 'Added'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {pagedBank.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        No bank details found.
                      </td>
                    </tr>
                  ) : (
                    pagedBank.map((bank) => {
                      const rowKey = bank.id ?? bank.user_id;
                      const isRevealed = revealedAccounts.has(rowKey);
                      const ownerProfile = profiles.find((p) => p.id === bank.user_id);
                      const latestPayment = paymentScreenshots.find((p) => p.user_id === bank.user_id);
                      const isUploading = uploadingPaymentFor === rowKey;
                      return (
                        <tr key={rowKey} className="hover:bg-gray-800/40 transition">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-200">{bank.account_holder_name}</div>
                            {ownerProfile && (
                              <div className="text-xs text-gray-500">
                                {ownerProfile.full_name ?? ownerProfile.phone ?? '—'}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-300">{bank.bank_name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-300">
                                {isRevealed
                                  ? bank.account_number
                                  : maskAccountNumber(bank.account_number)}
                              </span>
                              <button
                                onClick={() =>
                                  setRevealedAccounts((prev) => {
                                    const next = new Set(prev);
                                    if (isRevealed) next.delete(rowKey);
                                    else next.add(rowKey);
                                    return next;
                                  })
                                }
                                className="text-gray-500 hover:text-gray-300 transition"
                                title={isRevealed ? 'Hide' : 'Reveal'}
                              >
                                {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-400">{bank.ifsc_code}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {bank.branch_name && <div>{bank.branch_name}</div>}
                            {bank.upi_id && <div className="text-lime-400">{bank.upi_id}</div>}
                            {!bank.branch_name && !bank.upi_id && <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            <div className="mb-3 flex min-w-[180px] flex-col gap-2">
                              {latestPayment ? (
                                <button
                                  type="button"
                                  onClick={() => handlePaymentDownload(latestPayment)}
                                  className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-700 px-2 py-1 text-gray-300 transition hover:border-lime-500 hover:text-lime-300"
                                  title={latestPayment.file_name}
                                >
                                  <Download size={13} />
                                  <span className="max-w-[120px] truncate">{latestPayment.file_name}</span>
                                </button>
                              ) : (
                                <span className="text-gray-600">No file</span>
                              )}
                              <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-lime-500/10 px-2 py-1 font-semibold text-lime-300 transition hover:bg-lime-500/20">
                                <Upload size={13} />
                                {isUploading ? 'Uploading...' : 'Upload'}
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,application/pdf"
                                  disabled={isUploading}
                                  className="hidden"
                                  onChange={(e) => {
                                    void handlePaymentUpload(bank, e.target.files?.[0]);
                                    e.currentTarget.value = '';
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-gray-600">Max 5 MB</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {bank.created_at
                              ? new Date(bank.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-800">
              <Pagination
                page={bankPage}
                totalPages={bankTotalPages}
                onPrev={() => setBankPage((p) => p - 1)}
                onNext={() => setBankPage((p) => p + 1)}
              />
            </div>
          </section>
        )}

        {/* ── Status legend ── */}
        {activeTab === 'submissions' && (
          <div className="flex flex-wrap gap-3">
            {SUBMISSION_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              return (
                <div key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              );
            })}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle2 size={12} className="text-green-500" />
              Click a row to expand details
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <XCircle size={12} className="text-gray-500" />
              Use dropdown to update status inline
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
