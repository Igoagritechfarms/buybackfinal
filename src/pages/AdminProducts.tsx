import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, LogOut, Plus, Edit2, Trash2, TrendingUp,
  Search, X, Save, RefreshCw, Download, Filter,
  ChevronUp, ChevronDown, Layers, IndianRupee, BarChart3,
  ShieldCheck, AlertTriangle, Check,
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase, MarketPrice } from '../lib/supabase';
import { toast } from 'sonner';

/* ── seed data (170+ products) ── */
const SEED_PRODUCTS: Omit<MarketPrice, 'id' | 'updated_at'>[] = [
  // Vegetables
  { product_id: 'veg-potato', name: 'Potato', category: 'Vegetables', price: 18, prev_price: 16, unit: 'kg', demand: 'Very High' },
  { product_id: 'veg-onion', name: 'Onion', category: 'Vegetables', price: 35, prev_price: 38, unit: 'kg', demand: 'Very High' },
  { product_id: 'veg-tomato', name: 'Tomato', category: 'Vegetables', price: 25, prev_price: 22, unit: 'kg', demand: 'Very High' },
  { product_id: 'veg-garlic', name: 'Garlic', category: 'Vegetables', price: 85, prev_price: 80, unit: 'kg', demand: 'High' },
  { product_id: 'veg-ginger', name: 'Ginger', category: 'Vegetables', price: 120, prev_price: 115, unit: 'kg', demand: 'High' },
  { product_id: 'veg-carrot', name: 'Carrot', category: 'Vegetables', price: 40, prev_price: 45, unit: 'kg', demand: 'High' },
  { product_id: 'veg-radish', name: 'Radish', category: 'Vegetables', price: 22, prev_price: 20, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-beetroot', name: 'Beetroot', category: 'Vegetables', price: 35, prev_price: 32, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-cabbage', name: 'Cabbage', category: 'Vegetables', price: 20, prev_price: 18, unit: 'kg', demand: 'High' },
  { product_id: 'veg-cauliflower', name: 'Cauliflower', category: 'Vegetables', price: 30, prev_price: 28, unit: 'kg', demand: 'High' },
  { product_id: 'veg-broccoli', name: 'Broccoli', category: 'Vegetables', price: 90, prev_price: 85, unit: 'kg', demand: 'High' },
  { product_id: 'veg-cucumber', name: 'Cucumber', category: 'Vegetables', price: 28, prev_price: 25, unit: 'kg', demand: 'Very High' },
  { product_id: 'veg-bittergourd', name: 'Bitter Gourd', category: 'Vegetables', price: 45, prev_price: 42, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-snakegourd', name: 'Snake Gourd', category: 'Vegetables', price: 35, prev_price: 30, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-bottlegourd', name: 'Bottle Gourd', category: 'Vegetables', price: 22, prev_price: 20, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-ridgegourd', name: 'Ridge Gourd', category: 'Vegetables', price: 30, prev_price: 28, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-beans', name: 'French Beans', category: 'Vegetables', price: 55, prev_price: 52, unit: 'kg', demand: 'High' },
  { product_id: 'veg-chickpea', name: 'Cluster Beans', category: 'Vegetables', price: 48, prev_price: 45, unit: 'kg', demand: 'Medium' },
  { product_id: 'veg-drumstick', name: 'Drumstick', category: 'Vegetables', price: 60, prev_price: 58, unit: 'kg', demand: 'High' },
  { product_id: 'veg-brinjal', name: 'Brinjal (Eggplant)', category: 'Vegetables', price: 30, prev_price: 28, unit: 'kg', demand: 'High' },
  { product_id: 'veg-capsicum', name: 'Capsicum', category: 'Vegetables', price: 75, prev_price: 70, unit: 'kg', demand: 'High' },
  { product_id: 'veg-greenchilli', name: 'Green Chilli', category: 'Vegetables', price: 65, prev_price: 60, unit: 'kg', demand: 'Very High' },
  { product_id: 'veg-ladyfinger', name: 'Lady Finger (Okra)', category: 'Vegetables', price: 40, prev_price: 38, unit: 'kg', demand: 'High' },
  // Fruits
  { product_id: 'frt-mango', name: 'Mango (Alphonso)', category: 'Fruits', price: 280, prev_price: 260, unit: 'kg', demand: 'Very High' },
  { product_id: 'frt-banana', name: 'Banana', category: 'Fruits', price: 35, prev_price: 32, unit: 'dozen', demand: 'Very High' },
  { product_id: 'frt-papaya', name: 'Papaya', category: 'Fruits', price: 28, prev_price: 25, unit: 'kg', demand: 'High' },
  { product_id: 'frt-guava', name: 'Guava', category: 'Fruits', price: 45, prev_price: 42, unit: 'kg', demand: 'High' },
  { product_id: 'frt-pineapple', name: 'Pineapple', category: 'Fruits', price: 50, prev_price: 48, unit: 'pieces', demand: 'High' },
  { product_id: 'frt-watermelon', name: 'Watermelon', category: 'Fruits', price: 18, prev_price: 16, unit: 'kg', demand: 'Very High' },
  { product_id: 'frt-muskmelon', name: 'Muskmelon', category: 'Fruits', price: 30, prev_price: 28, unit: 'kg', demand: 'High' },
  { product_id: 'frt-lemon', name: 'Lemon', category: 'Fruits', price: 80, prev_price: 75, unit: 'kg', demand: 'Very High' },
  { product_id: 'frt-orange', name: 'Orange', category: 'Fruits', price: 60, prev_price: 58, unit: 'kg', demand: 'High' },
  { product_id: 'frt-pomegranate', name: 'Pomegranate', category: 'Fruits', price: 120, prev_price: 115, unit: 'kg', demand: 'High' },
  { product_id: 'frt-grapes', name: 'Grapes (Black)', category: 'Fruits', price: 90, prev_price: 85, unit: 'kg', demand: 'High' },
  { product_id: 'frt-strawberry', name: 'Strawberry', category: 'Fruits', price: 200, prev_price: 190, unit: 'kg', demand: 'High' },
  { product_id: 'frt-coconut', name: 'Coconut', category: 'Fruits', price: 25, prev_price: 23, unit: 'pieces', demand: 'Very High' },
  { product_id: 'frt-jackfruit', name: 'Jackfruit', category: 'Fruits', price: 40, prev_price: 38, unit: 'kg', demand: 'Medium' },
  { product_id: 'frt-tamarind', name: 'Tamarind', category: 'Fruits', price: 95, prev_price: 90, unit: 'kg', demand: 'High' },
  // Greens
  { product_id: 'grn-spinach', name: 'Spinach', category: 'Greens', price: 30, prev_price: 28, unit: 'bundles', demand: 'High' },
  { product_id: 'grn-fenugreek', name: 'Fenugreek Leaves', category: 'Greens', price: 25, prev_price: 22, unit: 'bundles', demand: 'High' },
  { product_id: 'grn-coriander', name: 'Coriander', category: 'Greens', price: 20, prev_price: 18, unit: 'bundles', demand: 'Very High' },
  { product_id: 'grn-curry', name: 'Curry Leaves', category: 'Greens', price: 40, prev_price: 38, unit: 'bundles', demand: 'Very High' },
  { product_id: 'grn-mint', name: 'Mint / Pudina', category: 'Greens', price: 20, prev_price: 18, unit: 'bundles', demand: 'High' },
  { product_id: 'grn-amaranth', name: 'Amaranth Leaves', category: 'Greens', price: 22, prev_price: 20, unit: 'bundles', demand: 'Medium' },
  { product_id: 'grn-mustard', name: 'Mustard Leaves', category: 'Greens', price: 18, prev_price: 16, unit: 'bundles', demand: 'Medium' },
  { product_id: 'grn-kale', name: 'Kale', category: 'Greens', price: 80, prev_price: 75, unit: 'bundles', demand: 'High' },
  { product_id: 'grn-lettuce', name: 'Lettuce', category: 'Greens', price: 60, prev_price: 55, unit: 'bundles', demand: 'High' },
  { product_id: 'grn-arugula', name: 'Arugula (Rocket)', category: 'Greens', price: 90, prev_price: 85, unit: 'bundles', demand: 'Medium' },
  // Microgreens
  { product_id: 'mg-sunflower', name: 'Sunflower Microgreens', category: 'Microgreens', price: 280, prev_price: 270, unit: 'kg', demand: 'High' },
  { product_id: 'mg-radish', name: 'Radish Microgreens', category: 'Microgreens', price: 255, prev_price: 245, unit: 'kg', demand: 'High' },
  { product_id: 'mg-peas', name: 'Pea Shoots', category: 'Microgreens', price: 300, prev_price: 290, unit: 'kg', demand: 'High' },
  { product_id: 'mg-wheat', name: 'Wheatgrass', category: 'Microgreens', price: 200, prev_price: 190, unit: 'kg', demand: 'Medium' },
  { product_id: 'mg-basil', name: 'Basil Microgreens', category: 'Microgreens', price: 350, prev_price: 340, unit: 'kg', demand: 'High' },
  { product_id: 'mg-broccoli', name: 'Broccoli Microgreens', category: 'Microgreens', price: 320, prev_price: 310, unit: 'kg', demand: 'High' },
  { product_id: 'mg-mustard', name: 'Mustard Microgreens', category: 'Microgreens', price: 260, prev_price: 250, unit: 'kg', demand: 'Medium' },
  { product_id: 'mg-fenugreek', name: 'Fenugreek Microgreens', category: 'Microgreens', price: 305, prev_price: 295, unit: 'kg', demand: 'High' },
  // Grocery
  { product_id: 'gro-coconutoil', name: 'Coconut Oil (Cold Pressed)', category: 'Grocery', price: 220, prev_price: 210, unit: 'liter', demand: 'High' },
  { product_id: 'gro-groundnutoil', name: 'Groundnut Oil', category: 'Grocery', price: 180, prev_price: 175, unit: 'liter', demand: 'High' },
  { product_id: 'gro-sesame', name: 'Sesame Oil', category: 'Grocery', price: 300, prev_price: 290, unit: 'liter', demand: 'Medium' },
  { product_id: 'gro-ghee', name: 'Cow Ghee', category: 'Grocery', price: 650, prev_price: 620, unit: 'liter', demand: 'Very High' },
  { product_id: 'gro-honey', name: 'Natural Honey', category: 'Grocery', price: 400, prev_price: 380, unit: 'kg', demand: 'High' },
  { product_id: 'gro-rice', name: 'Sona Masoori Rice', category: 'Grocery', price: 58, prev_price: 55, unit: 'kg', demand: 'Very High' },
  { product_id: 'gro-turmeric', name: 'Turmeric Powder', category: 'Grocery', price: 160, prev_price: 155, unit: 'kg', demand: 'High' },
  { product_id: 'gro-redchilli', name: 'Red Chilli Powder', category: 'Grocery', price: 180, prev_price: 170, unit: 'kg', demand: 'High' },
  { product_id: 'gro-toor', name: 'Toor Dal', category: 'Grocery', price: 130, prev_price: 125, unit: 'kg', demand: 'Very High' },
  { product_id: 'gro-moong', name: 'Moong Dal', category: 'Grocery', price: 110, prev_price: 105, unit: 'kg', demand: 'High' },
  { product_id: 'gro-chana', name: 'Chana Dal', category: 'Grocery', price: 95, prev_price: 90, unit: 'kg', demand: 'High' },
  { product_id: 'gro-urad', name: 'Urad Dal', category: 'Grocery', price: 120, prev_price: 115, unit: 'kg', demand: 'High' },
  // Animal Products
  { product_id: 'ani-chicken', name: 'Country Chicken (Live)', category: 'Animal Products', price: 380, prev_price: 360, unit: 'kg', demand: 'Very High' },
  { product_id: 'ani-broiler', name: 'Broiler Chicken', category: 'Animal Products', price: 185, prev_price: 178, unit: 'kg', demand: 'Very High' },
  { product_id: 'ani-eggs', name: 'Country Eggs', category: 'Animal Products', price: 90, prev_price: 85, unit: 'dozen', demand: 'Very High' },
  { product_id: 'ani-duck', name: 'Duck Eggs', category: 'Animal Products', price: 120, prev_price: 115, unit: 'dozen', demand: 'High' },
  { product_id: 'ani-goat', name: 'Goat Meat', category: 'Animal Products', price: 700, prev_price: 680, unit: 'kg', demand: 'Very High' },
  { product_id: 'ani-fish-rohu', name: 'Rohu Fish', category: 'Animal Products', price: 220, prev_price: 210, unit: 'kg', demand: 'High' },
  { product_id: 'ani-fish-catla', name: 'Catla Fish', category: 'Animal Products', price: 200, prev_price: 190, unit: 'kg', demand: 'High' },
  { product_id: 'ani-prawn', name: 'Prawns (Fresh)', category: 'Animal Products', price: 450, prev_price: 430, unit: 'kg', demand: 'Very High' },
  { product_id: 'ani-crab', name: 'Mud Crab', category: 'Animal Products', price: 600, prev_price: 580, unit: 'kg', demand: 'High' },
  { product_id: 'ani-milk', name: 'Farm Fresh Milk', category: 'Animal Products', price: 60, prev_price: 58, unit: 'liter', demand: 'Very High' },
  { product_id: 'ani-curd', name: 'Curd / Yoghurt', category: 'Animal Products', price: 50, prev_price: 48, unit: 'liter', demand: 'High' },
];

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Greens', 'Microgreens', 'Grocery', 'Animal Products'];

const DEMAND_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  'Very High': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  Medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Low: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

const CAT_COLORS: Record<string, string> = {
  Vegetables: 'bg-green-100 text-green-700',
  Fruits: 'bg-orange-100 text-orange-700',
  Greens: 'bg-teal-100 text-teal-700',
  Microgreens: 'bg-cyan-100 text-cyan-700',
  Grocery: 'bg-purple-100 text-purple-700',
  'Animal Products': 'bg-amber-100 text-amber-700',
};

type SortField = 'name' | 'price' | 'category' | 'demand';
type SortDir = 'asc' | 'desc';

const EMPTY_FORM: Partial<MarketPrice> = { product_id: '', name: '', price: 0, prev_price: 0, unit: 'kg', category: 'Vegetables', demand: 'Medium' };

export const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdminAuth();

  const [products, setProducts] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<Partial<MarketPrice>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!isAdmin) navigate('/admin');
  }, [isAdmin, navigate]);

  /* ── Fetch ── */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('market_prices').select('*').order('name');
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin]);

  /* ── Seed Data ── */
  const handleSeedData = async () => {
    if (!confirm(`This will insert ${SEED_PRODUCTS.length} products into your Supabase market_prices table. Duplicates will be skipped. Continue?`)) return;
    setSeeding(true);
    try {
      const { error } = await supabase
        .from('market_prices')
        .upsert(SEED_PRODUCTS, { onConflict: 'product_id', ignoreDuplicates: true });
      if (error) throw error;
      toast.success(`Seed data loaded! ${SEED_PRODUCTS.length} products processed.`);
      await fetchProducts();
    } catch (err: any) {
      toast.error('Seed failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  /* ── Sort ── */
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  /* ── Filtered + Sorted ── */
  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.product_id.toLowerCase().includes(s) ||
        (p.category || '').toLowerCase().includes(s)
      );
    }
    list.sort((a, b) => {
      let av: any = a[sortField] ?? '';
      let bv: any = b[sortField] ?? '';
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [products, activeCategory, searchTerm, sortField, sortDir]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: products.length,
    avgPrice: products.length ? Math.round(products.reduce((s, p) => s + (p.price || 0), 0) / products.length) : 0,
    categories: new Set(products.map(p => p.category)).size,
    veryHigh: products.filter(p => p.demand === 'Very High').length,
  }), [products]);

  /* ── CRUD ── */
  const openAdd = () => { setFormData(EMPTY_FORM); setModalMode('add'); setShowModal(true); };
  const openEdit = (p: MarketPrice) => { setFormData({ ...p }); setModalMode('edit'); setShowModal(true); };

  const handleSave = async () => {
    if (!formData.product_id || !formData.name || !formData.price) {
      toast.error('Product ID, Name and Price are required.'); return;
    }
    setSaving(true);
    try {
      if (modalMode === 'add') {
        const { data, error } = await supabase.from('market_prices').insert([formData]).select().single();
        if (error) throw error;
        setProducts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Product added successfully!');
      } else {
        const { error } = await supabase.from('market_prices').update(formData).eq('id', formData.id!);
        if (error) throw error;
        setProducts(prev => prev.map(p => p.id === formData.id ? { ...p, ...formData } : p));
        toast.success('Product updated!');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('market_prices').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteId(null);
      toast.success('Product deleted.');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ── Export CSV ── */
  const exportCSV = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Price (₹)', 'Prev Price (₹)', 'Unit', 'Demand'];
    const rows = filtered.map(p => [p.product_id, p.name, p.category || '', p.price, p.prev_price || '', p.unit, p.demand || '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'igobuyback-products.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortBtn = ({ field }: { field: SortField }) => (
    <button onClick={() => handleSort(field)} className="ml-1 opacity-50 hover:opacity-100 transition-opacity">
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ChevronDown size={13} />}
    </button>
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Admin Header ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9">
              <svg viewBox="0 0 60 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M8 44 L5 14 L54 14 L51 44 Z" stroke="#84CC16" strokeWidth="5" strokeLinejoin="round" fill="none"/>
                <path d="M54 14 C60 6 66 2 72 0" stroke="#84CC16" strokeWidth="5" strokeLinecap="round" fill="none"/>
                <path d="M5 14 L2 7" stroke="#84CC16" strokeWidth="5" strokeLinecap="round" fill="none"/>
                <circle cx="18" cy="52" r="5" fill="#555"/>
                <circle cx="42" cy="52" r="5" fill="#555"/>
                <path d="M28 40 Q12 20 26 2 Q46 16 28 40Z" fill="#84CC16"/>
                <path d="M38 38 Q26 18 40 4 Q52 18 38 38Z" fill="#5EA800"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-black text-gray-900">IGO<span className="text-lime-500">Buyback</span></div>
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none">Admin Dashboard</div>
            </div>
          </Link>

          {/* Centre badge */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-lime-50 border border-lime-200 rounded-full">
            <ShieldCheck size={14} className="text-lime-600" />
            <span className="text-xs font-bold text-lime-700">Admin Mode — Product Management</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden md:block text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">
              ← View Site
            </Link>
            <button
              onClick={async () => { await logout(); navigate('/admin'); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm border border-red-100"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-8">

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Products', value: stats.total, icon: Package, color: 'lime', sub: 'in database' },
            { label: 'Avg Market Price', value: `₹${stats.avgPrice}`, icon: IndianRupee, color: 'blue', sub: 'per unit' },
            { label: 'Categories', value: stats.categories, icon: Layers, color: 'purple', sub: 'product types' },
            { label: 'High Demand', value: stats.veryHigh, icon: TrendingUp, color: 'red', sub: 'very high demand' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color === 'lime' ? 'text-lime-600' : s.color === 'blue' ? 'text-blue-600' : s.color === 'purple' ? 'text-purple-600' : 'text-red-600'}`}>
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.color === 'lime' ? 'bg-lime-50' : s.color === 'blue' ? 'bg-blue-50' : s.color === 'purple' ? 'bg-purple-50' : 'bg-red-50'}`}>
                  <s.icon size={20} className={s.color === 'lime' ? 'text-lime-500' : s.color === 'blue' ? 'text-blue-500' : s.color === 'purple' ? 'text-purple-500' : 'text-red-500'} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Controls ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID or category…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Download size={15} />
                Export CSV
              </button>
              {products.length === 0 && (
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  <BarChart3 size={15} className={seeding ? 'animate-spin' : ''} />
                  {seeding ? 'Seeding…' : `Load ${SEED_PRODUCTS.length} Products`}
                </button>
              )}
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-lime-200"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-lime-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 opacity-70">
                    ({products.filter(p => p.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header info */}
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-lime-600" />
              <span className="font-bold text-gray-900">
                Product List
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Showing {filtered.length} of {products.length} products
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Filter size={13} />
              Sort by: <strong>{sortField}</strong> ({sortDir})
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block mb-4">
                <Package className="text-lime-500" size={36} />
              </motion.div>
              <p className="text-gray-500 font-medium">Loading products from Supabase…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center">
              <Package className="text-gray-200 mx-auto mb-4" size={48} />
              <p className="text-gray-500 font-semibold text-lg mb-2">No products found</p>
              {products.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Your Supabase table is empty. Load seed data to get started.</p>
                  <button
                    onClick={handleSeedData}
                    disabled={seeding}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-lime-500 text-white font-bold rounded-xl hover:bg-lime-600 transition-colors"
                  >
                    <BarChart3 size={16} />
                    {seeding ? 'Loading…' : `Load ${SEED_PRODUCTS.length} Products`}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Try adjusting your search or category filter.</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      #
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Product ID
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                      <span className="flex items-center">Name <SortBtn field="name" /></span>
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => handleSort('category')}>
                      <span className="flex items-center">Category <SortBtn field="category" /></span>
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => handleSort('price')}>
                      <span className="flex items-center justify-end">Price <SortBtn field="price" /></span>
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Prev Price
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700" onClick={() => handleSort('demand')}>
                      <span className="flex items-center">Demand <SortBtn field="demand" /></span>
                    </th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((product, idx) => {
                    const priceChange = product.prev_price
                      ? (((product.price - product.prev_price) / product.prev_price) * 100).toFixed(1)
                      : null;
                    const demand = DEMAND_CONFIG[product.demand || 'Medium'] || DEMAND_CONFIG['Medium'];
                    const catColor = CAT_COLORS[product.category || ''] || 'bg-gray-100 text-gray-600';

                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                        className="hover:bg-lime-50/40 transition-colors group"
                      >
                        <td className="px-6 py-4 text-gray-400 text-xs font-mono">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{product.product_id}</code>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColor}`}>
                            {product.category || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-black text-lime-600">₹{product.price}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-400 line-through">
                          {product.prev_price ? `₹${product.prev_price}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-medium">{product.unit}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${demand.bg} ${demand.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${demand.dot}`} />
                            {product.demand || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {priceChange !== null ? (
                            <span className={`text-xs font-bold ${parseFloat(priceChange) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {parseFloat(priceChange) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}%
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteId(product.id!)}
                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <span>{filtered.length} products · ₹{Math.min(...filtered.map(p => p.price))} – ₹{Math.max(...filtered.map(p => p.price))} price range</span>
              <span>Connected to Supabase market_prices table</span>
            </div>
          )}
        </div>
      </div>

      {/* ════════════ ADD / EDIT MODAL ════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-100 rounded-xl">
                    {modalMode === 'add' ? <Plus size={18} className="text-lime-600" /> : <Edit2 size={18} className="text-lime-600" />}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
                    <p className="text-xs text-gray-500">All prices in Indian Rupees (₹)</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product ID *</label>
                    <input
                      type="text"
                      value={formData.product_id || ''}
                      onChange={e => setFormData(p => ({ ...p, product_id: e.target.value }))}
                      placeholder="e.g. veg-tomato"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 font-mono"
                      disabled={modalMode === 'edit'}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Tomato"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Prev Price (₹)</label>
                    <input
                      type="number"
                      value={formData.prev_price || ''}
                      onChange={e => setFormData(p => ({ ...p, prev_price: Number(e.target.value) }))}
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                    <select
                      value={formData.unit || 'kg'}
                      onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
                    >
                      {['kg', 'bundles', 'pieces', 'liter', 'dozen', 'box'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Demand</label>
                    <select
                      value={formData.demand || 'Medium'}
                      onChange={e => setFormData(p => ({ ...p, demand: e.target.value as MarketPrice['demand'] }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
                    >
                      {['Low', 'Medium', 'High', 'Very High'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={formData.category || 'Vegetables'}
                      onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 shadow-md shadow-lime-200"
                >
                  {saving ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Save size={16} /></motion.div> Saving…</>
                  ) : (
                    <><Check size={16} /> {modalMode === 'add' ? 'Add Product' : 'Save Changes'}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ DELETE CONFIRM ════════════ */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This will permanently remove <strong>{products.find(p => p.id === deleteId)?.name}</strong> from your Supabase database.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
