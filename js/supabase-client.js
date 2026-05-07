/**
 * POTECH CMS - Supabase Client Module
 * Cấu hình kết nối và các hàm API cho toàn bộ hệ thống
 */

// ============================================
// CẤU HÌNH - Thay bằng thông tin project Supabase của bạn
// ============================================
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE';

// ============================================
// SUPABASE CLIENT (lightweight, no SDK needed)
// ============================================
const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  authToken: null,

  headers() {
    const h = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    const token = this.authToken || localStorage.getItem('sb_access_token');
    if (token) h['Authorization'] = `Bearer ${token}`;
    else h['Authorization'] = `Bearer ${this.key}`;
    return h;
  },

  // --- Generic REST ---
  async query(table, params = '') {
    const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, { headers: this.headers() });
    if (!res.ok) throw new Error(`Query failed: ${res.status}`);
    return res.json();
  },

  async insert(table, data) {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST', headers: this.headers(), body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Insert failed: ${res.status}`);
    return res.json();
  },

  async update(table, id, data) {
    const res = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'PATCH', headers: this.headers(), body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Update failed: ${res.status}`);
    return res.json();
  },

  async remove(table, id) {
    const res = await fetch(`${this.url}/rest/v1/${table}?id=eq.${id}`, {
      method: 'DELETE', headers: this.headers()
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    return true;
  },

  // --- Auth ---
  async signIn(email, password) {
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': this.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Đăng nhập thất bại');
    const data = await res.json();
    this.authToken = data.access_token;
    localStorage.setItem('sb_access_token', data.access_token);
    localStorage.setItem('sb_refresh_token', data.refresh_token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
    return data;
  },

  signOut() {
    this.authToken = null;
    localStorage.removeItem('sb_access_token');
    localStorage.removeItem('sb_refresh_token');
    localStorage.removeItem('sb_user');
  },

  isLoggedIn() {
    return !!localStorage.getItem('sb_access_token');
  },

  getUser() {
    const u = localStorage.getItem('sb_user');
    return u ? JSON.parse(u) : null;
  },

  // --- Storage (upload ảnh) ---
  async uploadFile(bucket, path, file) {
    const res = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        'apikey': this.key,
        'Authorization': `Bearer ${this.authToken || localStorage.getItem('sb_access_token')}`
      },
      body: file
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }
};

// ============================================
// API HELPERS - Products
// ============================================
const ProductAPI = {
  async getAll() {
    return supabase.query('products_with_category', 'order=sort_order,created_at.desc');
  },
  async getByCategory(slug) {
    return supabase.query('products_with_category', `category_slug=eq.${slug}&order=sort_order`);
  },
  async getFeatured() {
    return supabase.query('products_with_category', 'is_featured=eq.true&in_stock=eq.true&order=sort_order&limit=8');
  },
  async getBySlug(slug) {
    const data = await supabase.query('products', `slug=eq.${slug}`);
    return data[0] || null;
  },
  async create(product) { return supabase.insert('products', product); },
  async update(id, product) { return supabase.update('products', id, product); },
  async delete(id) { return supabase.remove('products', id); }
};

// ============================================
// API HELPERS - Categories
// ============================================
const CategoryAPI = {
  async getAll() {
    return supabase.query('categories', 'is_active=eq.true&order=sort_order');
  },
  async create(cat) { return supabase.insert('categories', cat); },
  async update(id, cat) { return supabase.update('categories', id, cat); },
  async delete(id) { return supabase.remove('categories', id); }
};

// ============================================
// API HELPERS - Projects
// ============================================
const ProjectAPI = {
  async getAll() { return supabase.query('projects', 'order=sort_order,created_at.desc'); },
  async getFeatured() { return supabase.query('projects', 'is_featured=eq.true&order=sort_order&limit=6'); },
  async create(p) { return supabase.insert('projects', p); },
  async update(id, p) { return supabase.update('projects', id, p); },
  async delete(id) { return supabase.remove('projects', id); }
};

// ============================================
// API HELPERS - Inquiries (Contact Form)
// ============================================
const InquiryAPI = {
  async submit(data) { return supabase.insert('inquiries', data); },
  async getAll() { return supabase.query('inquiries', 'order=created_at.desc'); },
  async updateStatus(id, status, notes) { return supabase.update('inquiries', id, { status, notes }); }
};

// ============================================
// API HELPERS - Settings
// ============================================
const SettingsAPI = {
  async getAll() {
    const rows = await supabase.query('site_settings', '');
    const map = {};
    rows.forEach(r => map[r.key] = r.value);
    return map;
  },
  async set(key, value) {
    // Upsert via delete + insert (simple approach)
    try { await supabase.remove('site_settings', key); } catch (e) {}
    return supabase.insert('site_settings', { key, value });
  }
};

// ============================================
// UTILITY
// ============================================
function formatVND(n) {
  return Number(n).toLocaleString('vi-VN') + 'đ';
}

function calcDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

// Export for modules (if needed)
if (typeof module !== 'undefined') {
  module.exports = { supabase, ProductAPI, CategoryAPI, ProjectAPI, InquiryAPI, SettingsAPI };
}
