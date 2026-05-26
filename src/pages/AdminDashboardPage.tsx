import { Fragment, useState, useEffect, useCallback, useMemo } from 'react';
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
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

type Tab = 'submissions' | 'users' | 'bank' | 'charts';
type ChartPeriod = 'daily' | 'weekly' | 'monthly';

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
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 transition-all
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 select-none' : ''}
        ${active ? 'ring-2 ring-green-500 border-green-300' : 'border-gray-100'}`}
    >
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
  const [subStatusFilter, setSubStatusFilter] = useState<BuybackSubmission['status'] | 'all' | 'active'>('all');
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

  // Charts
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('monthly');

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

      const named = [
        { res: pRes,   label: 'profiles' },
        { res: sRes,   label: 'buyback_submissions' },
        { res: bRes,   label: 'bank_accounts' },
        { res: fRes,   label: 'user_form_details' },
        { res: payRes, label: 'payment_screenshots' },
      ];
      const failed = named.filter((n) => n.res.status === 'rejected');
      if (failed.length === 5) {
        const firstReason =
          failed[0].res.status === 'rejected'
            ? (failed[0].res.reason as Error)?.message ?? 'unknown error'
            : '';
        const msg = `Failed to load data. Run scripts/sql/fix_admin_dashboard_complete.sql in Supabase SQL Editor and try again. (${firstReason})`;
        setError(msg);
        toast.error('Failed to load all dashboard data. Run the SQL fix in Supabase.');
      } else if (failed.length > 0) {
        const labels = failed.map((n) => n.label).join(', ');
        toast.warning(`Some data could not be loaded: ${labels}. Check Supabase RLS policies.`);
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
    // "Active" = pending + reviewing (still in the queue)
    active: submissions.filter((s) => s.status === 'pending' || s.status === 'reviewing').length,
    // "Processing" = approved (moving forward / payment processing stage)
    processing: submissions.filter((s) => s.status === 'approved').length,
  };

  // ── Chart data ─────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    const withPrice = submissions.filter(
      (s) => s.expected_price != null && s.expected_price > 0 && s.created_at
    );

    function getPeriodKey(dateStr: string, period: ChartPeriod): string {
      const d = new Date(dateStr);
      if (period === 'daily') {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
      if (period === 'weekly') {
        // ISO week: Mon-based
        const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
        const monday = new Date(d);
        monday.setDate(d.getDate() - day);
        return monday.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      }
      // monthly
      return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }

    function getSortKey(dateStr: string, period: ChartPeriod): number {
      const d = new Date(dateStr);
      if (period === 'daily') return d.setHours(0, 0, 0, 0);
      if (period === 'weekly') {
        const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
        return new Date(d).setDate(d.getDate() - day);
      }
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    }

    const bucketMap = new Map<string, { sortKey: number; prices: number[]; count: number }>();

    for (const s of withPrice) {
      const key = getPeriodKey(s.created_at!, chartPeriod);
      const sortKey = getSortKey(s.created_at!, chartPeriod);
      const existing = bucketMap.get(key) ?? { sortKey, prices: [], count: 0 };
      existing.prices.push(s.expected_price!);
      existing.count += 1;
      bucketMap.set(key, existing);
    }

    return Array.from(bucketMap.entries())
      .sort((a, b) => a[1].sortKey - b[1].sortKey)
      .slice(-30) // cap at 30 periods to avoid overcrowding
      .map(([period, { prices, count }]) => {
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        return {
          period,
          avg: Math.round(avg),
          max,
          min,
          count,
        };
      });
  }, [submissions, chartPeriod]);

  // Top products by submission count for bar chart
  const productChartData = useMemo(() => {
    const map = new Map<string, { name: string; count: number; avgPrice: number; totalPrice: number }>();
    for (const s of submissions) {
      const existing = map.get(s.product_id) ?? { name: s.product_name, count: 0, avgPrice: 0, totalPrice: 0 };
      existing.count += 1;
      if (s.expected_price && s.expected_price > 0) {
        existing.totalPrice += s.expected_price;
      }
      map.set(s.product_id, existing);
    }
    return Array.from(map.values())
      .map((p) => ({ ...p, avgPrice: p.count > 0 ? Math.round(p.totalPrice / p.count) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [submissions]);

  // ── Filtered / paginated data ───────────────────────────────────────────────

  const filteredSubmissions = submissions.filter((s) => {
    const q = subSearch.toLowerCase();
    const matchesSearch =
      !q ||
      s.contact_name.toLowerCase().includes(q) ||
      s.contact_phone.includes(q) ||
      s.product_name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q);
    const matchesStatus =
      subStatusFilter === 'all'
        ? true
        : subStatusFilter === 'active'
        ? (s.status === 'pending' || s.status === 'reviewing')
        : s.status === subStatusFilter;
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
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
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
          <StatCard
            icon={TrendingUp} label="Active" value={stats.active} color="bg-green-600"
            onClick={() => { setActiveTab('submissions'); setSubStatusFilter('active'); setSubTypeFilter('all'); }}
            active={activeTab === 'submissions' && subStatusFilter === 'active'}
          />
          <StatCard
            icon={ClipboardList} label="Submissions" value={stats.totalSubmissions} color="bg-purple-500"
            onClick={() => { setActiveTab('submissions'); setSubStatusFilter('all'); setSubTypeFilter('all'); }}
            active={activeTab === 'submissions' && subStatusFilter === 'all'}
          />
          <StatCard
            icon={Clock} label="Processing" value={stats.processing} color="bg-orange-500"
            onClick={() => { setActiveTab('submissions'); setSubStatusFilter('approved'); setSubTypeFilter('all'); }}
            active={activeTab === 'submissions' && subStatusFilter === 'approved'}
          />
          <StatCard
            icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-500"
            onClick={() => setActiveTab('users')}
            active={activeTab === 'users'}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit border border-gray-800">
          {(
            [
              { id: 'submissions', label: 'Submissions', icon: ClipboardList },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'bank', label: 'Bank Details', icon: Landmark },
              { id: 'charts', label: 'Charts', icon: BarChart2 },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === id
                  ? 'bg-green-600 text-white'
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
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
              <select
                value={subStatusFilter}
                onChange={(e) => setSubStatusFilter(e.target.value as typeof subStatusFilter)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                <option value="all">All Types</option>
                <option value="sell">Active (Sell)</option>
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
                                  ? 'bg-green-900/50 text-green-300'
                                  : 'bg-sky-900/50 text-sky-300'
                              }`}
                            >
                              {sub.submission_type === 'sell' ? 'Active' : 'Buy'}
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
                              className={`text-xs rounded-lg px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-green-500/40 transition ${
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
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
                    {['User', 'Phone / Login', 'Submissions', 'Form Details', 'Bank Details', 'Role', 'Joined'].map((h) => (
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
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
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
                              <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm font-bold shrink-0">
                                {initial}
                              </div>
                              <div>
                                <div className="font-medium text-gray-200">
                                  {profile.full_name ?? <span className="text-gray-500 italic">No name</span>}
                                </div>
                                {profile.email && (
                                  <div className="text-[11px] text-gray-500 font-mono truncate max-w-[160px]">{profile.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            <div>{profile.phone ?? '—'}</div>
                            {profile.email && (
                              <div className="text-[11px] text-green-400 mt-0.5 break-all">{profile.email}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-900/40 text-purple-300">
                              {subCount} submission{subCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {fd ? (
                              <div className="space-y-0.5">
                                {fd.address && <div>{fd.address}</div>}
                                {fd.city && <div>{fd.city}{fd.state ? `, ${fd.state}` : ''}</div>}
                                {fd.pincode && <div>{fd.pincode}</div>}
                                {fd.crop_type && <div className="text-green-400">Crop: {fd.crop_type}</div>}
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
                                {bank.upi_id && <div className="text-green-400">{bank.upi_id}</div>}
                              </div>
                            ) : <span className="text-gray-600 italic">No bank details</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                profile.role === 'admin'
                                  ? 'bg-green-900/50 text-green-300'
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
                  className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
                            {bank.upi_id && <div className="text-green-400">{bank.upi_id}</div>}
                            {!bank.branch_name && !bank.upi_id && <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            <div className="mb-3 flex min-w-[180px] flex-col gap-2">
                              {latestPayment ? (
                                <button
                                  type="button"
                                  onClick={() => handlePaymentDownload(latestPayment)}
                                  className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-700 px-2 py-1 text-gray-300 transition hover:border-green-500 hover:text-green-300"
                                  title={latestPayment.file_name}
                                >
                                  <Download size={13} />
                                  <span className="max-w-[120px] truncate">{latestPayment.file_name}</span>
                                </button>
                              ) : (
                                <span className="text-gray-600">No file</span>
                              )}
                              <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg bg-green-500/10 px-2 py-1 font-semibold text-green-300 transition hover:bg-green-500/20">
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

        {/* ── Charts Tab ── */}
        {activeTab === 'charts' && (
          <section className="space-y-6">
            {/* Period selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-medium">View by:</span>
              <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
                {(['daily', 'weekly', 'monthly'] as ChartPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                      chartPeriod === p
                        ? 'bg-green-600 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {chartData.length} period{chartData.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Price trend chart */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-1">
                Product Price Trend ({chartPeriod === 'daily' ? 'Daily' : chartPeriod === 'weekly' ? 'Weekly' : 'Monthly'})
              </h3>
              <p className="text-xs text-gray-500 mb-5">Average, min and max expected price per {chartPeriod.replace('ly', '')}</p>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                  No price data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `₹${v}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#D1FAE5', fontWeight: 600 }}
                      formatter={(value: unknown, name: unknown) => [`₹${value}`, name === 'avg' ? 'Avg Price' : name === 'max' ? 'Max Price' : 'Min Price']}
                    />
                    <Legend
                      formatter={(val) => val === 'avg' ? 'Avg' : val === 'max' ? 'Max' : 'Min'}
                      wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }}
                    />
                    <Line type="monotone" dataKey="avg" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="min" stroke="#6B7280" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Submissions count chart */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-1">
                Submission Volume ({chartPeriod === 'daily' ? 'Daily' : chartPeriod === 'weekly' ? 'Weekly' : 'Monthly'})
              </h3>
              <p className="text-xs text-gray-500 mb-5">Number of submissions with price data per {chartPeriod.replace('ly', '')}</p>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                  No data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                      dataKey="period"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#D1FAE5', fontWeight: 600 }}
                      formatter={(value: unknown) => [String(value), 'Submissions']}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top products chart */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-1">Top Products by Submissions</h3>
              <p className="text-xs text-gray-500 mb-5">Top 10 products with average expected price</p>
              {productChartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
                  No product data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={productChartData} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#D1FAE5', fontWeight: 600 }}
                      formatter={(value: unknown, name: unknown) => [
                        name === 'count' ? String(value) : `₹${value}`,
                        name === 'count' ? 'Submissions' : 'Avg Price (₹)',
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }} formatter={(val) => val === 'count' ? 'Submissions' : 'Avg Price (₹)'} />
                    <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="avgPrice" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
