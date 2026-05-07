/**
 * POTECH CMS - Supabase Client v2.0
 * Full commercial API: Products, Customers, Quotes, Analytics
 */

const SUPABASE_URL = 'https://npozfdcayxsivnpxgnzy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wb3pmZGNheXhzaXZucHhnbnp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTcxNjcsImV4cCI6MjA5MzY3MzE2N30.bAGqNewWmoEWlPYZBAbYDGVUtJpua22hXDYTaN1CN40';

// ============ CORE CLIENT ============
const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,

  headers(auth = true) {
    const h = { 'apikey': this.key, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
    const token = auth ? localStorage.getItem('sb_access_token') : null;
    h['Authorization'] = `Bearer ${token || this.key}`;
    return h;
  },

  async get(table, params = '') {
    const r = await fetch(`${this.url}/rest/v1/${table}?${params}`, { headers: this.headers() });
    if (!r.ok) throw new Error(`GET ${table}: ${r.status}`);
    return r.json();
  },
  async post(table, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}`, { method: 'POST', headers: this.headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error(`POST ${table}: ${r.status}`);
    return r.json();
  },
  async patch(table, id, data) {
    const r = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, { method: 'PATCH', headers: this.headers(), body: JSON.stringify(data) });
    if (!r.ok) throw new Error(`PATCH ${table}: ${r.status}`);
    return r.json();
  },
  async del(table, id) {
    const r = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, { method: 'DELETE', headers: this.headers() });
    if (!r.ok) throw new Error(`DELETE ${table}: ${r.status}`);
    return true;
  },

  // Auth
  async signIn(email, password) {
    const r = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { 'apikey': this.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) throw new Error('Đăng nhập thất bại');
    const d = await r.json();
    localStorage.setItem('sb_access_token', d.access_token);
    localStorage.setItem('sb_user', JSON.stringify(d.user));
    return d;
  },
  signOut() { localStorage.removeItem('sb_access_token'); localStorage.removeItem('sb_user'); },
  isLoggedIn() { return !!localStorage.getItem('sb_access_token'); },
  getUser() { try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; } },

  // Storage
  async upload(bucket, path, file) {
    const r = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${localStorage.getItem('sb_access_token')}` },
      body: file
    });
    if (!r.ok) throw new Error('Upload failed');
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }
};

// ============ PRODUCTS ============
const ProductAPI = {
  list: (params = '') => supabase.get('products_with_category', `select=*&${params}`),
  active: () => supabase.get('products_with_category', 'status=eq.active&order=sort_order'),
  featured: () => supabase.get('products_with_category', 'is_featured=eq.true&status=eq.active&order=sort_order&limit=8'),
  byCategory: (slug) => supabase.get('products_with_category', `category_slug=eq.${slug}&status=eq.active&order=sort_order`),
  bySlug: async (slug) => { const d = await supabase.get('products', `slug=eq.${slug}`); return d[0]; },
  create: (p) => supabase.post('products', p),
  update: (id, p) => supabase.patch('products', id, p),
  delete: (id) => supabase.del('products', id),
  trackView: (id) => supabase.patch('products', id, { view_count: 'view_count + 1' }), // needs RPC
};

// ============ CATEGORIES ============
const CategoryAPI = {
  list: () => supabase.get('categories', 'is_active=eq.true&order=sort_order'),
  all: () => supabase.get('categories', 'order=sort_order'),
  create: (c) => supabase.post('categories', c),
  update: (id, c) => supabase.patch('categories', id, c),
  delete: (id) => supabase.del('categories', id),
};

// ============ CUSTOMERS (CRM) ============
const CustomerAPI = {
  list: (params = '') => supabase.get('customers', `order=created_at.desc&${params}`),
  byStatus: (s) => supabase.get('customers', `status=eq.${s}&order=company_name`),
  search: (q) => supabase.get('customers', `or=(company_name.ilike.*${q}*,contact_name.ilike.*${q}*,phone.ilike.*${q}*)&order=created_at.desc`),
  create: (c) => supabase.post('customers', c),
  update: (id, c) => supabase.patch('customers', id, c),
  delete: (id) => supabase.del('customers', id),
};

// ============ INQUIRIES ============
const InquiryAPI = {
  list: () => supabase.get('inquiries', 'order=created_at.desc'),
  byStatus: (s) => supabase.get('inquiries', `status=eq.${s}&order=created_at.desc`),
  newCount: async () => { const d = await supabase.get('inquiries', 'status=eq.new&select=id'); return d.length; },
  submit: (data) => {
    // Public submit (no auth required) - add source tracking
    data.source_page = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    data.utm_source = params.get('utm_source') || '';
    data.utm_medium = params.get('utm_medium') || '';
    data.utm_campaign = params.get('utm_campaign') || '';
    return supabase.post('inquiries', data);
  },
  update: (id, d) => supabase.patch('inquiries', id, d),
  respond: (id) => supabase.patch('inquiries', id, { status: 'contacted', response_at: new Date().toISOString() }),
};

// ============ QUOTES ============
const QuoteAPI = {
  list: () => supabase.get('quotes', 'order=created_at.desc'),
  byCustomer: (cid) => supabase.get('quotes', `customer_id=eq.${cid}&order=created_at.desc`),
  create: (q) => supabase.post('quotes', q),
  update: (id, q) => supabase.patch('quotes', id, q),
  delete: (id) => supabase.del('quotes', id),
  nextNumber: async () => {
    const now = new Date();
    const prefix = `BG-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;
    const existing = await supabase.get('quotes', `quote_number=like.${prefix}*&order=quote_number.desc&limit=1`);
    const last = existing[0] ? parseInt(existing[0].quote_number.slice(-4)) : 0;
    return `${prefix}-${String(last + 1).padStart(4, '0')}`;
  }
};

// ============ PROJECTS ============
const ProjectAPI = {
  list: () => supabase.get('projects', 'order=sort_order,created_at.desc'),
  featured: () => supabase.get('projects', 'is_featured=eq.true&order=sort_order&limit=6'),
  create: (p) => supabase.post('projects', p),
  update: (id, p) => supabase.patch('projects', id, p),
  delete: (id) => supabase.del('projects', id),
};

// ============ ARTICLES (Blog) ============
const ArticleAPI = {
  published: () => supabase.get('articles', 'status=eq.published&order=published_at.desc'),
  all: () => supabase.get('articles', 'order=created_at.desc'),
  bySlug: async (slug) => { const d = await supabase.get('articles', `slug=eq.${slug}`); return d[0]; },
  create: (a) => supabase.post('articles', a),
  update: (id, a) => supabase.patch('articles', id, a),
  delete: (id) => supabase.del('articles', id),
};

// ============ PRICE HISTORY ============
const PriceHistoryAPI = {
  byProduct: (pid) => supabase.get('price_history', `product_id=eq.${pid}&order=created_at.desc`),
};

// ============ VOLUME PRICING ============
const VolumePricingAPI = {
  byProduct: (pid) => supabase.get('volume_pricing', `product_id=eq.${pid}&order=min_qty`),
  set: (pid, tiers) => {
    // Delete existing, then insert new
    return supabase.del('volume_pricing', `product_id=eq.${pid}`)
      .catch(() => {})
      .then(() => Promise.all(tiers.map(t => supabase.post('volume_pricing', { product_id: pid, ...t }))));
  }
};

// ============ SETTINGS ============
const SettingsAPI = {
  getAll: async () => {
    const rows = await supabase.get('site_settings', '');
    const map = {}; rows.forEach(r => map[r.key] = r.value);
    return map;
  },
  set: (key, value) => supabase.post('site_settings', { key, value }),
};

// ============ DASHBOARD ============
const DashboardAPI = {
  stats: () => supabase.get('dashboard_stats', ''),
  pipeline: () => supabase.get('inquiry_pipeline', ''),
  recentInquiries: () => supabase.get('inquiries', 'order=created_at.desc&limit=10'),
  topProducts: () => supabase.get('products', 'order=inquiry_count.desc&limit=5&select=name,sku,inquiry_count,view_count,price'),
};

// ============ ACTIVITY LOG ============
const ActivityAPI = {
  log: (action, entity_type, entity_id = '', details = {}) => {
    const user = supabase.getUser();
    return supabase.post('activity_log', {
      user_email: user?.email || 'system',
      action, entity_type, entity_id, details
    });
  },
  recent: (limit = 20) => supabase.get('activity_log', `order=created_at.desc&limit=${limit}`),
};

// ============ UTILS ============
function formatVND(n) { return Number(n).toLocaleString('vi-VN') + 'đ'; }
function calcDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}
function calcMargin(price, cost) {
  if (!cost || cost <= 0) return 0;
  return Math.round((price - cost) / price * 100);
}
function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}
