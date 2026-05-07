import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Check, Info, FileText } from 'lucide-react';
import styles from './page.module.css';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  // Await the params object directly to resolve Next.js 15 route params warning
  const resolvedParams = await params;
  
  const { data: product } = await supabase
    .from('products')
    .select('name, short_description')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!product) return { title: 'Không tìm thấy sản phẩm' };

  return {
    title: `${product.name} | Global Solutions`,
    description: product.short_description || `Chi tiết sản phẩm ${product.name}`,
  };
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  
  // Fetch product detail
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('slug', resolvedParams.slug)
    .single();

  if (!product) notFound();

  const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs || {};

  return (
    <div className={styles.productDetailWrap}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link href="/">Trang chủ</Link>
          <span className={styles.separator}>/</span>
          <Link href="/products">Sản phẩm</Link>
          <span className={styles.separator}>/</span>
          {product.category && (
            <>
              <Link href={`/products#cat-${product.category.slug}`}>{product.category.name}</Link>
              <span className={styles.separator}>/</span>
            </>
          )}
          <span className={styles.current}>{product.name}</span>
        </div>
      </div>

      <div className="container section">
        <div className={styles.mainLayout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              {product.badge && <span className={styles.badge}>{product.badge}</span>}
              <Image 
                src={`/${product.image_url}`} 
                alt={product.name} 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.sku}>Mã sản phẩm: <strong>{product.sku}</strong></p>

            <div className={styles.priceBox}>
              {product.price > 0 ? (
                <>
                  <span className={styles.currentPrice}>{Number(product.price).toLocaleString()} ₫</span>
                  {product.old_price > 0 && <span className={styles.oldPrice}>{Number(product.old_price).toLocaleString()} ₫</span>}
                </>
              ) : (
                <span className={styles.currentPrice}>Liên hệ báo giá</span>
              )}
            </div>

            <p className={styles.description}>{product.description}</p>

            <ul className={styles.keyFeatures}>
              {product.power_watt > 0 && <li><Check size={18} className={styles.checkIcon}/> Công suất: {product.power_watt}W</li>}
              {product.lumens > 0 && <li><Check size={18} className={styles.checkIcon}/> Quang thông: {product.lumens.toLocaleString()} lm</li>}
              {product.ip_rating && <li><Check size={18} className={styles.checkIcon}/> Chuẩn chống nước/bụi: {product.ip_rating}</li>}
              {product.warranty_months > 0 && <li><Check size={18} className={styles.checkIcon}/> Bảo hành: {product.warranty_months / 12} năm</li>}
            </ul>

            <div className={styles.stockStatus}>
              {product.in_stock ? (
                <span className={styles.inStock}>● Còn hàng</span>
              ) : (
                <span className={styles.outOfStock}>● Liên hệ</span>
              )}
            </div>

            <div className={styles.actions}>
              <div className={styles.qtyControl}>
                <button>-</button>
                <input type="number" defaultValue="1" min="1" />
                <button>+</button>
              </div>
              <button className={`btn btn-primary ${styles.addToCartBtn}`}>
                <ShoppingCart size={20} />
                THÊM VÀO YÊU CẦU BÁO GIÁ
              </button>
            </div>
          </div>
        </div>

        {/* Technical Specs Tab */}
        <div className={styles.tabsSection}>
          <div className={styles.tabHeader}>
            <button className={`${styles.tabBtn} ${styles.active}`}>Thông số kỹ thuật</button>
            <button className={styles.tabBtn}>Tài liệu & Chứng nhận</button>
          </div>
          
          <div className={styles.tabContent}>
            <div className={styles.specsGrid}>
              {Object.entries(specs).map(([key, value]) => (
                <div className={styles.specRow} key={key}>
                  <div className={styles.specLabel}>{key.toUpperCase()}</div>
                  <div className={styles.specValue}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
