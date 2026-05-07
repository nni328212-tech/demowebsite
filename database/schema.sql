-- ============================================
-- POTECH CMS - Commercial Grade Schema v2.0
-- Supabase PostgreSQL
-- ============================================

-- =====================
-- 1. CATEGORIES
-- =====================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 2. PRODUCTS (Enhanced)
-- =====================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Identification
  sku TEXT UNIQUE,
  model TEXT DEFAULT '',
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Pricing
  cost_price BIGINT DEFAULT 0,            -- Giá vốn
  price BIGINT NOT NULL DEFAULT 0,         -- Giá bán
  old_price BIGINT DEFAULT 0,              -- Giá cũ (hiển thị giảm giá)
  currency TEXT DEFAULT 'VND',
  min_order_qty INT DEFAULT 1,             -- Số lượng tối thiểu
  unit TEXT DEFAULT 'bộ',                  -- Đơn vị tính

  -- Media
  image_url TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  datasheet_url TEXT DEFAULT '',           -- PDF tài liệu kỹ thuật
  video_url TEXT DEFAULT '',

  -- Content
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',

  -- Technical specs
  specs JSONB DEFAULT '{}',
  power_watt INT DEFAULT 0,
  lumens INT DEFAULT 0,
  ip_rating TEXT DEFAULT '',
  chip_brand TEXT DEFAULT 'Nichia (Japan)',
  warranty_months INT DEFAULT 60,
  lifespan_hours INT DEFAULT 50000,
  weight_kg DECIMAL(8,2) DEFAULT 0,
  dimensions TEXT DEFAULT '',
  origin TEXT DEFAULT 'Việt Nam',
  certifications TEXT[] DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'discontinued', 'out_of_stock')),
  is_featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_qty INT DEFAULT 0,

  -- SEO
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  seo_keywords TEXT[] DEFAULT '{}',

  -- Tracking
  view_count INT DEFAULT 0,
  inquiry_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 3. PRICE HISTORY (Lịch sử giá)
-- =====================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price BIGINT NOT NULL,
  new_price BIGINT NOT NULL,
  old_cost BIGINT DEFAULT 0,
  new_cost BIGINT DEFAULT 0,
  changed_by TEXT DEFAULT '',
  reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 4. VOLUME PRICING (Giá theo số lượng)
-- =====================
CREATE TABLE IF NOT EXISTS volume_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty INT NOT NULL,
  max_qty INT,
  price BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 5. CUSTOMERS (CRM)
-- =====================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Company info
  company_name TEXT DEFAULT '',
  tax_code TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  company_size TEXT DEFAULT '' CHECK (company_size IN ('', 'small', 'medium', 'large', 'enterprise')),

  -- Contact
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',

  -- CRM
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'referral', 'exhibition', 'ads', 'cold_call', 'social', 'other')),
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'vip', 'inactive')),
  assigned_to TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',

  -- Financial
  total_revenue BIGINT DEFAULT 0,
  total_orders INT DEFAULT 0,

  -- Notes
  notes TEXT DEFAULT '',
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 6. INQUIRIES (Yêu cầu báo giá)
-- =====================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Contact
  full_name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',

  -- Request
  service TEXT DEFAULT '',
  product_interest TEXT DEFAULT '',
  message TEXT DEFAULT '',
  budget_range TEXT DEFAULT '',

  -- CRM link
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Pipeline
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  lost_reason TEXT DEFAULT '',

  -- Tracking
  source_page TEXT DEFAULT '',
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  response_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 7. QUOTES (Báo giá)
-- =====================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE SET NULL,

  -- Items stored as JSONB array
  items JSONB DEFAULT '[]',
  /*  items format:
      [{ "product_id": "...", "name": "...", "sku": "...",
         "qty": 10, "unit_price": 1850000, "total": 18500000 }]
  */

  subtotal BIGINT DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,
  vat_percent DECIMAL(5,2) DEFAULT 10,
  vat_amount BIGINT DEFAULT 0,
  total BIGINT DEFAULT 0,

  -- Terms
  payment_terms TEXT DEFAULT 'Thanh toán 50% đặt cọc, 50% sau khi giao hàng',
  delivery_time TEXT DEFAULT '7-14 ngày làm việc',
  warranty_terms TEXT DEFAULT 'Bảo hành theo chính sách POTECH',
  valid_until DATE,
  notes TEXT DEFAULT '',

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised')),
  version INT DEFAULT 1,

  created_by TEXT DEFAULT '',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 8. PROJECTS (Dự án)
-- =====================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  location TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  category TEXT DEFAULT '',
  products_used TEXT[] DEFAULT '{}',
  project_value BIGINT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  completed_date DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 9. BLOG / ARTICLES
-- =====================
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  category TEXT DEFAULT 'tin-tuc',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author TEXT DEFAULT '',
  view_count INT DEFAULT 0,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 10. SITE SETTINGS
-- =====================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  group_name TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 11. ACTIVITY LOG (Audit trail)
-- =====================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT DEFAULT '',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- 12. MEDIA
-- =====================
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT '',
  alt_text TEXT DEFAULT '',
  folder TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_price_history_product ON price_history(product_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_source ON customers(source);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-log price changes
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price OR OLD.cost_price IS DISTINCT FROM NEW.cost_price THEN
    INSERT INTO price_history (product_id, old_price, new_price, old_cost, new_cost)
    VALUES (NEW.id, OLD.price, NEW.price, OLD.cost_price, NEW.cost_price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_price_change AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION log_price_change();

-- Auto-increment product view/inquiry count
CREATE OR REPLACE FUNCTION increment_product_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_interest IS NOT NULL AND NEW.product_interest != '' THEN
    UPDATE products SET inquiry_count = inquiry_count + 1 WHERE name ILIKE '%' || NEW.product_interest || '%';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inquiry_product_count AFTER INSERT ON inquiries FOR EACH ROW EXECUTE FUNCTION increment_product_inquiry();

-- ============================================
-- VIEWS
-- ============================================
CREATE OR REPLACE VIEW products_with_category AS
SELECT p.*, c.name AS category_name, c.slug AS category_slug,
  CASE WHEN p.cost_price > 0 THEN ROUND((p.price - p.cost_price)::numeric / p.price * 100, 1) ELSE 0 END AS margin_percent
FROM products p LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.sort_order, p.created_at DESC;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM products WHERE status = 'active') AS total_products,
  (SELECT COUNT(*) FROM products WHERE in_stock = false) AS out_of_stock,
  (SELECT COUNT(*) FROM customers) AS total_customers,
  (SELECT COUNT(*) FROM inquiries WHERE status = 'new') AS new_inquiries,
  (SELECT COUNT(*) FROM inquiries WHERE created_at > now() - interval '30 days') AS inquiries_30d,
  (SELECT COUNT(*) FROM quotes WHERE status = 'sent') AS pending_quotes,
  (SELECT COALESCE(SUM(total), 0) FROM quotes WHERE status = 'accepted') AS total_revenue,
  (SELECT COUNT(*) FROM articles WHERE status = 'published') AS published_articles;

CREATE OR REPLACE VIEW inquiry_pipeline AS
SELECT status, COUNT(*) AS count,
  ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(response_at, now()) - created_at)) / 3600)::numeric, 1) AS avg_response_hours
FROM inquiries GROUP BY status ORDER BY
  CASE status WHEN 'new' THEN 1 WHEN 'contacted' THEN 2 WHEN 'qualified' THEN 3
  WHEN 'quoted' THEN 4 WHEN 'negotiating' THEN 5 WHEN 'won' THEN 6 WHEN 'lost' THEN 7 END;

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Public READ (frontend)
CREATE POLICY "pub_read" ON categories FOR SELECT USING (true);
CREATE POLICY "pub_read" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "pub_read" ON projects FOR SELECT USING (true);
CREATE POLICY "pub_read" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "pub_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "pub_read" ON media FOR SELECT USING (true);
CREATE POLICY "pub_read" ON volume_pricing FOR SELECT USING (true);

-- Public INSERT (contact form)
CREATE POLICY "pub_insert" ON inquiries FOR INSERT WITH CHECK (true);

-- Admin FULL ACCESS
CREATE POLICY "admin_all" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON price_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON volume_pricing FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all" ON activity_log FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA
-- ============================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Đèn LED Nhà xưởng', 'den-nha-xuong', 'Highbay 100W-500W cho nhà xưởng, nhà máy', 1),
  ('Đèn Pha LED', 'den-pha', 'Pha LED công suất lớn cho sân bãi, cảng biển', 2),
  ('Đèn Đường LED', 'den-duong', 'Đèn đường chống nước IP66', 3),
  ('Đèn LED Chống cháy nổ', 'den-chong-chay-no', 'ATEX cho mỏ, hóa chất, dầu khí', 4),
  ('Đèn Năng lượng Mặt trời', 'den-nang-luong-mat-troi', 'Tích hợp pin Lithium NLMT', 5),
  ('Đèn LED Panel', 'den-panel', 'Panel văn phòng bảo vệ mắt', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (key, value, group_name) VALUES
  ('company_name', 'CÔNG TY TNHH CÔNG NGHỆ NĂNG LƯỢNG POTECH', 'company'),
  ('phone_sales', '0912.122.016', 'contact'),
  ('phone_tech', '0937.659.657', 'contact'),
  ('phone_office', '028-37269399', 'contact'),
  ('email', 'info@potech.com.vn', 'contact'),
  ('address', '350/33/10/9B Quốc Lộ 1, KP4, An Phú Đông, TP.HCM', 'company'),
  ('working_hours', 'T2-T7: 8:00 - 17:30', 'company'),
  ('tax_code', '0311519359', 'company'),
  ('quote_validity_days', '30', 'business'),
  ('default_vat', '10', 'business'),
  ('default_payment_terms', 'Thanh toán 50% đặt cọc, 50% sau khi giao hàng', 'business')
ON CONFLICT (key) DO NOTHING;
