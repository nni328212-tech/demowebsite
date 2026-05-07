-- ============================================
-- POTECH CMS - Database Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price BIGINT NOT NULL DEFAULT 0,
  old_price BIGINT DEFAULT 0,
  image_url TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  badge TEXT DEFAULT '',
  description TEXT DEFAULT '',
  specs JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  category TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  completed_date DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INQUIRIES (form liên hệ)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  service TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'closed')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SITE SETTINGS (key-value)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MEDIA
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT '',
  alt_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEW: products with category name
-- ============================================
CREATE OR REPLACE VIEW products_with_category AS
SELECT
  p.*,
  c.name AS category_name,
  c.slug AS category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.sort_order, p.created_at DESC;

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read for frontend
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read media" ON media FOR SELECT USING (true);

-- Public insert for contact form
CREATE POLICY "Public insert inquiries" ON inquiries FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage inquiries" ON inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage media" ON media FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SEED DATA: Categories
-- ============================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Đèn LED Nhà xưởng', 'den-nha-xuong', 'Đèn LED Highbay công suất 100W-500W cho nhà xưởng, nhà máy', 1),
  ('Đèn Pha LED', 'den-pha', 'Đèn pha LED công suất lớn cho sân bãi, cảng biển, sân thể thao', 2),
  ('Đèn Đường LED', 'den-duong', 'Đèn đường LED chống nước IP66 cho đường phố, khu công nghiệp', 3),
  ('Đèn LED Chống cháy nổ', 'den-chong-chay-no', 'Đèn LED ATEX cho mỏ, nhà máy hóa chất, dầu khí', 4),
  ('Đèn Năng lượng Mặt trời', 'den-nang-luong-mat-troi', 'Đèn LED tích hợp pin Lithium năng lượng mặt trời', 5),
  ('Đèn LED Panel', 'den-panel', 'Đèn LED Panel văn phòng ánh sáng đều bảo vệ mắt', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Default settings
-- ============================================
INSERT INTO site_settings (key, value) VALUES
  ('company_name', 'CÔNG TY TNHH CÔNG NGHỆ NĂNG LƯỢNG POTECH'),
  ('phone_sales', '0912.122.016'),
  ('phone_tech', '0937.659.657'),
  ('phone_office', '028-37269399'),
  ('email', 'info@potech.com.vn'),
  ('address', '350/33/10/9B Quốc Lộ 1, KP4, An Phú Đông, TP.HCM'),
  ('working_hours', 'T2-T7: 8:00 - 17:30'),
  ('slogan', 'Chuyên gia Đèn LED Công nghiệp Hàng đầu Việt Nam')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SEED DATA: Sample products
-- ============================================
INSERT INTO products (name, slug, category_id, price, old_price, image_url, badge, description, specs, is_featured, in_stock) VALUES
(
  'Đèn LED Highbay 100W',
  'highbay-100w',
  (SELECT id FROM categories WHERE slug = 'den-nha-xuong'),
  1850000, 2200000,
  'images/led_highbay.png',
  'Bán chạy',
  'Đèn LED Highbay 100W chip Nichia Nhật Bản, hiệu suất 160lm/W, chống bụi IP65. Phù hợp nhà xưởng cao 6-8m.',
  '{"power":"100W","lumens":"16,000 lm","chip":"Nichia (Japan)","ip":"IP65","warranty":"5 năm","lifespan":"50,000h"}'::jsonb,
  true, true
),
(
  'Đèn LED Highbay 200W',
  'highbay-200w',
  (SELECT id FROM categories WHERE slug = 'den-nha-xuong'),
  3200000, 3800000,
  'images/led_highbay.png',
  '',
  'Đèn LED Highbay 200W cho nhà xưởng lớn, chiều cao 8-12m. Tiết kiệm 70% điện năng.',
  '{"power":"200W","lumens":"32,000 lm","chip":"Nichia (Japan)","ip":"IP65","warranty":"5 năm","lifespan":"50,000h"}'::jsonb,
  true, true
),
(
  'Đèn Pha LED 200W',
  'floodlight-200w',
  (SELECT id FROM categories WHERE slug = 'den-pha'),
  2950000, 3500000,
  'images/led_floodlight.png',
  'Mới',
  'Đèn pha LED 200W chống nước IP66, chiếu sáng sân bãi, công trình ngoài trời.',
  '{"power":"200W","lumens":"28,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"5 năm","lifespan":"50,000h"}'::jsonb,
  true, true
),
(
  'Đèn Pha LED 500W',
  'floodlight-500w',
  (SELECT id FROM categories WHERE slug = 'den-pha'),
  6800000, 7900000,
  'images/led_floodlight.png',
  '',
  'Đèn pha LED 500W cho sân thể thao, cảng biển, khu công nghiệp.',
  '{"power":"500W","lumens":"70,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"5 năm","lifespan":"50,000h"}'::jsonb,
  false, true
),
(
  'Đèn Đường LED 150W',
  'streetlight-150w',
  (SELECT id FROM categories WHERE slug = 'den-duong'),
  3400000, 4000000,
  'images/led_streetlight.png',
  '',
  'Đèn đường LED 150W khí động học, chống nước IP66, phù hợp đường phố và KCN.',
  '{"power":"150W","lumens":"21,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"5 năm","lifespan":"50,000h"}'::jsonb,
  true, true
),
(
  'Đèn LED Chống Cháy Nổ 100W',
  'explosion-proof-100w',
  (SELECT id FROM categories WHERE slug = 'den-chong-chay-no'),
  5500000, 6500000,
  'images/led_explosion_proof.png',
  'Đặc biệt',
  'Đèn LED chống cháy nổ ATEX cho mỏ, nhà máy hóa chất, dầu khí.',
  '{"power":"100W","lumens":"14,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"3 năm","lifespan":"50,000h"}'::jsonb,
  false, true
),
(
  'Đèn Năng Lượng Mặt Trời 100W',
  'solar-100w',
  (SELECT id FROM categories WHERE slug = 'den-nang-luong-mat-troi'),
  2800000, 0,
  'images/led_solar.png',
  'Mới',
  'Đèn NLMT 100W tích hợp pin Lithium, tự sạc ban ngày, chiếu sáng 10-12h.',
  '{"power":"100W","lumens":"12,000 lm","chip":"Nichia (Japan)","ip":"IP65","warranty":"2 năm","lifespan":"30,000h"}'::jsonb,
  true, true
),
(
  'Đèn LED Panel 48W 600x600',
  'panel-48w',
  (SELECT id FROM categories WHERE slug = 'den-panel'),
  680000, 850000,
  'images/led_panel.png',
  '',
  'Đèn LED Panel 48W 600x600mm, ánh sáng đều, không nhấp nháy, bảo vệ mắt.',
  '{"power":"48W","lumens":"4,800 lm","chip":"Nichia (Japan)","ip":"IP20","warranty":"3 năm","lifespan":"50,000h"}'::jsonb,
  false, true
)
ON CONFLICT (slug) DO NOTHING;
