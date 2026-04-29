import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Landmark,
  FileText,
  Edit2,
  Save,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Download,
  Gift,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ReferralProgram } from '../components/ReferralProgram';
import { Settings } from './Settings';
import {
  getMyFormDetails,
  saveUserFormDetails,
  getMyBankDetails,
  saveBankDetails,
  getMySubmissions,
  getMyPaymentScreenshots,
  getPaymentScreenshotDownloadUrl,
  UserFormDetails,
  BankAccount,
  BuybackSubmission,
  PaymentScreenshot,
} from '../lib/supabase';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: string | null | undefined) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400', label: 'Pending' },
  reviewing: { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500',   label: 'Reviewing' },
  approved:  { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'Approved' },
  rejected:  { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500',    label: 'Rejected' },
  completed: { bg: 'bg-gray-100',   text: 'text-gray-700',   dot: 'bg-gray-500',   label: 'Completed' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon size={16} className="text-green-700" />
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400 transition disabled:bg-gray-50 disabled:text-gray-500 ${props.className ?? ''}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400 transition disabled:bg-gray-50 disabled:text-gray-500 ${props.className ?? ''}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400 transition disabled:bg-gray-50 disabled:text-gray-500 resize-none ${props.className ?? ''}`}
    />
  );
}

// ─── Profile Section ─────────────────────────────────────────────────────────

function ProfileCard({ profile, user }: { profile: ReturnType<typeof useAuth>['profile']; user: ReturnType<typeof useAuth>['user'] }) {
  const name = profile?.full_name?.trim() || user?.phone || 'User';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="rounded-2xl bg-gradient-to-br from-green-700 to-green-600 text-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
          {initial}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-200 mb-0.5">My Account</p>
          <h1 className="text-xl font-bold">{name}</h1>
          <p className="text-sm text-green-200 mt-0.5">{profile?.phone || user?.phone || '—'}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          ['Email', profile?.email || '—'],
          ['Member Since', fmt(profile?.created_at)],
          ['Phone Verified', user?.phone_confirmed_at ? 'Yes' : 'No'],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-xs text-green-300">{l}</p>
            <p className="text-sm font-medium">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── My Details Form ─────────────────────────────────────────────────────────

type FormState = {
  full_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  crop_type: string;
  acreage: string;
  farming_method: 'organic' | 'inorganic' | 'mixed' | '';
  notes: string;
};

const EMPTY_FORM: FormState = {
  full_name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  crop_type: '',
  acreage: '',
  farming_method: '',
  notes: '',
};

function fromDetails(d: UserFormDetails | null, profileName?: string | null): FormState {
  if (!d) return { ...EMPTY_FORM, full_name: profileName ?? '' };
  return {
    full_name: d.full_name ?? profileName ?? '',
    address: d.address ?? '',
    city: d.city ?? '',
    state: d.state ?? '',
    pincode: d.pincode ?? '',
    crop_type: d.crop_type ?? '',
    acreage: d.acreage != null ? String(d.acreage) : '',
    farming_method: (d.farming_method as FormState['farming_method']) ?? '',
    notes: d.notes ?? '',
  };
}

function MyDetailsSection({ userId, profileName, phone: authPhone }: { userId: string; profileName?: string | null; phone?: string | null }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editablePhone, setEditablePhone] = useState('');
  const [saved, setSaved] = useState<UserFormDetails | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const phone = authPhone;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyFormDetails();
      setSaved(data);
      setForm(fromDetails(data, profileName));
      setEditablePhone(phone ?? data?.phone ?? '');
      setEditing(!data);
    } catch (err) {
      console.error('[Dashboard] Failed to load user details:', err);
      setSaved(null);
      setForm(fromDetails(null, profileName));
      setEditablePhone(phone ?? '');
      setEditing(true);
    } finally {
      setLoading(false);
    }
  }, [profileName, phone]);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      const result = await saveUserFormDetails({
        user_id: userId,
        full_name: form.full_name.trim(),
        phone: editablePhone.trim() || phone || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        pincode: form.pincode.trim() || undefined,
        crop_type: form.crop_type.trim() || undefined,
        acreage: form.acreage ? Number(form.acreage) : undefined,
        farming_method: form.farming_method || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSaved(result);
      setEditing(false);
      toast.success('Details saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(fromDetails(saved, profileName));
    setEditablePhone(phone ?? saved?.phone ?? '');
    setEditing(false);
  };

  if (loading) {
    return (
      <SectionCard title="My Details" icon={User}>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="My Details" icon={User}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">
          {saved ? `Last updated ${fmt(saved.updated_at)}` : 'No details saved yet'}
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition"
          >
            <Edit2 size={13} /> Edit
          </button>
        )}
      </div>

      {!editing && saved ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Full Name', saved.full_name],
            ['Phone', phone || saved.phone],
            ['Address', saved.address],
            ['City', saved.city],
            ['State', saved.state],
            ['Pincode', saved.pincode],
            ['Crop Type', saved.crop_type],
            ['Acreage (acres)', saved.acreage != null ? String(saved.acreage) : null],
            ['Farming Method', saved.farming_method],
          ].map(([l, v]) => (
            <div key={l as string}>
              <p className="text-xs text-gray-500 mb-0.5">{l}</p>
              <p className="font-medium text-gray-800">{v || '—'}</p>
            </div>
          ))}
          {saved.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-0.5">Notes</p>
              <p className="font-medium text-gray-800 whitespace-pre-line">{saved.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <Input value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
            </Field>
            <Field label="Phone">
              <Input
                value={phone ? phone : editablePhone}
                onChange={e => { if (!phone) setEditablePhone(e.target.value); }}
                disabled={Boolean(phone)}
                placeholder="e.g. +91 9876543210"
              />
              {!phone && (
                <p className="text-xs text-gray-400 mt-1">Enter your phone number</p>
              )}
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={set('address')} placeholder="Street address" />
            </Field>
            <Field label="City">
              <Input value={form.city} onChange={set('city')} placeholder="City" />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={set('state')} placeholder="State" />
            </Field>
            <Field label="Pincode">
              <Input value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" maxLength={6} />
            </Field>
            <Field label="Crop Type">
              <Input value={form.crop_type} onChange={set('crop_type')} placeholder="e.g. Rice, Wheat, Tomato" />
            </Field>
            <Field label="Acreage (acres)">
              <Input type="number" value={form.acreage} onChange={set('acreage')} placeholder="e.g. 2.5" min={0} step={0.1} />
            </Field>
            <Field label="Farming Method">
              <Select value={form.farming_method} onChange={set('farming_method')}>
                <option value="">Select method</option>
                <option value="organic">Organic</option>
                <option value="inorganic">Inorganic</option>
                <option value="mixed">Mixed</option>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={set('notes')} placeholder="Any additional info..." />
          </Field>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 transition"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Details'}
            </button>
            {saved && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── Bank Details Section ─────────────────────────────────────────────────────

type BankForm = {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  upi_id: string;
};

const EMPTY_BANK: BankForm = {
  account_holder_name: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  branch_name: '',
  upi_id: '',
};

function fromBank(b: BankAccount | null): BankForm {
  if (!b) return EMPTY_BANK;
  return {
    account_holder_name: b.account_holder_name ?? '',
    bank_name: b.bank_name ?? '',
    account_number: b.account_number ?? '',
    ifsc_code: b.ifsc_code ?? '',
    branch_name: b.branch_name ?? '',
    upi_id: b.upi_id ?? '',
  };
}

function BankDetailsSection({ userId }: { userId: string }) {
  const [form, setForm] = useState<BankForm>(EMPTY_BANK);
  const [saved, setSaved] = useState<BankAccount | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyBankDetails();
      setSaved(data);
      setForm(fromBank(data));
      setEditing(!data);
    } catch (err) {
      console.error('[Dashboard] Failed to load bank details:', err);
      setSaved(null);
      setForm(fromBank(null));
      setEditing(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof BankForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.account_holder_name.trim()) { toast.error('Account holder name is required'); return; }
    if (!form.bank_name.trim()) { toast.error('Bank name is required'); return; }
    if (!form.account_number.trim()) { toast.error('Account number is required'); return; }
    if (!form.ifsc_code.trim()) { toast.error('IFSC code is required'); return; }

    setSaving(true);
    try {
      const result = await saveBankDetails({
        user_id: userId,
        account_holder_name: form.account_holder_name.trim(),
        bank_name: form.bank_name.trim(),
        account_number: form.account_number.trim(),
        ifsc_code: form.ifsc_code.trim().toUpperCase(),
        branch_name: form.branch_name.trim() || undefined,
        upi_id: form.upi_id.trim() || undefined,
      });
      setSaved(result);
      setEditing(false);
      toast.success('Bank details saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(fromBank(saved));
    setEditing(false);
  };

  if (loading) {
    return (
      <SectionCard title="Bank Details" icon={Landmark}>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Bank Details" icon={Landmark}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">
          {saved ? `Last updated ${fmt(saved.updated_at)}` : 'No bank details saved yet'}
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition"
          >
            <Edit2 size={13} /> {saved ? 'Edit' : 'Add'}
          </button>
        )}
      </div>

      {!editing && saved ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Account Holder', saved.account_holder_name],
            ['Bank Name', saved.bank_name],
            ['Account Number', '•'.repeat(Math.max(0, saved.account_number.length - 4)) + saved.account_number.slice(-4)],
            ['IFSC Code', saved.ifsc_code],
            ['Branch Name', saved.branch_name],
            ['UPI ID', saved.upi_id],
          ].map(([l, v]) => (
            <div key={l as string}>
              <p className="text-xs text-gray-500 mb-0.5">{l}</p>
              <p className="font-medium text-gray-800">{v || '—'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Account Holder Name *">
              <Input value={form.account_holder_name} onChange={set('account_holder_name')} placeholder="Full name as in bank" />
            </Field>
            <Field label="Bank Name *">
              <Input value={form.bank_name} onChange={set('bank_name')} placeholder="e.g. State Bank of India" />
            </Field>
            <Field label="Account Number *">
              <Input value={form.account_number} onChange={set('account_number')} placeholder="Account number" type="text" />
            </Field>
            <Field label="IFSC Code *">
              <Input value={form.ifsc_code} onChange={set('ifsc_code')} placeholder="e.g. SBIN0001234" maxLength={11} className="uppercase" />
            </Field>
            <Field label="Branch Name">
              <Input value={form.branch_name} onChange={set('branch_name')} placeholder="Branch name (optional)" />
            </Field>
            <Field label="UPI ID (Optional)">
              <Input value={form.upi_id} onChange={set('upi_id')} placeholder="e.g. name@upi" />
            </Field>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 transition"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Bank Details'}
            </button>
            {saved && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ─── My Submissions Section ───────────────────────────────────────────────────

function PaymentProofsSection() {
  const [proofs, setProofs] = useState<PaymentScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyPaymentScreenshots();
      setProofs(data);
    } catch (err) {
      console.error('[Dashboard] Failed to load payment proofs:', err);
      setProofs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (proof: PaymentScreenshot) => {
    const key = proof.id ?? proof.file_path;
    setDownloading(key);
    try {
      const url = await getPaymentScreenshotDownloadUrl(proof.file_path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <SectionCard title="Payment Proofs" icon={FileText}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">
          {proofs.length} uploaded file{proofs.length !== 1 ? 's' : ''}
        </p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition disabled:opacity-50">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </div>
      ) : proofs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
          <p className="text-sm font-medium text-gray-500">No payment screenshots uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {proofs.map((proof) => {
            const key = proof.id ?? proof.file_path;
            return (
              <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">{proof.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {proof.created_at ? `Uploaded ${fmt(proof.created_at)}` : 'Uploaded'} · {(proof.file_size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownload(proof)}
                  disabled={downloading === key}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60 transition"
                >
                  {downloading === key ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                  Download
                </button>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

function SubmissionsSection() {
  const [submissions, setSubmissions] = useState<BuybackSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMySubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error('[Dashboard] Failed to load submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SectionCard title="My Submissions" icon={FileText}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition disabled:opacity-50">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 size={14} className="animate-spin" /> Loading...
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto text-gray-200 mb-2" />
          <p className="text-sm text-gray-400">No submissions yet.</p>
          <p className="text-xs text-gray-400 mt-1">Submit a sell or buy request to see it here.</p>
          <div className="flex justify-center gap-3 mt-4">
            <a
              href="/sell"
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition"
            >
              <PlusCircle size={14} /> Sell Produce
            </a>
            <a
              href="/buy"
              className="inline-flex items-center gap-1.5 rounded-xl border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition"
            >
              <PlusCircle size={14} /> Buy Request
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((sub) => {
            const st = STATUS_STYLE[sub.status ?? 'pending'];
            const isOpen = expanded === sub.id;
            return (
              <div key={sub.id} className="rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : (sub.id ?? null))}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${sub.submission_type === 'sell' ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700'}`}
                    >
                      {sub.submission_type === 'sell' ? 'Sell' : 'Buy'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{sub.product_name}</p>
                      <p className="text-xs text-gray-500">{sub.quantity} {sub.quantity_unit} · {sub.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                    {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm border-t border-gray-50 bg-gray-50/50">
                    {[
                      ['Expected Price', sub.expected_price ? `₹${sub.expected_price}` : '—'],
                      ['Harvest / Delivery', sub.harvest_date ?? '—'],
                      ['Site Visit', sub.site_visit_date ?? '—'],
                      ['Notes', sub.schedule_notes ?? '—'],
                      ['Submitted', fmt(sub.created_at)],
                      ['Updated', fmt(sub.updated_at)],
                    ].map(([l, v]) => (
                      <div key={l as string} className="pt-3">
                        <p className="text-xs text-gray-500 mb-0.5">{l}</p>
                        <p className="font-medium text-gray-800 break-words">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type DashTab = 'profile' | 'referrals' | 'settings';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<DashTab>('profile');
  const [copiedReferral, setCopiedReferral] = useState(false);

  const referralCode = useMemo(() => {
    if (!user) return 'IGO-REFERRAL';
    const source = profile?.full_name?.trim() || user.phone || user.email || user.id;
    const cleaned = source.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    return `IGO-${cleaned || user.id.slice(0, 8).toUpperCase()}`;
  }, [profile, user]);

  const referralLink = `https://igofarmgate.com/join?ref=${encodeURIComponent(referralCode)}`;

  const handleCopyReferral = () => {
    if (!user) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!loading && !profileLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, profileLoading, user, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) return null;

  const phone = profile?.phone || user?.phone || null;

  const dashTabs: { id: DashTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700">Farmgate Mandi</p>
          <p className="text-sm font-medium text-gray-700">My Account</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
        >
          {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Profile card */}
        <ProfileCard profile={profile} user={user} />

        {/* Tab bar */}
        <div className="flex gap-1 mt-5 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
          {dashTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-green-700 text-white shadow'
                  : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            <MyDetailsSection
              userId={user.id}
              profileName={profile?.full_name}
              phone={phone}
            />
            <BankDetailsSection userId={user.id} />
            <PaymentProofsSection />
            <SubmissionsSection />
          </>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="space-y-5">
            {/* Quick referral link */}
            <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <p className="text-xs uppercase tracking-widest text-green-700 font-semibold mb-1">Your Referral Link</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-mono text-green-700 break-all">{referralLink}</div>
                <button
                  onClick={handleCopyReferral}
                  className="shrink-0 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 transition"
                >
                  {copiedReferral ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </section>
            <ReferralProgram />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="-mx-4 sm:-mx-6">
            <Settings />
          </div>
        )}
      </main>
    </div>
  );
};
