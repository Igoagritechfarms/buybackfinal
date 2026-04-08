import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Phone, MapPin, Package, IndianRupee, CheckCircle2,
  Clock, AlertCircle, Download, Filter, ChevronDown,
  BadgeCheck, TrendingUp, CalendarCheck, HeartHandshake,
  ArrowLeft, Star,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

/* ── Types ── */
type PaymentStatus = 'Paid' | 'Processing' | 'Pending' | 'Rejected';
type Grade = 'A' | 'B' | 'C' | 'Pending';

interface LedgerRow {
  id: string;
  date: string;
  product: string;
  quantity: number;
  unit: string;
  grade: Grade;
  price_per_unit: number;
  total: number;
  status: PaymentStatus;
}

interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  zone?: string;
  crop_type?: string;
  acreage?: number;
  farming_method?: string;
  status?: string;
  created_at: string;
}

/* ── Status color map ── */
const STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  Paid: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Processing: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  Pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
};

const GRADE_COLORS: Record<Grade, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-gray-100 text-gray-600',
  Pending: 'bg-yellow-100 text-yellow-700',
};

/* ── Payment Timeline Steps ── */
const TIMELINE_STEPS = [
  { label: 'Submitted', icon: Package, done: true },
  { label: 'Quality Check', icon: BadgeCheck, done: true },
  { label: 'Approved', icon: CheckCircle2, done: true },
  { label: 'Payment Initiated', icon: IndianRupee, done: false },
  { label: 'Paid', icon: Star, done: false },
];

/* ── Mock ledger data (shown when Supabase has no rows yet) ── */
const MOCK_LEDGER: LedgerRow[] = [
  { id: '1', date: '2026-03-28', product: 'Tomato', quantity: 120, unit: 'kg', grade: 'A', price_per_unit: 25, total: 3000, status: 'Paid' },
  { id: '2', date: '2026-03-22', product: 'Cucumber', quantity: 80, unit: 'kg', grade: 'A', price_per_unit: 28, total: 2240, status: 'Paid' },
  { id: '3', date: '2026-03-18', product: 'Spinach', quantity: 50, unit: 'bundles', grade: 'B', price_per_unit: 22, total: 1100, status: 'Processing' },
  { id: '4', date: '2026-03-10', product: 'Brinjal', quantity: 95, unit: 'kg', grade: 'A', price_per_unit: 30, total: 2850, status: 'Paid' },
  { id: '5', date: '2026-03-05', product: 'Lady Finger', quantity: 60, unit: 'kg', grade: 'B', price_per_unit: 38, total: 2280, status: 'Pending' },
];

export const FarmerDashboard = () => {
  const { farmerId } = useParams<{ farmerId: string }>();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [ledger, setLedger] = useState<LedgerRow[]>(MOCK_LEDGER);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');

  /* ── Generate farmer ID ── */
  const farmerCode = farmerId || 'IGO-IN-2026-001';
  const joinYear = farmerCode.match(/\d{4}/)?.[0] || '2026';

  /* ── Fetch from Supabase ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to load lead by ID or phone
        const { data: leadData } = await supabase
          .from('buy_back_leads')
          .select('*')
          .limit(1)
          .single();

        if (leadData) setProfile(leadData as FarmerProfile);

        // Try to load transactions
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('type', 'sell')
          .order('created_at', { ascending: false })
          .limit(20);

        if (txData && txData.length > 0) {
          const rows: LedgerRow[] = txData.map((tx: any) => ({
            id: tx.id,
            date: tx.created_at?.split('T')[0] || '',
            product: tx.product_id,
            quantity: tx.quantity,
            unit: 'kg',
            grade: 'A' as Grade,
            price_per_unit: tx.price,
            total: tx.quantity * tx.price,
            status: (tx.status === 'completed' ? 'Paid' : tx.status === 'cancelled' ? 'Rejected' : tx.status === 'verified' ? 'Processing' : 'Pending') as PaymentStatus,
          }));
          setLedger(rows);
        }
      } catch {
        // Use mock data as fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [farmerId]);

  /* ── Computed stats ── */
  const totalQty = ledger.reduce((s, r) => s + r.quantity, 0);
  const gradeA = ledger.filter(r => r.grade === 'A').reduce((s, r) => s + r.quantity, 0);
  const gradeB = ledger.filter(r => r.grade === 'B').reduce((s, r) => s + r.quantity, 0);
  const totalEarnings = ledger.filter(r => r.status === 'Paid').reduce((s, r) => s + r.total, 0);
  const pendingAmount = ledger.filter(r => r.status !== 'Paid' && r.status !== 'Rejected').reduce((s, r) => s + r.total, 0);

  const filtered = statusFilter === 'All' ? ledger : ledger.filter(r => r.status === statusFilter);

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ['Date', 'Product', 'Qty', 'Unit', 'Grade', '₹/Unit', 'Total (₹)', 'Status'];
    const rows = filtered.map(r => [r.date, r.product, r.quantity, r.unit, r.grade, r.price_per_unit, r.total, r.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${farmerCode}-ledger.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-green-200 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={15} />
            Back to IGOBuyback
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-lime-400 text-green-900 flex items-center justify-center text-3xl font-black shadow-xl">
              {profile?.name?.charAt(0) || '🌾'}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white">
                  {profile?.name || 'Demo Farmer'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/20 border border-lime-400/30 rounded-full text-lime-300 text-xs font-bold">
                  <BadgeCheck size={12} />
                  Verified Farmer
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-green-200 text-sm">
                {profile?.phone && (
                  <span className="flex items-center gap-1.5"><Phone size={13} />{profile.phone}</span>
                )}
                {profile?.zone && (
                  <span className="flex items-center gap-1.5"><MapPin size={13} />{profile.zone}</span>
                )}
                {profile?.crop_type && (
                  <span className="flex items-center gap-1.5"><Package size={13} />{profile.crop_type}</span>
                )}
              </div>
            </div>

            {/* Farmer ID */}
            <div className="text-right bg-white/10 border border-white/20 rounded-2xl px-5 py-4 backdrop-blur">
              <p className="text-xs text-green-300 font-semibold uppercase tracking-wider mb-1">Farmer ID</p>
              <p className="text-xl font-black text-lime-300 font-mono tracking-wide">{farmerCode}</p>
              <p className="text-xs text-green-400 mt-1">Member since {joinYear}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Produce', value: `${totalQty.toLocaleString('en-IN')} kg`, sub: 'All time submitted', icon: Package, color: 'green' },
            { label: 'Grade A Qty', value: `${gradeA.toLocaleString('en-IN')} kg`, sub: `Grade B: ${gradeB} kg`, icon: BadgeCheck, color: 'blue' },
            { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, sub: 'Amount paid out', icon: IndianRupee, color: 'lime' },
            { label: 'Pending Payment', value: `₹${pendingAmount.toLocaleString('en-IN')}`, sub: 'Processing / Pending', icon: Clock, color: 'amber' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <div className={`p-2 rounded-xl ${s.color === 'green' ? 'bg-green-50' : s.color === 'blue' ? 'bg-blue-50' : s.color === 'lime' ? 'bg-lime-50' : 'bg-amber-50'}`}>
                  <s.icon size={15} className={s.color === 'green' ? 'text-green-600' : s.color === 'blue' ? 'text-blue-600' : s.color === 'lime' ? 'text-lime-600' : 'text-amber-600'} />
                </div>
              </div>
              <p className={`text-2xl font-black ${s.color === 'green' ? 'text-green-700' : s.color === 'blue' ? 'text-blue-700' : s.color === 'lime' ? 'text-lime-700' : 'text-amber-700'}`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Payment Timeline ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarCheck size={18} className="text-green-600" />
            <h2 className="font-bold text-gray-900">IGO Promise — 7 Working Days</h2>
            <span className="ml-auto text-xs text-gray-400 font-medium">From acknowledgement to payment</span>
          </div>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${step.done ? 'bg-green-600' : 'bg-gray-100'}`}>
                    <step.icon size={17} className={step.done ? 'text-white' : 'text-gray-400'} />
                  </div>
                  <span className={`text-xs font-semibold text-center whitespace-nowrap ${step.done ? 'text-green-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            ✓ Payment acknowledged and processing — typically credited within 7 working days of strict quality check approval
          </p>
        </div>

        {/* ── Transaction Ledger ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Ledger Header */}
          <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-green-600" />
              <h2 className="font-bold text-gray-900">Transaction Ledger</h2>
              <span className="text-xs text-gray-400">({filtered.length} entries)</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="pl-8 pr-4 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none font-semibold"
                >
                  <option value="All">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <Filter size={13} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
              {/* Export */}
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download size={13} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Product', 'Qty', 'Grade', '₹/Unit', 'Total (₹)', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row, idx) => {
                  const sc = STATUS_COLORS[row.status];
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      className="hover:bg-green-50/40 transition-colors"
                    >
                      <td className="px-5 py-4 text-gray-500 text-xs font-mono whitespace-nowrap">{row.date}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{row.product}</td>
                      <td className="px-5 py-4 text-gray-700">{row.quantity} {row.unit}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${GRADE_COLORS[row.grade]}`}>
                          Grade {row.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700">₹{row.price_per_unit}</td>
                      <td className="px-5 py-4 font-black text-green-700">₹{row.total.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {row.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ledger Footer */}
          <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
            <span>Total earnings (paid): <strong className="text-green-700">₹{totalEarnings.toLocaleString('en-IN')}</strong></span>
            <span>Ledger maintained by IGOBuyback · All amounts in INR</span>
          </div>
        </div>

        {/* ── Support CTA ── */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <HeartHandshake size={22} className="text-lime-300" />
            </div>
            <div>
              <p className="font-bold text-white">Need help with your account or payment?</p>
              <p className="text-green-200 text-sm">Our dedicated farmer support team is available 24/7</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-green-900 font-bold rounded-xl text-sm transition-colors"
            >
              Contact Support
            </Link>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/20"
            >
              WhatsApp Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
