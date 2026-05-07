const https = require('https');

const URL_BASE = process.env.SUPABASE_URL || 'npozfdcayxsivnpxgnzy.supabase.co';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.");
  process.exit(1);
}

function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: URL_BASE, path: `/rest/v1/${path}`, method,
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' }
    };
    if (data) opts.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // 1. Get category IDs
  console.log('Loading categories...');
  const cats = await apiCall('GET', 'categories?select=id,slug');
  const catMap = {};
  cats.d.forEach(c => catMap[c.slug] = c.id);
  console.log('Categories:', Object.keys(catMap).join(', '));

  // 2. Seed products
  const products = [
    {sku:'PT-HB-100',name:'Đèn LED Highbay 100W',slug:'highbay-100w',category_id:catMap['den-nha-xuong'],price:1850000,old_price:2200000,cost_price:1100000,image_url:'images/led_highbay.png',badge:'Bán chạy',description:'Đèn LED Highbay 100W chip Nichia Nhật Bản, hiệu suất 160lm/W, chống bụi IP65. Phù hợp nhà xưởng cao 6-8m.',specs:{"power":"100W","lumens":"16,000 lm","chip":"Nichia (Japan)","ip":"IP65","warranty":"5 năm","lifespan":"50,000h"},power_watt:100,lumens:16000,ip_rating:'IP65',warranty_months:60,is_featured:true,in_stock:true},
    {sku:'PT-HB-200',name:'Đèn LED Highbay 200W',slug:'highbay-200w',category_id:catMap['den-nha-xuong'],price:3200000,old_price:3800000,cost_price:1900000,image_url:'images/led_highbay.png',description:'Đèn LED Highbay 200W cho nhà xưởng lớn, chiều cao 8-12m. Tiết kiệm 70% điện.',specs:{"power":"200W","lumens":"32,000 lm","chip":"Nichia (Japan)","ip":"IP65","warranty":"5 năm","lifespan":"50,000h"},power_watt:200,lumens:32000,ip_rating:'IP65',warranty_months:60,is_featured:true,in_stock:true},
    {sku:'PT-FL-200',name:'Đèn Pha LED 200W',slug:'floodlight-200w',category_id:catMap['den-pha'],price:2950000,old_price:3500000,cost_price:1750000,image_url:'images/led_floodlight.png',badge:'Mới',description:'Đèn pha LED 200W chống nước IP66, chiếu sáng sân bãi.',specs:{"power":"200W","lumens":"28,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"5 năm","lifespan":"50,000h"},power_watt:200,lumens:28000,ip_rating:'IP66',warranty_months:60,is_featured:true,in_stock:true},
    {sku:'PT-FL-500',name:'Đèn Pha LED 500W',slug:'floodlight-500w',category_id:catMap['den-pha'],price:6800000,old_price:7900000,cost_price:4000000,image_url:'images/led_floodlight.png',description:'Đèn pha LED 500W cho sân thể thao, cảng biển.',specs:{"power":"500W","lumens":"70,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"5 năm","lifespan":"50,000h"},power_watt:500,lumens:70000,ip_rating:'IP66',warranty_months:60,is_featured:false,in_stock:true},
    {sku:'PT-SL-150',name:'Đèn Đường LED 150W',slug:'streetlight-150w',category_id:catMap['den-duong'],price:3400000,old_price:4000000,cost_price:2000000,image_url:'images/led_streetlight.png',description:'Đèn đường LED 150W khí động học, chống nước IP66.',specs:{"power":"150W","lumens":"21,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"5 năm","lifespan":"50,000h"},power_watt:150,lumens:21000,ip_rating:'IP66',warranty_months:60,is_featured:true,in_stock:true},
    {sku:'PT-EX-100',name:'Đèn LED Chống Cháy Nổ 100W',slug:'explosion-proof-100w',category_id:catMap['den-chong-chay-no'],price:5500000,old_price:6500000,cost_price:3300000,image_url:'images/led_explosion_proof.png',badge:'Đặc biệt',description:'Đèn LED chống cháy nổ ATEX cho mỏ, nhà máy hóa chất.',specs:{"power":"100W","lumens":"14,000 lm","chip":"Nichia (Japan)","ip":"IP66","warranty":"3 năm","lifespan":"50,000h"},power_watt:100,lumens:14000,ip_rating:'IP66',warranty_months:36,is_featured:false,in_stock:true},
    {sku:'PT-SOL-100',name:'Đèn Năng Lượng Mặt Trời 100W',slug:'solar-100w',category_id:catMap['den-nang-luong-mat-troi'],price:2800000,old_price:0,cost_price:1600000,image_url:'images/led_solar.png',badge:'Mới',description:'Đèn NLMT 100W tích hợp pin Lithium, chiếu sáng 10-12h.',specs:{"power":"100W","lumens":"12,000 lm","chip":"Nichia (Japan)","ip":"IP65","warranty":"2 năm","lifespan":"30,000h"},power_watt:100,lumens:12000,ip_rating:'IP65',warranty_months:24,is_featured:true,in_stock:true},
    {sku:'PT-PNL-48',name:'Đèn LED Panel 48W 600x600',slug:'panel-48w',category_id:catMap['den-panel'],price:680000,old_price:850000,cost_price:380000,image_url:'images/led_panel.png',description:'Đèn LED Panel 48W 600x600mm, ánh sáng đều, bảo vệ mắt.',specs:{"power":"48W","lumens":"4,800 lm","chip":"Nichia (Japan)","ip":"IP20","warranty":"3 năm","lifespan":"50,000h"},power_watt:48,lumens:4800,ip_rating:'IP20',warranty_months:36,is_featured:false,in_stock:true}
  ];

  console.log(`\nSeeding ${products.length} products...`);
  for (const p of products) {
    const r = await apiCall('POST', 'products', p);
    console.log(`  ${p.sku} ${p.name}: ${r.s === 201 ? '✓' : 'ERR ' + (r.d?.message || r.s)}`);
  }

  // 3. Seed settings
  console.log('\nSeeding settings...');
  const settings = [
    {key:'company_name',value:'CÔNG TY TNHH GLOBAL SOLUTIONS',group_name:'company'},
    {key:'phone_sales',value:'0912.122.016',group_name:'contact'},
    {key:'phone_tech',value:'0937.659.657',group_name:'contact'},
    {key:'email',value:'contact@globalsolutions.vn',group_name:'contact'},
    {key:'address',value:'TP.HCM',group_name:'company'},
    {key:'working_hours',value:'T2-T7: 8:00 - 17:30',group_name:'company'},
    {key:'tax_code',value:'0311519359',group_name:'company'},
    {key:'default_vat',value:'10',group_name:'business'}
  ];
  for (const s of settings) {
    const r = await apiCall('POST', 'site_settings', s);
    console.log(`  ${s.key}: ${r.s === 201 ? '✓' : r.d?.message || r.s}`);
  }

  // 4. Create admin user
  console.log('\nCreating admin user...');
  const adminBody = JSON.stringify({ email: 'admin@globalsolutions.vn', password: 'Global@2026', email_confirm: true });
  const adminRes = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: URL_BASE, path: '/auth/v1/admin/users', method: 'POST',
      headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(adminBody) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, d: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, d }); } });
    });
    req.on('error', reject);
    req.write(adminBody);
    req.end();
  });
  console.log(`  Admin user: ${adminRes.s === 200 ? '✓ Created' : adminRes.d?.msg || adminRes.d?.message || adminRes.s}`);

  // 5. Verify
  console.log('\n--- VERIFICATION ---');
  const prodCheck = await apiCall('GET', 'products?select=name,sku,price&order=price');
  console.log(`Products: ${prodCheck.d.length} records`);
  prodCheck.d.forEach(p => console.log(`  ${p.sku} | ${p.name} | ${Number(p.price).toLocaleString()}đ`));

  const setCheck = await apiCall('GET', 'site_settings?select=key,value');
  console.log(`Settings: ${setCheck.d.length} records`);

  console.log('\n✅ Database setup complete!');
  console.log('Admin login: admin@globalsolutions.vn / Global@2026');
}

main().catch(console.error);
