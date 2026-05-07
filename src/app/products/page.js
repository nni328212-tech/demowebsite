import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Search } from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
  title: 'Danh mục Sản phẩm - Global Solutions',
  description: 'Khám phá các giải pháp chiếu sáng công nghiệp, pin lưu trữ, và năng lượng mặt trời chất lượng cao từ Global Solutions.',
};

export default async function ProductsPage() {
  // Fetch categories and products server-side
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Group products by category
  const productsByCategory = {};
  if (categories && products) {
    categories.forEach(cat => {
      productsByCategory[cat.id] = products.filter(p => p.category_id === cat.id);
    });
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>SẢN PHẨM & GIẢI PHÁP</h1>
          <p>Chất lượng vượt trội, tiết kiệm tối đa, bảo hành dài hạn</p>
        </div>
      </div>

      <div className="container section">
        <div className={styles.shopLayout}>
          {/* Sidebar / Filters */}
          <aside className={styles.sidebar}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input type="text" placeholder="Tìm kiếm sản phẩm..." />
            </div>

            <div className={styles.filterWidget}>
              <h3>Danh mục</h3>
              <ul className={styles.categoryList}>
                <li><a href="#all" className={styles.active}>Tất cả sản phẩm</a></li>
                {categories?.map(cat => (
                  <li key={cat.id}>
                    <a href={`#cat-${cat.slug}`}>{cat.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <main className={styles.mainContent}>
            {categories?.map(cat => {
              const catProducts = productsByCategory[cat.id];
              if (!catProducts || catProducts.length === 0) return null;

              return (
                <div key={cat.id} id={`cat-${cat.slug}`} className={styles.categorySection}>
                  <h2 className={styles.categoryTitle}>{cat.name}</h2>
                  
                  <div className={styles.productGrid}>
                    {catProducts.map(product => (
                      <div key={product.id} className={styles.productCard}>
                        {product.badge && <span className={styles.badge}>{product.badge}</span>}
                        <Link href={`/products/${product.slug}`} className={styles.productImage}>
                          <Image 
                            src={`/${product.image_url}`} 
                            alt={product.name} 
                            width={300} 
                            height={300}
                            style={{ objectFit: 'cover' }}
                            // Fallback image handling could go here, but since it's an MVP we assume paths are correct
                          />
                        </Link>
                        <div className={styles.productInfo}>
                          <div className={styles.productCat}>{product.category?.name}</div>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className={styles.productName}>{product.name}</h3>
                          </Link>
                          
                          <div className={styles.productSpecs}>
                            {product.power_watt > 0 && <span>⚡ {product.power_watt}W</span>}
                            {product.ip_rating && <span>💧 {product.ip_rating}</span>}
                            {product.warranty_months && <span>🛡️ {product.warranty_months / 12} năm</span>}
                          </div>

                          <div className={styles.productFooter}>
                            <div className={styles.priceContainer}>
                              {product.price > 0 ? (
                                <>
                                  <span className={styles.price}>{Number(product.price).toLocaleString()}đ</span>
                                  {product.old_price > 0 && <span className={styles.oldPrice}>{Number(product.old_price).toLocaleString()}đ</span>}
                                </>
                              ) : (
                                <span className={styles.price}>Liên hệ báo giá</span>
                              )}
                            </div>
                            <button className={styles.cartBtn} aria-label="Thêm vào yêu cầu báo giá">
                              <ShoppingCart size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {(!products || products.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Chưa có sản phẩm nào trong cơ sở dữ liệu.
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
